package dev.ems.backend.service;

import dev.ems.backend.dto.RegisterRequest;
import dev.ems.backend.model.Department;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.EmployeeStatus;
import dev.ems.backend.model.Role;
import dev.ems.backend.repository.DepartmentRepository;
import dev.ems.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "employees", key = "#id")
    public Employee getEmployeeById(UUID id) {
        return employeeRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public Employee getEmployeeByEmail(String email) {
        return employeeRepository.findByEmailWithDetails(email)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with email: " + email));
    }

    @Transactional
    public Employee registerEmployee(RegisterRequest request) {
        if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        Department dept = null;
        if (request.getDepartmentCode() != null && !request.getDepartmentCode().isBlank()) {
            dept = departmentRepository.findByCode(request.getDepartmentCode())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found with code: " + request.getDepartmentCode()));
        }

        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found with ID: " + request.getManagerId()));
        }

        Employee employee = Employee.builder()
                .id(UUID.randomUUID())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .jobTitle(request.getJobTitle())
                .department(dept)
                .manager(manager)
                .salary(request.getSalary())
                .dateOfJoining(request.getDateOfJoining() != null ? request.getDateOfJoining() : LocalDate.now())
                .status(EmployeeStatus.ACTIVE)
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE)
                .build();

        return employeeRepository.save(employee);
    }

    @Transactional
    @CacheEvict(value = "employees", key = "#id")
    public Employee updateEmployee(UUID id, RegisterRequest request) {
        Employee employee = getEmployeeById(id);

        if (request.getEmail() != null && !request.getEmail().equals(employee.getEmail())) {
            if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already in use: " + request.getEmail());
            }
            employee.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getPhone() != null) employee.setPhone(request.getPhone());
        if (request.getJobTitle() != null) employee.setJobTitle(request.getJobTitle());
        if (request.getSalary() != null) employee.setSalary(request.getSalary());
        if (request.getRole() != null) employee.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getDepartmentCode() != null) {
            if (request.getDepartmentCode().isBlank()) {
                employee.setDepartment(null);
            } else {
                Department dept = departmentRepository.findByCode(request.getDepartmentCode())
                        .orElseThrow(() -> new IllegalArgumentException("Department not found with code: " + request.getDepartmentCode()));
                employee.setDepartment(dept);
            }
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found with ID: " + request.getManagerId()));
            employee.setManager(manager);
        } else if (request.getManagerId() == null && request.getFirstName() != null) { // Simple reset check
            // If they pass null for manager explicitly in JSON (which standard mapping handles)
            // employee.setManager(null);
        }

        return employeeRepository.save(employee);
    }

    @Transactional
    @CacheEvict(value = "employees", key = "#id")
    public void deleteEmployee(UUID id) {
        Employee employee = getEmployeeById(id);
        // Soft delete / termination is standard in HR systems
        employee.setStatus(EmployeeStatus.TERMINATED);
        employeeRepository.save(employee);
    }
}
