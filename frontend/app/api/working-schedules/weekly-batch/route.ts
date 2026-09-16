import { NextResponse } from "next/server";
import {
  getWorkingSchedulesByDoctor,
  createWorkingSchedule,
} from "@/lib/resources/working-schedules";
import { createAppointmentSlot } from "@/lib/resources/appointment-slots";
import { calculateSlotsForDay } from "@/lib/utils/schedule-generator";
import { ApiError } from "@/lib/api-client";
import type { WorkingScheduleResponseDTO } from "@/lib/types";

export interface WeeklyBatchRequestBody {
  doctorId: number;
  dates: string[]; // array of YYYY-MM-DD
  shiftStartTime: string; // HH:mm (e.g. "09:00")
  shiftEndTime: string; // HH:mm (e.g. "19:00")
  slotMinutes?: number; // default 60
  hasLunchBreak?: boolean; // default true
  lunchStart?: string; // default "12:00"
  lunchEnd?: string; // default "13:00"
}

export interface SkippedDayInfo {
  date: string;
  reason: string;
}

export interface CreatedDayInfo {
  scheduleId: number;
  date: string;
  slotsCount: number;
}

export interface WeeklyBatchResponse {
  success: boolean;
  createdDaysCount: number;
  createdSlotsCount: number;
  createdDays: CreatedDayInfo[];
  skippedDays: SkippedDayInfo[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WeeklyBatchRequestBody;
    const {
      doctorId,
      dates,
      shiftStartTime,
      shiftEndTime,
      slotMinutes = 60,
      hasLunchBreak = true,
      lunchStart = "12:00",
      lunchEnd = "13:00",
    } = body;

    if (!doctorId || !dates || dates.length === 0 || !shiftStartTime || !shiftEndTime) {
      return NextResponse.json(
        { message: "กรุณาระบุข้อมูลแพทย์ วันที่ และเวลาทำการให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // 1. Fetch existing doctor schedules to detect any overlapping shifts
    let existingSchedules: WorkingScheduleResponseDTO[] = [];
    try {
      existingSchedules = await getWorkingSchedulesByDoctor(doctorId);
    } catch {
      // In case doctor has no schedules or endpoint returns 404/empty, default to empty list
      existingSchedules = [];
    }

    const now = new Date();
    const createdDays: CreatedDayInfo[] = [];
    const skippedDays: SkippedDayInfo[] = [];
    let totalSlotsCreated = 0;

    // Sort dates in ascending order
    const sortedDates = [...dates].sort();

    for (const dateStr of sortedDates) {
      const shiftStartObj = new Date(`${dateStr}T${shiftStartTime}:00`);
      const shiftEndObj = new Date(`${dateStr}T${shiftEndTime}:00`);

      if (shiftEndObj <= shiftStartObj) {
        skippedDays.push({
          date: dateStr,
          reason: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น",
        });
        continue;
      }

      // Check 1: Skip if shift end time is already in the past
      if (shiftEndObj <= now) {
        skippedDays.push({
          date: dateStr,
          reason: "เวลาตรวจได้ผ่านไปแล้ว ไม่สามารถสร้างตารางย้อนหลังได้",
        });
        continue;
      }

      // Check 2: Skip if overlapping with existing schedule for this doctor
      const startMs = shiftStartObj.getTime();
      const endMs = shiftEndObj.getTime();
      const hasOverlap = existingSchedules.some((s) => {
        const sStart = new Date(s.shiftStart).getTime();
        const sEnd = new Date(s.shiftEnd).getTime();
        return sStart < endMs && sEnd > startMs;
      });

      if (hasOverlap) {
        skippedDays.push({
          date: dateStr,
          reason: "มีตารางเวรเดิมในช่วงเวลาดังกล่าวแล้ว",
        });
        continue;
      }

      // 2. Create WorkingSchedule
      try {
        const createdSchedule = await createWorkingSchedule({
          doctorId,
          date: dateStr as any,
          shiftStart: shiftStartObj.toISOString() as any,
          shiftEnd: shiftEndObj.toISOString() as any,
        });

        // Add newly created schedule to existing list in case subsequent days overlap
        existingSchedules.push(createdSchedule);

        // 3. Generate and create 1-hour slots
        const slotsToCreate = calculateSlotsForDay({
          dateStr,
          shiftStartTime,
          shiftEndTime,
          slotMinutes,
          hasLunchBreak,
          lunchStart,
          lunchEnd,
        });

        let daySlotCount = 0;
        for (const slot of slotsToCreate) {
          try {
            await createAppointmentSlot({
              scheduleId: createdSchedule.scheduleId,
              startTime: slot.startTime as any,
              endTime: slot.endTime as any,
              status: "AVAILABLE",
            });
            daySlotCount++;
            totalSlotsCreated++;
          } catch (slotErr) {
            console.error(`Failed to create slot ${slot.startFormatted} for schedule ${createdSchedule.scheduleId}:`, slotErr);
          }
        }

        createdDays.push({
          scheduleId: createdSchedule.scheduleId,
          date: dateStr,
          slotsCount: daySlotCount,
        });
      } catch (err) {
        const errorMsg = err instanceof ApiError ? err.message : "เกิดข้อผิดพลาดในการบันทึกตารางเวร";
        skippedDays.push({
          date: dateStr,
          reason: errorMsg,
        });
      }
    }

    const responseData: WeeklyBatchResponse = {
      success: true,
      createdDaysCount: createdDays.length,
      createdSlotsCount: totalSlotsCreated,
      createdDays,
      skippedDays,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    console.error("Weekly batch error:", err);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการประมวลผลตารางเวรรายสัปดาห์" },
      { status: 500 }
    );
  }
}
