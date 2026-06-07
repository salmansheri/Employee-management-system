package dev.ems.backend.repository;

import dev.ems.backend.model.Task;
import dev.ems.backend.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assignedTo e LEFT JOIN FETCH t.assignedBy b WHERE e.id = :employeeId ORDER BY t.dueDate ASC")
    List<Task> findByAssignedToId(@Param("employeeId") UUID employeeId);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assignedTo e LEFT JOIN FETCH t.assignedBy b WHERE b.id = :assignedById ORDER BY t.createdAt DESC")
    List<Task> findByAssignedById(@Param("assignedById") UUID assignedById);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assignedTo e LEFT JOIN FETCH t.assignedBy b WHERE e.id = :employeeId AND t.status = :status ORDER BY t.dueDate ASC")
    List<Task> findByAssignedToIdAndStatus(@Param("employeeId") UUID employeeId, @Param("status") TaskStatus status);
}
