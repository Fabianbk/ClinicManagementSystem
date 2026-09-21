package com.clinic.clinicmanagementsystem.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Issues and validates JWTs. Claims carry the role (DOCTOR/PATIENT) and the
 * underlying doctorId/patientId so controllers can identify "the logged-in
 * user" without a DB round trip on every request.
 */
@Component
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username, String role, int id, String fullname) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        var builder = Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("id", id)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey());

        if (fullname != null && !fullname.isBlank()) {
            builder.claim("fullname", fullname);
        }

        return builder.compact();
    }

    public String generateToken(String username, String role, int id) {
        return generateToken(username, role, id, null);
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}