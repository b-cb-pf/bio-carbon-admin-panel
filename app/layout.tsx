import type { Metadata } from "next";
import "./globals.css";
import "@/styles/admin.css";
import "@/styles/components.css";
import "@/styles/auth.css";

export const metadata: Metadata = {
  title: "CarbonProfile | Admin Panel",
  description: "CarbonProfile administration portal",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
