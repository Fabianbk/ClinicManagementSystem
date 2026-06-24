package com.clinic.clinicmanagementsystem.exception;

/** Thrown when a lookup by ID (or other key) finds nothing. Maps to 404. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(resourceName + " not found with id: " + identifier);
    }
}
