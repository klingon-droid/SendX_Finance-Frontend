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
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

export function DepositModal({ open, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const { connected } = useWallet();
  console.log(connected);

  const handleDeposit = () => {
    // Handle deposit logic here
    onClose();
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
