"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

// Prisma does not support Edge without the Data Proxy currently
// export const runtime = 'edge'
export const preferredRegion = "home";
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center ">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
        Cookbook 🍱
      </h1>

      <Button className="mt-8" variant="ghost" asChild>
        <Link href="/import">Manually import</Link>
      </Button>
    </main>
  );
}
