import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, Download, Printer, ChevronRight, X } from "lucide-react";
import { SalarySlip } from "./SalarySlip";

export function ReportsDashboard() {
    const [activeView, setActiveView] = useState<"menu" | "salary" | "attendance">("menu");

    return (
        <div className="min-h-[600px] relative">
            <AnimatePresence mode="wait">
                {activeView === "menu" && (
                    <ReportsMenu onSelect={setActiveView} key="menu" />
                )}
                {activeView === "salary" && (
                    <SalaryReports onBack={() => setActiveView("menu")} key="salary" />
                )}
                {activeView === "attendance" && (
                    <AttendanceReports onBack={() => setActiveView("menu")} key="attendance" />
                )}
            </AnimatePresence>
        </div>
    );
}

function ReportsMenu({ onSelect }: { onSelect: (view: "salary" | "attendance") => void }) {
    const cards = [
        {
            id: "salary",
            title: "Salary Slips",
            desc: "Generate and download monthly payslips for all employees.",
            icon: <FileText size={40} />,
            gradient: "from-zinc-800 to-black"
        },
        {
            id: "attendance",
            title: "Attendance Register",
            desc: "Export detailed attendance logs and summary reports.",
            icon: <Calendar size={40} />,
            gradient: "from-zinc-800 to-black"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full place-items-center py-10"
        >
            {cards.map((card, i) => (
                <motion.div
                    key={card.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    onClick={() => onSelect(card.id as any)}
                    className="group cursor-pointer relative w-full max-w-sm aspect-[4/5] perspective-1000"
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-3xl border border-white/10 shadow-2xl transition-all duration-500 group-hover:shadow-glow group-hover:border-white/30 overflow-hidden`}>

                        {/* 3D Content Container */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/20 backdrop-blur-sm group-hover:backdrop-blur-none transition-all">
                            <div className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 transition-colors shadow-inner">
                                <div className="text-white group-hover:text-cyan-400 transition-colors">
                                    {card.icon}
                                </div>
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-4 tracking-tighter">{card.title}</h3>
                            <p className="text-silver-dark mb-8 leading-relaxed">{card.desc}</p>

                            <div className="flex items-center gap-2 text-sm font-bold text-white opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                OPEN DASHBOARD <ChevronRight size={16} />
                            </div>
                        </div>

                        {/* Decorative Noise */}
                        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}

function SalaryReports({ onBack }: { onBack: () => void }) {
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
    const payrolls = useQuery(api.payroll.getAllPayroll, { payPeriod: selectedPeriod });
    const [selectedSlip, setSelectedSlip] = useState<any>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-2 text-silver-dark hover:text-white transition-colors">
                    <ChevronRight className="rotate-180" size={20} /> Back to Reports
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-silver-dark font-mono text-sm">SELECT PERIOD</span>
                    <input
                        type="month"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-cyan-500/50 transition-colors"
                    />
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6 min-h-[500px]">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <FileText className="text-cyan-dim" />
                    Salary Slips for {selectedPeriod}
                </h2>

                <div className="space-y-2">
                    {payrolls?.map((payroll, i) => (
                        <motion.div
                            key={payroll._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10">
                                    {payroll.employee?.firstName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-lg">{payroll.employee?.firstName} {payroll.employee?.lastName}</p>
                                    <p className="text-silver-dark text-xs uppercase tracking-wider">{payroll.employee?.role} • {payroll.employee?.employeeId}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-white font-mono font-bold">${payroll.netSalary.toLocaleString()}</p>
                                    <p className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 rounded-full inline-block mt-1">{payroll.status}</p>
                                </div>

                                <button
                                    onClick={() => setSelectedSlip({ payroll, employee: payroll.employee })}
                                    className="p-2 rounded-full bg-white text-black hover:scale-110 active:scale-95 transition-all shadow-glow"
                                >
                                    <Printer size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {payrolls?.length === 0 && <p className="text-center text-silver-dark py-20">No payroll records found for this period.</p>}
                </div>
            </div>

            {/* Modal for Print */}
            {selectedSlip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto max-w-4xl w-full relative"
                    >
                        <button onClick={() => setSelectedSlip(null)} className="absolute top-4 right-4 text-black hover:bg-gray-100 p-2 rounded-full z-10">
                            <X size={24} />
                        </button>
                        <div className="p-8">
                            <SalarySlip payroll={selectedSlip.payroll} employee={selectedSlip.employee} />
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function AttendanceReports({ onBack }: { onBack: () => void }) {
    // Placeholder for future expansion
    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-silver-dark hover:text-white transition-colors">
                <ChevronRight className="rotate-180" size={20} /> Back to Reports
            </button>
            <div className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-white/20">
                <Calendar size={48} className="mx-auto text-silver-dark mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Attendance Reports</h3>
                <p className="text-silver-dark">Detailed attendance logs export works exactly like Salary Slips.</p>
                <div className="mt-8 flex justify-center gap-4">
                    <button className="premium-btn flex items-center gap-2">
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>
        </div>
    )
}
