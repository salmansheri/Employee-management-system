package dev.ems.backend.service;

import dev.ems.backend.dto.DepartmentDto;
import dev.ems.backend.model.Department;
import dev.ems.backend.model.Employee;
import dev.ems.backend.repository.DepartmentRepository;
import dev.ems.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return departmentRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "departments", key = "#id")
    public Department getDepartmentById(UUID id) {
        return departmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public Department getDepartmentByCode(String code) {
        return departmentRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with code: " + code));
    }

    @Transactional
    public Department createDepartment(DepartmentDto dto) {
        if (departmentRepository.findByCode(dto.getCode()).isPresent()) {
            throw new IllegalArgumentException("Department code already exists: " + dto.getCode());
        }

        Employee manager = null;
        if (dto.getManagerId() != null) {
            manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager employee not found with ID: " + dto.getManagerId()));
        }

        Department department = Department.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .manager(manager)
                .build();

        return departmentRepository.save(department);
    }

    @Transactional
    @CacheEvict(value = "departments", key = "#id")
    public Department updateDepartment(UUID id, DepartmentDto dto) {
        Department department = getDepartmentById(id);

        if (dto.getCode() != null && !dto.getCode().equals(department.getCode())) {
            if (departmentRepository.findByCode(dto.getCode()).isPresent()) {
                throw new IllegalArgumentException("Department code already exists: " + dto.getCode());
            }
            department.setCode(dto.getCode());
        }

        if (dto.getName() != null) department.setName(dto.getName());

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager employee not found with ID: " + dto.getManagerId()));
            department.setManager(manager);
        } else if (dto.getManagerId() == null) {
            department.setManager(null);
        }

        return departmentRepository.save(department);
    }

    @Transactional
    @CacheEvict(value = "departments", key = "#id")
    public void deleteDepartment(UUID id) {
        Department department = getDepartmentById(id);
        departmentRepository.delete(department);
    }
}
