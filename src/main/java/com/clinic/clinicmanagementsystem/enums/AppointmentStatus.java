package com.clinic.clinicmanagementsystem.enums;

/**
 * Lifecycle of a booked Appointment. Persisted as EnumType.STRING, so the
 * database column still holds readable text (e.g. "SCHEDULED") — the
 * difference from a plain String field is that Hibernate and Jackson now
 * both reject anything that isn't exactly one of these values, instead of
 * silently accepting a typo.
 */
public enum AppointmentStatus {
    SCHEDULED,
    COMPLETED,
    CANCELLED,
    NO_SHOW
}
