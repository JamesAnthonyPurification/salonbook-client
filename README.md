# SalonBook – Salon Appointment Booking Platform (Client)

SalonBook is a salon appointment booking platform. Customers explore salon services, request appointments online, and pay for confirmed appointments through Stripe. Salon admins manage services, review and confirm appointment requests, manage customers, and monitor payments.

This repository contains the **Next.js frontend**, which also hosts **Better Auth** authentication.

- **Live Website:** `https://your-salonbook.vercel.app` _(replace after deploying)_
- **Client Repository:** `https://github.com/JamesAnthonyPurification/salonbook-client`
- **Server Repository:** `https://github.com/JamesAnthonyPurification/salonbook-server`

## Important Features

**Customers**
- Browse active services, search by name, filter by category, and sort by price. Filters live in the URL, so a refresh keeps them.
- Protected service details page with appointment booking: date, predefined time slots (booked and past slots are disabled), and an optional message.
- Dashboard with an overview (total, pending, confirmed, and cancelled counts), My Appointments (details, cancel pending requests, **Pay Now**), payment history, and profile editing.
- Stripe Checkout with Payment Success and Payment Cancel pages. The success page waits for the webhook-verified record and never marks anything as paid itself.

**Admins**
- Overview statistics: customers, active services, appointments, pending, confirmed, and successful payments.
- Manage services: add, update, delete, and activate/deactivate. Service images are uploaded to ImgBB.
- Manage appointments: view details, confirm pending appointments, and cancel pending or confirmed ones.
- Manage users: view details, and block or unblock users. A blocked user is signed out immediately.
- Read-only transactions list with the Stripe session reference.

**Platform**
- Better Auth email/password and Google sign-in. Password rules (6+ characters, one uppercase, one lowercase) are enforced on both client and server.
- `role` and `isBlocked` are server-only fields. Admins can't be created through sign-up.
- Role-based dashboards are protected **on the server** (layouts redirect before rendering), so changing the URL can't open another role's dashboard, and private routes work after a refresh.
- The Express API is called with a short-lived JWT issued from the Better Auth session (`/api/token`).
- The ImgBB key stays server-side, behind the `/api/upload` route.
- Toast notifications, confirmation dialogs, status badges, skeleton loaders, 404 and error pages, and a fully responsive layout.

## Technology Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Better Auth (MongoDB adapter, Google OAuth) · Axios · Sonner · Lucide icons · ImgBB · Stripe Checkout (via the API)

## Architecture

```
Browser ──cookie──▶ Next.js (Better Auth, /api/token, /api/upload)
   │                       │ signs a 1-hour JWT with JWT_SECRET
   └──Bearer JWT──────────▶ Express API ──▶ MongoDB ◀── Stripe webhook
```

## Installation

```bash
git clone https://github.com/JamesAnthonyPurification/salonbook-client.git
cd salonbook-client
npm install
cp .env.example .env.local   # then fill in the values
```

## Required Environment Variables

Names only. Never commit real values.

```
MONGODB_URI
DB_NAME
BETTER_AUTH_SECRET
BETTER_AUTH_URL            # e.g. http://localhost:3000
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
JWT_SECRET                 # must match the server's JWT_SECRET
IMGBB_API_KEY
NEXT_PUBLIC_API_URL        # e.g. http://localhost:5000/api
```

Google OAuth redirect URI: `<BETTER_AUTH_URL>/api/auth/callback/google`

## How to Run Locally

1. Start the server first (see the server README).
2. Run the client:

```bash
npm run dev     # http://localhost:3000
```

Production build: `npm run build && npm start`

**Admin account:** sign up normally, then run `npm run make-admin -- <email>` in the server repository.

**Stripe test card:** `4242 4242 4242 4242`, any future expiry date, any CVC.

## Deployment (Vercel)

1. Import the repository and add all environment variables. Set `BETTER_AUTH_URL` to the live URL and `NEXT_PUBLIC_API_URL` to the live API URL plus `/api`.
2. Add the live callback URL to the Google OAuth client.
3. Set `CLIENT_URL` in the server to this site's URL (for CORS and the Stripe redirects).
