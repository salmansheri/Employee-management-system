package dev.ems.backend.config;

import dev.ems.backend.model.Employee;
import dev.ems.backend.model.EmployeeStatus;
import dev.ems.backend.model.Role;
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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (employeeRepository.count() == 0) {
            log.info("Database is empty. Seeding default administrator account...");
            
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
                    .build();

            employeeRepository.save(admin);
            log.info("Default administrator seeded: email=admin@ems.dev, password=admin123");
        } else {
            log.info("Database has existing records. Seeding skipped.");
        }
    }
}
