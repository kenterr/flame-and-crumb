import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flame & Crumb — Order",
  description: "Order from Flame & Crumb for pickup or delivery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
