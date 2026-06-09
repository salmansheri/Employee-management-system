package dev.ems.backend.config;

import dev.ems.backend.model.Department;
import dev.ems.backend.model.Employee;
import dev.ems.backend.model.EmployeeStatus;
import dev.ems.backend.model.Role;
import dev.ems.backend.repository.DepartmentRepository;
import dev.ems.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Departments
        if (departmentRepository.count() == 0) {
            log.info("Database is empty. Seeding standard departments...");
            
            Department hr = Department.builder()
                    .name("Human Resources")
                    .code("HR")
                    .build();
            Department eng = Department.builder()
                    .name("Engineering")
                    .code("ENG")
                    .build();
            Department mkt = Department.builder()
                    .name("Marketing")
                    .code("MKT")
                    .build();
            Department fin = Department.builder()
                    .name("Finance")
                    .code("FIN")
                    .build();

            departmentRepository.save(hr);
            departmentRepository.save(eng);
            departmentRepository.save(mkt);
            departmentRepository.save(fin);
            log.info("Departments seeded successfully: HR, ENG, MKT, FIN");
        }

        // 2. Seed Default Administrator
        if (employeeRepository.count() == 0) {
            log.info("Database is empty. Seeding default administrator account...");
            
            Department hrDept = departmentRepository.findByCode("HR").orElse(null);

            Employee admin = Employee.builder()
                    .id(UUID.randomUUID())
                    .firstName("System")
                    .lastName("Admin")
                    .email("admin@ems.dev")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("+15550100")
                    .jobTitle("Administrator")
                    .status(EmployeeStatus.ACTIVE)
                    .role(Role.ROLE_ADMIN)
                    .salary(BigDecimal.valueOf(120000.00))
                    .dateOfJoining(LocalDate.now())
                    .department(hrDept)
                    .build();

            employeeRepository.save(admin);
            log.info("Default administrator seeded: email=admin@ems.dev, password=admin123 (Linked to HR department)");
        } else {
            log.info("Database has existing records. Seeding skipped.");
        }
    }
}
