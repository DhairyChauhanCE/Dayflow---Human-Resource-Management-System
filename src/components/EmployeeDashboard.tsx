import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AttendanceCard } from "./AttendanceCard";
import { LeaveRequestCard } from "./LeaveRequestCard";
import { PayrollCard } from "./PayrollCard";
import { ProfileView } from "./ProfileView";
import { AttendanceHistory } from "./AttendanceHistory";
import { NotificationBell } from "./NotificationBell";
import { EmployeeTimeOffRequest } from "./EmployeeTimeOffRequest";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Clock, Palmtree, CreditCard, User, LogOut, Bell, AlertCircle } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

interface EmployeeDashboardProps {
  employee: any;
}

export function EmployeeDashboard({ employee }: EmployeeDashboardProps) {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState("overview");
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const todayAttendance = useQuery(api.attendance.getTodayAttendance);
  const leaveRequests = useQuery(api.leaves.getMyLeaveRequests);
  const payrollRecords = useQuery(api.payroll.getMyPayroll);
  const notifications = useQuery(api.notifications.getMyNotifications, { unreadOnly: true });

  const tabs = [
    { id: "overview", label: "Overview", icon: <Home size={18} /> },
    { id: "attendance", label: "Attendance", icon: <Clock size={18} /> },
    { id: "leaves", label: "Leaves", icon: <Palmtree size={18} /> },
    { id: "payroll", label: "Payroll", icon: <CreditCard size={18} /> },
    { id: "profile", label: "Profile", icon: <User size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {employee.firstName}!
          </h1>
          <p className="text-slate-300">
            {employee.position} • {employee.department}
          </p>
        </div>
        <NotificationBell notifications={notifications || []} />
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
                layoutId="activeTab"
                className="absolute inset-0 bg-premium-gradient rounded-xl shadow-lg shadow-indigo-500/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10 font-semibold text-sm">{tab.label}</span>
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AttendanceCard attendance={todayAttendance} />
                  <LeaveRequestCard requests={leaveRequests?.slice(0, 3) || []} />
                  <PayrollCard records={payrollRecords?.slice(0, 1) || []} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity / Alerts */}
                  <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Bell size={20} className="text-indigo-400" />
                        Recent Activity & Alerts
                      </h3>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Updates</span>
                    </div>
                    <div className="space-y-4">
                      {notifications?.length ? (
                        notifications.slice(0, 4).map((notif) => (
                          <div key={notif._id} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                              <AlertCircle size={18} />
                            </div>
                            <div>
                              <p className="text-white text-sm font-semibold">{notif.title}</p>
                              <p className="text-slate-400 text-xs mt-1">{notif.message}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-slate-500 text-sm italic">No recent alerts or activity.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions / Logout */}
                  <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-white/5 to-white/[0.02]">
                    <h3 className="text-lg font-bold text-white mb-6">Quick Access</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <User size={20} className="text-indigo-400" />
                          <span className="text-white font-medium text-sm">View Profile</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:bg-indigo-500 group-hover:text-white transition-all text-xs">→</div>
                      </button>
                      <button
                        onClick={() => {
                          void signOut();
                        }}
                        className="w-full flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-bold text-sm"
                      >
                        <LogOut size={20} />
                        Logout Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && <AttendanceHistory />}

            {activeTab === "leaves" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Leave Requests</h2>
                  <button
                    onClick={() => setIsTimeOffModalOpen(true)}
                    className="premium-btn flex items-center gap-2"
                  >
                    NEW REQUEST
                  </button>
                </div>
                <LeaveRequestCard requests={leaveRequests || []} detailed />
              </div>
            )}

            {activeTab === "payroll" && (
              <PayrollCard records={payrollRecords || []} detailed />
            )}

            {activeTab === "profile" && (
              <ProfileView employee={employee} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Employee Time Off Request Modal */}
      <EmployeeTimeOffRequest 
        isOpen={isTimeOffModalOpen} 
        onClose={() => setIsTimeOffModalOpen(false)} 
        employee={employee}
      />
    </div>
  );
}
