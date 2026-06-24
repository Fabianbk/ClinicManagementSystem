package com.clinic.clinicmanagementsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Just the encoder bean — does NOT pull in Spring Security's autoconfiguration
 * (that would lock every endpoint behind HTTP Basic auth by default and break
 * your existing unsecured endpoints). This bean will be reused later when
 * full JWT auth is built.
 */
@Configuration
public class PasswordEncoderConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
