package dev.ems.backend.repository;

import dev.ems.backend.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    Optional<Department> findByCode(String code);

    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.manager m")
    List<Department> findAllWithDetails();

    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.manager m WHERE d.id = :id")
    Optional<Department> findByIdWithDetails(@Param("id") UUID id);
}
