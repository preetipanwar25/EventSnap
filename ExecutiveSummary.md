# 1. Executive Summary  

| Item | Description |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Goal | Build a cloud‑native, secure, and maintainable platform that lets event organisers create & sell tickets, while users can browse, book, and pay for events. |
| MVP Scope | • Event CRUD (admin) 
• Ticket inventory + purchase 
• Promotion codes 
• Multi‑payment gateway (Stripe + PayPal) 
• Email & SMS notifications (OTPs, receipts) 
• JWT‑based auth & 2FA 
• Admin & user dashboards (React/Next.js + Tailwind) |
| Tech Stack | • Backend – Java 21, Spring Boot 3 (MVC) 
• Data – MySQL 8 + HikariCP, Flyway 
• Auth – Spring Security (JWT, BCrypt, 2FA) 
• Payment – Stripe & PayPal via WebClient + idempotency 
• Messaging – Kafka (domain events, SAGA) 
• Front‑end – Next.js 14, React 18, Tailwind 3 (JIT) 
• DevOps – Docker, Docker‑Compose, Traefik, Kubernetes, Helm, ArgoCD, Prometheus, Grafana, Loki, OpenTelemetry 
• Testing – JUnit 5, Spring Test, Testcontainers, Postman/Newman, Pact, Resilience4j, Jacoco, SonarQube |
| Timeline | • Phase 0 – Foundations (2 weeks) – Repo, CI, Docker, dev env, base templates 
• Phase 1 – Core Domain (4 weeks) – Event/Ticket/Promo entities, CRUD APIs, security 
• Phase 2 – Payment & Notifications (3 weeks) – Stripe, PayPal, SMS/Email services, domain events 
• Phase 3 – Front‑end & UX (3 weeks) – Next.js pages, Tailwind styling, auth flows 
• Phase 4 – Testing & Hardening (2 weeks) – Contract tests, load tests, observability 
• Phase 5 – Launch & Roll‑out (2 weeks) – Kubernetes rollout, monitoring, feedback loop |
  
## 2. High‑Level Architecture  
  
```
┌─────────────────────┐
│  Web Client (SPA)   │
│  (Next.js + Tailwind)│
└───────┬──────────────┘
        │  HTTPS (TLS‑1.2+)
        ▼
┌───────────────────────┐
│    API Gateway / Nginx│
└───────┬───────────────┘
        │
┌───────────────────────┐
│ Spring Boot 3 MVC App │
│  (Monolith + Modules) │
├───────────────────────┤
│ • Auth Service        │
│ • Event Service       │
│ • Ticket Service      │
│ • Promotion Service   │
│ • Notification Service│
│ • Payment Service     │
└───────┬───────────────┘
        │
┌───────────────────────┐
│  MySQL 8 (Primary)     │
│  (HikariCP + Flyway)  │
└───────┬───────────────┘
        │
┌───────────────────────┐
│  Redis (Cache & Session)│
└───────────────────────┘
┌─────────────────────┐
│  Web Client (SPA)   │
│  (Next.js + Tailwind)│
└───────┬──────────────┘
        │  HTTPS (TLS‑1.2+)
        ▼
┌───────────────────────┐
│    API Gateway / Nginx│
└───────┬───────────────┘
        │
┌───────────────────────┐
│ Spring Boot 3 MVC App │
│  (Monolith + Modules) │
├───────────────────────┤
│ • Auth Service        │
│ • Event Service       │
│ • Ticket Service      │
│ • Promotion Service   │
│ • Notification Service│
│ • Payment Service     │
└───────┬───────────────┘
        │
┌───────────────────────┐
│  MySQL 8 (Primary)     │
│  (HikariCP + Flyway)  │
└───────┬───────────────┘
        │
┌───────────────────────┐
│  Redis (Cache & Session)│
└───────────────────────┘

```
Why a modular monolith?  
* Faster to ship MVP (single deployment unit).  
* Clean separation via DDD modules → easy to split later into micro‑services (payment, notifications, audit).  
* Keeps the tech‑stack lean for the first iteration; only adds extra services if horizontal scaling becomes critical.  
  
## 3. Domain Model (DDD‑inspired)  

