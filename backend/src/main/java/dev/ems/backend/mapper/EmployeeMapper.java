package dev.ems.backend.mapper;

import dev.ems.backend.dto.EmployeeDto;
import dev.ems.backend.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(source = "department.id", target = "departmentId")
    @Mapping(source = "department.code", target = "departmentCode")
    @Mapping(source = "department.name", target = "departmentName")
    @Mapping(source = "manager.id", target = "managerId")
    @Mapping(source = "manager.email", target = "managerEmail")
    @Mapping(target = "managerName", expression = "java(employee.getManager() != null ? employee.getManager().getFirstName() + \" \" + employee.getManager().getLastName() : null)")
    EmployeeDto toDto(Employee employee);

    List<EmployeeDto> toDtoList(List<Employee> employees);
}
