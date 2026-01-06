import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AttendanceCard } from "./AttendanceCard";
import { LeaveRequestCard } from "./LeaveRequestCard";
import { PayrollCard } from "./PayrollCard";
import { ProfileCard } from "./ProfileCard";
import { NotificationBell } from "./NotificationBell";
import { TimeOffView } from "./TimeOffView";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Clock, Palmtree, CreditCard, User, LogOut, Bell, AlertCircle, Calendar, Sparkles, ChevronRight } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

interface EmployeeDashboardProps {
  employee: any;
}

export function EmployeeDashboard({ employee }: EmployeeDashboardProps) {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState("overview");

  const todayAttendance = useQuery(api.attendance.getTodayAttendance);
  const leaveRequests = useQuery(api.leaves.getMyLeaveRequests);
  const payrollRecords = useQuery(api.payroll.getMyPayroll);
  const notifications = useQuery(api.notifications.getMyNotifications, { unreadOnly: true });

  const tabs = [
    { id: "overview", label: "Overview", icon: <Home size={18} /> },
    { id: "attendance", label: "Attendance", icon: <Clock size={18} /> },
    { id: "timeoff", label: "Time Off", icon: <Palmtree size={18} /> },
    { id: "payroll", label: "Payroll", icon: <CreditCard size={18} /> },
    { id: "profile", label: "Profile", icon: <User size={18} /> },
  ];

  const pendingLeaves = leaveRequests?.filter(req => req.status === "pending").length || 0;

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">
            <Sparkles size={12} /> Personal Workspace
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            Welcome, {employee.firstName}.
          </h1>
          <p className="text-gray-500 font-medium">
            Review your <span className="text-white">attendance & performance</span> for this period.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[24px] border border-white/5">
          <NotificationBell notifications={notifications || []} />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/10 flex items-center justify-center text-white font-black">
            {employee.firstName[0]}
          </div>
        </div>
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
                layoutId="activeTabEmp"
                className="absolute inset-0 bg-white rounded-[24px]"
                transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10 font-black text-[10px] uppercase tracking-widest">{tab.label}</span>
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
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AttendanceCard attendance={todayAttendance} />
                  <LeaveRequestCard requests={leaveRequests?.slice(0, 3) || []} />
                  <PayrollCard records={payrollRecords?.slice(0, 1) || []} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Activity / Alerts */}
                  <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <Bell size={24} className="text-indigo-400" /> Notifications
                      </h3>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Live Updates</span>
                    </div>
                    <div className="space-y-4 relative z-10">
                      {notifications?.length ? (
                        notifications.slice(0, 4).map((notif) => (
                          <div key={notif._id} className="flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                            <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-400 border border-indigo-500/20">
                              <AlertCircle size={20} />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{notif.title}</p>
                              <p className="text-gray-500 text-xs mt-1 leading-relaxed">{notif.message}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20 opacity-30">
                          <Bell size={48} className="mx-auto mb-4" />
                          <p className="font-black text-[10px] uppercase tracking-widest">Inbox Clear</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions / Logout */}
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full group-hover:bg-rose-500/10 transition-colors duration-700"></div>
                    <h3 className="text-2xl font-black text-white mb-8">Direct Access</h3>
                    <div className="space-y-4 relative z-10">
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="w-full flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                            <User size={20} />
                          </div>
                          <span className="text-white font-bold text-sm tracking-tight text-left">View Identity Card</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                      </button>
                      <button
                        onClick={() => {
                          void signOut();
                        }}
                        className="w-full flex items-center gap-4 p-5 bg-rose-500/10 border border-rose-500/20 rounded-[28px] text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
                      >
                        <LogOut size={20} />
                        Logout Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <AttendanceCard attendance={todayAttendance} detailed />
            )}

            {activeTab === "timeoff" && (
              <TimeOffView employee={employee} />
            )}

            {activeTab === "payroll" && (
              <PayrollCard records={payrollRecords || []} detailed />
            )}

            {activeTab === "profile" && (
              <ProfileCard employee={employee} currentUserId={employee.userId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
