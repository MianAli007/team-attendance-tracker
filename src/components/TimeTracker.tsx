import { useState, useEffect } from 'react';
import { LogIn, Coffee, CoffeeIcon, LogOut, Clock } from 'lucide-react';
import type { Employee, TimeLog } from '../App';

interface TimeTrackerProps {
  employees: Employee[];
  timeLogs: TimeLog[];
  onAddTimeLog: (log: Omit<TimeLog, 'id' | 'date'>) => void;
  isAdmin: boolean;
  currentUser: Employee | null;
}

export function TimeTracker({ employees, timeLogs, onAddTimeLog, isAdmin, currentUser }: TimeTrackerProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(currentUser?.id || '');

  // Update selectedEmployeeId when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      setSelectedEmployeeId(currentUser.id);
    }
  }, [currentUser]);

  const handleTimeLog = (type: TimeLog['type']) => {
    if (!selectedEmployeeId) {
      alert('Please select an employee');
      return;
    }

    const employee = employees.find(emp => emp.id === selectedEmployeeId);
    if (!employee) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    onAddTimeLog({
      employeeId: employee.id,
      employeeName: employee.name,
      type,
      timestamp,
    });
  };

  // Get today's logs
  const today = new Date().toISOString().split('T')[0];
  let todayLogs = timeLogs.filter(log => log.date === today);

  // If employee, only show their own logs
  if (!isAdmin && currentUser) {
    todayLogs = todayLogs.filter(log => log.employeeId === currentUser.id);
  }

  // Get last 10 logs
  const recentLogs = [...todayLogs].reverse().slice(0, 10);

  const getLogIcon = (type: TimeLog['type']) => {
    switch (type) {
      case 'check-in':
        return <LogIn className="w-5 h-5 text-green-600" />;
      case 'break-start':
        return <Coffee className="w-5 h-5 text-orange-600" />;
      case 'break-end':
        return <CoffeeIcon className="w-5 h-5 text-blue-600" />;
      case 'check-out':
        return <LogOut className="w-5 h-5 text-red-600" />;
    }
  };

  const getLogLabel = (type: TimeLog['type']) => {
    switch (type) {
      case 'check-in':
        return 'Checked In';
      case 'break-start':
        return 'Break Started';
      case 'break-end':
        return 'Returned from Break';
      case 'check-out':
        return 'Checked Out';
    }
  };

  const getLogColor = (type: TimeLog['type']) => {
    switch (type) {
      case 'check-in':
        return 'bg-green-100 text-green-800';
      case 'break-start':
        return 'bg-orange-100 text-orange-800';
      case 'break-end':
        return 'bg-blue-100 text-blue-800';
      case 'check-out':
        return 'bg-red-100 text-red-800';
    }
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No employees available. Please add employees first.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-gray-900 mb-6">Track Time</h2>

      {/* Employee Selection - Only shown to Admin */}
      {isAdmin && (
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Select Employee</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose an employee...</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} - {employee.department || 'No Department'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Employee Info - Shown to regular employees */}
      {!isAdmin && currentUser && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-gray-700">
            Tracking time for: <span className="text-gray-900">{currentUser.name}</span>
            {currentUser.department && <span className="text-gray-600"> - {currentUser.department}</span>}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => handleTimeLog('check-in')}
          disabled={!selectedEmployeeId}
          className="flex flex-col items-center gap-3 p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <LogIn className="w-8 h-8 text-green-600" />
          <span className="text-green-900">Check In</span>
        </button>

        <button
          onClick={() => handleTimeLog('break-start')}
          disabled={!selectedEmployeeId}
          className="flex flex-col items-center gap-3 p-6 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Coffee className="w-8 h-8 text-orange-600" />
          <span className="text-orange-900">Start Break</span>
        </button>

        <button
          onClick={() => handleTimeLog('break-end')}
          disabled={!selectedEmployeeId}
          className="flex flex-col items-center gap-3 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <CoffeeIcon className="w-8 h-8 text-blue-600" />
          <span className="text-blue-900">End Break</span>
        </button>

        <button
          onClick={() => handleTimeLog('check-out')}
          disabled={!selectedEmployeeId}
          className="flex flex-col items-center gap-3 p-6 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <LogOut className="w-8 h-8 text-red-600" />
          <span className="text-red-900">Check Out</span>
        </button>
      </div>

      {/* Today's Activity */}
      <div>
        <h3 className="text-gray-900 mb-4">Today's Activity</h3>
        {recentLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activity logged today yet.</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {getLogIcon(log.type)}
                  <div>
                    <div className="text-gray-900">{log.employeeName}</div>
                    <div className="text-gray-600">{log.timestamp}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full ${getLogColor(log.type)}`}>
                  {getLogLabel(log.type)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
