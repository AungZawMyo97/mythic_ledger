# Mythic Ledger 💎

Mythic Ledger is a comprehensive, full-stack management and accounting system specifically built for processing Mobile Legends: Bang Bang (MLBB) Diamond orders. 

It provides seamless tracking of customers, order histories, and profit margins, designed with a premium, responsive UI for both mobile and desktop management.

![Mythic Ledger Overview](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## 🌟 Key Features

- **Single Admin Model:** One shop admin account manages all dashboard settings, customers, orders, and reports.
- **Customer Management:** Keep track of player In-Game IDs and Zone IDs seamlessly.
- **Order Tracking:** Create granular records of buying price, selling price, and automatically calculate net profit for every diamond recharge.
- **Public Order Form:** Let customers place orders directly from `/order`, select package + payment method, and submit transaction IDs.
- **Financial Reporting:** View automated monthly revenue and net profit aggregated reports natively inside your dashboard.
- **Beautiful Modern UI:** Built with standard shadcn/ui components, dynamic React loading skeletons, smooth animations, and comprehensive dark mode support.
- **Security:** Fully hashed passwords with bcrypt and secure session handling using Auth.js. Enforced password resets for newly created admins.

## 🛠 Tech Stack

- **Framework:** Next.js (App Router) / React
- **Authentication:** Auth.js (NextAuth.js v5)
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma
- **Styling:** Tailwind CSS + custom glass-morphism aesthetic
- **UI Components:** shadcn/ui (Radix Base UI primitives)
- **CI/CD:** Automated GitHub Actions workflows for continuous integration.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- A PostgreSQL Database (Tested flawlessly on [Neon.tech](https://neon.tech/))

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/AungZawMyo97/mythic_ledger.git
   cd mythic_ledger
   ```

2. Install modules
   ```bash
   npm install
   ```

3. Configure Environment Variables
   Create a `.env` file in the root based on your database credentials:
   ```env
   DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
   AUTH_SECRET="generate-a-random-32-char-string-here"
   SEED_SUPER_ADMIN_EMAIL="admin@example.com"
   SEED_SUPER_ADMIN_PASSWORD="SecurePassword123!"
   DEFAULT_SHOP_ADMIN_PASSWORD="TempPassword123!"
   KPAY_NUMBER="09xxxxxxxxx"
   AYA_PAY_NUMBER="09xxxxxxxxx"
   WAVE_PAY_NUMBER="09xxxxxxxxx"
   ```

4. Push the Database Schema
   ```bash
   npm run db:push
   ```

5. Seed the Super Admin Account
   ```bash
   npm run db:seed
   ```

6. Run the Development Server
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to use the public order page.  
Admin dashboard is available after login at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## 📦 Deployment (Vercel)

1. Import this repository to [Vercel](https://vercel.com/new).
2. Load your environment variables in the Project Settings.
3. Override the **Build Command** to: `npx prisma db push && next build`.
4. Click Deploy. Vercel will handle the rest!
