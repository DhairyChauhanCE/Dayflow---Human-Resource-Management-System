import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plus, Calendar, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LeaveAllocation } from "./LeaveAllocation";
import { TimeOffRequestModal } from "./TimeOffRequestModal";

export function TimeOffManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("timeoff");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const leaveRequests = useQuery(api.leaves.getAllLeaveRequests);
  const approveLeave = useMutation(api.leaves.approveLeaveRequest);
  const rejectLeave = useMutation(api.leaves.rejectLeaveRequest);

  // Filter leave requests based on search
  const filteredRequests = useMemo(() => {
    if (!leaveRequests) return [];
    return leaveRequests.filter((request: any) => {
      if (!request.employee) return false;
      const fullName = `${request.employee.firstName || ''} ${request.employee.lastName || ''}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [leaveRequests, searchTerm]);

  // Calculate leave balances (mock data for now)
  const leaveBalances = useMemo(() => {
    return {
      paid: 24,
      sick: 7
    };
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      await approveLeave({ requestId });
      toast.success("Leave request approved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve leave request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectLeave({ requestId });
      toast.success("Leave request rejected successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject leave request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "rejected":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Time Off Management</h1>
          <p className="text-slate-400">Manage employee leave requests and allocations</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="premium-btn flex items-center gap-2">
          <Plus size={18} />
          NEW
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex space-x-1 bg-white/5 backdrop-blur-xl rounded-xl p-1 border border-white/10">
        <button
          onClick={() => setActiveTab("timeoff")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
            activeTab === "timeoff"
              ? "bg-white text-black font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Calendar size={16} />
          Time Off
        </button>
        <button
          onClick={() => setActiveTab("allocation")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
            activeTab === "allocation"
              ? "bg-white text-black font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <User size={16} />
          Allocation
        </button>
      </div>

      {activeTab === "timeoff" && (
        <>
          {/* Leave Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Paid time Off</h3>
                  <p className="text-3xl font-bold text-emerald-400">{leaveBalances.paid} Days</p>
                  <p className="text-slate-400 text-sm">Available</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Calendar size={24} className="text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Sick time off</h3>
                  <p className="text-3xl font-bold text-blue-400">{leaveBalances.sick} Days</p>
                  <p className="text-slate-400 text-sm">Available</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle size={24} className="text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Table */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#050505] border border-white/20 rounded-lg pl-10 pr-4 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Leave Requests Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
              <div className="grid grid-cols-5 p-4 text-slate-400 font-medium border-b border-white/10 bg-black/20">
                <div className="pl-4">Name</div>
                <div>Start Date</div>
                <div>End Date</div>
                <div>Time off Type</div>
                <div className="text-right pr-4">Status</div>
              </div>

              <div className="divide-y divide-white/5">
                {filteredRequests === undefined ? (
                  <div className="p-12 text-center text-slate-500 animate-pulse">
                    Loading leave requests...
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    No leave requests found.
                  </div>
                ) : (
                  filteredRequests.map((request: any) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-5 p-4 text-slate-300 hover:bg-white/5 transition-colors items-center"
                    >
                      <div className="pl-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                          <User size={16} className="text-white/30" />
                        </div>
                        <div>
                          <span className="font-medium">
                            {request.employee?.firstName} {request.employee?.lastName}
                          </span>
                        </div>
                      </div>
                      <div>{request.startDate}</div>
                      <div>{request.endDate}</div>
                      <div>
                        <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                          {request.leaveType}
                        </span>
                      </div>
                      <div className="text-right pr-4">
                        {request.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => void handleReject(request._id)}
                              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                            <button
                              onClick={() => void handleApprove(request._id)}
                              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "allocation" && <LeaveAllocation />}

      {/* Time Off Request Modal */}
      <TimeOffRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
