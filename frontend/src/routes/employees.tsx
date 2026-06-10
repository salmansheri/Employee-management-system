import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMeQuery } from '../hooks/useAuth';
import { 
  useEmployeesQuery, 
  useDepartmentsQuery, 
  useRegisterEmployeeMutation, 
  useUpdateEmployeeMutation, 
  useDeleteEmployeeMutation 
} from '../hooks/useEmployees';
import { 
  Search, 
  UserPlus, 
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { EmployeeCard } from '../components/EmployeeCard';
import { EmployeeDetailsModal } from '../components/EmployeeDetailsModal';
import { CreateEmployeeModal } from '../components/CreateEmployeeModal';
import { EditEmployeeModal } from '../components/EditEmployeeModal';
import { AlertDialog } from '../components/ui/alert-dialog';
import type { EmployeeDto, RegisterRequest } from '../client/types.gen';
import { toast } from 'sonner';

export const Route = createFileRoute('/employees')({
  component: EmployeesComponent,
});

function EmployeesComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Selected Employee records
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDto | null>(null);
  const [employeeIdToDelete, setEmployeeIdToDelete] = useState<string | null>(null);
  
  const [formLoading, setFormLoading] = useState(false);

  // Fetch logged in profile via hook
  const { data: me, isLoading: loadingMe } = useMeQuery();

  // Fetch all employees via hook
  const { data: employees, isLoading: loadingEmployees } = useEmployeesQuery();

  // Fetch departments for dropdowns via hook
  const { data: departments } = useDepartmentsQuery();

  // Mutations via hooks
  const registerMutation = useRegisterEmployeeMutation();
  const updateMutation = useUpdateEmployeeMutation();
  const deleteMutation = useDeleteEmployeeMutation();

  // Check user permissions
  const isAdmin = me?.role === 'ROLE_ADMIN';
  const isManager = me?.role === 'ROLE_MANAGER';
  const hasEditPrivilege = isAdmin || isManager;

  if (loadingMe) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-mauve" />
          <span className="text-sm text-subtext0">Checking authorization...</span>
        </div>
      </div>
    );
  }

  if (!hasEditPrivilege) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="p-4 rounded-full bg-red/10 text-red animate-pulse">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-text">Access Denied</h3>
          <p className="text-sm text-subtext0 max-w-sm">
            You do not have the required permissions to view the employee directory.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateSubmit = async (values: RegisterRequest) => {
    setFormLoading(true);
    console.log('[Employee Registry] Submitting registration payload:', values);
    try {
      await registerMutation.mutateAsync({ body: values });
      console.log('[Employee Registry] Employee registered successfully.');
      toast.success('Employee registered', {
        description: `Successfully registered ${values.firstName} ${values.lastName}.`
      });
      setIsCreateOpen(false);
    } catch (err: any) {
      console.error('[Employee Registry] Registration failed:', err);
      toast.error('Registration failed', {
        description: err.response?.data?.message || err.message || 'Error occurred.'
      });
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (values: EmployeeDto) => {
    setFormLoading(true);
    console.log(`[Employee Edit] Submitting profile update payload for ID ${values.id}:`, values);
    try {
      await updateMutation.mutateAsync({ 
        path: { id: values.id! }, 
        body: values as any 
      });
      console.log('[Employee Edit] Profile updated successfully.');
      toast.success('Employee updated', {
        description: `Profile details for ${values.firstName} ${values.lastName} saved.`
      });
      setIsEditOpen(false);
    } catch (err: any) {
      console.error('[Employee Edit] Profile update failed:', err);
      toast.error('Update failed', {
        description: err.response?.data?.message || err.message || 'Error occurred.'
      });
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (emp: EmployeeDto) => {
    console.log(`[Employee Directory] Loading edit profile modal for: ${emp.firstName} ${emp.lastName}`);
    setSelectedEmployee(emp);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setEmployeeIdToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeIdToDelete) return;
    console.log(`[Employee Directory] Deletion requested for employee ID: ${employeeIdToDelete}`);
    try {
      await deleteMutation.mutateAsync({ path: { id: employeeIdToDelete } });
      console.log('[Employee Directory] Employee record deleted successfully.');
      toast.success('Employee record deleted', {
        description: 'Employee profile was removed from database.'
      });
    } catch (err: any) {
      console.error('[Employee Directory] Deletion failed:', err);
      toast.error('Deletion failed', {
        description: err.response?.data?.message || err.message || 'Error occurred.'
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setEmployeeIdToDelete(null);
    }
  };

  // Filter logic
  const filteredEmployees = employees?.filter((emp) => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const searchMatch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const deptMatch = !deptFilter || emp.departmentId === deptFilter || emp.departmentCode === deptFilter;
    const roleMatch = !roleFilter || emp.role === roleFilter;
    
    return searchMatch && deptMatch && roleMatch;
  }) || [];

  const managersList = employees?.filter((emp) => emp.role === 'ROLE_MANAGER' || emp.role === 'ROLE_ADMIN') || [];

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Employee Directory</h2>
          <p className="text-sm text-subtext0 mt-0.5">
            Manage roles, view corporate department assignments, and edit profiles.
          </p>
        </div>

        {hasEditPrivilege && (
          <button
            onClick={() => {
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-mauve hover:bg-mauve/95 text-crust py-2.5 px-4 font-semibold shadow-lg shadow-mauve/15 transition-all cursor-pointer"
          >
            <UserPlus className="h-5 w-5" />
            Add Employee
          </button>
        )}
      </div>

      {/* Filter inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl glass-panel shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-surface2" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text placeholder-surface2 outline-none focus:border-mauve transition-all"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all cursor-pointer"
        >
          <option value="">All Departments</option>
          {departments?.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name} ({dept.code})
            </option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-surface0/60 bg-mantle text-xs text-text outline-none focus:border-mauve transition-all cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="ROLE_ADMIN">Admin</option>
          <option value="ROLE_MANAGER">Manager</option>
          <option value="ROLE_EMPLOYEE">Employee</option>
        </select>
      </div>

      {/* Grid of employees */}
      {loadingEmployees ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-10 w-10 text-mauve animate-spin" />
          <span className="text-xs text-subtext0">Fetching directory...</span>
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              emp={emp}
              me={me}
              hasEditPrivilege={hasEditPrivilege}
              onViewDetails={(emp) => {
                setSelectedEmployee(emp);
                setIsDetailsOpen(true);
              }}
              onEditClick={openEditModal}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl py-16 text-center text-subtext0">
          No employees found matching the filters
        </div>
      )}

      {/* CREATE MODAL OVERLAY - Rendered conditionally to refresh state on mount */}
      {isCreateOpen && (
        <CreateEmployeeModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          departments={departments || []}
          managersList={managersList}
          onSubmit={handleCreateSubmit}
          formLoading={formLoading}
        />
      )}

      {/* EDIT MODAL OVERLAY - Rendered conditionally with key prop to re-initialize form state when different employee is selected */}
      {isEditOpen && selectedEmployee && (
        <EditEmployeeModal
          key={selectedEmployee.id}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          employee={selectedEmployee}
          departments={departments || []}
          managersList={managersList}
          onSubmit={handleEditSubmit}
          formLoading={formLoading}
        />
      )}

      {/* DETAILS VIEW MODAL OVERLAY */}
      <EmployeeDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedEmployee(null);
        }}
        selectedEmployee={selectedEmployee}
        isAdmin={isAdmin}
        hasEditPrivilege={hasEditPrivilege}
        onEditClick={openEditModal}
      />

      {/* DELETE CONFIRMATION ALERT DIALOG */}
      <AlertDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Employee Record"
        description="Are you sure you want to delete this employee record? This action is permanent and cannot be undone."
        confirmText="Delete"
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setEmployeeIdToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}
