import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowVault Savings Vault Example",
  description: "Reference Savings Vault app built with flowvault-sdk on Stacks testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
