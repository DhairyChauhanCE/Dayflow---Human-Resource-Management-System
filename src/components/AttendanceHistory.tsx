import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function AttendanceHistory() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const attendanceData = useQuery(api.attendance.fetchMonthlyAttendanceForEmployee, { year, month });

    const stats = useMemo(() => {
        if (!attendanceData) return { present: 0, leaves: 0, working: 0 };
        const present = attendanceData.filter(r => r.status === "present" || r.status === "half-day").length;
        const leaves = attendanceData.filter(r => r.status === "leave").length;

        let working = 0;
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month - 1, i).getDay();
            if (d !== 0 && d !== 6) working++;
        }
        return { present, leaves, working };
    }, [attendanceData, year, month]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Stats Overlay */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/5 p-5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="flex bg-[#050505] rounded-xl border border-white/20 p-1.5 shadow-lg">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all active:scale-95">
                            <ChevronLeft size={22} />
                        </button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all active:scale-95">
                            <ChevronRight size={22} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-2.5 bg-[#050505] border border-white/20 rounded-xl min-w-[180px] justify-center shadow-lg">
                        <Calendar size={18} className="text-indigo-400" />
                        <span className="text-white font-handwriting text-2xl tracking-wide">
                            {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
                    <StatCard label="Present" value={stats.present} color="emerald" />
                    <StatCard label="Leaves" value={stats.leaves} color="rose" />
                    <StatCard label="Working" value={stats.working} color="indigo" />
                </div>
            </div>

            {/* Records List */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 shadow-2xl">
                <div className="grid grid-cols-5 p-5 text-slate-400 font-handwriting text-xl border-b border-white/10 bg-black/40">
                    <div className="pl-4">Date</div>
                    <div>In</div>
                    <div>Out</div>
                    <div className="text-center">Work Hrs</div>
                    <div className="text-right pr-6">Overtime</div>
                </div>

                <div className="divide-y divide-white/5 bg-black/20">
                    {attendanceData === undefined ? (
                        <div className="p-16 text-center text-slate-500 font-handwriting text-lg animate-pulse">
                            Fetching your history...
                        </div>
                    ) : attendanceData === null ? (
                        <div className="p-16 text-center space-y-3">
                            <AlertCircle className="mx-auto text-rose-500" size={32} />
                            <p className="text-slate-400 font-handwriting text-lg">Unable to load history. Please try again.</p>
                        </div>
                    ) : attendanceData.length === 0 ? (
                        <div className="p-16 text-center text-slate-500 font-handwriting text-lg italic">
                            No attendance records found for this period.
                        </div>
                    ) : (
                        attendanceData.map((record: any) => {
                            if (!record) return null;
                            const workHours = (record.hoursWorked || 0);
                            const overtime = Math.max(0, workHours - 9);

                            // Safe date parsing
                            let displayDate = record.date;
                            try {
                                const d = new Date(record.date);
                                if (!isNaN(d.getTime())) {
                                    displayDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                }
                            } catch (e) { }

                            return (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={record._id}
                                    className="grid grid-cols-5 p-5 text-slate-300 font-handwriting text-lg hover:bg-white/5 transition-colors group"
                                >
                                    <div className="pl-4 flex items-center">{displayDate}</div>
                                    <div className="flex items-center text-emerald-300/80 group-hover:text-emerald-300">{record.checkIn || "--:--"}</div>
                                    <div className="flex items-center text-rose-300/80 group-hover:text-rose-300">{record.checkOut || "--:--"}</div>
                                    <div className="text-center font-mono text-lg">{workHours > 0 ? workHours.toFixed(1) : '-'}</div>
                                    <div className="text-right pr-6 text-emerald-400 font-bold">
                                        {overtime > 0 ? `+${overtime.toFixed(1)}h` : '-'}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            <p className="text-center text-slate-600 font-handwriting text-sm italic py-4">
                * Note: Overtime is calculated for hours exceeding the 9-hour workday.
            </p>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
    const colors: any = {
        emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
        rose: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20",
        indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20"
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color] || colors.indigo} border rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 min-w-[100px]`}>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</span>
            <span className="text-2xl font-handwriting font-bold">{value}</span>
        </div>
    );
}
