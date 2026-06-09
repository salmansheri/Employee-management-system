import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
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
  Loader2
} from 'lucide-react';
import { EmployeeCard } from '../components/EmployeeCard';
import { EmployeeDetailsModal } from '../components/EmployeeDetailsModal';
import { CreateEmployeeModal } from '../components/CreateEmployeeModal';
import { EditEmployeeModal } from '../components/EditEmployeeModal';

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
  
  // Selected Employee records
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch logged in profile via hook
  const { data: me } = useMeQuery();

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

  // Form hooks
  const createForm = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      jobTitle: '',
      departmentCode: 'ENG',
      managerId: '',
      salary: 50000,
      role: 'ROLE_EMPLOYEE'
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setFormLoading(true);
      try {
        await registerMutation.mutateAsync({ body: value as any });
        setIsCreateOpen(false);
        createForm.reset();
      } catch (err: any) {
        setFormError(err.response?.data?.message || err.message || 'Error registering employee');
      } finally {
        setFormLoading(false);
      }
    }
  });

  const editForm = useForm({
    defaultValues: {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      departmentId: '',
      managerId: '',
      salary: 50000,
      role: 'ROLE_EMPLOYEE',
      status: 'ACTIVE'
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setFormLoading(true);
      try {
        await updateMutation.mutateAsync({ 
          path: { id: value.id }, 
          body: value as any 
        });
        setIsEditOpen(false);
      } catch (err: any) {
        setFormError(err.response?.data?.message || err.message || 'Error updating employee');
      } finally {
        setFormLoading(false);
      }
    }
  });

  const resetCreateForm = () => {
    createForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      jobTitle: '',
      departmentCode: departments?.[0]?.code || 'ENG',
      managerId: '',
      salary: 50000,
      role: 'ROLE_EMPLOYEE'
    });
    setFormError(null);
  };

  const openEditModal = (emp: any) => {
    editForm.reset({
      id: emp.id || '',
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      jobTitle: emp.jobTitle || '',
      departmentId: emp.departmentId || '',
      managerId: emp.managerId || '',
      salary: emp.salary || 50000,
      role: emp.role || 'ROLE_EMPLOYEE',
      status: emp.status || 'ACTIVE'
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee record?')) {
      try {
        await deleteMutation.mutateAsync({ path: { id } });
      } catch (err: any) {
        alert(err.response?.data?.message || err.message || 'Failed to delete employee');
      }
    }
  };

  // Filter logic
  const filteredEmployees = employees?.filter((emp: any) => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const searchMatch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const deptMatch = !deptFilter || emp.departmentId === deptFilter || emp.departmentCode === deptFilter;
    const roleMatch = !roleFilter || emp.role === roleFilter;
    
    return searchMatch && deptMatch && roleMatch;
  }) || [];

  const managersList = employees?.filter((emp: any) => emp.role === 'ROLE_MANAGER' || emp.role === 'ROLE_ADMIN') || [];

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
              resetCreateForm();
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
          {departments?.map((dept: any) => (
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
          {filteredEmployees.map((emp: any) => (
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
              onDeleteClick={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl py-16 text-center text-subtext0">
          No employees found matching the filters
        </div>
      )}

      {/* CREATE MODAL OVERLAY */}
      <CreateEmployeeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        form={createForm}
        formError={formError}
        formLoading={formLoading}
        departments={departments || []}
        managersList={managersList}
      />

      {/* EDIT MODAL OVERLAY */}
      <EditEmployeeModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        form={editForm}
        formError={formError}
        formLoading={formLoading}
        departments={departments || []}
        managersList={managersList}
      />

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

    </div>
  );
}
