import { useState } from 'react';
import { Calendar, Download, User } from 'lucide-react';
import type { Employee, TimeLog } from '../App';

interface ReportsProps {
  employees: Employee[];
  timeLogs: TimeLog[];
}

interface DailyReport {
  date: string;
  checkIn?: string;
  breakStart?: string;
  breakEnd?: string;
  checkOut?: string;
  totalHours?: string;
  breakDuration?: string;
}

export function Reports({ employees, timeLogs }: ReportsProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'custom'
  const [customDate, setCustomDate] = useState('');

  const getFilteredLogs = () => {
    let filtered = timeLogs;

    // Filter by employee
    if (selectedEmployeeId) {
      filtered = filtered.filter(log => log.employeeId === selectedEmployeeId);
    }

    // Filter by date
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      filtered = filtered.filter(log => log.date === today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      filtered = filtered.filter(log => log.date >= weekAgoStr);
    } else if (dateFilter === 'custom' && customDate) {
      filtered = filtered.filter(log => log.date === customDate);
    }

    return filtered;
  };

  const generateDailyReports = (): DailyReport[] => {
    const filtered = getFilteredLogs();
    const reportsByDate: { [date: string]: DailyReport } = {};

    filtered.forEach(log => {
      if (!reportsByDate[log.date]) {
        reportsByDate[log.date] = { date: log.date };
      }

      const report = reportsByDate[log.date];
      switch (log.type) {
        case 'check-in':
          report.checkIn = log.timestamp;
          break;
        case 'break-start':
          report.breakStart = log.timestamp;
          break;
        case 'break-end':
          report.breakEnd = log.timestamp;
          break;
        case 'check-out':
          report.checkOut = log.timestamp;
          break;
      }
    });

    // Calculate durations
    Object.values(reportsByDate).forEach(report => {
      if (report.checkIn && report.checkOut) {
        const checkIn = parseTime(report.checkIn);
        const checkOut = parseTime(report.checkOut);
        if (checkIn && checkOut) {
          const diff = checkOut.getTime() - checkIn.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          report.totalHours = `${hours}h ${minutes}m`;
        }
      }

      if (report.breakStart && report.breakEnd) {
        const breakStart = parseTime(report.breakStart);
        const breakEnd = parseTime(report.breakEnd);
        if (breakStart && breakEnd) {
          const diff = breakEnd.getTime() - breakStart.getTime();
          const minutes = Math.floor(diff / (1000 * 60));
          report.breakDuration = `${minutes}m`;
        }
      }
    });

    return Object.values(reportsByDate).sort((a, b) => b.date.localeCompare(a.date));
  };

  const parseTime = (timeStr: string): Date | null => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [time, period] = timeStr.split(' ');
      let [hours, minutes, seconds] = time.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const date = new Date(`${today}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds || 0).padStart(2, '0')}`);
      return date;
    } catch {
      return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const exportToCSV = () => {
    const reports = generateDailyReports();
    const employee = employees.find(e => e.id === selectedEmployeeId);
    
    let csv = 'Date,Employee,Check In,Break Start,Break End,Check Out,Total Hours,Break Duration\n';
    
    reports.forEach(report => {
      csv += `${formatDate(report.date)},`;
      csv += `${employee?.name || 'All Employees'},`;
      csv += `${report.checkIn || '-'},`;
      csv += `${report.breakStart || '-'},`;
      csv += `${report.breakEnd || '-'},`;
      csv += `${report.checkOut || '-'},`;
      csv += `${report.totalHours || '-'},`;
      csv += `${report.breakDuration || '-'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const reports = generateDailyReports();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-900">Attendance Reports</h2>
        <button
          onClick={exportToCSV}
          disabled={reports.length === 0}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 mb-2">Employee</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Time Period</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="custom">Custom Date</option>
          </select>
        </div>

        {dateFilter === 'custom' && (
          <div>
            <label className="block text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Reports Table */}
      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No attendance records found for the selected filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700">Date</th>
                {selectedEmployeeId && <th className="text-left py-3 px-4 text-gray-700">Employee</th>}
                <th className="text-left py-3 px-4 text-gray-700">Check In</th>
                <th className="text-left py-3 px-4 text-gray-700">Break Start</th>
                <th className="text-left py-3 px-4 text-gray-700">Break End</th>
                <th className="text-left py-3 px-4 text-gray-700">Check Out</th>
                <th className="text-left py-3 px-4 text-gray-700">Total Hours</th>
                <th className="text-left py-3 px-4 text-gray-700">Break Duration</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => {
                const employee = selectedEmployeeId 
                  ? employees.find(e => e.id === selectedEmployeeId)
                  : null;
                
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{formatDate(report.date)}</td>
                    {selectedEmployeeId && (
                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {employee?.name}
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-4 text-gray-600">{report.checkIn || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{report.breakStart || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{report.breakEnd || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{report.checkOut || '-'}</td>
                    <td className="py-3 px-4 text-gray-900">{report.totalHours || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{report.breakDuration || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
