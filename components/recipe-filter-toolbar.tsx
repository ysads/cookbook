import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { COURSES } from "@/lib/types";
import { Course } from "@prisma/client";
import FilterPopover from "./filters/filter-popover";

export type RecipeFilters = { term: string; courses: Course[] };

type Props = {
  filters: RecipeFilters;
  onFilter: (newFilters: RecipeFilters) => void;
};

const courseOptions = COURSES.map((c) => ({
  id: c,
  label: c.toLocaleLowerCase(),
}));

export default function RecipeFilterToolbar({ filters, onFilter }: Props) {
  const [localFilters, setLocalFilters] = useState(filters);

  function handleFilter(evt: React.FormEvent) {
    evt.preventDefault();
    onFilter(localFilters);
  }

  return (
    <form
      className="flex gap-2 items-center w-full flex-wrap"
      onSubmit={handleFilter}
    >
      <Input
        type="search"
        className="h-8 w-[250px] lg:w-[350px] shadow-sm"
        placeholder="Filter recipes by name"
        value={localFilters.term}
        onChange={(evt) =>
          setLocalFilters((prev) => ({ ...prev, term: evt.target.value }))
        }
      />
      <FilterPopover
        title="Course"
        options={courseOptions}
        selectedValues={localFilters.courses}
        onSelectionChange={(newCourses) =>
          setLocalFilters((prev) => ({ ...prev, courses: newCourses }))
        }
      />
      <Button size="sm" className="h-8" variant="secondary" type="submit">
        Filter
      </Button>
    </form>
  );
}
