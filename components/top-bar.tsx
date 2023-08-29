"use client";

import { Button } from "@/components/ui/button";
import { Import, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { LightSwitcher } from "./theme/light-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Logo from "./logo";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function TopBar() {
  return (
    <div className="py-3 md:py-5 shadow-sm border-b">
      <div className="px-3 max-w-screen-xl mx-auto justify-between items-center flex md:px-8">
        <p className="text-xl font-bold tracking-tight">
          <Link href="/" className="flex gap-2 items-center">
            Cookbook
            <Logo className="w-7 h-7" />
          </Link>
        </p>
        <div className="flex items-center gap-2">
          <LightSwitcher />
          <div className="block md:hidden">
            <ResponsiveDropdownMenu />
          </div>
          <div className="hidden md:flex items-center gap-2">
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
            <UserAvatar />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResponsiveDropdownMenu() {
  const session = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="link">
          <UserAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          {session.data?.user?.name || "User"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/imports" className="flex gap-2 items-center">
            <Import className="w-4 h-4" />
            Import
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitials(name?: string) {
  return (name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("");
}
function UserAvatar() {
  const session = useSession();
  const initials = useMemo(
    () => getInitials(session.data?.user?.name),
    [session]
  );

  return (
    <Avatar>
      <AvatarImage src={session.data?.user?.image} alt="Open menu" />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
