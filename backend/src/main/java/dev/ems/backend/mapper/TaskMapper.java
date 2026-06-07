package dev.ems.backend.mapper;

import dev.ems.backend.dto.TaskDto;
import dev.ems.backend.model.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    @Mapping(source = "assignedTo.id", target = "assignedToId")
    @Mapping(target = "assignedToName", expression = "java(task.getAssignedTo() != null ? task.getAssignedTo().getFirstName() + \" \" + task.getAssignedTo().getLastName() : null)")
    @Mapping(source = "assignedBy.id", target = "assignedById")
    @Mapping(target = "assignedByName", expression = "java(task.getAssignedBy() != null ? task.getAssignedBy().getFirstName() + \" \" + task.getAssignedBy().getLastName() : null)")
    TaskDto toDto(Task task);

    List<TaskDto> toDtoList(List<Task> tasks);
}
