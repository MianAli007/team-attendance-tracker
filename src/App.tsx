import { useState, useEffect } from 'react';
import { EmployeeManager } from './components/EmployeeManager';
import { TimeTracker } from './components/TimeTracker';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { ClipboardList, Users, Clock, LogOut, Shield } from 'lucide-react';
import { supabase } from './lib/supabase';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface TimeLog {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'check-in' | 'break-start' | 'break-end' | 'check-out';
  timestamp: string;
  date: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'tracker' | 'employees' | 'reports'>('tracker');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  // Load data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data: employeesData, error: empError } = await supabase.from('employees').select('*');
      const { data: logsData, error: logsError } = await supabase.from('time_logs').select('*');

      if (empError) {
        console.error('Error fetching employees:', empError);
        alert(`Failed to load employees: ${empError.message}. Please check your Supabase configuration.`);
      }
      if (logsError) {
        console.error('Error fetching time logs:', logsError);
      }

      if (employeesData) setEmployees(employeesData);
      if (logsData) {
        // Transform snake_case to camelCase
        const transformedLogs = logsData.map((log: any) => ({
          id: log.id,
          employeeId: log.employee_id,
          employeeName: log.employee_name,
          type: log.type,
          timestamp: log.timestamp,
          date: log.date
        }));
        setTimeLogs(transformedLogs);
        console.log('Loaded time logs:', transformedLogs);
      }
    };

    fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, (payload) => {
        console.log('Real-time employee event:', payload);
        if (payload.eventType === 'INSERT') {
          setEmployees((prev) => [...prev, payload.new as Employee]);
        } else if (payload.eventType === 'DELETE') {
          setEmployees((prev) => prev.filter((emp) => emp.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_logs' }, (payload) => {
        console.log('Real-time time_logs event:', payload);
        if (payload.eventType === 'INSERT') {
          const newLog: any = payload.new;
          const transformedLog: TimeLog = {
            id: newLog.id,
            employeeId: newLog.employee_id,
            employeeName: newLog.employee_name,
            type: newLog.type,
            timestamp: newLog.timestamp,
            date: newLog.date
          };
          console.log('Adding log to state:', transformedLog);
          setTimeLogs((prev) => [...prev, transformedLog]);
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Admin persistence (keep in localStorage for simplicity as it's just a flag)
  useEffect(() => {
    const savedAdmin = localStorage.getItem('isAdmin');
    const savedUser = localStorage.getItem('currentUser');

    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (email: string, password: string, asAdmin: boolean) => {
    if (asAdmin) {
      // Admin login - check email and password
      if (email === 'mianalihusnain1118@gmail.com' && password === 'tracker@softbuses') {
        setIsAdmin(true);
        setCurrentUser(null);
        localStorage.setItem('isAdmin', 'true');
        localStorage.removeItem('currentUser');
        return true;
      }
      return false;
    } else {
      // Employee login - check if employee exists
      const employee = employees.find(emp => emp.email === email);
      if (employee) {
        setIsAdmin(false);
        setCurrentUser(employee);
        localStorage.setItem('currentUser', JSON.stringify(employee));
        localStorage.removeItem('isAdmin');
        return true;
      }
      return false;
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('currentUser');
    setActiveTab('tracker');
  };

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString(),
    };

    const { data, error } = await supabase.from('employees').insert(newEmployee).select();

    if (error) {
      console.error('Error adding employee:', error);
      alert(`Failed to add employee: ${error.message}`);
      return;
    }

    console.log('Employee added successfully:', data);
    // State update handled by subscription
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
    // State update handled by subscription
  };

  const addTimeLog = async (log: Omit<TimeLog, 'id' | 'date'>) => {
    const now = new Date();
    const newLog = {
      id: Date.now().toString(),
      employee_id: log.employeeId,
      employee_name: log.employeeName,
      type: log.type,
      timestamp: log.timestamp,
      date: now.toISOString().split('T')[0],
    };

    const { data, error } = await supabase.from('time_logs').insert(newLog).select();

    if (error) {
      console.error('Error adding time log:', error);
      alert(`Failed to add time log: ${error.message}`);
      return;
    }

    if (data && data[0]) {
      // Immediately update local state with the new log
      const transformedLog: TimeLog = {
        id: data[0].id,
        employeeId: data[0].employee_id,
        employeeName: data[0].employee_name,
        type: data[0].type,
        timestamp: data[0].timestamp,
        date: data[0].date
      };
      setTimeLogs((prev) => [...prev, transformedLog]);
      console.log('Time log added successfully:', transformedLog);
    }
  };

  // Show login screen if not logged in
  if (!isAdmin && !currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-gray-900 mb-2">Employee Time Tracker</h1>
            <p className="text-gray-600">
              {isAdmin ? (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Admin Dashboard
                </span>
              ) : (
                `Welcome, ${currentUser?.name}`
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-6 py-4 transition-colors ${activeTab === 'tracker'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Clock className="w-5 h-5" />
              Time Tracker
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('employees')}
                className={`flex items-center gap-2 px-6 py-4 transition-colors ${activeTab === 'employees'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Users className="w-5 h-5" />
                Employees
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-6 py-4 transition-colors ${activeTab === 'reports'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <ClipboardList className="w-5 h-5" />
                Reports
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'tracker' && (
            <TimeTracker
              employees={employees}
              timeLogs={timeLogs}
              onAddTimeLog={addTimeLog}
              isAdmin={isAdmin}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'employees' && isAdmin && (
            <EmployeeManager
              employees={employees}
              onAddEmployee={addEmployee}
              onDeleteEmployee={deleteEmployee}
            />
          )}
          {activeTab === 'reports' && isAdmin && (
            <Reports employees={employees} timeLogs={timeLogs} />
          )}
        </div>
      </div>
    </div>
  );
}
