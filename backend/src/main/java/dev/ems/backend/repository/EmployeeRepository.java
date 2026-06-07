package dev.ems.backend.repository;

import dev.ems.backend.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByEmail(String email);

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.department d LEFT JOIN FETCH e.manager m WHERE e.email = :email")
    Optional<Employee> findByEmailWithDetails(@Param("email") String email);

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.department d LEFT JOIN FETCH e.manager m WHERE e.id = :id")
    Optional<Employee> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.department d LEFT JOIN FETCH e.manager m")
    List<Employee> findAllWithDetails();

    @Query("SELECT e FROM Employee e WHERE e.manager.id = :managerId")
    List<Employee> findByManagerId(@Param("managerId") UUID managerId);
}
