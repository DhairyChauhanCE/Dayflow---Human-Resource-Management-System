import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface LeaveManagementProps {
  requests: any[];
}

export function LeaveManagement({ requests }: LeaveManagementProps) {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState<string | null>(null);

  const approveLeave = useMutation(api.leaves.approveLeave);

  const handleApproveReject = async (leaveId: string, status: "approved" | "rejected", comments?: string) => {
    setLoading(leaveId);
    try {
      await approveLeave({
        leaveId: leaveId as any,
        status,
        comments
      });
      toast.success(`Leave request ${status} successfully!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === "all") return true;
    return request.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
          <p className="text-blue-300 text-sm font-medium">Total Requests</p>
          <p className="text-white text-2xl font-bold">{requests.length}</p>
        </div>

        <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
          <p className="text-yellow-300 text-sm font-medium">Pending</p>
          <p className="text-white text-2xl font-bold">{pendingCount}</p>
        </div>

        <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
          <p className="text-green-300 text-sm font-medium">Approved</p>
          <p className="text-white text-2xl font-bold">{approvedCount}</p>
        </div>

        <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
          <p className="text-red-300 text-sm font-medium">Rejected</p>
          <p className="text-white text-2xl font-bold">{rejectedCount}</p>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Leave Requests</h3>
          
          <div className="flex space-x-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === status
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "pending" && pendingCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request._id} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-white font-semibold text-lg">
                      {request.employee?.firstName} {request.employee?.lastName}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                      request.status === "approved" ? "bg-green-500/20 text-green-300" :
                      "bg-red-500/20 text-red-300"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Leave Type</p>
                      <p className="text-white font-medium capitalize">{request.leaveType}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Duration</p>
                      <p className="text-white font-medium">
                        {request.startDate} to {request.endDate} ({request.days} days)
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Applied On</p>
                      <p className="text-white font-medium">
                        {new Date(request.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-slate-400 text-sm mb-1">Reason</p>
                    <p className="text-slate-300">{request.reason}</p>
                  </div>

                  {request.approvalComments && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                      <p className="text-blue-300 text-sm font-medium">Admin Comments:</p>
                      <p className="text-slate-300 text-sm">{request.approvalComments}</p>
                    </div>
                  )}
                </div>
              </div>

              {request.status === "pending" && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApproveReject(request._id, "approved")}
                    disabled={loading === request._id}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {loading === request._id ? "Processing..." : "Approve"}
                  </button>
                  
                  <button
                    onClick={() => {
                      const comments = prompt("Enter rejection reason (optional):");
                      handleApproveReject(request._id, "rejected", comments || undefined);
                    }}
                    disabled={loading === request._id}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {loading === request._id ? "Processing..." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">
                No {filter === "all" ? "" : filter} leave requests found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
