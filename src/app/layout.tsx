import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import { Providers } from "@/app/providers";
import { cn } from "@/lib/utils";
import "./globals.css";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mythic Ledger",
  description: "Order and customer records for your shop",
  applicationName: "Mythic Ledger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(oxanium.variable, oxanium.className, "h-full antialiased")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
