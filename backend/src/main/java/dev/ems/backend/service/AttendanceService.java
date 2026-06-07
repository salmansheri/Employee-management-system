package dev.ems.backend.service;

import dev.ems.backend.model.Attendance;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.WorkLocation;
import dev.ems.backend.repository.AttendanceRepository;
import dev.ems.backend.repository.WfhRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final WfhRequestRepository wfhRequestRepository;

    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceHistory(UUID employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceHistoryByRange(UUID employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByEmployeeIdAndDateRange(employeeId, startDate, endDate);
    }

    @Transactional(readOnly = true)
    public Optional<Attendance> getActivePunch(UUID employeeId) {
        return attendanceRepository.findActivePunch(employeeId, LocalDate.now());
    }

    @Transactional
    public Attendance punchIn(Employee employee, WorkLocation manualLocation) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> activePunch = attendanceRepository.findActivePunch(employee.getId(), today);
        if (activePunch.isPresent()) {
            throw new IllegalArgumentException("Employee is already punched in for today");
        }

        WorkLocation location = manualLocation;
        if (location == null) {
            // Automatically resolve location based on approved WFH requests
            boolean hasApprovedWfh = wfhRequestRepository.findApprovedWfhForDate(employee.getId(), today).isPresent();
            location = hasApprovedWfh ? WorkLocation.WFH : WorkLocation.OFFICE;
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(today)
                .clockIn(LocalDateTime.now())
                .workLocation(location)
                .build();

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public Attendance punchOut(Employee employee) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findActivePunch(employee.getId(), today)
                .orElseThrow(() -> new IllegalArgumentException("No active punch-in session found for today"));

        LocalDateTime clockOutTime = LocalDateTime.now();
        attendance.setClockOut(clockOutTime);

        // Calculate hours worked
        Duration duration = Duration.between(attendance.getClockIn(), clockOutTime);
        double hours = duration.toSeconds() / 3600.0;
        
        // Round to 2 decimal places
        double roundedHours = Math.round(hours * 100.0) / 100.0;
        attendance.setWorkHours(roundedHours);

        return attendanceRepository.save(attendance);
    }

    @Transactional(readOnly = true)
    public Double getTotalHoursWorked(UUID employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.calculateTotalWorkHours(employeeId, startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<Attendance> getAllAttendanceByDate(LocalDate date) {
        return attendanceRepository.findAllByDate(date);
    }
}
