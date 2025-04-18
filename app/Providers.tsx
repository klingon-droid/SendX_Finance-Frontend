"use client";

//write a providers component that will wrap the app and provide the privy provider
import { PrivyProvider } from "@privy-io/react-auth";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { useEffect } from "react";
import { Cluster, clusterApiUrl } from "@solana/web3.js";

export function Providers({ children }: { children: React.ReactNode }) {
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta") as Cluster;
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
  const wsEndpoint = process.env.NEXT_PUBLIC_SOLANA_WS_URL || endpoint.replace(/^http/, 'ws');
  
  const config = {
    commitment: "confirmed" as const,
    wsEndpoint: wsEndpoint,
    confirmTransactionInitialTimeout: 120000,
  };

  const phantomAdapter = new PhantomWalletAdapter();

  // Optional: add more wallet adapters here

  // console.log("Solana RPC Endpoint:", endpoint);
  // console.log("Solana WebSocket Endpoint:", wsEndpoint);
  // console.log("Solana Network:", network);
  // console.log("Configured wallet:", phantomAdapter.name);
  // console.log("Privy App ID:", process.env.NEXT_PUBLIC_PRIVY_APP_ID);

  return (
    <ConnectionProvider endpoint={endpoint} config={config}>
      <WalletProvider wallets={[phantomAdapter]} autoConnect>
        <WalletModalProvider>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
              appearance: {
                walletChainType: "solana-only",
                theme: "light",
                accentColor: "#676FFF",
              },
              loginMethods: ["twitter"],
              embeddedWallets: {
                createOnLogin: "off",
              },
              defaultChain: {
                name: "solana",
                id: network === "mainnet-beta" ? 1 : 2,
                rpcUrls: {
                  default: {
                    http: [endpoint],
                  },
                },
                nativeCurrency: {
                  name: "SOL",
                  symbol: "SOL",
                  decimals: 9,
                },
              },
            }}
          >
            {children}
          </PrivyProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
