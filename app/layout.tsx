import { cn } from "@/lib/utils";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { Import } from "lucide-react";

export const metadata = {
  title: "Cookbook",
  description: "A collection of low fodmap recipes",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "h-screen bg-background font-sans antialiased flex-1",
          inter.variable
        )}
      >
        <nav className="bg-[#ecf6f2] text-[] py-10 shadow-sm">
          <div className="max-w-screen-xl mx-auto justify-between flex px-8">
            <h1 className="text-3xl font-bold tracking-tight">
              <Link href="/">Cookbook 🍱</Link>
            </h1>
            <div className="flex gap-4">
              <Link
                href="/import"
                className="flex gap-2 items-center text-lg font-semibold hover:underline"
              >
                <Import className="w-4 h-4" />
                Import
              </Link>
            </div>
          </div>
        </nav>
        <main className="p-8 max-w-screen-xl mx-auto">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
