"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DepositModal } from "./deposit-modal";

export function BalanceCard({ balance, deposits, getDepositBalance }: any) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-medium mb-1">Deposited Amount</h3>
            <p className="text-3xl font-bold">{balance.toFixed(4)} SOL</p>
          </div>
          <Button onClick={() => setIsDepositModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Funds
          </Button>
        </div>
      </Card>

      <DepositModal
        open={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          getDepositBalance();
        }}
      />
    </>
  );
}