| Entity | Key Fields | Relationships | Notes |
| --------- | --------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------ |
| Event | id, title, description, location, startAt, endAt, status (UPCOMING, ONGOING, CANCELLED), ticketInventory, ticketsSold | 1 ↔ many Ticket | @Version for optimistic locking on inventory. |
| Ticket | id, eventId, price, inventoryCount, reservedCount, status (AVAILABLE, RESERVED, SOLD, CANCELLED) | 1 ↔ many OrderItem | SELECT … FOR UPDATE when decrementing inventory. |
| Promotion | id, code, description, discountType (PERCENTAGE, FIXED), discountValue, validFrom, validTo, usageLimit | 1 ↔ many Ticket | Applied during checkout. |
| Order | id, userId, status (CREATED, PAID, FAILED, CANCELLED), totalAmount, paymentIntentId | 1 ↔ many OrderItem | idempotencyKey to avoid double charge. |
| OrderItem | id, orderId, ticketId, quantity, priceAtPurchase |  |  |
| User | id, email, phone, passwordHash, roles (USER, ADMIN), 2faEnabled |  | Password → BCrypt; email/phone → masked in logs. |
| AuditLog | id, entity, entityId, revisionNumber, changedBy, timestamp, changes |  | Use Envers + Spring Data JPA Auditing. |
  
## 4. API Design (OpenAPI 3.0)  
yaml  
```
openapi: 3.0.3
info:
  title: Event Ticketing API
  version: 1.0.0
paths:
  /api/v1/events:
    get:
      summary: List events
      operationId: listEvents
      tags: [Events]
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/EventDto'
    post:
      summary: Create event (admin)
      operationId: createEvent
      tags: [Events]
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateEventDto'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EventDto'
  /api/v1/tickets/purchase:
    post:
      summary: Purchase tickets
      operationId: purchaseTickets
      tags: [Tickets]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PurchaseDto'
      responses:
        '200':
          description: Purchase success
        '409':
          description: Inventory conflict
openapi: 3.0.3
info:
  title: Event Ticketing API
  version: 1.0.0
paths:
  /api/v1/events:
    get:
      summary: List events
      operationId: listEvents
      tags: [Events]
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/EventDto'
    post:
      summary: Create event (admin)
      operationId: createEvent
      tags: [Events]
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateEventDto'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EventDto'
  /api/v1/tickets/purchase:
    post:
      summary: Purchase tickets
      operationId: purchaseTickets
      tags: [Tickets]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PurchaseDto'
      responses:
        '200':
          description: Purchase success
        '409':
          description: Inventory conflict

```
* Versioning: /api/v1/ keeps a stable contract; future versions can branch cleanly.  
* Security: bearerAuth uses Authorization: Bearer <JWT>.  
* Idempotency: PurchaseDto includes idempotencyKey (header or body) → stored in orders.idempotencyKey.  
  
## 5. Authentication & Authorization  

| Feature | Implementation |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| JWT | JwtAuthenticationFilter, JwtAuthorizationFilter – signed with RSA‑256; public key cached in application.yml. |
| Password | BCryptPasswordEncoder (strength=10). |
| Roles | ROLE_USER, ROLE_ADMIN.  @PreAuthorize on admin endpoints. |
| Two‑Factor | TOTP via Google Authenticator / Authy (UserDetailsService + TotpAuthenticationProvider). Users can enable/disable; on login, 2FA token is required. |
| Account Recovery | One‑time OTP (SMS or email) – short‑lived (5 min). Service sends via Twilio (SMS) & SendGrid (Email). |
| Rate Limiting | Bucket4j + Redis – protect login, OTP, and purchase endpoints. |
| CORS | Allowed origins defined in application.yml. |
| XSS / CSRF | CSRF disabled for REST (stateless). XSS mitigated by output‑encoding on the client. |
  
## 5. Security Hardening  

