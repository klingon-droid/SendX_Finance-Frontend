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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider endpoint={"https://api.mainnet-beta.solana.com"}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
              // Customize Privy's appearance in your app
              appearance: {
                walletChainType: "solana-only",
                theme: "light",
                accentColor: "#676FFF",
              },
              // Enable specific login methods including Twitter
              loginMethods: ["email", "twitter"],
              // Create embedded wallets for users who don't have a wallet
              embeddedWallets: {
                createOnLogin: "off",
              },
              solanaClusters: [
                { name: "mainnet-beta", rpcUrl: "https://api.mainnet-beta.solana.com" },
              ],
            }}
          >
            {children}
          </PrivyProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
