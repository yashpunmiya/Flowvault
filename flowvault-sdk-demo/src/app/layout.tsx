import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowVault SDK Demo",
  description: "Official demo for flowvault-sdk end-to-end usage",
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
