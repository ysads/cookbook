import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMPORT_STATUS, ImportStatus } from "@/lib/types";
import FilterPopover from "@/components/filters/filter-popover";

export type ImportFilters = { term: string; status: ImportStatus[] };

type Props = {
  filters: ImportFilters;
  onFilter: (newFilters: ImportFilters) => void;
};

const statusOptions = IMPORT_STATUS.map((c) => ({
  id: c,
  label: c.toLocaleLowerCase(),
}));

export default function ImportFilterToolbar({ filters, onFilter }: Props) {
  const [localFilters, setLocalFilters] = useState(filters);

  function handleFilter(evt: React.FormEvent) {
    evt.preventDefault();
    console.log(":::::", localFilters);
    onFilter(localFilters);
  }

  return (
    <form className="flex gap-2 items-center w-full" onSubmit={handleFilter}>
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
        title="Status"
        options={statusOptions}
        selectedValues={localFilters.status}
        onSelectionChange={(newStatus) =>
          setLocalFilters((prev) => ({ ...prev, status: newStatus }))
        }
      />
      <Button
        size="sm"
        className="h-8"
        variant="secondary"
        type="submit"
        onClick={handleFilter}
      >
        Filter
      </Button>
    </form>
  );
}
