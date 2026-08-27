import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-clinic-primary/20 bg-clinic-primary-soft text-clinic-primary",
        terracotta:
          "border-clinic-terracotta/25 bg-clinic-terracotta-soft text-clinic-terracotta-deep",
        accent:
          "border-clinic-accent/25 bg-clinic-accent-soft text-clinic-accent-deep",
        secondary:
          "border-clinic-line bg-clinic-bg text-clinic-ink-soft",
        outline:
          "border-clinic-line text-clinic-ink bg-transparent",
        success:
          "border-emerald-300 bg-emerald-50 text-emerald-800",
        warning:
          "border-amber-300 bg-amber-50 text-amber-900",
        danger:
          "border-rose-300 bg-rose-50 text-rose-800",
        destructive:
          "border-transparent bg-clinic-danger text-white shadow-xs",
        muted:
          "border-stone-200 bg-stone-100 text-stone-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

/**
 * Helper component to render standardized Appointment Status Badges
 */
export function AppointmentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "SCHEDULED":
      return (
        <Badge variant="default" className="border-clinic-primary/30">
          <span className="w-1.5 h-1.5 rounded-full bg-clinic-primary" />
          <span>นัดหมายยืนยันแล้ว</span>
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>เสร็จสิ้นการรักษา</span>
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          <span>ยกเลิกนัดหมาย</span>
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

/**
 * Helper component to render standardized Payment Status Badges
 */
export function PaymentStatusBadge({ status }: { status?: string }) {
  switch (status) {
    case "PAID":
      return (
        <Badge variant="success">
          <span>ชำระเงินเรียบร้อย</span>
        </Badge>
      );
    case "UNPAID":
    case "PENDING":
      return (
        <Badge variant="warning">
          <span>รอชำระเงิน</span>
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status || "ยังไม่มีข้อมูล"}</Badge>;
  }
}

/**
 * Helper component to render standardized Appointment Slot Status Badges
 */
export function SlotStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "AVAILABLE":
      return (
        <Badge variant="success" className="text-[11px] px-2 py-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>ว่าง (พร้อมจอง)</span>
        </Badge>
      );
    case "BOOKED":
      return (
        <Badge variant="muted" className="text-[11px] px-2 py-0">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
          <span>มีผู้จองแล้ว</span>
        </Badge>
      );
    case "BLOCKED":
      return (
        <Badge variant="danger" className="text-[11px] px-2 py-0">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          <span>งดให้บริการ</span>
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="text-[11px] px-2 py-0">{status}</Badge>;
  }
}

export { Badge, badgeVariants };
