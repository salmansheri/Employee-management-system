package dev.ems.backend.repository;

import dev.ems.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @Query("SELECT n FROM Notification n JOIN FETCH n.employee WHERE n.employee.id = :employeeId ORDER BY n.createdAt DESC")
    List<Notification> findByEmployeeIdOrderByCreatedAtDesc(@Param("employeeId") UUID employeeId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.employee.id = :employeeId AND n.isRead = false")
    long countUnreadByEmployeeId(@Param("employeeId") UUID employeeId);
}
