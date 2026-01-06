import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, Download, Printer, ChevronRight, X, ArrowRight, Mail } from "lucide-react";
import { SalarySlip } from "./SalarySlip";

export function ReportsDashboard() {
    const [activeView, setActiveView] = useState<"menu" | "salary" | "attendance">("menu");

    return (
        <div className="min-h-[600px] relative pb-20">
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
    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-white tracking-tight mb-4 text-gradient-workflow">Financial Intelligence</h2>
                <p className="text-gray-500 max-w-xl mx-auto">Generate detailed payroll insights and compliance reports with one click.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <ReportCard
                    title="Salary Distribution"
                    desc="Process monthly payroll, generate slips, and track historical disbursements."
                    icon={<FileText size={32} />}
                    onClick={() => onSelect("salary")}
                    color="cyan"
                />
                <ReportCard
                    title="Attendance Registry"
                    desc="Overview of employee presence, leave trends, and punctuality scoring."
                    icon={<Calendar size={32} />}
                    onClick={() => onSelect("attendance")}
                    color="purple"
                />
            </div>
        </div>
    );
}

function ReportCard({ title, desc, icon, onClick, color }: { title: string, desc: string, icon: any, onClick: () => void, color: 'cyan' | 'purple' }) {
    const colors = {
        cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 group-hover:border-cyan-500/40 text-cyan-400',
        purple: 'from-purple-500/10 to-transparent border-purple-500/20 group-hover:border-purple-500/40 text-purple-400'
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={`group cursor-pointer p-10 rounded-[40px] border bg-gradient-to-br transition-all duration-500 ${colors[color]}`}
        >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm mb-8">{desc}</p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
                Launch Explorer <ArrowRight size={14} />
            </div>
        </motion.div>
    )
}

function SalaryReports({ onBack }: { onBack: () => void }) {
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
    const [searchTerm, setSearchTerm] = useState("");
    const payrolls = useQuery(api.payroll.getAllPayroll, { payPeriod: selectedPeriod });
    const [selectedSlip, setSelectedSlip] = useState<any>(null);

    const filteredPayrolls = payrolls?.filter(p =>
        p.employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employee?.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <button onClick={onBack} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    <ChevronRight className="rotate-180" size={18} /> BACK
                </button>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                        />
                    </div>
                    <input
                        type="month"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="bg-[#0A0A0A] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="bg-[#0A0A0A] rounded-[32px] p-8 border border-white/5">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        Payroll Ledger <span className="text-gray-600 text-sm font-normal">({selectedPeriod})</span>
                    </h2>
                    <div className="flex gap-2">
                        <button className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white"><Printer size={18} /></button>
                        <button className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white"><Download size={18} /></button>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredPayrolls?.map((payroll) => (
                        <div key={payroll._id} className="flex flex-wrap justify-between items-center p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 font-black border border-white/5">
                                    {payroll.employee?.firstName[0]}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{payroll.employee?.firstName} {payroll.employee?.lastName}</p>
                                    <p className="text-gray-500 text-xs font-mono">{payroll.employee?.employeeId}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 py-2 md:py-0">
                                <div className="text-right">
                                    <p className="text-white font-black text-lg">₹{payroll.netSalary.toLocaleString('en-IN')}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${payroll.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {payroll.status}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setSelectedSlip({ payroll, employee: payroll.employee })}
                                    className="p-3 bg-white text-black rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                                >
                                    <Printer size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredPayrolls?.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText size={32} className="text-gray-700" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No records found</h3>
                            <p className="text-gray-500">Try adjusting your search or selecting a different period.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Print */}
            <AnimatePresence>
                {selectedSlip && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSlip(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[40px] overflow-hidden max-h-[90vh] overflow-y-auto max-w-4xl w-full relative z-[110] shadow-2xl"
                        >
                            <button onClick={() => setSelectedSlip(null)} className="absolute top-6 right-6 bg-black/5 hover:bg-black/10 p-3 rounded-2xl text-black transition-colors z-[120]">
                                <X size={24} />
                            </button>
                            <div className="p-12">
                                <SalarySlip payroll={selectedSlip.payroll} employee={selectedSlip.employee} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AttendanceReports({ onBack }: { onBack: () => void }) {
    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-400 hover:text-white transition-all">
                <ChevronRight className="rotate-180" size={18} /> BACK
            </button>
            <div className="bg-[#0A0A0A] rounded-[40px] p-20 text-center border-dashed border-2 border-white/5 overflow-hidden relative">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full"></div>
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                        <Calendar size={40} className="text-purple-400" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">Registry Module Unlocked</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
                        Attendance summaries, heatmaps, and audit logs are being processed. This module will integrate with the biometric server shortly.
                    </p>
                    <button className="bg-white text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-2xl">
                        Schedule Integration
                    </button>
                </div>
            </div>
        </div>
    )
}
