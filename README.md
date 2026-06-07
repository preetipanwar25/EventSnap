# EventSnap — Events Management Platform

> A full-featured, production-grade **Events Management & Ticketing Platform** built with **Next.js 14**, **TypeScript**, and **Vanilla CSS** with glassmorphism design. Simulates real-world distributed systems concepts including SAGA orchestration, Kafka-style event streaming, OTP verification, and multi-role access.

---

## ✨ Live Preview

**Local:** `http://localhost:3000`  
**Repo:** [github.com/preetipanwar25/EventSnap](https://github.com/preetipanwar25/EventSnap)

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone git@github.com:preetipanwar25/EventSnap.git
cd EventSnap

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Vanilla CSS + Tailwind CSS |
| **Icons** | Lucide React |
| **State Management** | React `useState` / `useMemo` hooks |
| **Fonts** | Google Fonts — Inter, Outfit |
| **Design System** | Glassmorphism, CSS variables, dark mode |

---

## 📦 Modules & Features

### 1. 🗓️ Event Catalog (`/` → Catalog Tab)

The main discovery hub for all events.

- **Sponsored Events Scroll Banner** — Auto-scrolling marquee showcasing the top 5 sponsored events at the top of the page; pauses on hover; each card links to the Event Detail Page
- **Grid & Calendar View toggle** — Switch between a responsive event card grid and an interactive monthly calendar
- **Advanced Search & Filters** — Search by keyword, city, state, ZIP code, date range, and geo-radius proximity
- **Event Cards** — Display title, category, location, price, ticket availability badge, and star ratings
- **500+ Sample Events** — Dynamically generated events distributed across 16 US cities with realistic data

---

### 2. 📄 Event Details Page

A full-screen overlay that opens when any event card is clicked.

- **Hero Banner** — Full-width event image with gradient overlay, event title, date, location, price, and SOLD OUT / Selling Fast badges
- **Aggregate Star Ratings** — Average rating computed from community reviews with review count
- **About This Event** — Event description with live ticket availability progress bar (green → amber → red)
- **Venue Card** — Venue name, address, capacity, parking spots, and services tags
- **Sponsorship Packages** — If the event has sponsor packages, they're listed with benefits and a "Show Interest" CTA
- **Community Reviews** — Up to 10 approved reviews with author, rating, date, and comment
- **Sticky Purchase Panel** — Full ticket checkout panel with:
  - Ticket/Booth mode toggle
  - Quantity ± controls (capped at available inventory)
  - Promo code input with live validation
  - Payment gateway selector (Stripe / PayPal)
  - Payment simulation toggle (success / failure)
  - Cost breakdown (subtotal, discount, total)
  - **"Book Tickets"** CTA — triggers the SAGA checkout orchestration

---

### 3. 🎫 My Orders & 2FA Management (`My Tickets` Tab)

Order history and secure booking verification for attendees.

- **Order History** — Full list of ticket and booth orders with status badges (PAID / PENDING / FAILED / CANCELLED)
- **Order Details** — Event name, quantity, total amount, promo applied, payment gateway, and payment terms
- **2FA / MFA Checkout** — OTP-based verification step before order confirmation; simulates SMS / Email OTP (code: `123456`)
- **Deposit vs. Full Payment** — Orders show remaining balance when a deposit payment term is used
- **Order Cancellation** — Cancel pending or paid orders with instant state update

---

### 4. 🏪 Vendor Booth Booking (within Catalog Sidebar)

Enables vendors to discover and reserve booths at events.

- **Vendor Profile Registration** — Vendors must register with business name, owner, email, phone, and category
- **OTP Verification** — Email/SMS OTP step to verify vendor identity before booking (code: `123456`)
- **Booth Discovery** — Browse available Standard and Food Truck booths for the selected event
- **Booth Booking** — Reserve a booth with Full Payment or 25% Deposit option
- **Vendor Profile Management** — View verified vendor profile with available dates and pricing
- **Vendor Directory** (Admin) — Admin can view all registered and verified vendors

---

### 5. 🏢 Venue Providers Management (`Venues` Tab)

Manages the venue supply side of the platform.

- **Venue Provider Registration** — Company registration with OTP verification
- **Venue Listings** — Each venue has name, description, location, capacity, parking spots, services, and available dates
- **Venue Booking Records** — Shows which events are booked at each venue with confirmation status
- **Star Ratings** — Venues are rated by vendors and attendees; aggregate ratings displayed
- **Search & Filter** — Filter venues by name, city, state, or capacity

---

### 6. 🎙️ Event Organizers Management (`Organizer` Tab)

A dedicated portal for event creators and organizers.

- **Organizer Registration** — Organization name, contact, email, phone with OTP verification
- **Event Publishing** — Create new events with title, description, location, date, price, category, image URL, venue selection, ticket inventory, and sponsored flag
- **Sponsorship Package Editor** — Define custom sponsor packages (Gold, Silver, Bronze) with names, prices, and benefit lists
- **Event Editing** — Edit existing events directly from the organizer dashboard
- **Event Deletion** — Remove events with confirmation
- **Organizer Event List** — View all events created by the logged-in organizer

---

### 7. 💛 Sponsorship Module

End-to-end sponsor management across the platform.

- **Sponsor Package Definition** — Organizers define packages with tier name, price, and benefits checklist
- **Sponsorship Opportunities Sidebar** — Shown in the Catalog sidebar; lists packages for the selected event
- **Show Interest Flow** — Sponsors fill in company name, contact, email, and phone
- **OTP Verification** — Email/SMS OTP to verify sponsor identity before submission (code: `123456`)
- **Interest Confirmation** — Submission stored with PENDING status
- **Admin Sponsor Console** — Admin can view all sponsor interest records per event, with company, package, status, and contact details

---

### 8. 🔐 Admin Panel (`Admin` Tab)

Full control center for platform administrators.

- **Event CRUD** — Create, edit, and delete events; toggle sponsored flag
- **Promo Code Management** — Add, view, and manage promo codes (PERCENTAGE / FIXED discount types) with usage tracking
- **Review Moderation** — View all site, event, venue, and vendor reviews; flag or hide abusive content
- **Vendor Directory** — View all registered vendor profiles with verification status
- **Sponsor Interest Console** — See all sponsorship interest submissions with verification status per event
- **Platform Metrics Dashboard** — At-a-glance stats: total events, total revenue, tickets sold, active vendors, pending orders
- **Venue Booking Records** — View all confirmed venue-to-event bookings

---

### 9. ⚡ SAGA & Kafka Event Visualizer (`SAGA` Tab)

A real-time visualization of the distributed transaction pattern used for ticket purchases.

- **SAGA Orchestration Simulation** — Booking a ticket triggers a multi-step SAGA:
  1. `InventoryService` — Reserve ticket inventory
  2. `PaymentService` — Charge via selected gateway (Stripe / PayPal)
  3. `NotificationService` — Send booking confirmation email/SMS
  4. `OrderService` — Persist the order record
- **Compensating Transactions** — Toggle "Simulate Payment Failure" to watch the SAGA roll back each step with compensation events
- **Kafka-style Event Log** — Live, color-coded event stream showing each microservice message with timestamps
- **Step-by-step Progress Indicator** — Visual stepper showing current SAGA phase
- **Payment Gateway Toggle** — Switch between Stripe API and PayPal Orders mid-flow

---

## 🗂️ Data Model

| Entity | Key Fields |
|---|---|
| `Event` | id, title, description, location, date, price, ticketInventory, ticketsSold, category, isSponsored, sponsorPackages, venueId |
| `Venue` | id, name, location, capacity, parkingSpots, services, availableDates |
| `Booth` | id, eventId, name, type (STANDARD/FOOD_TRUCK), price, status, paymentTerms |
| `Order` | id, eventId, quantity, totalAmount, status, paymentGateway, type (TICKET/BOOTH), paymentTerms |
| `VendorProfile` | id, businessName, ownerName, email, category, status (PENDING/VERIFIED) |
| `OrganizerProfile` | id, organizationName, contactName, email, status |
| `VenueProviderProfile` | id, companyName, contactName, email, status |
| `SponsorPackage` | id, name, price, benefits[] |
| `SponsorInterest` | id, eventId, packageId, companyName, email, status (PENDING/VERIFIED/APPROVED) |
| `Review` | id, targetType, targetId, authorName, rating, comment, status |
| `PromoCode` | code, discountType, value, usageLimit, usageCount |

---

## 🎨 Design System

- **Dark Mode First** with CSS custom properties (`--bg-primary`, `--text-primary`, `--glass-bg`, etc.)
- **Glassmorphism** — frosted glass panels with `backdrop-blur`, subtle borders, and layered transparency
- **Gradient Accents** — sky/indigo for primary actions, amber/yellow for sponsored, emerald for success, rose for errors
- **Micro-animations** — slide-in overlays, marquee scroll, pulse effects, hover scale transforms
- **Responsive** — mobile-first grid layout adapting from 1 → 3 columns
- **Typography** — Outfit (display headings) + Inter (body) + monospace (prices, codes, timestamps)

---

## 📁 Project Structure

```
EventSnap/
├── src/
│   └── app/
│       ├── page.tsx          # Main application (single-page, all tabs & modules)
│       ├── globals.css       # CSS variables, animations, glassmorphism utilities
│       └── layout.tsx        # Root layout with font imports and metadata
├── public/
├── next.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🔑 Demo Credentials & Test Data

| Field | Value |
|---|---|
| OTP Code (all flows) | `123456` |
| Promo Code — 10% off | `WELCOME10` |
| Promo Code — 50% off | `AURA50` |
| Promo Code — $30 off | `EARLYBIRD` |
| Simulate Payment Failure | Toggle in checkout panel |

---

## 📄 License

MIT — free to use, modify, and distribute.
