"use client";

import type React from "react";
import { ThemeProvider } from "./theme-provider"; // Assuming theme-provider is in the same directory
import { PrivyProvider } from '@privy-io/react-auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['twitter', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#9CA3AF', // Medium Gray
          logo: '/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        }
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </PrivyProvider>
  );
} 