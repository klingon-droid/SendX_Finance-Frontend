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
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction, VersionedTransaction, RpcResponseAndContext, SignatureResult } from "@solana/web3.js";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { toast } from "sonner";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function DepositModal({ open, onClose, walletAddress }: DepositModalProps) {
  const { user } = usePrivy();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { connected, publicKey } = useWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!user?.twitter?.username) {
      toast.error("Please connect your Twitter account first");
      return;
    }

    console.log('Starting deposit process:', {
      amount,
      publicKey: publicKey.toString(),
      twitterUsername: user.twitter.username
    });

    setIsLoading(true);
    let confirmationStrategy: any;
    try {
      const amountInLamports = Number(amount) * 10 ** 9;
      console.log('Amount in lamports:', amountInLamports);

      // const botPublicKey = process.env.NEXT_PUBLIC_BOT_PUBLIC_KEY;
      const botPublicKey = walletAddress;
      if (!botPublicKey) {
        throw new Error("Bot public key not configured");
      }
      console.log('Bot public key:', botPublicKey);

      // Get the latest blockhash with retries
      let blockhash, lastValidBlockHeight;
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await connection.getLatestBlockhash('confirmed');
          blockhash = response.blockhash;
          lastValidBlockHeight = response.lastValidBlockHeight;
          console.log('Got latest blockhash:', { blockhash, lastValidBlockHeight });
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            throw new Error("Failed to get latest blockhash after 3 attempts");
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const transaction = new Transaction({
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(botPublicKey),
          lamports: amountInLamports,
        })
      );

      console.log('Sending transaction...');
      const signature = await wallet.sendTransaction(transaction, connection);
      console.log('Transaction sent, signature:', signature);
      
      confirmationStrategy = {
        signature,
        blockhash,
        lastValidBlockHeight,
      };

      // Create a promise that rejects after 30 seconds
      const timeout = new Promise((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('Transaction confirmation timeout - please check your wallet for status'));
        }, 30000);
      });

      console.log('Waiting for transaction confirmation...');
      const status = await Promise.race([
        connection.confirmTransaction(confirmationStrategy, 'confirmed'),
        timeout
      ]);

      console.log('Transaction confirmation status:', status);

      // Type guard to check if the status is a successful confirmation
      const isSuccessfulConfirmation = (
        res: unknown
      ): res is RpcResponseAndContext<SignatureResult> => {
        return (
          res !== null &&
          typeof res === "object" &&
          "context" in res &&
          "value" in res &&
          typeof res.value === "object" &&
          res.value !== null &&
          !("err" in res.value)
        );
      };

      if (!isSuccessfulConfirmation(status)) {
        if (status && typeof status === 'object' && 'value' in status && status.value && typeof status.value === 'object' && 'err' in status.value) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        } else {
          throw new Error('Transaction confirmation failed or timed out.');
        }
      }

      console.log('Fetching current balance from API...');
      const response = await axios.get(
        `/api/userBalance?username=${user.twitter.username}`
      );
      console.log('Current balance API response:', response.data);
      
      let currentBalance = 0;
      if (response.data.data) {
        currentBalance = response.data.data.balance;
      }
      console.log('Current balance:', currentBalance);

      const newBalance = currentBalance + Number(amount);
      console.log('New balance to be saved:', newBalance);

      console.log('Updating balance in API...');
      const updateResponse = await axios.post("/api/userBalance", {
        username: user.twitter.username,
        balance: newBalance,
      });
      console.log('Balance update API response:', updateResponse.data);

      toast.success("Deposit successful!");
      onClose();
    } catch (error) {
      console.error("Error during deposit:", error);
      if (error instanceof Error && error.message.includes('timeout')) {
        console.error("Confirmation timed out. Strategy used:", confirmationStrategy);
      }
      const errorMessage = error instanceof Error ? error.message : "Failed to process deposit";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {connected ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Enter the amount of SOL you want to deposit into your AeroSol account.
            </DialogDescription>
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
                min="0"
                step="0.000000001"
              />
            </div>
            <Button 
              onClick={handleDeposit} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Deposit"}
            </Button>
          </div>
          <WalletDisconnectButton />
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Connect a wallet on Solana to continue
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <WalletMultiButton className="w-full !bg-indigo-600 hover:!bg-indigo-700 !h-auto !py-4" />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
