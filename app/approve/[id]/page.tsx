"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import axios from "axios";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

export default function TransactionApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params?.id as string;
  
  const { user } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { connection } = useConnection();
  const { wallets } = useSolanaWallets();
  const [embeddedWallet, setEmbeddedWallet] = useState<any>(null);
  
  const [transaction, setTransaction] = useState<{
    id: string;
    sender: string;
    recipient: string;
    recipientAddress: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'expired';
  } | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  // Find the Privy embedded wallet when wallets are loaded
  useEffect(() => {
    const privyWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
    setEmbeddedWallet(privyWallet);
  }, [wallets]);

  // Fetch transaction details
  useEffect(() => {
    async function fetchTransactionDetails() {
      if (!transactionId) return;
      
      try {
        setIsLoadingTransaction(true);
        const response = await axios.get(`http://localhost:3001/api/transactions/${transactionId}`);
        
        if (response.data.success) {
          setTransaction(response.data.transaction);
        } else {
          setError("Failed to load transaction details");
        }
      } catch (error: any) {
        setError(error.response?.data?.error || "Transaction not found or has expired");
        console.error("Error fetching transaction:", error);
      } finally {
        setIsLoadingTransaction(false);
      }
    }
    
    fetchTransactionDetails();
  }, [transactionId]);

  // Fetch wallet balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (embeddedWallet && user?.wallet?.address) {
        try {
          setIsLoadingBalance(true);
          const publicKey = new PublicKey(user.wallet.address);
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
  }, [connection, embeddedWallet, user?.wallet?.address]);

  const handleApprove = async () => {
    if (!embeddedWallet || !user?.wallet?.address || !transaction) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Check if Twitter username matches transaction sender
    if (user?.twitter?.username && user.twitter.username.toLowerCase() !== transaction.sender.toLowerCase()) {
      toast.warning("This transaction was requested by a different Twitter account");
      // Allow to continue anyway - user might have multiple Twitter accounts
    }

    // Check if amount exceeds available balance
    if (walletBalance !== null && transaction.amount > walletBalance - 0.001) {
      toast.error("Insufficient balance for transaction (including fees)");
      return;
    }

    console.log('Starting transaction approval process:', {
      transactionId: transaction.id,
      amount: transaction.amount,
      recipientAddress: transaction.recipientAddress,
      walletAddress: user.wallet.address
    });

    setIsLoading(true);
    let confirmationStrategy: any;
    let signature: string = '';
    
    try {
      const amountInLamports = transaction.amount * LAMPORTS_PER_SOL;
      console.log('Amount in lamports:', amountInLamports);

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

      const publicKey = new PublicKey(user.wallet.address);
      const tx = new Transaction({
        feePayer: publicKey,
        recentBlockhash: blockhash
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(transaction.recipientAddress),
          lamports: amountInLamports,
        })
      );

      console.log('Signing transaction with Privy embedded wallet...');
      
      // Sign the transaction using Privy's embedded wallet
      const signedTx = await embeddedWallet.signTransaction(tx);
      
      console.log('Sending signed transaction...');
      signature = await connection.sendRawTransaction(signedTx.serialize());
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

      // Update transaction status on backend
      console.log('Updating transaction status on backend...');
      await axios.post("/api/transactions/complete", {
        id: transaction.id,
        signature,
        senderAddress: publicKey.toBase58()
      });
      
      // Refresh wallet balance after successful transaction
      const newWalletBalance = await connection.getBalance(publicKey);
      setWalletBalance(newWalletBalance / LAMPORTS_PER_SOL);

      // Create Solana Explorer link
      const explorerUrl = `https://solscan.io/tx/${signature}`;
 
      toast.success(
        <div className="flex flex-col gap-2">
          <div>Transaction successful!</div>
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

      // Redirect to success page
      setTimeout(() => {
        router.push(`/transaction/success?tx=${signature}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error during transaction:", error);
      if (error instanceof Error && error.message.includes('timeout')) {
        console.error("Confirmation timed out. Strategy used:", confirmationStrategy);
      }
      
      // Even if there was an error in our confirmation process,
      // check if we have a signature and the transaction might have gone through
      if (signature && user?.wallet?.address) {
        const explorerUrl = `https://solscan.io/tx/${signature}`;
        toast.error(
          <div className="flex flex-col gap-2">
            <div>{error instanceof Error ? error.message : "Failed to process transaction"}</div>
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
        try {
          const publicKey = new PublicKey(user.wallet.address);
          const refreshedBalance = await connection.getBalance(publicKey);
          setWalletBalance(refreshedBalance / LAMPORTS_PER_SOL);
        } catch (balanceError) {
          console.error("Failed to refresh wallet balance after error:", balanceError);
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to process transaction";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingTransaction) {
    return (
      <div className="container mx-auto max-w-md py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-6">Loading Transaction...</h1>
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-md py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-6">Transaction Error</h1>
          <p className="text-red-500 mb-6">{error}</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto max-w-md py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-6">Transaction Not Found</h1>
          <Button
            onClick={() => router.push("/")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-12 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-indigo-600">
          <h2 className="text-xl font-bold text-white">Approve Transaction</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">From</p>
            <p className="font-medium">@{transaction.sender}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">To</p>
            <p className="font-medium">@{transaction.recipient}</p>
          </div>
          
          <div className="mb-6 border-b pb-6">
            <p className="text-sm text-gray-500 mb-1">Amount</p>
            <p className="font-bold text-2xl text-indigo-600">{transaction.amount} SOL</p>
          </div>
          
          {embeddedWallet && user?.wallet?.address ? (
            <>
              {walletBalance !== null && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Wallet Balance</p>
                    <p className="font-medium">{isLoadingBalance ? "Loading..." : `${walletBalance.toFixed(4)} SOL`}</p>
                  </div>
                  
                  {walletBalance < transaction.amount + 0.001 && (
                    <p className="text-red-500 text-sm mt-2">
                      Insufficient balance for this transaction (including fees)
                    </p>
                  )}
                </div>
              )}
              
              <Button 
                onClick={handleApprove} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mb-4"
                disabled={
                  isLoading || 
                  isLoadingBalance || 
                  (walletBalance !== null && walletBalance < transaction.amount + 0.001) ||
                  transaction.status !== 'pending'
                }
              >
                {isLoading ? "Processing..." : "Approve & Send"}
              </Button>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>Using Privy embedded wallet: {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}</p>
              </div>
            </>
          ) : (
            <div>
              <p className="text-center text-gray-600 mb-4">
                {!user ? (
                  "Please sign in with your Twitter account"
                ) : (
                  "Connecting to your Privy wallet..."
                )}
              </p>
              
              {!user && (
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => router.push("/login")}
                >
                  Sign In with Twitter
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}