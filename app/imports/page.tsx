"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { filterImports } from "@/lib/api/filterImports";
import { Queries } from "@/lib/queries";
import { StringifiedDates } from "@/lib/types";
import { RecipeImport } from "@prisma/client";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  ArchiveX,
  ArrowUpDown,
  Edit,
  PackageMinus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ImportFilterToolbar, {
  ImportFilters,
} from "@/components/imports/import-filter-toolbar";
import MaxWSize from "@/components/ui/max-w-size";
import { useRouter } from "next/navigation";
import { useWritableSearchParams } from "@/lib/hooks/useWritableSearchParams";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { useMemo } from "react";

type Filters = ImportFilters & { page: number; take: number };

const MAP_STATUS_TO_VARIANT = {
  partial: "warning",
  success: "success",
  error: "destructive",
};

const TAKE_PER_PAGE = 10;

const buildTableColumns = (
  queryClient: QueryClient
): ColumnDef<StringifiedDates<Omit<RecipeImport, "errors">>>[] => [
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
        <div className="flex space-x-2">
          <Tooltip>
            <TooltipTrigger>
              <Button
                asChild
                className="rounded-full w-8 h-8 p-2"
                variant="secondary"
              >
                <Link href={`/imports/${row.original.id}`}>
                  <Edit />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button
                className="rounded-full w-8 h-8 p-2"
                variant="destructive"
                onClick={() => {
                  console.log("::: row", row.original);
                  fetch(`/api/imports/reject`, {
                    method: "post",
                    body: JSON.stringify({ id: row.original.id }),
                  }).then((res) => {
                    if (res.ok) {
                      queryClient
                        .invalidateQueries([Queries.filteredImports])
                        .then(() => {
                          toast(
                            res.ok
                              ? {
                                  variant: "success",
                                  title: "Rejected!",
                                  duration: 1000,
                                }
                              : {
                                  variant: "destructive",
                                  title: "Failed to reject",
                                  duration: 1000,
                                }
                          );
                        });
                    }
                  });
                }}
              >
                <ArchiveX />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reject</TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];

export default async function ImportsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { searchParams, setSearchParams } =
    useWritableSearchParams<Filters>(router);

  const filters: Filters = {
    term: searchParams.get("term") || "",
    status: searchParams.has("status")
      ? (searchParams.getAll("status") as Filters["status"])
      : ["partial"],
    page: parseInt(searchParams.get("page") || "0"),
    take: TAKE_PER_PAGE,
  };
  const pagination = { pageIndex: filters.page, pageSize: filters.take };

  const query = useQuery({
    queryKey: [Queries.filteredImports, filters],
    queryFn: () => filterImports(filters),
  });

  const tableColumns = useMemo(
    () => buildTableColumns(queryClient),
    [queryClient]
  );

  return (
    <MaxWSize>
      <main className="relative flex h-full flex-col space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Recipe Imports</h1>
        </div>
        <div className="grow">
          <ImportFilterToolbar
            filters={filters}
            onFilter={(newFilters) => {
              setSearchParams(
                {
                  page: 0,
                  term: newFilters.term,
                  status: newFilters.status,
                },
                true
              );
            }}
          />
          {query.isInitialLoading ? (
            <ul className="py-10">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <ImportSkeleton key={`import-${index}`} />
                ))}
            </ul>
          ) : (
            <div className="mx-auto py-10">
              <DataTable
                columns={tableColumns}
                data={query.data?.imports || []}
                tableOptions={{
                  manualPagination: true,
                  state: { pagination },
                  pageCount: query.data?.meta.pages,
                  onPaginationChange: (updater) => {
                    // INFO: the arg is a functional updater, ie, a fn takes current state
                    // and uses it to produce the next state -- despite the types suggesting
                    // the argument could *already* be the updated state.
                    if (typeof updater === "function") {
                      const nextState = updater(pagination);
                      setSearchParams({ page: nextState.pageIndex });
                    }
                  },
                }}
              />
            </div>
          )}
        </div>
      </main>
    </MaxWSize>
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
