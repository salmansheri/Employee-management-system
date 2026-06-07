package dev.ems.backend.service;

import dev.ems.backend.model.Employee;
import dev.ems.backend.model.PerformanceReview;
import dev.ems.backend.repository.EmployeeRepository;
import dev.ems.backend.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PerformanceReviewService {

    private final PerformanceReviewRepository performanceReviewRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<PerformanceReview> getReviewsForEmployee(UUID employeeId) {
        return performanceReviewRepository.findByEmployeeId(employeeId);
    }

    @Transactional(readOnly = true)
    public List<PerformanceReview> getReviewsByReviewer(UUID reviewerId) {
        return performanceReviewRepository.findByReviewerId(reviewerId);
    }

    @Transactional
    public PerformanceReview createReview(UUID employeeId, Employee reviewer, String feedback, Integer rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + employeeId));

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewDate(LocalDate.now())
                .feedback(feedback)
                .rating(rating)
                .build();

        return performanceReviewRepository.save(review);
    }
}
