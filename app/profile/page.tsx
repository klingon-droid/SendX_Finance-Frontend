"use client";

import { UserInfoCard } from "@/components/profile/user-info-card";
import { BalanceCard } from "@/components/profile/balance-card";
import { usePrivy } from "@privy-io/react-auth";
import { Card } from "@/components/ui/card";

// This would normally come from your auth/state management
const mockUserData = {
  name: "John Doe",
  twitterHandle: "@johndoe",
  walletAddress: "8xk7nAstQYAwNFLJvBRdZqDQ1QCArpinKvVbVtb3LYf5",
  chain: "Solana",
  balance: 145.32,
  deposits: [
    { amount: 50, date: "2024-03-20" },
    { amount: 25, date: "2024-03-15" },
    { amount: 70.32, date: "2024-03-10" },
  ],
};

export default function ProfilePage() {
  const { user } = usePrivy();

  return !user ? (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="py-10 px-12 md:px-28 text-center bg-content1 w-fit mx-auto">
        <p className="text-foreground/70 text-center w-full">
          Please sign in to view your profile.
        </p>
      </Card>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 mx-auto text-center">Profile</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <UserInfoCard
          name={user?.twitter?.name ?? "Unknown"}
          twitterHandle={user?.twitter?.username ?? "Unknown"}
          walletAddress={user?.wallet?.address ?? "Not Connected"}
          chain={user?.wallet?.chainType ?? "Unknown"}
          balance={145.32}
        />

        <BalanceCard
          balance={mockUserData.balance}
          deposits={mockUserData.deposits}
        />
      </div>
    </div>
  );
}
