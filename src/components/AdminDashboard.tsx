import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { EmployeeManagement } from "./EmployeeManagement";
import { AttendanceManagement } from "./AttendanceManagement";
import { LeaveManagement } from "./LeaveManagement";
import { PayrollManagement } from "./PayrollManagement";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { ReportsDashboard } from "./ReportsDashboard";
import { NotificationBell } from "./NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, Palmtree, CreditCard, LayoutDashboard, Building, CheckCircle, Timer, BarChart3, FileText } from "lucide-react";

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
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    { id: "employees", label: "Employees", icon: <Users size={18} /> },
    { id: "attendance", label: "Attendance", icon: <Clock size={18} /> },
    { id: "leaves", label: "Leaves", icon: <Palmtree size={18} /> },
    { id: "payroll", label: "Payroll", icon: <CreditCard size={18} /> },
    { id: "reports", label: "Reports", icon: <FileText size={18} /> },
  ];

  const pendingLeaves = leaveRequests?.filter(req => req.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-300">
            {employee.firstName} {employee.lastName} • {employee.role.toUpperCase()}
          </p>
        </div>
        <NotificationBell notifications={notifications || []} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Employees"
          value={employees?.length || 0}
          icon={<Users size={24} />}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          label="Pending Leaves"
          value={pendingLeaves}
          icon={<Timer size={24} />}
          color="from-orange-500 to-rose-600"
        />
        <StatCard
          label="Active Today"
          value={employees?.filter(e => e.status === "active").length || 0}
          icon={<CheckCircle size={24} />}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Departments"
          value={new Set(employees?.map(e => e.department)).size || 0}
          icon={<Building size={24} />}
          color="from-purple-500 to-fuchsia-600"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10 shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 group ${activeTab === tab.id
              ? "text-white"
              : "text-slate-400 hover:text-slate-200"
              }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabAdmin"
                className="absolute inset-0 bg-premium-gradient rounded-xl shadow-lg shadow-indigo-500/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10 font-semibold text-sm">{tab.label}</span>
            {tab.id === "leaves" && pendingLeaves > 0 && (
              <span className="relative z-10 bg-rose-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {pendingLeaves}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[60vh] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {leaveRequests?.slice(0, 5).map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {request.employee?.firstName} {request.employee?.lastName}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {request.leaveType} leave • {request.startDate} to {request.endDate}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${request.status === "pending" ? "bg-amber-500/20 text-amber-300" :
                          request.status === "approved" ? "bg-emerald-500/20 text-emerald-300" :
                            "bg-rose-500/20 text-rose-300"
                          }`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Department Overview</h3>
                  <div className="space-y-3">
                    {Array.from(new Set(employees?.map(e => e.department) || [])).map((dept: string) => {
                      const deptEmployees = employees?.filter(e => e.department === dept) || [];
                      return (
                        <div key={dept} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <span className="text-white font-medium">{dept}</span>
                          <span className="text-slate-400 text-sm font-semibold">{deptEmployees.length} employees</span>
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
            {activeTab === "leaves" && <LeaveManagement requests={leaveRequests || []} />}
            {activeTab === "payroll" && <PayrollManagement />}
            {activeTab === "reports" && <ReportsDashboard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-gradient-to-br ${color} bg-opacity-10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl overflow-hidden relative group`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-white/70 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
