package dev.ems.backend.repository;

import dev.ems.backend.model.RequestStatus;
import dev.ems.backend.model.WfhRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WfhRequestRepository extends JpaRepository<WfhRequest, UUID> {

    @Query("SELECT w FROM WfhRequest w LEFT JOIN FETCH w.employee e LEFT JOIN FETCH w.approvedBy a WHERE e.id = :employeeId")
    List<WfhRequest> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT w FROM WfhRequest w LEFT JOIN FETCH w.employee e LEFT JOIN FETCH w.approvedBy a WHERE e.manager.id = :managerId AND w.status = :status")
    List<WfhRequest> findByManagerAndStatus(@Param("managerId") UUID managerId, @Param("status") RequestStatus status);

    @Query("SELECT w FROM WfhRequest w LEFT JOIN FETCH w.employee e LEFT JOIN FETCH w.approvedBy a")
    List<WfhRequest> findAllWithDetails();

    @Query("SELECT w FROM WfhRequest w WHERE w.employee.id = :empId AND w.status = 'APPROVED' AND :date BETWEEN w.startDate AND w.endDate")
    Optional<WfhRequest> findApprovedWfhForDate(@Param("empId") UUID empId, @Param("date") LocalDate date);

    @Query("SELECT w FROM WfhRequest w WHERE w.employee.id = :employeeId AND w.status <> 'REJECTED' AND " +
           "((w.startDate <= :endDate AND w.endDate >= :startDate))")
    List<WfhRequest> findOverlappingWfhRequests(@Param("employeeId") UUID employeeId, 
                                               @Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);
}
