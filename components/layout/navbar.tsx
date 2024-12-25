"use client";

import { Send } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useLogout, usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";

export function Navbar() {
  const { ready, authenticated, login, user } = usePrivy();
  const { createWallet } = useSolanaWallets();
  const { logout } = useLogout();
  console.log(user);
  async function createSOLWallet() {
    const wallet = await createWallet();
    console.log("wallet", wallet);
  }
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);
  if (ready && authenticated) {
    if (!user?.wallet) createSOLWallet();
  }

  return (
    <nav className="border-b">
      {/* //make responsive  */}
      <div className="container mx-auto px-4 lg:px-20 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Send className="w-6 h-6" />
          <span className="font-semibold">SendX</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="hidden sm:flex">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost">Profile</Button>
          </Link>

          <ThemeToggle />
          <div className="">
            {!authenticated ? (
              <Button
                disabled={disableLogin}
                onClick={async () => {
                  console.log("login");
                  login();
                }}
              >
                Log in
              </Button>
            ) : (
              <Button onClick={async () => await logout()}>Logout</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
