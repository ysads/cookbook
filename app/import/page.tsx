"use client";

import { Martian_Mono } from "next/font/google";
import RecipeLeads from "./components/recipe-leads";
import RecipeImport from "./components/recipe-import";
import { ParserOutput } from "@/lib/sources";
import { useState } from "react";

export default function Import() {
  const [parsed, setParsed] = useState<ParserOutput | null>(null);

  return (
    <main className="relative flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Import</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-8 lg:grid-cols-12 grow">
        <RecipeLeads onImport={(p) => setParsed(p)} />
        {parsed && (
          <section className="rounded-lg border bg-card text-card-foreground shadow-sm md:col-span-4 lg:col-span-9 p-5">
            <RecipeImport key={parsed.url} lead={parsed} />
          </section>
        )}
      </div>

      {/* {parsed?.status === "success" || parsed?.status === "error" ? (
        <>
          {parsed?.status === "error" && (
            <ScrollArea
              className={cn(
                "mt-2 h-[400px] w-full rounded-md border p-4 text-xs bg-slate-200/75",
                martianMono.className
              )}
            >
              <pre contentEditable>
                {JSON.stringify(parsed.errors, null, 2)}
              </pre>
            </ScrollArea>
          )}

          <Separator className="mt-6" />
          <img
            className="mt-6"
            src={parsed.recipe?.imageUrl}
            width={400}
            alt={parsed.recipe?.title || "Recipe image"}
          />
          <ScrollArea
            className={cn(
              "mt-2 h-[400px] w-full rounded-md border p-4 text-xs bg-slate-200/75",
              martianMono.className
            )}
          >
            <pre contentEditable>{JSON.stringify(parsed.recipe, null, 2)}</pre>
          </ScrollArea>
        </>
      ) : null} */}
    </main>
  );
}
