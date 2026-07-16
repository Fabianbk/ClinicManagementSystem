package com.clinic.clinicmanagementsystem.enums;

/**
 * Availability state of a single AppointmentSlot within a doctor's
 * WorkingSchedule. BLOCKED is included so a doctor can mark a slot
 * unavailable (e.g. a break) without deleting the slot outright.
 */
public enum AppointmentSlotStatus {
    AVAILABLE,
    BOOKED,
    BLOCKED
}
