package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.ReviewRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ReviewResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.entity.Review;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.ReviewMapper;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import com.clinic.clinicmanagementsystem.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PatientRepository patientRepository;
    private final ReviewMapper reviewMapper;

    /**
     * Review Clinic One review per patient — Review.patient is a
     * unique OneToOne, so a second attempt is rejected here with a clean 400
     * (via a dedicated Edit flow) rather than a raw DB constraint error.
     */
    public ReviewResponseDTO create(ReviewRequestDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));

        if (reviewRepository.existsByPatient_PatientId(dto.getPatientId())) {
            throw new BadRequestException(
                    "Patient " + dto.getPatientId()
                            + " has already submitted a review — use Edit Review instead");
        }

        Review review = reviewMapper.toEntity(dto);
        review.setPatient(patient);

        return reviewMapper.toResponseDTO(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public ReviewResponseDTO getById(int reviewId) {
        return reviewMapper.toResponseDTO(findReviewOrThrow(reviewId));
    }

    /** A patient has at most one review, so this returns that single review directly. */
    @Transactional(readOnly = true)
    public ReviewResponseDTO getByPatientId(int patientId) {
        return reviewRepository.findFirstByPatient_PatientId(patientId)
                .map(reviewMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Review for patient", patientId));
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getAll(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(reviewMapper::toResponseDTO);
    }

    /** Edit Review Clinic */
    public ReviewResponseDTO update(int reviewId, ReviewRequestDTO dto) {
        Review existing = findReviewOrThrow(reviewId);
        reviewMapper.updateEntityFromDto(dto, existing);
        return reviewMapper.toResponseDTO(reviewRepository.save(existing));
    }

    private Review findReviewOrThrow(int reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
    }
}