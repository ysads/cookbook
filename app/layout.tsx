import "./globals.css";

import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Providers from "@/components/providers";
import TopBar from "@/components/top-bar";
import { Suspense } from "react";

export const metadata = {
  title: "Cookbook",
  description: "A collection of low fodmap recipes",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <html lang="en">
      <body
        className={cn(
          "h-screen bg-background font-sans antialiased flex-1",
          inter.variable
        )}
      >
        <Providers session={session}>
          <>
            <TopBar />
            <div className="p-0">
              <Suspense>{children}</Suspense>
            </div>
            <Toaster />
          </>
        </Providers>
      </body>
    </html>
  );
}
