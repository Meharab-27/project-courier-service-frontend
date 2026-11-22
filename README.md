# Express Courier — Frontend

A next-generation nationwide parcel logistics platform built with **Next.js 15**, covering all 64 districts of Bangladesh across 62 strategic distribution hubs.

## Features

- 📦 **Parcel Booking** — Book pickups from your doorstep in minutes
- 🔍 **Real-Time Tracking** — 8-stage shipment lifecycle with audit-trail logs
- 🔐 **6-Digit OTP Delivery** — Cryptographically secure handover verification
- 💳 **Stripe & COD Payments** — International card payments + Cash on Delivery
- 🤖 **Bilingual AI Assistant** — English & Bangla logistics support
- 🏭 **62 Hub Network** — Nationwide distribution hub management
- 👤 **Role-Based Dashboards** — Customer, Courier, and Admin portals
- 🌐 **Google OAuth** — One-click sign-in with Google

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State / Data | TanStack Query v5 |
| Forms | TanStack Form |
| Auth | Google OAuth (`@react-oauth/google`) |
| Payments | Stripe |
| Linting | Biome |
| Package Manager | pnpm |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Meharab-27/project-courier-service-frontend.git
cd project-courier-service-frontend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the required values in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (dashboard)/      # Protected dashboard routes
│   └── (public)/         # Public marketing & auth pages
├── components/
│   ├── form/             # Form components (login, register, etc.)
│   ├── layout/           # Header, Footer, Dashboard shell
│   ├── modules/          # Feature-level page sections
│   └── ui/               # Reusable UI primitives (shadcn/ui)
├── api/                  # API client functions
├── hooks/                # Custom React hooks
├── providers/            # Context providers
├── utils/                # Helper utilities
└── validation/           # Zod schemas
```

## User Roles

| Role | Access |
|---|---|
| **Customer** | Book parcels, track shipments, manage address book |
| **Courier** | View delivery queue, complete deliveries with OTP |
| **Admin** | Manage hubs, approve couriers, oversee all shipments |

## Contributing

1. Fork the repository and create a feature branch
2. Make your changes with clear, descriptive commits
3. Submit a pull request with a summary of your changes

## License

MIT © Express Courier Service Bangladesh
