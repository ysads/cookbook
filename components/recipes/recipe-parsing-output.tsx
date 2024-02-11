import { ImportStatus } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Input } from "../ui/input";
import { AlertCircle } from "lucide-react";
import { ParserOutput } from "@/lib/sources";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Martian_Mono } from "next/font/google";

const martianMono = Martian_Mono({ subsets: ["latin"], weight: "400" });

type Props = {
  parsed: ParserOutput;
};

export default function RecipeParsingOutput({ parsed }: Props) {
  return parsed.status === "partial" ? (
    <Alert variant="destructive" className="col-span-2">
      <AlertCircle className="h-4 w-4 mb-6" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        This recipe could not be automatically imported! You can still fill out
        its data manually though.
        <br />
        <br />
        Errors reported:
        <ul className={cn("mt-4 text-xs space-y-3", martianMono.className)}>
          {parsed.errors.map((error, index) => (
            <li
              key={"error-" + index}
              className="flex gap-2 items-center flex-wrap"
            >
              <span className="rounded bg-red-100 px-2 py-1 break-words">
                {error.path}
              </span>
              {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  ) : parsed.status === "error" ? (
    <>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4 mb-6" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          This link could not be parsed as a recipe! This could be a blog post,
          or maybe the recipe is not in a format we support yet.
          <br />
          <br />
          Errors reported:
          <ul className={cn("mt-4 text-xs", martianMono.className)}>
            {parsed.errors.map((error, index) => (
              <li key={"error-" + index}>{error.message}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      <Label className="mt-5 block">Source url</Label>
      <Input className="mt-2" disabled value={parsed.url} />
    </>
  ) : null;
}
