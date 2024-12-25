# SendX

SendX is a web3 application that allows users to connect their wallets, manage deposits, and track their Solana balances. The platform integrates with Twitter authentication and provides a seamless interface for users to manage their crypto assets.

## Website Preview

![SendX Dashboard](./public/images/dashboard.png)

<!-- Add your website screenshot in public/images/dashboard.png -->

## Features

- Wallet connection via Privy
- Twitter authentication
- Real-time Solana balance tracking
- Deposit management system
- User profile dashboard
- Responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Blockchain**: Solana
- **Authentication**: Privy
- **UI Components**: Tailwind CSS, Shadcn/ui

## Project Structure

```
sendx/
├── app/
│   ├── api/
│   │   └── userBalance/ # API endpoints for balance management
│   ├── profile/ # User profile page
│   ├── layout.tsx # Root layout
│   └── page.tsx # Home page
├── components/
│   ├── profile/
│   │   ├── user-info-card.tsx # User information display
│   │   ├── balance-card.tsx # Balance information
│   │   └── deposit-modal.tsx # Deposit functionality
│   ├── layout/ # Layout components
│   └── ui/ # Reusable UI components
├── models/
│   └── user.ts # MongoDB user model
├── utils/
│   └── dbConnect.ts # Database connection utility
└── public/ # Static assets
```

## Getting Started

```bash
git clone https://github.com/abhiraj2404/SendX_frontend.git
cd SendX_frontend
npm install
```

## Environment Variables

Create a `.env` file in the root directory and add the following:

```
MONGODB_URI=your_mongodb_uri
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_appid_here
```

## Running the Application

```bash
npm run dev
```
