package dev.ems.backend.repository;

import dev.ems.backend.model.LeaveRequest;
import dev.ems.backend.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    @Query("SELECT l FROM LeaveRequest l LEFT JOIN FETCH l.employee e LEFT JOIN FETCH l.approvedBy a WHERE e.id = :employeeId")
    List<LeaveRequest> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT l FROM LeaveRequest l LEFT JOIN FETCH l.employee e LEFT JOIN FETCH l.approvedBy a WHERE e.manager.id = :managerId AND l.status = :status")
    List<LeaveRequest> findByManagerAndStatus(@Param("managerId") UUID managerId, @Param("status") RequestStatus status);

    @Query("SELECT l FROM LeaveRequest l LEFT JOIN FETCH l.employee e LEFT JOIN FETCH l.approvedBy a")
    List<LeaveRequest> findAllWithDetails();

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId AND l.status <> 'REJECTED' AND " +
           "((l.startDate <= :endDate AND l.endDate >= :startDate))")
    List<LeaveRequest> findOverlappingLeaves(@Param("employeeId") UUID employeeId, 
                                            @Param("startDate") LocalDate startDate, 
                                            @Param("endDate") LocalDate endDate);
}
