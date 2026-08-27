import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-control border bg-white px-3.5 py-2 pr-9 text-sm text-clinic-ink transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinic-primary focus-visible:border-clinic-primary",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-clinic-bg/60",
            error
              ? "border-clinic-danger focus-visible:ring-clinic-danger text-clinic-danger"
              : "border-clinic-line hover:border-clinic-line-dark",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-clinic-ink-soft">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
