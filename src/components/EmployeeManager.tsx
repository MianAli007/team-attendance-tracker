import { useState } from 'react';
import { UserPlus, Trash2, Mail, Briefcase, Users } from 'lucide-react';
import type { Employee } from '../App';

interface EmployeeManagerProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onDeleteEmployee: (id: string) => void;
}

export function EmployeeManager({ employees, onAddEmployee, onDeleteEmployee }: EmployeeManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      onAddEmployee(formData);
      setFormData({ name: '', email: '', department: '' });
      setShowForm(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-900">Manage Employees</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-gray-900 mb-4">New Employee</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Employee
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee List */}
      <div className="space-y-3">
        {employees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No employees added yet. Click "Add Employee" to get started.</p>
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="text-gray-900 mb-1">{employee.name}</div>
                <div className="flex gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {employee.email}
                  </span>
                  {employee.department && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {employee.department}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
                    onDeleteEmployee(employee.id);
                  }
                }}
                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
