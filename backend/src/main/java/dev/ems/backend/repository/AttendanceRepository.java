package dev.ems.backend.repository;

import dev.ems.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId ORDER BY a.clockIn DESC")
    List<Attendance> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :empId AND a.date = :date AND a.clockOut IS NULL")
    Optional<Attendance> findActivePunch(@Param("empId") UUID empId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId AND a.date BETWEEN :startDate AND :endDate ORDER BY a.date DESC")
    List<Attendance> findByEmployeeIdAndDateRange(@Param("employeeId") UUID employeeId, 
                                                 @Param("startDate") LocalDate startDate, 
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(a.workHours), 0.0) FROM Attendance a WHERE a.employee.id = :employeeId AND a.date BETWEEN :startDate AND :endDate")
    Double calculateTotalWorkHours(@Param("employeeId") UUID employeeId, 
                                   @Param("startDate") LocalDate startDate, 
                                   @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee e WHERE a.date = :date")
    List<Attendance> findAllByDate(@Param("date") LocalDate date);
}
