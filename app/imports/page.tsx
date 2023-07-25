"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { filterImports } from "@/lib/api/filterImports";
import { Queries } from "@/lib/queries";
import { StringifiedDates } from "@/lib/types";
import { RecipeImport } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ImportFilterToolbar, {
  ImportFilters,
} from "@/components/imports/import-filter-toolbar";

type Filters = ImportFilters & { page: number };

const MAP_STATUS_TO_VARIANT = {
  partial: "warning",
  success: "success",
  error: "destructive",
};

const tableColumns: ColumnDef<
  StringifiedDates<Omit<RecipeImport, "errors">>
>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          className="px-0"
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Recipe
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="max-w-[400px]">{row.getValue("title")}</div>;
    },
  },
  {
    accessorKey: "url",
    header: ({ column }) => {
      return (
        <Button
          className="px-0"
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          URL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="max-w-[400px]">{row.getValue("url")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          className="px-0"
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        // @ts-expect-error FIXME: status needs to be narrowed
        <Badge variant={MAP_STATUS_TO_VARIANT[row.original.status]}>
          {row.getValue("status")}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          asChild
          className="rounded-full w-8 h-8 p-2"
          variant="secondary"
        >
          <Link href={`/imports/${row.original.id}`}>
            <Edit />
          </Link>
        </Button>
      );
    },
  },
];

export default function ImportsPage() {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    term: "",
    status: ["partial"],
  });
  const query = useQuery({
    queryKey: [Queries.filteredImports, filters],
    queryFn: () => filterImports(filters),
  });

  return (
    <main className="relative flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Recipe Imports</h1>
      </div>
      <div className="grow">
        {query.isLoading ? (
          <ul>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <ImportSkeleton key={`import-${index}`} />
              ))}
          </ul>
        ) : (
          <>
            <ImportFilterToolbar
              filters={filters}
              onFilter={(newFilters) =>
                setFilters((prev) => ({ ...newFilters, page: 1 }))
              }
            />
            <div className="mx-auto py-10">
              <DataTable
                columns={tableColumns}
                data={query.data?.imports || []}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ImportSkeleton() {
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
