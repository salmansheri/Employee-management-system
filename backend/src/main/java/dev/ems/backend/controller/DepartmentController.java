package dev.ems.backend.controller;

import dev.ems.backend.dto.DepartmentDto;
import dev.ems.backend.mapper.DepartmentMapper;
import dev.ems.backend.model.Department;
import dev.ems.backend.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;
    private final DepartmentMapper departmentMapper;

    @GetMapping
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        List<Department> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departmentMapper.toDtoList(departments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable UUID id) {
        Department department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(departmentMapper.toDto(department));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody DepartmentDto dto) {
        Department department = departmentService.createDepartment(dto);
        return ResponseEntity.ok(departmentMapper.toDto(department));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentDto> updateDepartment(@PathVariable UUID id, @Valid @RequestBody DepartmentDto dto) {
        Department department = departmentService.updateDepartment(id, dto);
        return ResponseEntity.ok(departmentMapper.toDto(department));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable UUID id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
