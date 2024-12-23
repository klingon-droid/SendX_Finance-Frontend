"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Twitter,
  Send,
  Wallet,
  Zap,
  ArrowRight,
  CheckCircle2,
  Shield,
  Globe,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 pb-32">
        <div className="flex flex-col items-center text-center space-y-8 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl -z-10" />

          <div className="flex items-center gap-3 text-primary animate-fade-in">
            <Send className="w-12 h-12" />
            <h1 className="text-5xl font-bold">SendX</h1>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            Send Crypto Payments Directly to Twitter Users
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl">
            The easiest way to send Solana payments using Twitter handles. No
            wallet address needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Button size="lg" className="gap-2 text-lg px-8 py-6">
              Get Started <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-lg px-8 py-6"
            >
              <Twitter className="w-5 h-5" /> Connect Twitter
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-secondary/50 py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h3 className="text-3xl font-bold mb-4">Why Choose SendX?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of social payments with our innovative
              platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-background/50 backdrop-blur hover:shadow-lg transition-all">
              <Zap className="w-12 h-12 text-yellow-500 mb-6" />
              <h4 className="text-xl font-semibold mb-3">Lightning Fast</h4>
              <p className="text-muted-foreground">
                Send payments instantly to any Twitter user without complicated
                wallet addresses.
              </p>
            </Card>

            <Card className="p-8 bg-background/50 backdrop-blur hover:shadow-lg transition-all">
              <Shield className="w-12 h-12 text-blue-500 mb-6" />
              <h4 className="text-xl font-semibold mb-3">Secure & Private</h4>
              <p className="text-muted-foreground">
                Built on Solana blockchain with enterprise-grade security
                protocols.
              </p>
            </Card>

            <Card className="p-8 bg-background/50 backdrop-blur hover:shadow-lg transition-all">
              <Globe className="w-12 h-12 text-green-500 mb-6" />
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
            Get started with SendX in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 to-primary/20 -translate-y-1/2" />

          <div className="text-center relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform">
              <Twitter className="w-10 h-10 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-3">1. Connect Twitter</h4>
            <p className="text-muted-foreground">
              Link your Twitter account to get started
            </p>
          </div>

          <div className="text-center relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-3">2. Connect Wallet</h4>
            <p className="text-muted-foreground">Link your Solana wallet</p>
          </div>

          <div className="text-center relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform">
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
      {/* //make bg of cta same as hero section */}
      <div className="bg-gradient-to-b from-background to-secondary py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="relative">
            <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
            <p className="text-xl mb-8 text-foreground/80 max-w-2xl mx-auto">
              Join thousands of users who are already using SendX to send crypto
              payments on Twitter.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-lg px-8 py-6"
            >
              Launch App <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
