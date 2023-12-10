import { cn } from "@/lib/utils";
import React from "react";

export default function MaxWSize({
  children,
  component = "div",
  className,
}: {
  children: React.ReactNode;
  component?: string;
  className?: string;
}) {
  return React.createElement(
    component,
    { className: cn("max-w-screen-xl mx-auto p-3 md:p-8", className) },
    children
  );
}
