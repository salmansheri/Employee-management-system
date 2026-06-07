package dev.ems.backend.controller;

import dev.ems.backend.dto.WfhRequestCreate;
import dev.ems.backend.dto.WfhRequestDto;
import dev.ems.backend.mapper.WfhRequestMapper;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.WfhRequest;
import dev.ems.backend.service.WfhRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wfh")
@RequiredArgsConstructor
public class WfhRequestController {

    private final WfhRequestService wfhRequestService;
    private final WfhRequestMapper wfhRequestMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<WfhRequestDto>> getAllWfhRequests() {
        List<WfhRequest> requests = wfhRequestService.getAllWfhRequests();
        return ResponseEntity.ok(wfhRequestMapper.toDtoList(requests));
    }

    @GetMapping("/my")
    public ResponseEntity<List<WfhRequestDto>> getMyWfhRequests(@AuthenticationPrincipal Employee currentEmployee) {
        List<WfhRequest> requests = wfhRequestService.getWfhRequestsByEmployee(currentEmployee.getId());
        return ResponseEntity.ok(wfhRequestMapper.toDtoList(requests));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or #employeeId == principal.id")
    public ResponseEntity<List<WfhRequestDto>> getWfhRequestsByEmployee(@PathVariable UUID employeeId) {
        List<WfhRequest> requests = wfhRequestService.getWfhRequestsByEmployee(employeeId);
        return ResponseEntity.ok(wfhRequestMapper.toDtoList(requests));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<WfhRequestDto>> getPendingRequestsForManager(@AuthenticationPrincipal Employee manager) {
        List<WfhRequest> requests = wfhRequestService.getPendingRequestsForManager(manager.getId());
        return ResponseEntity.ok(wfhRequestMapper.toDtoList(requests));
    }

    @PostMapping
    public ResponseEntity<WfhRequestDto> applyForWfh(
            @Valid @RequestBody WfhRequestCreate createDto,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        WfhRequest request = wfhRequestService.applyForWfh(
                currentEmployee,
                createDto.getStartDate(),
                createDto.getEndDate(),
                createDto.getReason()
        );
        return ResponseEntity.ok(wfhRequestMapper.toDto(request));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<WfhRequestDto> approveWfh(
            @PathVariable UUID id,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        WfhRequest request = wfhRequestService.approveWfh(id, currentEmployee);
        return ResponseEntity.ok(wfhRequestMapper.toDto(request));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<WfhRequestDto> rejectWfh(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal Employee currentEmployee) {
        
        WfhRequest request = wfhRequestService.rejectWfh(id, currentEmployee, reason);
        return ResponseEntity.ok(wfhRequestMapper.toDto(request));
    }
}
