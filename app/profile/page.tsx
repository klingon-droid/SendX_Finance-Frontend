"use client";

import { UserInfoCard } from "@/components/profile/user-info-card";
import { BalanceCard } from "@/components/profile/balance-card";
import { usePrivy } from "@privy-io/react-auth";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import axios from "axios";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/button";

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
  const [privyBalance, setPrivyBalance] = useState(0);
  const { connection } = useConnection();
  const { user } = usePrivy();
  const [balance, setBalance] = useState<number>(0);

  const getPrivyBalance = async () => {
    if (user?.wallet?.address) {
      try {
        const publicKey = new PublicKey(user?.wallet?.address ?? "");
        const balance = await connection.getBalance(publicKey);
        const balanceInSol = balance / LAMPORTS_PER_SOL;
        setPrivyBalance(balanceInSol);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    }
  };

  async function getDepositBalance() {
    if (user?.twitter?.username) {
      try {
        console.log('Fetching deposit balance for username:', user.twitter.username);
        const response = await axios.get(
          `/api/userBalance?username=${user?.twitter?.username}`
        );
        console.log('Deposit balance API response:', response.data);
        
        if (response.data.data == null) {
          console.log('No balance found, initializing to 0');
          setBalance(0);
          await axios.post("/api/userBalance", {
            username: user?.twitter?.username,
            balance: 0,
          });
        } else {
          console.log('Setting balance to:', response.data.data.balance);
          setBalance(response.data.data.balance);
        }
      } catch (error) {
        console.error("Error fetching deposit balance:", error);
      }
    }
  }

  // Refresh balances periodically
  useEffect(() => {
    if (user?.wallet?.address || user?.twitter?.username) {
      const refreshInterval = setInterval(() => {
        getPrivyBalance();
        getDepositBalance();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [user?.wallet?.address, user?.twitter?.username]);

  // Initial balance fetch
  useEffect(() => {
    if (user?.wallet?.address) {
      getPrivyBalance();
    }
  }, [user?.wallet?.address]);

  useEffect(() => {
    if (user?.twitter?.username) {
      getDepositBalance();
    }
  }, [user?.twitter?.username]);

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
          balance={privyBalance}
        />

        <BalanceCard
          balance={balance}
          deposits={mockUserData.deposits}
          getDepositBalance={getDepositBalance}
        />
      </div>
    </div>
  );
}
