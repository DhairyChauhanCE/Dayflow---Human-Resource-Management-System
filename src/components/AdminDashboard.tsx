import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { EmployeeManagement } from "./EmployeeManagement";
import { AttendanceManagement } from "./AttendanceManagement";
import { TimeOffManagement } from "./TimeOffManagement";
import { SalaryInformation } from "./SalaryInformation";
import { PayrollManagement } from "./PayrollManagement";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { ReportsDashboard } from "./ReportsDashboard";
import { NotificationBell } from "./NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Users, Clock, Palmtree, CreditCard, LayoutDashboard, Building, CheckCircle, Timer, BarChart3, FileText, ChevronRight } from "lucide-react";

interface AdminDashboardProps {
  employee: any;
}

export function AdminDashboard({ employee }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const employees = useQuery(api.employees.getAllEmployees);
  const leaveRequests = useQuery(api.leaves.getAllLeaveRequests);
  const notifications = useQuery(api.notifications.getMyNotifications, { unreadOnly: true });

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "analytics", label: "Intelligence", icon: <BarChart3 size={18} /> },
    { id: "employees", label: "Workforce", icon: <Users size={18} /> },
    { id: "attendance", label: "Presence", icon: <Clock size={18} /> },
    { id: "leaves", label: "Time Off", icon: <Palmtree size={18} /> },
    { id: "salary", label: "Salary", icon: <CreditCard size={18} /> },
    { id: "payroll", label: "Financials", icon: <CreditCard size={18} /> },
    { id: "reports", label: "Audit Logs", icon: <FileText size={18} /> },
  ];

  const pendingLeaves = leaveRequests?.filter(req => req.status === "pending").length || 0;

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">
            <Sparkles size={12} /> Management Portal
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            Welcome back, {employee.firstName}.
          </h1>
          <p className="text-gray-500 font-medium">
            You have <span className="text-white">{pendingLeaves} pending tasks</span> that require your attention today.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[24px] border border-white/5">
          <NotificationBell notifications={notifications || []} />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/10 flex items-center justify-center text-white font-black">
            {employee.firstName[0]}
          </div>
        </div>
      </div>

      {/* High-Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Headcount"
          value={employees?.length || 0}
          trend="+4.2%"
          icon={<Users size={24} />}
          color="indigo"
        />
        <StatCard
          label="Urgent Requests"
          value={pendingLeaves}
          trend="Required"
          icon={<Timer size={24} />}
          color="rose"
        />
        <StatCard
          label="Peak Presence"
          value={`${Math.floor((employees?.filter(e => e.status === "active").length || 0) / (employees?.length || 1) * 100)}%`}
          trend="Live"
          icon={<CheckCircle size={24} />}
          color="emerald"
        />
        <StatCard
          label="Operational Units"
          value={new Set(employees?.map(e => e.department)).size || 0}
          trend="Stable"
          icon={<Building size={24} />}
          color="amber"
        />
      </div>

      {/* Navigation Sub-Bar */}
      <div className="flex space-x-1 bg-[#0A0A0A] p-2 rounded-[32px] border border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center space-x-2 px-6 py-4 rounded-[24px] transition-all duration-500 group whitespace-nowrap ${activeTab === tab.id
              ? "text-black"
              : "text-gray-500 hover:text-white"
              }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabAdmin"
                className="absolute inset-0 bg-white rounded-[24px]"
                transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10 font-black text-[10px] uppercase tracking-widest">{tab.label}</span>
            {tab.id === "leaves" && pendingLeaves > 0 && (
              <span className={`relative z-10 text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-black ${activeTab === tab.id ? 'bg-black text-white' : 'bg-rose-500 text-white'}`}>
                {pendingLeaves}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="min-h-[60vh] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
                  <h3 className="text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
                    <Clock className="text-indigo-400" size={24} /> Recent Velocity
                  </h3>
                  <div className="space-y-4 relative z-10">
                    {leaveRequests?.slice(0, 5).map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                            {request.employee?.firstName[0]}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">
                              {request.employee?.firstName} {request.employee?.lastName}
                            </p>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                              {request.leaveType} REQUEST
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${request.status === "pending" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            request.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                              "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(!leaveRequests || leaveRequests.length === 0) && (
                      <div className="py-20 text-center opacity-30">
                        <Users size={48} className="mx-auto mb-4" />
                        <p className="font-black text-[10px] uppercase tracking-widest">No Recent Activity</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-700"></div>
                  <h3 className="text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
                    <Building className="text-emerald-400" size={24} /> Structural Registry
                  </h3>
                  <div className="space-y-4 relative z-10">
                    {Array.from(new Set(employees?.map(e => e.department) || [])).map((dept: string) => {
                      const deptEmployees = employees?.filter(e => e.department === dept) || [];
                      return (
                        <div key={dept} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                              D
                            </div>
                            <span className="text-white font-bold text-sm tracking-tight">{dept}</span>
                          </div>
                          <span className="bg-white/5 text-gray-400 text-[10px] font-black px-3 py-1 rounded-full border border-white/5 tracking-tighter">
                            {deptEmployees.length} MEMBERS
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "employees" && <EmployeeManagement employees={employees || []} />}
            {activeTab === "analytics" && <AnalyticsDashboard />}
            {activeTab === "attendance" && <AttendanceManagement isAdmin={true} />}
            {activeTab === "leaves" && <TimeOffManagement />}
            {activeTab === "salary" && <SalaryInformation />}
            {activeTab === "payroll" && <PayrollManagement />}
            {activeTab === "reports" && <ReportsDashboard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon, color }: { label: string, value: string | number, trend: string, icon: React.ReactNode, color: 'indigo' | 'rose' | 'emerald' | 'amber' }) {
  const colors = {
    indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400'
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-gradient-to-br ${colors[color]} rounded-[32px] p-8 border shadow-xl overflow-hidden relative group transition-all duration-500`}
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
        <h4 className="text-4xl font-black text-white mb-3 tracking-tighter">{value}</h4>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-400">
          <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
          {trend}
        </div>
      </div>
    </motion.div>
  );
}
