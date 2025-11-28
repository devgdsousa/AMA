"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const searchInputVariants = cva(
  "flex w-full items-center gap-2 rounded-md border bg-background text-sm text-foreground shadow-xs transition-all " +
    "focus-within:ring-2 focus-within:ring-ring/60 focus-within:border-ring " +
    "hover:border-border/80 disabled:cursor-not-allowed disabled:opacity-60 " +
    "bg-white/70 backdrop-blur-sm dark:bg-zinc-900/70",
  {
    variants: {
      variant: {
        default: "",
        subtle: "border-transparent shadow-none hover:bg-accent/40",
        outline: "border-input",
      },
      sizeVariant: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      sizeVariant: "default",
    },
  }
);

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof searchInputVariants> {
  icon?: React.ReactNode;
  sizeVariant?: "default" | "sm" | "lg";
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, variant, sizeVariant, icon, ...props }, ref) => {
    return (
      <div className={cn(searchInputVariants({ variant, sizeVariant }), className)}>
        <span className="text-muted-foreground flex items-center">
          {icon ?? (
            <svg
              className="h-4 w-4 opacity-70"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35M5 11a6 6 0 1 1 12 0A6 6 0 0 1 5 11Z"
              />
            </svg>
          )}
        </span>
        <input
          ref={ref}
          type="search"
          className={cn(
            "flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm",
            "min-w-0"
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
