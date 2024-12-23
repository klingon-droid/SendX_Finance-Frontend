"use client";

import { Card } from "@/components/ui/card";
import { Twitter, Wallet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSolanaWallets } from "@privy-io/react-auth/solana";

interface UserInfoCardProps {
  name: string;
  twitterHandle: string;
  walletAddress: string;
  chain: string;
  balance: number;
}

export function UserInfoCard({
  name,
  twitterHandle,
  walletAddress,
  chain,
  balance,
}: UserInfoCardProps) {
  const { exportWallet } = useSolanaWallets();

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Twitter className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{name}</h2>
            <p className="text-muted-foreground">@{twitterHandle}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-start gap-4">
            <Wallet className="w-5 h-5 mt-1 text-muted-foreground" />
            <div>
              <p className="font-medium">Your Balance</p>
              <p className="text-lg font-semibold text-primary">
                {balance} SOL
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Wallet className="w-5 h-5 mt-1 text-muted-foreground" />
            <div>
              <p className="font-medium">Wallet Address</p>
              <p className="text-sm text-muted-foreground break-all">
                {walletAddress}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-5 h-5 mt-1">🔗</div>
            <div>
              <p className="font-medium">Chain</p>
              <p className="text-sm text-muted-foreground">{chain}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => exportWallet()}
          >
            <Download className="w-4 h-4" />
            Export Wallet
          </Button>
        </div>
      </div>
    </Card>
  );
}
