import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "./Providers";
import { Send } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SendX - Crypto Payments via Twitter",
  description: "Send Solana payments using Twitter handles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
            <footer className="border-t">
              <div className="container mx-auto px-4 md:px-20 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Send className="w-6 h-6" />
                    <span className="font-semibold">SendX</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Terms
                    </a>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Privacy
                    </a>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Contact
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground text-center md:text-left">
                    © 2024 SendX. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
