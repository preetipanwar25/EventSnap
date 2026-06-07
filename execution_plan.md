# Event Management & Ticketing Platform: Step-by-Step Execution Plan

This document outlines a professional, production-ready execution plan for developing the cloud-native, secure, and maintainable Event Management & Ticketing platform. It translates the requirements from [Executive Summary](file:///Users/preeti/Desktop/Events_Management.md/1.%20Executive%20Summary.md) into concrete, sequential implementation tasks.

---

## Phase 0: Foundations & Environment Setup (Weeks 1-2)

### Task 0.1: Repository Structure & CI/CD Pipeline
- **Actions**:
  - Initialize a monorepo or two separate repositories: `event-ticketing-backend` (Java 21 / Spring Boot 3) and `event-ticketing-frontend` (Next.js 14 / Tailwind CSS).
  - Set up GitHub Actions for the backend:
    - Step 1: Lint check using Checkstyle and SpotBugs.
    - Step 2: Compile & run unit tests via Maven/Gradle.
    - Step 3: Check code coverage with JaCoCo (ensure >80% threshold).
    - Step 4: Run SonarCloud static analysis.
  - Set up GitHub Actions for the frontend:
    - Run ESLint, Prettier, and NextJS build checks.
- **Verification**: Push a boilerplate commit and verify that the GitHub Action workflow succeeds.

### Task 0.2: Docker-Compose Local Environment
- **Actions**:
  - Create a `docker-compose.yml` file in the root containing:
    - **MySQL 8**: Database engine with volume mapping.
    - **Redis 7**: Cache & rate limiter store.
    - **Apache Kafka + Zookeeper** (or Redpanda): Message broker for Saga orchestration.
    - **MailHog / GreenMail**: Mock SMTP server for testing notifications locally.
- **Verification**: Run `docker-compose up -d` and ensure all containers are running. Connect to MySQL and Redis via CLI/GUI.

---

## Phase 1: Core Domain Development (Weeks 3-6)

### Task 1.1: Database Schemas & Migration (Flyway)
- **Actions**:
  - Write SQL migrations under `src/main/resources/db/migration/`:
    - `V1__init_security.sql`: Tables for `users`, `roles`, and `user_roles`.
    - `V2__init_events_tickets.sql`: Tables for `events`, `tickets`, `promotions`.
    - `V3__init_orders.sql`: Tables for `orders`, `order_items`.
    - `V4__init_audit.sql`: Audit logs (Spring Envers).
    - `V5__init_booths.sql`: Tables for `booths` (id, event_id, name, type [STANDARD, FOOD_TRUCK], category [Mexican, Italian, Tech, Crafts, etc], price, status [AVAILABLE, RESERVED, SOLD]) and `booth_orders` (id, vendor_id, booth_id, status, total_amount, payment_intent_id, idempotency_key).
    - `V6__vendor_profiles.sql`: Table for `vendor_profiles` (id, business_name, owner_name, email, phone, category, status [PENDING, VERIFIED], created_at).
- **Verification**: Start the Spring application; verify Flyway executes migrations successfully and tables are created.

### Task 1.2: Authentication & 2FA (Spring Security)
- **Actions**:
  - Configure `SecurityFilterChain` in Spring Boot:
    - Disable CSRF (since we use JWTs).
    - Configure CORS for Next.js app.
    - Setup BCrypt password hashing.
  - Implement JWT Token Provider:
    - Use RSA-256 for token signing.
    - Establish private key configuration in Spring configuration.
    - Setup `ROLE_VENDOR` role mapping to differentiate vendors from standard users and admins.
  - Implement 2FA (TOTP):
    - Use a Java TOTP library (`com.warrenstrange:googleauth`).
    - Create endpoints: `/api/v1/auth/2fa/setup` (returns QR code URI) and `/api/v1/auth/2fa/verify`.
    - Update login flow: `/api/v1/auth/login` returns a temporary token if 2FA is enabled; `/api/v1/auth/login/verify` validates the TOTP and returns the final JWT.
- **Verification**: Test auth endpoints with Postman. Verify password hashes in MySQL.

### Task 1.3: Event, Ticket, Booth & Vendor Domain APIs
- **Actions**:
  - Implement DDD entities `Event`, `Ticket`, `Promotion`, `Booth`, `BoothOrder`, `VendorProfile` using Spring Data JPA.
  - Use `@Version` on entities for optimistic locking.
  - Implement endpoints:
    - `GET /api/v1/events` (public catalog search, filtering, pagination).
    - `POST /api/v1/events` (Admin only, requires `ROLE_ADMIN`).
    - `GET /api/v1/events/{id}` (public details + ticket availability).
    - `GET /api/v1/events/{id}/booths` (retrieve catalog of booths and food truck slots for a specific event, supporting filters for type and food categories).
    - `POST /api/v1/events/{id}/booths` (Admin only - create a new booth/catering slot with price and category).
    - `POST /api/v1/vendors/profile` (Register new vendor profile, setting status to `PENDING`).
    - `POST /api/v1/vendors/profile/verify` (Submit OTP verification token; update vendor profile status to `VERIFIED` and grant security permissions).
- **Verification**: Write JUnit 5 + Mockito tests for domain logic.

---

## Phase 2: Ordering, Payments & Messaging (Weeks 7-9)

### Task 2.1: SAGA Orchestrator & Kafka Setup
- **Actions**:
  - Create Kafka topics: `order-events`, `ticket-events`, `payment-events`, `notification-events`, `booth-events`.
  - Configure Spring Cloud Stream or Spring Kafka Producers & Consumers.
  - Implement SAGA Orchestrator:
    - **Ticket SAGA**:
      - **Step 1**: User checkout requests order creation. Order is created in state `PENDING`.
      - **Step 2**: Publish `OrderCreatedEvent` to `order-events`.
      - **Step 3**: Ticket Service consumes event, reserves inventory (`SELECT FOR UPDATE`), publishes `TicketsReservedEvent` (or `TicketsReservationFailedEvent` if stock is empty).
      - **Step 4**: Payment Service consumes success event, initiates transaction with Stripe/PayPal.
    - **Booth SAGA**:
      - **Step 1**: Vendor initiates checkout for an available booth/catering slot. OrderService checks if the `VendorProfile` is `VERIFIED`. If not, aborts. If verified, BoothOrder is created as `PENDING`.
      - **Step 2**: Publish `BoothOrderCreatedEvent` to `booth-events`.
      - **Step 3**: Booth Service consumes event, reserves booth (`SELECT FOR UPDATE` on specific slot), publishes `BoothReservedEvent` (or `BoothReservationFailedEvent` if already booked).
      - **Step 4**: Payment Service consumes success event. Based on payment selection (Deposit vs. Full), initiates Stripe/PayPal charges for 25% or 100% of the booth price.
      - **Step 5**: On Payment Success: Commit booth status as `SOLD` or `RESERVED_DEPOSIT` (with remaining balance noted). If payment fails: execute compensating transaction to mark booth back to `AVAILABLE` and update BoothOrder to `FAILED`.

### Task 2.2: Stripe & PayPal Integration
- **Actions**:
  - Integrate **Stripe WebClient**:
    - Call `/v1/payment_intents` to generate transaction keys.
    - Set up a webhook listener endpoint `/api/v1/webhooks/stripe` to handle `payment_intent.succeeded` and `payment_intent.payment_failed`.
    - Handle partial amount authorization configurations for deposit checkouts.
  - Integrate **PayPal WebClient**:
    - Call `/v2/checkout/orders` to create a order capture (passing the deposit price or full price dynamically).
    - Set up webhook `/api/v1/webhooks/paypal` to capture status updates.
  - Ensure **Idempotency**:
    - Pass `Idempotency-Key` header to Stripe.
    - Store the `idempotencyKey` in the Order and BoothOrder database tables to reject duplicate requests.
- **Verification**: Run local tests mock-routing Stripe/PayPal API endpoints with WireMock.

### Task 2.3: Notification & SMS Service
- **Actions**:
  - Implement email dispatch using `JavaMailSender` (integrating SendGrid/SMTP).
  - Implement SMS dispatch using Twilio Client (sending one-time passcodes and booking receipts).
  - Integrate with Kafka: Notification Service listens to `payment.success` and publishes the booking confirmation email.
  - Add Vendor receipt emails containing booth layout attachments and parking passes for catering spots.
- **Verification**: Verify emails land in local MailHog interface.

---

## Phase 3: Next.js Frontend & Dashboards (Weeks 10-12)

### Task 3.1: Client Core Architecture
- **Actions**:
  - Configure Next.js 14 App Router.
  - Implement Tailwind CSS with variables for clean light/dark modes.
  - Set up authentication state using React Context (handling JWT storing in secure HttpOnly cookies, identifying roles: standard user vs. vendor vs. admin).

### Task 3.2: User & Vendor Interface Implementation
- **Actions**:
  - **Landing & Catalog**: Modern responsive grid for event discovery. Includes category filters and fuzzy search.
  - **Ticket Checkout**: Interactive checkout. Integrates Stripe Element/PayPal.
  - **Vendor Booth Booking**: Interactive booth map / slot grid. Filter by booth type (Standard vs. Food Truck) and food category (Mexican, Italian, etc.). Form for business info.
  - **User & Vendor Portal**: Manage active tickets, view booked booths with QR codes, setup 2FA.
  - **Admin Panel**: Create/edit events, add standard booths/food truck slots with custom categories, track ticket and booth revenue metrics.

---

## Phase 4: Testing, Hardening & Observability (Weeks 13-14)

### Task 4.1: Integration & Load Testing
- **Actions**:
  - Write integration tests using **Testcontainers** (MySQL, Redis, Kafka) to verify DB transactions, SAGA flow, and caching.
  - Write contract tests using **Pact** between backend and frontend.
  - Conduct load tests using **k6** or **Gatling**:
    - Simulate 10,000 concurrent ticket booking requests to verify optimistic locking and database connection pool tuning.

### Task 4.2: Security Hardening & Rate Limiting
- **Actions**:
  - Implement rate limiting via **Bucket4j + Redis** on sensitive routes: `/api/v1/auth/login`, `/api/v1/tickets/purchase`, `/api/v1/auth/2fa/verify`.
  - Enforce SSL/TLS 1.2+ configuration.
  - Configure log masking for PII fields (emails, phone numbers) in Logback configurations.

### Task 4.3: Observability Stack
- **Actions**:
  - Add **Micrometer** metrics and configure **Prometheus** scraper endpoints.
  - Set up **OpenTelemetry Collector** to forward traces (HikariCP, Spring MVC, HTTP clients) to **Jaeger**.
  - Configure structured JSON logging to **Grafana Loki**.
- **Verification**: Verify Grafana dashboard shows live JVM metrics and trace waterfall diagrams.

---

## Phase 5: Launch & GitOps Deployment (Weeks 15-16)

### Task 5.1: Infrastructure as Code (IaC) & Helm
- **Actions**:
  - Write Helm charts for backend monolithic app and frontend Next.js app.
  - Configure **Traefik IngressRoute** in Kubernetes. Let's Encrypt TLS challenge configs.

### Task 5.2: ArgoCD GitOps
- **Actions**:
  - Configure ArgoCD application pointing to the Kubernetes configuration repository.
  - Trigger rolling update deployments. Set up Canary release rules (e.g. routing 5% traffic to a staging version, monitoring error rate, then promoting).
- **Verification**: Trigger a code change, commit, and verify ArgoCD pulls and applies changes automatically.
