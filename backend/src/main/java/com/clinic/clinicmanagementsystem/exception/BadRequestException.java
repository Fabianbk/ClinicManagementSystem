package com.clinic.clinicmanagementsystem.exception;

/**
 * Thrown for business-rule violations that aren't simple field validation,
 * e.g. "this AppointmentSlot is already booked" or "cannot issue a receipt
 * for a RecordTreatment that already has one". Maps to 400 Bad Request.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
