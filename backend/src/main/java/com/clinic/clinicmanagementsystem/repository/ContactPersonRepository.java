package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.ContactPerson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactPersonRepository extends JpaRepository<ContactPerson, Integer> {
}
