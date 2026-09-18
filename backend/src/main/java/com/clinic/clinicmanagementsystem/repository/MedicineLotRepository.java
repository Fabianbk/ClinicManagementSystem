package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.MedicineLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MedicineLotRepository extends JpaRepository<MedicineLot, Integer> {

    List<MedicineLot> findByMedicine_MedicineIdOrderByExpiryDateAsc(int medicineId);

    List<MedicineLot> findByMedicine_MedicineIdAndStatusAndQuantityRemainingGreaterThanOrderByExpiryDateAsc(
            int medicineId, String status, int minRemaining);

    boolean existsByMedicine_MedicineIdAndLotNumberIgnoreCase(int medicineId, String lotNumber);

    @Query("SELECT l FROM MedicineLot l WHERE l.quantityRemaining > 0 AND l.expiryDate BETWEEN :today AND :targetDate ORDER BY l.expiryDate ASC")
    List<MedicineLot> findExpiringSoonLots(@Param("today") LocalDate today, @Param("targetDate") LocalDate targetDate);

    @Query("SELECT l FROM MedicineLot l WHERE l.quantityRemaining > 0 AND l.expiryDate < :today ORDER BY l.expiryDate ASC")
    List<MedicineLot> findExpiredLots(@Param("today") LocalDate today);
}
