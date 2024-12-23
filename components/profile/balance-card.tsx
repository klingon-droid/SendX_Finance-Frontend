'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DepositModal } from "./deposit-modal";

interface BalanceCardProps {
  balance: number;
  deposits: {
    amount: number;
    date: string;
  }[];
}

export function BalanceCard({ balance, deposits }: BalanceCardProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-medium mb-1">Deposited Amount</h3>
            <p className="text-3xl font-bold">{balance.toFixed(2)} SOL</p>
          </div>
          <Button onClick={() => setIsDepositModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Funds
          </Button>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Deposits</h4>
          <div className="space-y-2">
            {deposits.map((deposit, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{deposit.date}</span>
                <span className="font-medium">+{deposit.amount} SOL</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <DepositModal 
        open={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)}
      />
    </>
  );
}