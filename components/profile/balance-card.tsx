"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { DepositModal } from "./deposit-modal";
import { WithdrawModal } from "./withdraw-modal";

export function BalanceCard({ balance, deposits, getDepositBalance, walletAddress }: any) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-medium mb-1">Deposited Amount</h3>
            <p className="text-3xl font-bold">{balance.toFixed(4)} SOL</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsWithdrawModalOpen(true)} 
              variant="outline" 
              className="gap-2"
              disabled={balance <= 0}
            >
              <Minus className="w-4 h-4" /> Withdraw
            </Button>
            <Button onClick={() => setIsDepositModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Funds
            </Button>
          </div>
        </div>
      </Card>

      <DepositModal
        walletAddress={walletAddress}
        open={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          getDepositBalance();
        }}
      />

      <WithdrawModal
        open={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          getDepositBalance();
        }}
        balance={balance}
        getDepositBalance={getDepositBalance}
      />
    </>
  );
}
