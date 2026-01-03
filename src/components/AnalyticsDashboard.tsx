import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Activity, Users } from "lucide-react";

export function AnalyticsDashboard() {
    const attendanceStats = useQuery(api.analytics.getAttendanceStats);
    const payrollStats = useQuery(api.analytics.getPayrollStats);

    // Custom Monochrome Palette
    const COLORS = ['#FFFFFF', '#9CA3AF', '#4B5563', '#1F2937'];

    // Loading Skeleton
    if (!attendanceStats || !payrollStats) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
                <div className="h-96 bg-white/5 rounded-2xl border border-white/10"></div>
                <div className="h-96 bg-white/5 rounded-2xl border border-white/10"></div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-obsidian border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
                    <p className="text-white font-bold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span className="capitalize">{entry.name}:</span>
                            <span className="font-mono">{entry.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 pb-10">

            {/* 1. Top Key Metrics Row - 3D Floating Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    label="Total Payroll Processed"
                    value={`$${payrollStats.totalPaid.toLocaleString()}`}
                    icon={<DollarSign size={24} className="text-white" />}
                    trend="+12% vs last month"
                    delay={0}
                />
                <MetricCard
                    label="Avg. Daily Attendance"
                    value={`${Math.round(attendanceStats.reduce((acc, curr) => acc + curr.present, 0) / (attendanceStats.length || 1))} Emps`}
                    icon={<Users size={24} className="text-white" />}
                    trend="Stable"
                    delay={0.1}
                />
                <MetricCard
                    label="Leave Utilization"
                    value="15%"
                    icon={<Activity size={24} className="text-white" />}
                    trend="-2% vs last month"
                    delay={0.2}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 2. Attendance Trends Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Attendance Trends
                                <TrendingUp size={16} className="text-silver-dark" />
                            </h3>
                            <p className="text-silver-dark text-sm">Last 30 Days Activity</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4B5563" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4B5563" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6B7280"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => new Date(value).getDate().toString()}
                                />
                                <YAxis
                                    stroke="#6B7280"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="present" name="Present" fill="url(#colorPresent)" radius={[4, 4, 0, 0]} barSize={20} animationDuration={1500} />
                                <Bar dataKey="absent" name="Absent" fill="url(#colorAbsent)" radius={[4, 4, 0, 0]} barSize={20} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 3. Payroll Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">Payroll Distribution</h3>
                            <p className="text-silver-dark text-sm">Cost Breakdown</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={payrollStats.distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {payrollStats.distribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-silver-dark text-xs uppercase tracking-widest mb-1">Total</p>
                            <p className="text-2xl font-bold text-white">${(payrollStats.totalPaid / 1000).toFixed(1)}k</p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-6 mt-4">
                        {payrollStats.distribution.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-sm text-silver-dark">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}

function MetricCard({ label, value, icon, trend, delay }: { label: string, value: string, icon: any, trend: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card p-6 rounded-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                {icon}
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        {icon}
                    </div>
                    <span className="text-silver-dark text-sm font-medium">{label}</span>
                </div>
                <div className="flex items-end justify-between">
                    <h2 className="text-3xl font-bold text-white tracking-tight">{value}</h2>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                        {trend}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
