package dev.ems.backend.mapper;

import dev.ems.backend.dto.DepartmentDto;
import dev.ems.backend.model.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    @Mapping(source = "manager.id", target = "managerId")
    @Mapping(target = "managerName", expression = "java(department.getManager() != null ? department.getManager().getFirstName() + \" \" + department.getManager().getLastName() : null)")
    DepartmentDto toDto(Department department);

    List<DepartmentDto> toDtoList(List<Department> departments);
}
