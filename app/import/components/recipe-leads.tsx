"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ListOutput } from "@/lib/sources";
import { RecipeLead } from "@/lib/sources/types";
import { Edit } from "lucide-react";
import { useState } from "react";

export default function RecipeLeads() {
  const [leads, setLeads] = useState<RecipeLead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState<string>("");

  async function fetchRecipeLeads(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    fetch(`/import/api?url=${url}`).then(async (res) => {
      const data = (await res.json()) as unknown as ListOutput;
      setLeads(data.list);
      setIsLoading(false);
    });
  }

  return (
    <>
      <p className="text-lg font-semibold leading-tight px-3 pt-5">
        Search fodmap recipes
      </p>

      <div>
        <form
          className="flex justify-between items-center space-x-2 p-3"
          onSubmit={fetchRecipeLeads}
        >
          <Input
            type="text"
            id="url"
            name="url"
            value={url}
            placeholder="https://www.example.com"
            onChange={(event) => setUrl(event.target.value)}
          />
          <Button size="sm" variant="secondary" type="submit">
            Search
          </Button>
        </form>
      </div>
      <Separator className="w-full" />
      {isLoading
        ? Array(5)
            .fill(0)
            .map((_, index) => <RecipeLeadSkeleton key={index} />)
        : leads.length
        ? leads.map((lead) => <RecipeLead key={lead.url} lead={lead} />)
        : null}
    </>
  );
}

function RecipeLead(props: { lead: RecipeLead }) {
  return (
    <>
      <div className="flex items-center space-x-4 p-3">
        {/* <img
          className="w-20 h-20 object-cover rounded-lg"
          src={props.lead.imageUrl}
        /> */}
        <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2 h-full grow">
          <p className="text-sm font-medium leading-5">{props.lead.title}</p>
          <p className="flex justify-between">
            <Button className="rounded-full w-8 h-8 p-2" variant="secondary">
              <Edit />
            </Button>
          </p>
        </div>
      </div>
      <Separator className="flex-1" />
    </>
  );
}

function RecipeLeadSkeleton() {
  return (
    <>
      <div className="flex items-center space-x-4 p-3">
        <Skeleton className="h-20 w-20 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <Separator className="flex-1" />
    </>
  );
}
