import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowPay",
  description: "Salary automation reference app built with FlowVault SDK on Stacks testnet.",
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