| Layer | Controls |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Transport | TLS 1.2+ (certs from Let's Encrypt via Traefik). |
| Input Validation | Spring Validator + @Valid + BindingResult + JSON schema validation (via springdoc-openapi). |
| Logging | Sensitive fields masked (email → e****@example.com); audit log stored encrypted at rest. |
| Secrets | Stored in Kubernetes Secrets or HashiCorp Vault. |
| Dependencies | Dependabot / Renovate for auto‑updating. |
| Brute‑Force | Spring Security FailedLoginHandler locks account after 5 failed attempts. |
| Audit | Envers + AuditLog table. |
| Observability | Structured logs (JSON), metrics (Micrometer → Prometheus), traces (OpenTelemetry → Jaeger). |
  
## 6. Security Architecture Diagram  
  
```
User
 ├─► Login Form (HTTPS)
 │   ├─► Auth Service (JWT, TOTP)
 │   └─► Front‑end shows 2FA prompt
 └─► Token → API Gateway
      │
      ▼
    API (Spring Security)  
      │
   Authenticated → CRUD / Purchase
User
 ├─► Login Form (HTTPS)
 │   ├─► Auth Service (JWT, TOTP)
 │   └─► Front‑end shows 2FA prompt
 └─► Token → API Gateway
      │
      ▼
    API (Spring Security)  
      │
   Authenticated → CRUD / Purchase

```
  
## 7. Payment Integration  
## 7.1 Stripe  
java  
```
// StripeConfig.java
@Bean
WebClient stripeWebClient(@Value("${stripe.api.key}") String key) {
    return WebClient.builder()
        .baseUrl("https://api.stripe.com/v1")
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + key)
        .build();
}
// StripeConfig.java
@Bean
WebClient stripeWebClient(@Value("${stripe.api.key}") String key) {
    return WebClient.builder()
        .baseUrl("https://api.stripe.com/v1")
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + key)
        .build();
}

```
* Create PaymentIntent → paymentIntentId stored in Order.  
* Webhook (/webhook/stripe) → listens to payment_intent.succeeded, payment_intent.failed.  
* Idempotency – use the same idempotencyKey for repeat requests; Stripe returns 409 on duplicates.  
## 7.2 PayPal  
java  
```
// PayPalConfig.java
@Bean
WebClient paypalWebClient(@Value("${paypal.client.id}") String id,
                          @Value("${paypal.client.secret}") String secret) {
    return WebClient.builder()
        .baseUrl("https://api-m.sandbox.paypal.com")
        .defaultHeader(HttpHeaders.AUTHORIZATION,
                       "Bearer " + generatePayPalBearer(id, secret))
        .build();
}
// PayPalConfig.java
@Bean
WebClient paypalWebClient(@Value("${paypal.client.id}") String id,
                          @Value("${paypal.client.secret}") String secret) {
    return WebClient.builder()
        .baseUrl("https://api-m.sandbox.paypal.com")
        .defaultHeader(HttpHeaders.AUTHORIZATION,
                       "Bearer " + generatePayPalBearer(id, secret))
        .build();
}

```
* Use PayPal Orders API (/v2/checkout/orders).  
* Webhook (/webhook/paypal) – PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED.  
## 7.3 SAGA Pattern (Kafka)  
  
```
OrderService
 ├─► CreateOrder (Kafka: order.created)
 │
 ├─► ReserveTickets (Kafka: tickets.reserve)
 │
 ├─► ApplyPromotion (Kafka: promotion.apply)
 │
 ├─► InitiatePayment (Kafka: payment.initiate)
 │
 ├─► OnPaymentSuccess (Kafka: payment.success) → Update Order to PAID, Commit SAGA
 │
 └─► OnPaymentFailure / Timeout (Kafka: payment.failed) → Rollback: ReleaseTickets, CancelOrder
OrderService
 ├─► CreateOrder (Kafka: order.created)
 │
 ├─► ReserveTickets (Kafka: tickets.reserve)
 │
 ├─► ApplyPromotion (Kafka: promotion.apply)
 │
 ├─► InitiatePayment (Kafka: payment.initiate)
 │
 ├─► OnPaymentSuccess (Kafka: payment.success) → Update Order to PAID, Commit SAGA
 │
 └─► OnPaymentFailure / Timeout (Kafka: payment.failed) → Rollback: ReleaseTickets, CancelOrder

```
* Guarantees eventual consistency without tight coupling.  
* All events published to a shared Kafka topic; other modules (notification, reporting) can subscribe.  
  
## 8. Notification & OTP Service  

| Channel | Provider | Implementation |
| ------- | --------------------------- | ---------------------------------------------------------- |
| Email | SendGrid (SMTP) | JavaMailSender + Thymeleaf templates. |
| SMS | Twilio | RestTemplate / WebClient – send OTP, booking confirmation. |
| OTP | TOTP (Google Authenticator) | TOTP library – generate secret, verify. |
| Push | (future) | Firebase / OneSignal (optional). |
  
Design  
* Command: SendEmailCommand, SendSmsCommand.  
* Saga: If email fails after payment success → flag for retry.  
* Queue: notifications Kafka topic → NotificationProcessor worker thread.  
* Retry: Exponential back‑off + max attempts (5).  
  
## 9. Dev & Test Environment  
## 9.1 Repository & CI  
* GitHub repo with main + dev branches.  
* GitHub Actions:  
    * Lint – Checkstyle, SpotBugs.  
    * Unit Tests – JUnit 5, Spring Boot Test.  
    * Containerized Tests – Testcontainers: MySQL, Kafka, Redis.  
    * Contract Tests – Pact (consumer & provider).  
    * Code Coverage – Jacoco → GitHub PR checks.  
    * Static Analysis – SonarCloud integration.  
## 9.2 Docker & Docker‑Compose  
yaml  
```
version: "3.9"
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ticketing
    volumes:
      - mysql-data:/var/lib/mysql
  redis:
    image: redis:7
    command: redis-server --save 900 1 --loglevel warning
  kafka:
    image: confluentinc/cp-kafka:7.2
    depends_on:
      - zookeeper
  zookeeper:
    image: confluentinc/cp-zookeeper:7.2
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
  app:
    build: .
    depends_on:
      - mysql
      - redis
      - kafka
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/ticketing
      SPRING_RABBITMQ_HOST: rabbitmq
      ...
    ports:
      - "8080:8080"
volumes:
  mysql-data:
version: "3.9"
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ticketing
    volumes:
      - mysql-data:/var/lib/mysql
  redis:
    image: redis:7
    command: redis-server --save 900 1 --loglevel warning
  kafka:
    image: confluentinc/cp-kafka:7.2
    depends_on:
      - zookeeper
  zookeeper:
    image: confluentinc/cp-zookeeper:7.2
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
  app:
    build: .
    depends_on:
      - mysql
      - redis
      - kafka
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/ticketing
      SPRING_RABBITMQ_HOST: rabbitmq
      ...
    ports:
      - "8080:8080"
volumes:
  mysql-data:

```
* Local dev: docker‑compose up --build.  
* Unit tests run inside Testcontainers, no external services required.  
## 9.3 Traefik + Kubernetes  
* Traefik Ingress Controller (with TLS challenge).  
* Auto‑generation of IngressRoute via annotations.  
* Deployment via Helm charts; values can be overridden per env.  
* ArgoCD for GitOps – syncs manifests from Git to cluster.  
## 9.4 Observability  

| Component | Tool | Function |
| --------- | ----------------------- | ----------------------------------------------------- |
| Metrics | Prometheus | JVM GC, HTTP latency, DB queries, Kafka lag. |
| Tracing | OpenTelemetry Collector | Export to Jaeger/Kibana. |
| Logs | Loki (Grafana) | Structured JSON logs from app + Redis. |
| Alerting | Grafana Alerting | Critical alerts (DB down, payment failure rate >5 %). |
  
## 10. Security Hardening Checklist  

| Check | Owner | Deadline |
| --------------------------------------------------------- | ------------- | ---------- |
| OWASP Top‑10 review (Spring Boot) | Security Lead | Week 1 |
| Pen‑test scope (authentication, authorization, injection) | External SME | Week 2 |
| Rate limiting on login & purchase | DevOps | Week 3 |
| Secrets rotation policy | Ops | Continuous |
| 2FA enforcement for admin | Security Lead | Week 2 |
| GDPR data handling (email masking, data deletion) | Compliance | Week 4 |
  
## 11. Testing Strategy  

| Type | Tool | Scope |
| ----------- | --------------------------- | ---------------------------------------------------------------------------- |
| Unit | JUnit 5, Mockito | Service & repository logic. |
| Integration | Spring Test, Testcontainers | End‑to‑end on DB, Kafka, Redis. |
| Contract | Pact | Verify consumer‑provider expectations for payment and notification services. |
| Load | k6 (or Gatling) | Simulate 10k concurrent users during ticket sale. |
| SAST | SonarQube | Detect insecure code patterns. |
| Fuzz | OSS-Fuzz (Java) | Random API payloads. |
  
All tests run in CI; PRs blocked until all checks green.  
  
## 12. Deployment Flow  
1. Code Commit → GitHub PR → CI pipeline.  
2. Helm chart updated in dev branch → ArgoCD sync → Traefik exposes /api.  
3. Canary deployment – route 5 % traffic to new version.  
4. Rollback on failed health checks.  
  
## 13. Release Plan  

| Phase      | Activities                                   | Duration   |
| ---------- | -------------------------------------------- | ---------- |
| MVP        | Core API + Stripe + Twilio                   | 4 weeks    |
| Beta       | PayPal, Kafka SAGA, Notification worker      | 2 weeks    |
| Production | Full CI/CD, Observability, Disaster Recovery | Continuous |
  
## 14. Summary  
* Technology stack: Spring Boot 3.x, Kotlin (optional), Micrometer, Kafka, Redis, Traefik.  
* Key patterns: SAGA (Kafka), TOTP 2FA, contract testing.  
* Security: RSA‑256 JWT, OWASP compliant, GDPR aware.  
* Deployment: GitOps via ArgoCD, Helm, Traefik.  
* Observability: Prometheus + Grafana + Loki + OpenTelemetry.  
This architecture meets the requirement for a secure, maintainable, and highly scalable ticket booking API, ready for continuous delivery and future extensibility.  
