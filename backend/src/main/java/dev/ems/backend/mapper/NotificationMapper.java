package dev.ems.backend.mapper;

import dev.ems.backend.dto.NotificationDto;
import dev.ems.backend.model.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(target = "employeeName", expression = "java(notification.getEmployee() != null ? notification.getEmployee().getFirstName() + \" \" + notification.getEmployee().getLastName() : null)")
    NotificationDto toDto(Notification notification);

    List<NotificationDto> toDtoList(List<Notification> notifications);
}
