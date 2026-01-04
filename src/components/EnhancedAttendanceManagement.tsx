import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronLeft, ChevronRight, User, Search, AlertCircle, Calendar, Clock, Users, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function EnhancedAttendanceManagement() {
  const [date, setDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"day" | "present">("day");
  const [isCalculating, setIsCalculating] = useState(false);

  const dateStr = useMemo(() => {
    try {
      return date.toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  }, [date]);

  // Get current user to determine view
  const currentUser = useQuery(api.employees.getCurrentEmployee);
  
  // Admins see all employees present, employees see their own day-wise attendance
  const records = useQuery(
    currentUser?.role !== "employee" 
      ? api.attendance.fetchDailyAttendanceForAdmin 
      : api.attendance.fetchMonthlyAttendanceForEmployee,
    currentUser?.role !== "employee" 
      ? { date: dateStr }
      : { year: date.getFullYear(), month: date.getMonth() + 1 }
  );

  const calculatePayableDays = useMutation(api.payroll.calculatePayableDays);

  const filteredRecords = useMemo(() => {
    if (!records) return null;
    return records.filter((r: any) => {
      if (!r || !r.employee) return false;
      const fullName = `${r.employee.firstName || ''} ${r.employee.lastName || ''}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [records, searchTerm]);

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    if (!records) return null;
    
    const totalDays = records.length;
    const presentDays = records.filter((r: any) => 
      r.status === "present" || (r.checkIn && r.checkOut)
    ).length;
    const absentDays = records.filter((r: any) => r.status === "absent").length;
    const leaveDays = records.filter((r: any) => r.status === "on_leave").length;
    const lateDays = records.filter((r: any) => r.status === "late").length;
    
    return {
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      lateDays,
      attendanceRate: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0"
    };
  }, [records]);

  const handlePrevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d);
  };

  const handleCalculatePayableDays = async () => {
    if (!currentUser || currentUser.role === "employee") {
      toast.error("Access denied");
      return;
    }

    setIsCalculating(true);
    try {
      const result = await calculatePayableDays({
        employeeId: "all", // Calculate for all employees
        month: date.getMonth() + 1,
        year: date.getFullYear()
      });
      
      toast.success(`Payable days calculated for ${result.length} employees`);
    } catch (error: any) {
      toast.error(error.message || "Failed to calculate payable days");
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePrevMonth = () => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - 1);
    setDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    setDate(d);
  };

  return (
    <div className="space-y-6">
      {/* Header / Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="bg-[#050505] rounded-lg border border-white/20 p-1 flex items-center">
            <button onClick={currentUser?.role !== "employee" ? handlePrevDay : handlePrevMonth} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 py-2 bg-[#050505] min-w-[150px] text-center">
              <span className="text-white font-medium">
                {currentUser?.role !== "employee" 
                  ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                  : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
              </span>
            </div>
            <button onClick={currentUser?.role !== "employee" ? handleNextDay : handleNextMonth} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050505] border border-white/20 rounded-lg pl-10 pr-4 py-3 text-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* View Mode Toggle for Admins */}
        {currentUser?.role !== "employee" && (
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("day")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "day" 
                  ? "bg-indigo-500 text-white" 
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode("present")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "present" 
                  ? "bg-emerald-500 text-white" 
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              All Present
            </button>
          </div>
        )}

        {/* Calculate Payable Days Button */}
        {currentUser?.role !== "employee" && (
          <button
            onClick={() => void handleCalculatePayableDays()}
            disabled={isCalculating}
            className="premium-btn flex items-center gap-2 disabled:opacity-50"
          >
            <Calendar size={18} />
            {isCalculating ? "Calculating..." : "Calculate Payable Days"}
          </button>
        )}
      </div>

      {/* Attendance Statistics */}
      {attendanceStats && currentUser?.role !== "employee" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Total Days</h3>
                <p className="text-3xl font-bold text-blue-400">{attendanceStats.totalDays}</p>
              </div>
              <Calendar size={24} className="text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Present</h3>
                <p className="text-3xl font-bold text-emerald-400">{attendanceStats.presentDays}</p>
              </div>
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-rose-500/20 to-rose-500/5 backdrop-blur-xl rounded-xl p-6 border border-rose-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Absent</h3>
                <p className="text-3xl font-bold text-rose-400">{attendanceStats.absentDays}</p>
              </div>
              <XCircle size={24} className="text-rose-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 backdrop-blur-xl rounded-xl p-6 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">On Leave</h3>
                <p className="text-3xl font-bold text-amber-400">{attendanceStats.leaveDays}</p>
              </div>
              <Clock size={24} className="text-amber-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Late Days</h3>
                <p className="text-3xl font-bold text-purple-400">{attendanceStats.lateDays}</p>
              </div>
              <AlertCircle size={24} className="text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5 min-h-[400px]">
        {viewMode === "present" && currentUser?.role !== "employee" ? (
          /* All Employees Present View */
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users size={20} className="text-emerald-400" />
                All Employees Present Today
              </h2>
              <span className="text-emerald-400 text-lg font-bold">
                {filteredRecords?.filter(r => r.status === "present").length || 0} Present
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords?.filter((record: any) => record.status === "present").map((record: any) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={record._id}
                  className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        {record.employee.firstName} {record.employee.lastName}
                      </h4>
                      <p className="text-emerald-300 text-sm">
                        {record.employee.position} • {record.employee.department}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-emerald-400 text-sm">
                          {record.checkIn?.split('T')[1]?.substring(0, 5) || '--:--'}
                        </span>
                        <span className="text-slate-500">to</span>
                        <span className="text-emerald-400 text-sm">
                          {record.checkOut?.split('T')[1]?.substring(0, 5) || '--:--'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* Day-wise Attendance View */
          <>
            <div className="grid grid-cols-12 p-4 text-slate-400 font-medium border-b border-white/10 bg-black/20">
              <div className="col-span-4 pl-4">Employee</div>
              <div className="col-span-2">Check In</div>
              <div className="col-span-2">Check Out</div>
              <div className="col-span-2">Hours</div>
              <div className="col-span-2 text-center">Status</div>
            </div>

            <div className="divide-y divide-white/5 bg-black/10">
              {records === undefined ? (
                <div className="p-12 text-center text-slate-500 animate-pulse">
                  Loading attendance records...
                </div>
              ) : records === null ? (
                <div className="p-12 text-center space-y-3">
                  <AlertCircle className="mx-auto text-rose-500" size={32} />
                  <p className="text-slate-400 text-lg">Access Denied. Admin/HR role required.</p>
                </div>
              ) : filteredRecords && filteredRecords.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-lg">
                  No records found for this period.
                </div>
              ) : (
                filteredRecords?.map((record: any) => {
                  const workHours = record.hoursWorked || 0;
                  const extra = Math.max(0, workHours - 9);
                  const statusColor = record.status === "present" ? "text-emerald-400" : 
                                       record.status === "absent" ? "text-rose-400" : 
                                       record.status === "late" ? "text-amber-400" : "text-slate-400";

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={record._id}
                      className="grid grid-cols-12 p-4 text-slate-300 hover:bg-white/5 transition-colors items-center"
                    >
                      <div className="col-span-4 pl-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                          {record.employee?.profilePictureUrl ? (
                            <img src={record.employee.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} className="text-white/30" />
                          )}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="truncate">{record.employee?.firstName} {record.employee?.lastName}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{record.employee?.department || 'Staff'}</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          record.checkIn ? "bg-emerald-500" : "bg-slate-600"
                        }`} />
                        {record.checkIn?.split('T')[1]?.substring(0, 5) || '--:--'}
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          record.checkOut ? "bg-rose-500" : "bg-slate-600"
                        }`} />
                        {record.checkOut?.split('T')[1]?.substring(0, 5) || '--:--'}
                      </div>
                      <div className="col-span-2 text-center font-mono text-base">
                        {workHours > 0 ? workHours.toFixed(1) + "h" : '-'}
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === "present" ? "bg-emerald-500/20 text-emerald-300" :
                          record.status === "absent" ? "bg-rose-500/20 text-rose-300" :
                          record.status === "late" ? "bg-amber-500/20 text-amber-300" :
                          "bg-slate-500/20 text-slate-300"
                        }`}>
                          {record.status === "present" ? "Present" :
                           record.status === "absent" ? "Absent" :
                           record.status === "late" ? "Late" : record.status || "-"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
