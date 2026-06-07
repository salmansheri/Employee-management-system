package dev.ems.backend.repository;

import dev.ems.backend.model.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, UUID> {

    @Query("SELECT p FROM PerformanceReview p LEFT JOIN FETCH p.employee e LEFT JOIN FETCH p.reviewer r WHERE e.id = :employeeId ORDER BY p.reviewDate DESC")
    List<PerformanceReview> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT p FROM PerformanceReview p LEFT JOIN FETCH p.employee e LEFT JOIN FETCH p.reviewer r WHERE r.id = :reviewerId ORDER BY p.reviewDate DESC")
    List<PerformanceReview> findByReviewerId(@Param("reviewerId") UUID reviewerId);
}
