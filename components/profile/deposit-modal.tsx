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
import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
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
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { connected, publicKey } = useWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  // Fetch wallet balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          setIsLoadingBalance(true);
          const balance = await connection.getBalance(publicKey);
          setWalletBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
          toast.error("Failed to load wallet balance");
        } finally {
          setIsLoadingBalance(false);
        }
      } else {
        setWalletBalance(null);
      }
    };

    fetchBalance();
    
    // Set up balance refresh on interval
    const refreshInterval = setInterval(fetchBalance, 20000); // Refresh every 20 seconds
    
    return () => clearInterval(refreshInterval);
  }, [connection, publicKey, connected]);

  const setMaxAmount = () => {
    if (walletBalance !== null) {
      // Reserve 0.01 SOL for transaction fees and minimum balance
      const MAX_RESERVE = 0.01;
      const maxDeposit = Math.max(0, walletBalance - MAX_RESERVE);
      // Round to 9 decimal places (SOL precision)
      const roundedMax = Math.floor(maxDeposit * 1e9) / 1e9;
      setAmount(roundedMax.toString());
    }
  };

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

    // Check if amount exceeds available balance
    if (walletBalance !== null && Number(amount) > walletBalance - 0.001) {
      toast.error("Insufficient balance for transaction (including fees)");
      return;
    }

    console.log('Starting deposit process:', {
      amount,
      publicKey: publicKey.toString(),
      twitterUsername: user.twitter.username
    });

    setIsLoading(true);
    let confirmationStrategy: any;
    let signature: string = '';
    
    try {
      const amountInLamports = Number(amount) * LAMPORTS_PER_SOL;
      console.log('Amount in lamports:', amountInLamports);

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
      signature = await wallet.sendTransaction(transaction, connection);
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
      ): res is any => {
        return (
          res !== null &&
          typeof res === "object" &&
          "context" in res &&
          "value" in res &&
          typeof res.value === "object" &&
          res.value !== null &&
          ("err" in res.value && res.value.err === null)
        );
      };

      if (!isSuccessfulConfirmation(status)) {
        if (status && typeof status === 'object' && 'value' in status && status.value && typeof status.value === 'object' && 'err' in status.value) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        } else {
          throw new Error('Transaction confirmation failed or timed out.');
        }
      }

      // Refresh wallet balance after successful transaction
      const newWalletBalance = await connection.getBalance(publicKey);
      setWalletBalance(newWalletBalance / LAMPORTS_PER_SOL);

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

      // Create Solana Explorer link
      const explorerUrl = `https://solscan.io/tx/${signature}`;
 
      toast.success(
        <div className="flex flex-col gap-2">
          <div>Deposit successful!</div>
          <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-700"
          >
            View transaction on Solscan
          </a>
        </div>,
        {
          duration: 6000, 
        }
      );

      onClose();
    } catch (error) {
      console.error("Error during deposit:", error);
      if (error instanceof Error && error.message.includes('timeout')) {
        console.error("Confirmation timed out. Strategy used:", confirmationStrategy);
      }
      
      // Even if there was an error in our confirmation process,
      // check if we have a signature and the transaction might have gone through
      if (signature) {
        const explorerUrl = `https://solscan.io/tx/${signature}`;
        toast.error(
          <div className="flex flex-col gap-2">
            <div>{error instanceof Error ? error.message : "Failed to process deposit"}</div>
            <div className="text-sm">Your transaction might still have gone through.</div>
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-700"
            >
              Check status on Solscan
            </a>
          </div>,
          {
            duration: 8000,
          }
        );
        
        // Try to refresh balance even after error, in case transaction went through
        if (publicKey) {
          try {
            const refreshedBalance = await connection.getBalance(publicKey);
            setWalletBalance(refreshedBalance / LAMPORTS_PER_SOL);
          } catch (balanceError) {
            console.error("Failed to refresh wallet balance after error:", balanceError);
          }
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to process deposit";
        toast.error(errorMessage);
      }
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
            {walletBalance !== null && (
              <div className="text-sm text-muted-foreground flex justify-between items-center">
                <span>Wallet Balance: {isLoadingBalance ? "Loading..." : `${walletBalance.toFixed(4)} SOL`}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={setMaxAmount}
                  disabled={isLoadingBalance || walletBalance <= 0}
                >
                  Max
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium flex justify-between">
                <span>Amount (SOL)</span>
                {walletBalance !== null && Number(amount) > walletBalance - 0.001 && Number(amount) > 0 && (
                  <span className="text-red-500 text-xs">Insufficient balance</span>
                )}
              </label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.000000001"
                className={walletBalance !== null && Number(amount) > walletBalance - 0.001 && Number(amount) > 0 ? "border-red-500" : ""}
              />
            </div>
            <Button 
              onClick={handleDeposit} 
              className="w-full"
              disabled={
                isLoading || 
                isLoadingBalance || 
                (walletBalance !== null && Number(amount) > walletBalance - 0.001) ||
                !amount || 
                Number(amount) <= 0
              }
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