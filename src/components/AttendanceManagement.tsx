import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronLeft, ChevronRight, User, Search, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function AttendanceManagement() {
  const [date, setDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const dateStr = useMemo(() => {
    try {
      return date.toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  }, [date]);

  const records = useQuery(api.attendance.fetchDailyAttendanceForAdmin, { date: dateStr });

  const filteredRecords = useMemo(() => {
    if (!records) return null;
    return records.filter((r: any) => {
      if (!r || !r.employee) return false;
      const fullName = `${r.employee.firstName || ''} ${r.employee.lastName || ''}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [records, searchTerm]);

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

  return (
    <div className="space-y-6">
      {/* Header / Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-[#050505] rounded-lg border border-white/20 p-1 flex items-center">
            <button onClick={handlePrevDay} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNextDay} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="px-4 py-2 bg-[#050505] border border-white/20 rounded-lg min-w-[150px] text-center">
            <span className="text-white font-handwriting text-lg">
              {date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050505] border border-white/20 rounded-lg pl-10 pr-4 py-2 text-slate-300 font-handwriting focus:outline-none focus:border-indigo-500 shadow-inner"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5 min-h-[400px]">
        <div className="grid grid-cols-12 p-4 text-slate-400 font-handwriting text-lg border-b border-white/10 bg-black/20">
          <div className="col-span-4 pl-4">Employee</div>
          <div className="col-span-2">Check In</div>
          <div className="col-span-2">Check Out</div>
          <div className="col-span-2 text-center">Hours</div>
          <div className="col-span-2 text-right pr-4">Extra</div>
        </div>

        <div className="divide-y divide-white/5 bg-black/10">
          {records === undefined ? (
            <div className="p-12 text-center text-slate-500 font-handwriting animate-pulse">
              Loading attendance records...
            </div>
          ) : records === null ? (
            <div className="p-12 text-center space-y-3">
              <AlertCircle className="mx-auto text-rose-500" size={32} />
              <p className="text-slate-400 font-handwriting text-lg">Access Denied. Admin/HR role required.</p>
            </div>
          ) : filteredRecords && filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-handwriting text-lg">
              No records found for this date.
            </div>
          ) : (
            filteredRecords?.map((record: any) => {
              if (!record) return null;
              const workHours = (record.hoursWorked || 0);
              const extra = Math.max(0, workHours - 9);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={record._id}
                  className="grid grid-cols-12 p-4 text-slate-300 font-handwriting text-lg hover:bg-white/5 transition-colors items-center"
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
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {record.checkIn || "--:--"}
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {record.checkOut || "--:--"}
                  </div>
                  <div className="col-span-2 text-center font-mono text-base">
                    {workHours > 0 ? workHours.toFixed(1) + "h" : '-'}
                  </div>
                  <div className="col-span-2 text-right pr-4 text-emerald-400 font-bold">
                    {extra > 0 ? `+${extra.toFixed(1)}h` : '-'}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
