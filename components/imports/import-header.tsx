"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { ArchiveX } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { request, extractError } from "@/lib/request";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { RecipeImport } from "@prisma/client";

type Props = {
  recipeImport: RecipeImport;
};
export default function ImportHeader({ recipeImport }: Props) {
  const router = useRouter();

  const rejectMutation = useMutation({
    mutationFn: () =>
      request("post", "/api/imports/reject", { id: recipeImport.id }),
    onSuccess: () => {
      toast({ title: "Import rejected", duration: 3000 });
      router.refresh();
    },
    onError: (error) => {
      toast({
        title:
          "Failed to reject import. Server returned: " + extractError(error),
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  return (
    <div className="flex items-center justify-between space-y-2 gap-6">
      <h1 className="text-3xl font-bold tracking-tight gap-2 flex lg:flex-row flex-col items-start lg:items-center">
        <span>Editing {recipeImport.title || "(Unnamed)"}</span>
        <Badge
          variant={
            recipeImport.status === "success"
              ? "success"
              : recipeImport.status === "partial"
              ? "warning"
              : "destructive"
          }
        >
          {recipeImport.status}
        </Badge>
      </h1>
      <Button
        className="flex gap-2 items-center"
        variant="destructiveOutline"
        onClick={() => rejectMutation.mutate()}
        disabled={rejectMutation.isLoading}
      >
        <ArchiveX size={20} />
        {rejectMutation.isLoading ? "Rejecting" : "Reject"}
      </Button>
    </div>
  );
}
