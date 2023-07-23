import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useWritableSearchParams } from "@/lib/hooks/useWritableSearchParams";

type Props = {
  pages: number;
  currPage: number;
};

export default function PageNavigation({ currPage, pages }: Props) {
  const { getUpdatedQueryString } = useWritableSearchParams();
  const nextPage = currPage + 1;
  const prevPage = currPage - 1;

  return (
    <div className="flex gap-4 items-center">
      {prevPage > 0 && (
        <Button asChild variant="outline" size="sm" title={`Page: ${prevPage}`}>
          <Link href={`/?${getUpdatedQueryString({ page: prevPage })}`}>
            <ArrowLeftIcon className="w-3 h-3" />
          </Link>
        </Button>
      )}
      <p className="font-semibold text-sm">
        Page {currPage} / {pages}
      </p>
      {nextPage <= pages && (
        <Button asChild variant="outline" size="sm" title={`Page: ${nextPage}`}>
          <Link href={`/?${getUpdatedQueryString({ page: nextPage })}`}>
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </Button>
      )}
    </div>
  );
}
