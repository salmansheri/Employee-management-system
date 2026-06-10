import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMeQuery } from '../hooks/useAuth';
import { 
  useMyTasksQuery, 
  useCreatedTasksQuery, 
  useCreateTaskMutation, 
  useUpdateTaskStatusMutation, 
  useDeleteTaskMutation 
} from '../hooks/useTasks';
import { useEmployeesQuery } from '../hooks/useEmployees';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  User, 
  ListPlus, 
  Loader2, 
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KanbanColumn } from '../components/KanbanColumn';
import { DatePicker } from '../components/DatePicker';
import { FormItem, FormLabel, FormControl, FormMessage } from '../components/ui/form';
import { AlertDialog } from '../components/ui/alert-dialog';
import { Tooltip } from '../components/ui/tooltip';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  assignedToId: z.string().min(1, 'Assignee is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional()
});

export const Route = createFileRoute('/tasks')({
  component: TasksComponent,
});

function TasksComponent() {
  const [activeTab, setActiveTab] = useState<'my-board' | 'manage'>('my-board');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch logged in profile detail via hook
  const { data: me } = useMeQuery();

  // Fetch my tasks via hook
  const { data: myTasks, isLoading: loadingMyTasks } = useMyTasksQuery();

  // Fetch tasks I created via hook
  const isManagerOrAdmin = me?.role === 'ROLE_MANAGER' || me?.role === 'ROLE_ADMIN';
  const { data: createdTasks, isLoading: loadingCreatedTasks } = useCreatedTasksQuery(isManagerOrAdmin);

  // Fetch employees list for assigning via hook
  const { data: employees } = useEmployeesQuery();

  // Mutations via hooks
  const updateStatusMutation = useUpdateTaskStatusMutation();
  const createTaskMutation = useCreateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  // TanStack Form hook for creating a task
  const createTaskForm = useForm({
    defaultValues: {
      title: '',
      description: '',
      assignedToId: '',
      priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
      dueDate: ''
    },
    validators: {
      onChange: createTaskSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setFormLoading(true);
      console.log('[Tasks Workspace] Submitting new task payload:', value);

      if (!value.title || !value.assignedToId) {
        console.warn('[Tasks Workspace] Task creation payload validation failed: missing title or assignee.');
        setFormError('Please fill in title and assignee');
        setFormLoading(false);
        return;
      }

      try {
        await createTaskMutation.mutateAsync({ body: value as any });
        console.log('[Tasks Workspace] Task created successfully.');
        toast.success('Task assigned successfully', {
          description: `Assigned task "${value.title}" to employee.`
        });
        setIsCreateOpen(false);
        createTaskForm.reset();
      } catch (err: any) {
        console.error('[Tasks Workspace] Task creation failed:', err);
        const errMsg = err.response?.data?.message || 'Error creating task';
        setFormError(errMsg);
        toast.error('Task assignment failed', {
          description: errMsg
        });
      } finally {
        setFormLoading(false);
      }
    }
  });

  const resetCreateForm = () => {
    createTaskForm.reset({
      title: '',
      description: '',
      assignedToId: employees?.[0]?.id || '',
      priority: 'MEDIUM',
      dueDate: ''
    });
    setFormError(null);
  };

  const handleDeleteTaskClick = (id: string) => {
    setTaskIdToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskIdToDelete) return;
    console.log(`[Tasks Workspace] Deleting task ID: ${taskIdToDelete}`);
    try {
      await deleteTaskMutation.mutateAsync({ path: { id: taskIdToDelete } });
      console.log('[Tasks Workspace] Task deleted successfully.');
      toast.success('Task deleted successfully');
    } catch (err: any) {
      console.error('[Tasks Workspace] Task deletion failed:', err);
      toast.error('Deletion failed', {
        description: err.response?.data?.message || 'Failed to delete task.'
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setTaskIdToDelete(null);
    }
  };

  const moveTask = (task: any, direction: 'forward' | 'backward') => {
    const columns: Array<'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'> = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const currentIndex = columns.indexOf(task.status);
    
    if (direction === 'forward' && currentIndex < columns.length - 1) {
      const targetStatus = columns[currentIndex + 1];
      console.log(`[Tasks Workspace] Moving task ID ${task.id} forward: ${task.status} -> ${targetStatus}`);
      updateStatusMutation.mutate({ path: { id: task.id }, query: { status: targetStatus } }, {
        onSuccess: () => {
          toast.success('Task status updated', {
            description: `Moved "${task.title}" to ${targetStatus}`
          });
        },
        onError: (err: any) => {
          toast.error('Failed to move task', {
            description: err.response?.data?.message || 'Please try again.'
          });
        }
      });
    } else if (direction === 'backward' && currentIndex > 0) {
      const targetStatus = columns[currentIndex - 1];
      console.log(`[Tasks Workspace] Moving task ID ${task.id} backward: ${task.status} -> ${targetStatus}`);
      updateStatusMutation.mutate({ path: { id: task.id }, query: { status: targetStatus } }, {
        onSuccess: () => {
          toast.success('Task status updated', {
            description: `Moved "${task.title}" to ${targetStatus}`
          });
        },
        onError: (err: any) => {
          toast.error('Failed to move task', {
            description: err.response?.data?.message || 'Please try again.'
          });
        }
      });
    }
  };

  // Kanban Columns
  const getTasksByStatus = (status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') => {
    return myTasks?.filter(t => t.status === status) || [];
  };

  const getPriorityColor = (p: 'LOW' | 'MEDIUM' | 'HIGH' | undefined) => {
    switch (p) {
      case 'HIGH': return 'bg-red/10 text-red border border-red/20';
      case 'LOW': return 'bg-green/10 text-green border border-green/20';
      default: return 'bg-yellow/10 text-yellow border border-yellow/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Tasks Workspace</h2>
          <p className="text-sm text-subtext0 mt-0.5">
            Organize assignments, progression reviews, and manage team tasks.
          </p>
        </div>

        {isManagerOrAdmin && activeTab === 'manage' && (
          <button
            onClick={() => {
              resetCreateForm();
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-mauve hover:bg-mauve/95 text-crust py-2.5 px-4 font-semibold shadow-lg shadow-mauve/15 transition-all cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Create Task
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface0/60 w-full">
        <button
          onClick={() => setActiveTab('my-board')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider px-4 border-b-2 cursor-pointer transition-all ${
            activeTab === 'my-board' 
              ? 'border-mauve text-mauve font-bold' 
              : 'border-transparent text-subtext0 hover:text-text'
          }`}
        >
          My Task Board
        </button>
        {isManagerOrAdmin && (
          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider px-4 border-b-2 cursor-pointer transition-all ${
              activeTab === 'manage' 
                ? 'border-mauve text-mauve font-bold' 
                : 'border-transparent text-subtext0 hover:text-text'
            }`}
          >
            Manage Assigned Tasks
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="mt-4">
        {activeTab === 'my-board' && (
          loadingMyTasks ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="h-10 w-10 text-mauve animate-spin" />
              <span className="text-xs text-subtext0">Loading Kanban board...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full items-start">
              <KanbanColumn 
                title="To Do" 
                tasks={getTasksByStatus('TODO')} 
                status="TODO"
                getPriorityColor={getPriorityColor}
                onMove={moveTask}
                mutatingTaskId={updateStatusMutation.isPending ? updateStatusMutation.variables?.path?.id : null}
              />
              <KanbanColumn 
                title="In Progress" 
                tasks={getTasksByStatus('IN_PROGRESS')} 
                status="IN_PROGRESS"
                getPriorityColor={getPriorityColor}
                onMove={moveTask}
                mutatingTaskId={updateStatusMutation.isPending ? updateStatusMutation.variables?.path?.id : null}
              />
              <KanbanColumn 
                title="Reviewing" 
                tasks={getTasksByStatus('REVIEW')} 
                status="REVIEW"
                getPriorityColor={getPriorityColor}
                onMove={moveTask}
                mutatingTaskId={updateStatusMutation.isPending ? updateStatusMutation.variables?.path?.id : null}
              />
              <KanbanColumn 
                title="Completed" 
                tasks={getTasksByStatus('DONE')} 
                status="DONE"
                getPriorityColor={getPriorityColor}
                onMove={moveTask}
                mutatingTaskId={updateStatusMutation.isPending ? updateStatusMutation.variables?.path?.id : null}
              />
            </div>
          )
        )}

        {activeTab === 'manage' && isManagerOrAdmin && (
          <div className="glass-panel rounded-2xl p-6 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-subtext1 mb-6 flex items-center gap-2">
              <ListPlus className="h-4.5 w-4.5 text-mauve" />
              Tasks Created By Me
            </h3>

            {loadingCreatedTasks ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-mauve" />
              </div>
            ) : createdTasks && createdTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-surface0 text-[11px] font-bold uppercase tracking-wider text-subtext0">
                      <th className="pb-3 pl-2">Task Details</th>
                      <th className="pb-3">Assigned To</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Priority</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface0/30 text-xs">
                    {createdTasks.map((task: any) => (
                      <tr key={task.id} className="hover:bg-surface0/10">
                        <td className="py-3 pl-2 pr-4">
                          <h4 className="font-semibold text-text">{task.title}</h4>
                          <p className="text-[10px] text-subtext0 line-clamp-1 mt-0.5">{task.description || 'No description'}</p>
                        </td>
                        <td className="py-3 text-subtext1 font-medium">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-surface2" />
                            <span>{task.assignedToName || 'Unknown Employee'}</span>
                          </div>
                        </td>
                        <td className="py-3 text-subtext1">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Limit'}
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            task.status === 'DONE' ? 'bg-green/10 text-green border border-green/20' :
                            task.status === 'REVIEW' ? 'bg-blue/10 text-blue border border-blue/20' :
                            task.status === 'IN_PROGRESS' ? 'bg-peach/10 text-peach border border-peach/20' :
                            'bg-surface1 text-subtext0 border border-surface2/30'
                          }`}>
                            {task.status === 'DONE' && <CheckCircle2 className="h-3 w-3" />}
                            {task.status || 'TODO'}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <Tooltip content="Delete Task" side="left">
                            <button
                              onClick={() => handleDeleteTaskClick(task.id)}
                              className="p-1 rounded-lg hover:bg-red/10 text-subtext0 hover:text-red transition-all cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-subtext0">
                You haven't created any tasks yet
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE TASK MODAL OVERLAY */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 bg-crust/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl glass-panel glass-panel-glow p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-surface0/60 mb-4">
                <h3 className="text-base font-bold text-text uppercase tracking-wider">Create New Task</h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-subtext0 hover:text-text cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-lg bg-red/10 border border-red/20 p-3 text-xs text-red">
                  {formError}
                </div>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  createTaskForm.handleSubmit();
                }} 
                className="space-y-4"
              >
                <createTaskForm.Field name="title">
                  {(field: any) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <input
                          id={field.name}
                          name={field.name}
                          type="text"
                          required
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="E.g. Review Q3 budget allocations"
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all"
                        />
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </createTaskForm.Field>

                <createTaskForm.Field name="description">
                  {(field: any) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          id={field.name}
                          name={field.name}
                          rows={3}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Provide details about the deliverables..."
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text placeholder-surface2 outline-none focus:border-mauve transition-all resize-none"
                        />
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </createTaskForm.Field>

                <createTaskForm.Field name="assignedToId">
                  {(field: any) => (
                    <FormItem>
                      <FormLabel>Assign To (Employee)</FormLabel>
                      <FormControl>
                        <select
                          required
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all cursor-pointer"
                        >
                          <option value="">Select Employee</option>
                          {employees?.map((emp: any) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName} ({emp.departmentCode})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage>{field.state.meta.errors}</FormMessage>
                    </FormItem>
                  )}
                </createTaskForm.Field>

                <div className="grid grid-cols-2 gap-4">
                  <createTaskForm.Field name="priority">
                    {(field: any) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <select
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all cursor-pointer"
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                        </FormControl>
                        <FormMessage>{field.state.meta.errors}</FormMessage>
                      </FormItem>
                    )}
                  </createTaskForm.Field>
                  <createTaskForm.Field name="dueDate">
                    {(field: any) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.state.value}
                            onChange={(date) => field.handleChange(date)}
                          />
                        </FormControl>
                        <FormMessage>{field.state.meta.errors}</FormMessage>
                      </FormItem>
                    )}
                  </createTaskForm.Field>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface0/60">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-lg bg-surface0 hover:bg-surface1 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mauve text-crust font-semibold transition-all hover:bg-mauve/90 cursor-pointer disabled:opacity-50"
                  >
                    {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Assign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TASK DELETION ALERT DIALOG */}
      <AlertDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action is permanent and cannot be undone."
        confirmText="Delete"
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setTaskIdToDelete(null);
        }}
        onConfirm={handleConfirmDeleteTask}
      />

    </div>
  );
}
