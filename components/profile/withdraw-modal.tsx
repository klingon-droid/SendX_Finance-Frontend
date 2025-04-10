"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  getDepositBalance: () => void;
}

export function WithdrawModal({ open, onClose, balance, getDepositBalance }: WithdrawModalProps) {
  const { user } = usePrivy();
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<{
    signature: string;
    solscanUrl: string;
  } | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();

  const handleWithdraw = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(amount) > balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!recipientAddress) {
      toast.error("Please enter a recipient address");
      return;
    }

    try {
      // Validate Solana address
      new PublicKey(recipientAddress);
    } catch (error) {
      toast.error("Invalid Solana address");
      return;
    }

    if (!user?.twitter?.username) {
      toast.error("Please connect your Twitter account first");
      return;
    }

    if (!user?.wallet?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Initiating withdrawal with data:', {
        username: user.twitter.username,
        amount: Number(amount),
        recipientAddress: recipientAddress,
        walletAddress: user.wallet.address
      });
      
      // Get the transaction from the backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/withdraw`, {
        username: user.twitter.username,
        amount: Number(amount),
        recipientAddress: recipientAddress,
        walletAddress: user.wallet.address
      });

      console.log('Withdrawal API response:', response.data);

      if (response.data.message === 'Transaction ready for signing') {
        // Deserialize the transaction
        const transaction = Transaction.from(
          Buffer.from(response.data.data.transaction, 'base64')
        );

        // Sign and send the transaction
        const signedTx = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        console.log('Transaction sent, signature:', signature);

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature);
        if (confirmation.value.err) {
          throw new Error('Transaction failed');
        }

        // Update the UI
        setTransactionDetails({
          signature,
          solscanUrl: `https://solscan.io/tx/${signature}`,
        });
        toast.success("Withdrawal successful!");
        getDepositBalance();
      } else {
        throw new Error(response.data.error || "Withdrawal failed");
      }
    } catch (error) {
      console.error("Error during withdrawal:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
        if (errorMessage.includes('Insufficient wallet balance')) {
          toast.error("Your wallet needs some SOL to cover transaction fees. Please deposit a small amount of SOL to your wallet first.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to process withdrawal";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTransactionDetails(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            {transactionDetails ? (
              <div className="space-y-4">
                <p>Your withdrawal was successful!</p>
                <div className="flex items-center gap-2">
                  <a
                    href={transactionDetails.solscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    View transaction on Solscan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              "Enter the amount of SOL you want to withdraw and the recipient address."
            )}
          </DialogDescription>
        </DialogHeader>
        {!transactionDetails && (
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
                min="0"
                max={balance}
                step="0.000000001"
              />
              <p className="text-sm text-muted-foreground">
                Available balance: {balance.toFixed(4)} SOL
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="recipient" className="text-sm font-medium">
                Recipient Address
              </label>
              <Input
                id="recipient"
                placeholder="Enter Solana address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleWithdraw} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Withdraw"}
            </Button>
          </div>
        )}
        {transactionDetails && (
          <div className="flex justify-end">
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 