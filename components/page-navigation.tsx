import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  page: number;
  onNavigate: (newPage: number) => void;
};

export default function PageNavigation({ page, onNavigate }: Props) {
  const nextPage = page + 1;
  const prevPage = Math.min(page - 1, 1);

  return (
    <div className="flex gap-4 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate(prevPage)}
        title={`Page: ${prevPage}`}
      >
        <ArrowLeftIcon className="w-3 h-3" />
      </Button>
      <p className="font-semibold text-sm">Page {page}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate(nextPage)}
        title={`Page: ${nextPage}`}
      >
        <ArrowRightIcon className="w-3 h-3" />
      </Button>
    </div>
  );
}
