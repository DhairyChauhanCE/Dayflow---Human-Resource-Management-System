import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  FileText,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface AttendanceManagementProps {
  isAdmin?: boolean;
}

export function AttendanceManagement({ isAdmin = false }: AttendanceManagementProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Computed range for the selected month
  const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).toISOString().split('T')[0];

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState<"present" | "absent" | "half-day" | "leave" | "on_leave">("present");
  const [remarks, setRemarks] = useState("");

  // Only fetch all employees if admin
  const employees = useQuery(api.employees.getAllEmployees, isAdmin ? {} : "skip") || [];

  // Fetch monthly stats and history for the employee view
  const monthlyStats = useQuery(api.attendance.getMonthlyAttendanceStats, !isAdmin ? {
    month: selectedMonth.getMonth(),
    year: selectedMonth.getFullYear()
  } : "skip");

  const monthlyAttendance = useQuery(api.attendance.fetchMonthlyAttendanceForEmployee, !isAdmin ? {
    month: selectedMonth.getMonth() + 1,
    year: selectedMonth.getFullYear()
  } : "skip") || [];


  // Fetch attendance for the selected date (Admin View)
  const attendanceHistory = useQuery(api.attendance.fetchDailyAttendanceForAdmin, isAdmin ? {
    date: selectedDate
  } : "skip") || [];

  const filteredAttendance = useMemo(() => {
    if (!attendanceHistory) return [];
    return attendanceHistory.filter((record: any) => {
      const employeeName = record.employeeName || (record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : "Unknown");
      return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [attendanceHistory, searchTerm]);

  const markAttendance = useMutation(api.attendance.markAttendance);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    try {
      await markAttendance({
        employeeId: selectedEmployee as any,
        date: selectedDate,
        status: attendanceStatus,
        remarks: remarks
      });
      toast.success("Attendance marked successfully");
      setRemarks("");
    } catch (error: any) {
      toast.error("Failed to mark attendance: " + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "absent": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "half-day": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "leave":
      case "on_leave": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Generate days for the selected month
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Attendance</h1>
          <p className="text-slate-300">Track and manage daily attendance</p>
        </div>
        {!isAdmin && (
          <div className="flex flex-col items-end">
            <p className="text-sm text-slate-400">Current Month</p>
            <p className="text-xl font-bold text-white">{monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}</p>
          </div>
        )}
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mark Attendance Form */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 h-fit">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="text-indigo-400" size={20} />
              Mark Attendance
            </h3>
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Date</label>
                <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-2 py-1">
                  <button type="button" onClick={handlePrevDay} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white focus:outline-none py-2 text-center"
                  />
                  <button type="button" onClick={handleNextDay} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" className="bg-slate-900">Select Employee</option>
                  {employees.map((emp: any) => (
                    <option key={emp._id} value={emp._id} className="bg-slate-900">
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                <div className="grid grid-cols-2 gap-3">
                  {["present", "absent", "half-day", "leave", "on_leave"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAttendanceStatus(status as any)}
                      className={`px-2 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${attendanceStatus === status
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-lg scale-105"
                        : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                        }`}
                    >
                      {status === "on_leave" ? "On Leave" : status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                  placeholder="Optional notes..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95"
              >
                Submit Attendance
              </button>
            </form>
          </div>

          {/* Daily Records List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 min-h-[400px]">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h3 className="text-lg font-bold text-white">Records for {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {attendanceHistory === undefined ? (
                  <div className="text-center py-12 animate-pulse text-slate-500">Loading records...</div>
                ) : filteredAttendance.length > 0 ? (
                  filteredAttendance.map((record: any) => (
                    <motion.div
                      key={record._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden">
                          {record.employee?.profilePictureUrl ? (
                            <img src={record.employee.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={18} className="text-indigo-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {record.employeeName || (record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : "Unknown Employee")}
                          </p>
                          <p className="text-xs text-slate-500">
                            {record.checkIn || "09:00 AM"} - {record.checkOut || "06:00 PM"}
                            {record.hoursWorked ? ` • ${record.hoursWorked.toFixed(1)}h` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        {record.remarks && <p className="text-xs text-slate-500 mt-1 max-w-[150px] truncate">{record.remarks}</p>}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No attendance records found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Employee Month View
        <>
          <div className="glass-card p-8 rounded-3xl border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-white w-48 text-center">
                  {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                </h2>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Summary Stats */}
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Present</p>
                  <p className="text-lg font-bold text-white">{monthlyStats?.present ?? '-'}</p>
                </div>
                <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">Absent</p>
                  <p className="text-lg font-bold text-white">{monthlyStats?.absent ?? '-'}</p>
                </div>
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Payable Days</p>
                  <p className="text-lg font-bold text-white">{monthlyStats?.payableDays ?? '-'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-slate-500 text-sm font-bold uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
              {daysArray.map(day => {
                const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = monthlyAttendance.find((r: any) => r.date === dateStr);
                const status = record?.status;

                let statusColor = "";
                if (status === "present") statusColor = "bg-emerald-500";
                else if (status === "absent") statusColor = "bg-rose-500";
                else if (status === "half-day") statusColor = "bg-amber-500";
                else if (status === "leave" || status === "on_leave") statusColor = "bg-blue-500";

                return (
                  <div key={day} className="aspect-square bg-white/5 border border-white/5 rounded-xl p-3 relative group hover:bg-white/10 transition-all cursor-pointer">
                    <span className={`text-sm font-bold ${status ? 'text-white' : 'text-slate-400'} group-hover:text-white`}>{day}</span>

                    {status && (
                      <div className="absolute bottom-3 right-3">
                        <div className={`w-2 h-2 rounded-full ${statusColor}`} title={status}></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                <FileText size={18} />
                Download Payslip for {monthNames[selectedMonth.getMonth()]}
              </button>
            </div>
          </div>

          {/* Note Section */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#0A0A0A]">
            <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4">
              <h3 className="text-amber-500 font-bold mb-4 text-center border-b border-amber-500/20 pb-2 mx-auto w-fit px-8">NOTE</h3>
              <ul className="space-y-3 text-slate-400 text-sm list-disc pl-5">
                <li>If the employee's working source is based on the assigned attendance</li>
                <li>On the Attendance page, users should see a day-wise attendance of themselves by default for ongoing month, displaying details based on their working time, including breaks.</li>
                <li>For Admins: They can see attendance of all the employees present on the selected day.</li>
                <li>Attendance data serves as the basis for payslip generation.</li>
                <li>The system should use the generated attendance records to determine the total number of payable days for each employee.</li>
                <li>Any unpaid leave or missing attendance days should automatically reduce the number of payable days during payslip computation</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
