package dev.ems.backend.mapper;

import dev.ems.backend.dto.AttendanceDto;
import dev.ems.backend.model.Attendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(target = "employeeName", expression = "java(attendance.getEmployee().getFirstName() + \" \" + attendance.getEmployee().getLastName())")
    AttendanceDto toDto(Attendance attendance);

    List<AttendanceDto> toDtoList(List<Attendance> attendances);
}
