import { cn } from "@/lib/utils";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { Import } from "lucide-react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LightSwitcher } from "@/components/theme/light-switcher";
import Providers from "@/components/providers";
import Logo from "@/components/logo";

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
        <Providers>
          <div className="py-5 shadow-sm border-b">
            <div className="max-w-screen-xl mx-auto justify-between flex px-8">
              <p className="text-3xl font-bold tracking-tight">
                <Link href="/" className="flex gap-2 items-center">
                  Cookbook
                  <Logo className="w-7 h-7" />
                </Link>
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/imports"
                  className="text-sm flex items-center gap-2 font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <Import className="w-4 h-4" />
                  Import
                </Link>
                <LightSwitcher />
              </div>
            </div>
          </div>
          <div className="p-8 max-w-screen-xl mx-auto">{children}</div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
