"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  CheckCheck,
  ChevronRight,
} from "lucide-react";
import type { NotifyAppointmentResponseDTO } from "@/lib/types";
import { formatDoctorDisplayName } from "@/lib/utils";

interface NotificationBellProps {
  patientId: number;
}

const STORAGE_PREFIX = "patient_read_notifications_";

export function NotificationBell({ patientId }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotifyAppointmentResponseDTO[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const storageKey = `${STORAGE_PREFIX}${patientId}`;

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReadIds(new Set(parsed));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!patientId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/appointments/patient/${patientId}/notifications`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      }
    } catch {
      // Ignore network errors silently
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchNotifications();

    // Poll every 60 seconds for real-time reminders
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Save readIds to localStorage
  const saveReadIds = (newReadIds: Set<string>) => {
    setReadIds(newReadIds);
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newReadIds)));
    } catch {
      // Ignore localStorage write errors
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    const updated = new Set(readIds);
    notifications.forEach((n) => {
      if (n.notificationId) {
        updated.add(n.notificationId);
      }
    });
    saveReadIds(updated);
  };

  // Click on a notification item
  const handleItemClick = (n: NotifyAppointmentResponseDTO) => {
    if (n.notificationId && !readIds.has(n.notificationId)) {
      const updated = new Set(readIds);
      updated.add(n.notificationId);
      saveReadIds(updated);
    }
    setIsOpen(false);
    router.push(n.linkUrl || "/patient/appointments");
  };

  const unreadCount = notifications.filter(
    (n) => n.notificationId && !readIds.has(n.notificationId)
  ).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        aria-label="การแจ้งเตือน"
        className="relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-card bg-white text-clinic-ink shadow-xl border border-clinic-line z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-clinic-bg/70 border-b border-clinic-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-clinic-primary" />
              <h3 className="font-display font-bold text-xs sm:text-sm text-clinic-primary-deep">
                การแจ้งเตือน
              </h3>
              {unreadCount > 0 && (
                <span className="bg-rose-100 text-rose-700 text-[11px] font-semibold px-2 py-0.2 rounded-full">
                  ใหม่ {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-clinic-primary hover:text-clinic-primary-deep font-semibold flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>อ่านทั้งหมด</span>
              </button>
            )}
          </div>

          {/* List Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-clinic-line/60">
            {isLoading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-clinic-ink-soft">
                กำลังโหลดการแจ้งเตือน...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                <p className="text-xs font-semibold text-clinic-ink">ไม่มีการแจ้งเตือนในขณะนี้</p>
                <p className="text-[11px] text-clinic-ink-soft">
                  เมื่อใกล้ถึงเวลานัดหมายหรือมีการเปลี่ยนแปลงสถานะ จะแจ้งเตือนที่นี่
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isRead = n.notificationId ? readIds.has(n.notificationId) : false;
                const isCancelled = n.notificationType === "STATUS_CANCELLED" || n.status === "CANCELLED";

                return (
                  <div
                    key={n.notificationId || n.appointmentId}
                    onClick={() => handleItemClick(n)}
                    className={`p-3.5 hover:bg-clinic-bg/60 cursor-pointer transition-colors flex items-start gap-3 text-left ${
                      !isRead ? "bg-clinic-primary-soft/20" : ""
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="mt-0.5 shrink-0">
                      {isCancelled ? (
                        <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      ) : n.isUrgent ? (
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center animate-pulse">
                          <Clock className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-clinic-primary-soft text-clinic-primary flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs ${
                            !isRead ? "font-bold text-clinic-primary-deep" : "font-semibold text-clinic-ink"
                          }`}
                        >
                          {n.title || (isCancelled ? "การนัดหมายถูกยกเลิก" : "เตือนนัดหมายตรวจรักษา")}
                        </p>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-clinic-ink-soft leading-relaxed line-clamp-2">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-clinic-ink-muted pt-0.5">
                        <span className="truncate">
                          {formatDoctorDisplayName(n.doctorFullname)}
                        </span>
                        <span className="shrink-0 text-clinic-primary flex items-center gap-0.5">
                          ดูรายละเอียด <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-clinic-bg/40 border-t border-clinic-line text-center">
            <Link
              href="/patient/appointments"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-clinic-primary hover:text-clinic-primary-deep hover:underline inline-flex items-center gap-1"
            >
              <span>ดูประวัติการนัดหมายทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
