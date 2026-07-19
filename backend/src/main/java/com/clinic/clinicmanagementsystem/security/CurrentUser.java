package com.clinic.clinicmanagementsystem.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Reads the authenticated caller's role/id out of the SecurityContext
 * (populated by JwtAuthenticationFilter). Used by services to enforce that
 * a PATIENT can only read/write their own data, while a DOCTOR can act on
 * any patient's data.
 */
@Component
public class CurrentUser {

    public boolean isDoctor() {
        return hasAuthority("ROLE_DOCTOR");
    }

    public boolean isPatient() {
        return hasAuthority("ROLE_PATIENT");
    }

    /** The doctorId or patientId embedded in the token's "id" claim, or null if unauthenticated. */
    public Integer id() {
        Claims claims = currentClaims();
        if (claims == null) {
            return null;
        }
        Number id = claims.get("id", Number.class);
        return id == null ? null : id.intValue();
    }

    /**
     * Allows the call if the caller is a DOCTOR, or is a PATIENT whose own
     * id matches the given patientId. Throws otherwise. This is the single
     * checkpoint every patient-scoped service method should call.
     */
    public void requireSelfOrDoctor(int patientId) {
        if (isDoctor()) {
            return;
        }
        if (isPatient() && id() != null && id() == patientId) {
            return;
        }
        throw new AccessDeniedException("You do not have permission to access this patient's data");
    }

    private Claims currentClaims() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getDetails() instanceof Claims)) {
            return null;
        }
        return (Claims) auth.getDetails();
    }

    private boolean hasAuthority(String authority) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(authority));
    }
}