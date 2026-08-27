import * as React from "react";
import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-card border border-dashed border-clinic-line bg-white/70 shadow-2xs space-y-3",
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 rounded-full bg-clinic-bg border border-clinic-line flex items-center justify-center text-clinic-primary-soft text-clinic-primary shadow-2xs">
        {icon || <Leaf className="w-6 h-6 text-clinic-primary" />}
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="font-display font-bold text-base text-clinic-ink">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-clinic-ink-soft leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
