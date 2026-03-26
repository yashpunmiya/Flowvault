import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowVault | Secure Stacks Treasury",
  description: "Programmable routing vault for USDCx on Stacks blockchain. Lock, split, and automate your stablecoin flows.",
  other: {
    "talentapp:project_verification":
      "a61a14edd67b7d3264d293770ca39a911e7b422e23f5f121d131374cdc43ef1e8480f5a3c318d2bed52bb25463683f7c259ff3b85e37e717a5b0e98404d4f760",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
