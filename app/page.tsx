"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Twitter,
  Send,
  Wallet,
  Zap,
  ArrowRight,
  Shield,
  Globe,
  ClipboardCopy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

export default function Home() {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const contractAddress = "Coming Soon";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(contractAddress).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [contractAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/80">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 pb-32">
        <div className="flex flex-col items-center text-center space-y-8 relative">
          {/* Decorative elements - Using accent color now */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50vw] h-[50vw] max-w-[600px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[33vw] h-[33vw] max-w-[400px] bg-accent/10 rounded-full blur-3xl -z-10 animate-spin-slow animation-delay-300" />

          <div className="flex items-center gap-3 text-primary animate-float">
            <Send className="w-12 h-12" />
            <h1 className="text-5xl font-bold">AeroSol</h1>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Send Crypto with Twitter/X Handles
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl">
            The easiest way to send Solana. No complicated wallet setup needed. Because there are no tarrifs on memecoins.
          </p>

          {/* Contract Address Bar */}
          <div className="mt-6 p-3 bg-secondary/80 rounded-lg flex items-center justify-between max-w-lg mx-auto text-sm border border-border/50 shadow-sm">
            <span className="font-mono text-muted-foreground overflow-hidden overflow-ellipsis whitespace-nowrap mr-2">
              Contract Address: {contractAddress}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-primary shrink-0"
            >
              <ClipboardCopy className="w-4 h-4 mr-1" />
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
          {/* End Contract Address Bar */}

          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Button
              size="lg"
              className="gap-2 text-lg px-8 py-6 hover:scale-105 transition-transform animate-pulse-glow"
              onClick={() => router.push("/profile")}
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-secondary/50 py-32">
        <div className="container mx-auto px-4 md:px-20">
          <div className="text-center mb-20">
            <h3 className="text-3xl font-bold mb-4">Why Choose AeroSol?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of social payments with our innovative
              platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-card shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 group">
              <Zap className="w-12 h-12 text-yellow-500 mb-6 group-hover:animate-bounce-subtle" />
              <h4 className="text-xl font-semibold mb-3">Lightning Fast</h4>
              <p className="text-muted-foreground">
                Send payments instantly to any Twitter user without complicated
                wallet addresses.
              </p>
            </Card>

            <Card className="p-8 bg-card shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 animation-delay-150 group">
              <Shield className="w-12 h-12 text-blue-500 mb-6 group-hover:animate-bounce-subtle" />
              <h4 className="text-xl font-semibold mb-3">Secure & Private</h4>
              <p className="text-muted-foreground">
                Built on Solana blockchain with enterprise-grade security
                protocols.
              </p>
            </Card>

            <Card className="p-8 bg-card shadow-sm hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 animation-delay-300 group">
              <Globe className="w-12 h-12 text-green-500 mb-6 group-hover:animate-bounce-subtle" />
              <h4 className="text-xl font-semibold mb-3">Global Reach</h4>
              <p className="text-muted-foreground">
                Connect with Twitter users worldwide and send payments
                seamlessly.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <h3 className="text-3xl font-bold mb-4">How It Works</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started with AeroSol in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
          {/* Connection lines using primary */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/30 to-primary/30 -translate-y-1/2" />

          <div className="text-center relative group">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <Twitter className="w-10 h-10 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-3">1. Connect Twitter</h4>
            <p className="text-muted-foreground">
              Link your Twitter account to get started
            </p>
          </div>

          <div className="text-center relative group">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 animation-delay-150">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-3">2. Connect Wallet</h4>
            <p className="text-muted-foreground">Link your Solana wallet</p>
          </div>

          <div className="text-center relative group">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <Send className="w-10 h-10 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-3">3. Start Sending</h4>
            <p className="text-muted-foreground">
              Send payments using Twitter handles
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-b from-background to-secondary/80 py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="relative">
            <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
            <p className="text-xl mb-8 text-foreground/80 max-w-2xl mx-auto">
              Join thousands of users who are already using AeroSol to send crypto
              payments on Twitter.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-lg px-8 py-6 hover:scale-105 transition-transform animate-pulse-glow"
              onClick={() => router.push("/profile")}
            >
              Launch App <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
