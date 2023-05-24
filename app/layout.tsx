import { cn } from "@/lib/utils";
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata = {
  title: "Vercel Postgres Demo with Prisma",
  description:
    "A simple Next.js app with Vercel Postgres as the database and Prisma as the ORM",
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
          "min-h-screen bg-background font-sans antialiased p-10",
          inter.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
