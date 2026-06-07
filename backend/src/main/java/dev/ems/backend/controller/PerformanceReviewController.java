package dev.ems.backend.controller;

import dev.ems.backend.dto.PerformanceReviewDto;
import dev.ems.backend.mapper.PerformanceReviewMapper;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.PerformanceReview;
import dev.ems.backend.service.PerformanceReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class PerformanceReviewController {

    private final PerformanceReviewService performanceReviewService;
    private final PerformanceReviewMapper performanceReviewMapper;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PerformanceReviewDto> createReview(
            @Valid @RequestBody PerformanceReviewDto dto,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        PerformanceReview review = performanceReviewService.createReview(
                dto.getEmployeeId(),
                currentEmployee,
                dto.getFeedback(),
                dto.getRating()
        );
        return ResponseEntity.ok(performanceReviewMapper.toDto(review));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or #employeeId == principal.id")
    public ResponseEntity<List<PerformanceReviewDto>> getEmployeeReviews(@PathVariable UUID employeeId) {
        List<PerformanceReview> reviews = performanceReviewService.getReviewsForEmployee(employeeId);
        return ResponseEntity.ok(performanceReviewMapper.toDtoList(reviews));
    }
}
