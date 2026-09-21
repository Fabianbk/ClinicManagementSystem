package com.clinic.clinicmanagementsystem.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Secret must be at least 32 bytes for HMAC-SHA256
        ReflectionTestUtils.setField(jwtService, "secret", "0123456789012345678901234567890123456789");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 3600000L);
    }

    @Test
    void generateToken_withFullname_containsFullnameClaim() {
        String token = jwtService.generateToken("doctor1", "DOCTOR", 101, "พท.ว. พิมพ์วิมาน เบ็กเคอร์");

        assertThat(token).isNotBlank();
        assertThat(jwtService.isTokenValid(token)).isTrue();

        Claims claims = jwtService.parseClaims(token);
        assertThat(claims.getSubject()).isEqualTo("doctor1");
        assertThat(claims.get("role", String.class)).isEqualTo("DOCTOR");
        assertThat(claims.get("id", Integer.class)).isEqualTo(101);
        assertThat(claims.get("fullname", String.class)).isEqualTo("พท.ว. พิมพ์วิมาน เบ็กเคอร์");
    }

    @Test
    void generateToken_withoutFullname_omitsOrNullFullnameClaim() {
        String token = jwtService.generateToken("patient1", "PATIENT", 202);

        assertThat(token).isNotBlank();
        assertThat(jwtService.isTokenValid(token)).isTrue();

        Claims claims = jwtService.parseClaims(token);
        assertThat(claims.getSubject()).isEqualTo("patient1");
        assertThat(claims.get("fullname", String.class)).isNull();
    }
}
