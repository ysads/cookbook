// "use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  className?: string;
  onSelect: (val: Date | undefined) => void;
  value: Date | null | undefined;
  disabled?: boolean;
};

export const DatePicker = React.forwardRef<
  React.ElementRef<typeof Popover>,
  Props
>(({ className, disabled = false, onSelect, value }, ref) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            className,
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
});

// export function DatePicker({
//   className,
//   value,
//   onSelect,
//   disabled = false,
// }: Props) {
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button
//           variant={"outline"}
//           disabled={disabled}
//           className={cn(
//             "w-[280px] justify-start text-left font-normal",
//             className,
//             !value && "text-muted-foreground"
//           )}
//         >
//           <CalendarIcon className="mr-2 h-4 w-4" />
//           {value ? format(value, "PPP") : <span>Pick a date</span>}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0">
//         <Calendar
//           mode="single"
//           selected={value ?? undefined}
//           onSelect={onSelect}
//           initialFocus
//         />
//       </PopoverContent>
//     </Popover>
//   );
// }
