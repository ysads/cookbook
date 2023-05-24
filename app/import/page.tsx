"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BaseRecipe } from "@/lib/sources/types";
import { useState } from "react";
import { Martian_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const martianMono = Martian_Mono({ subsets: ["latin"] });

export default function Import() {
  const [parsed, setParsed] = useState<BaseRecipe | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setParsed(null);

    const response = await fetch("/import/api", {
      method: "post",
      body: new FormData(event.currentTarget),
    });

    if (response.ok) {
      setParsed((await response.json()) as unknown as BaseRecipe);
    } else {
    }
    console.log(response);
  }

  return (
    <main className="relative flex min-h-screen flex-col">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Import</h1>
      <form className="mt-16" onSubmit={handleSubmit}>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="url"
          >
            Url
          </label>
          <Input
            type="text"
            id="url"
            name="url"
            placeholder="https://www.example.com"
          />
        </div>
        <Button className="mt-2" type="submit">
          Import
        </Button>
      </form>

      {parsed ? (
        <>
          <Separator className="mt-6" />
          <img
            className="mt-6"
            src={parsed.imageUrl}
            width={400}
            alt={parsed.title}
          />
          <ScrollArea
            className={cn(
              "mt-2 h-[400px] w-full rounded-md border p-4 text-xs bg-slate-200/75",
              martianMono.className
            )}
          >
            <pre contentEditable>{JSON.stringify(parsed, null, 2)}</pre>
          </ScrollArea>
        </>
      ) : null}
    </main>
  );
}
