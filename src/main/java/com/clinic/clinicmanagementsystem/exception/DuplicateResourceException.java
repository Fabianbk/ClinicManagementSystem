package com.clinic.clinicmanagementsystem.exception;

/**
 * Thrown when creating/updating something would violate a uniqueness rule
 * you want to check explicitly in the service (e.g. idNumber, username).
 * Maps to 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
