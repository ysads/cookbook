"use client";

import { Button } from "@/components/ui/button";
import { Import, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { LightSwitcher } from "./theme/light-switcher";
import Link from "next/link";
import Logo from "./logo";

export default function TopBar() {
  const session = useSession();

  return (
    <div className="py-5 shadow-sm border-b">
      <div className="max-w-screen-xl mx-auto justify-between flex px-8">
        <p className="text-3xl font-bold tracking-tight">
          <Link href="/" className="flex gap-2 items-center">
            Cookbook
            <Logo className="w-7 h-7" />
          </Link>
        </p>
        <div className="flex items-center gap-2">
          <Button asChild variant="link" size="sm">
            <Link href="/imports" className="flex gap-2 items-center">
              <Import className="w-4 h-4" />
              Import
            </Link>
          </Button>
          <Button
            className="flex gap-2 items-center"
            variant="link"
            size="sm"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
          <LightSwitcher />
          {session.data?.user && (
            <img src={session.data.user.image} className="rounded-full w-8" />
          )}
        </div>
      </div>
    </div>
  );
}
