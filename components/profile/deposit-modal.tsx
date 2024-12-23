"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

export function DepositModal({ open, onClose }: DepositModalProps) {
  const { user } = usePrivy();
  const [amount, setAmount] = useState("");
  const { connected, publicKey } = useWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  console.log(connected);

  const handleDeposit = async () => {
    const amountInLamports = Number(amount) * 10 ** 9;
    if (!publicKey) return;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(process.env.NEXT_PUBLIC_BOT_PUBLIC_KEY ?? ""),
        lamports: amountInLamports,
      })
    );

    try {
      await wallet.sendTransaction(transaction, connection);

      // Fetch the current balance from the database
      const response = await axios.get(
        `/api/userBalance?username=${user?.twitter?.username}`
      );
      let currentBalance = 0;
      if (response.data.data == null) {
        currentBalance = 0;
      } else {
        currentBalance = response.data.data.balance;
      }

      console.log("current balance", currentBalance);

      // Calculate the new balance
      const newBalance = currentBalance + Number(amount);

      console.log("new balance", newBalance);

      // Update the balance in the database
      await axios.post("/api/userBalance", {
        username: user?.twitter?.username,
        balance: newBalance,
      });

      onClose();
    } catch (error) {
      console.error("Error during deposit:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {connected ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount (SOL)
              </label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleDeposit} className="w-full">
              Deposit
            </Button>
          </div>
          <WalletDisconnectButton />
        </DialogContent>
      ) : (
        <DialogContent className="flex justify-center items-center p-10">
          <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700" />
        </DialogContent>
      )}
    </Dialog>
  );
}
