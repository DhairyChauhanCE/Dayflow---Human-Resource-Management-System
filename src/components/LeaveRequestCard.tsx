import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface LeaveRequestCardProps {
  requests: any[];
  detailed?: boolean;
}

export function LeaveRequestCard({ requests, detailed = false }: LeaveRequestCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "paid" as const,
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);

  const applyLeave = useMutation(api.leaves.applyLeave);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await applyLeave(formData);
      toast.success("Leave request submitted successfully!");
      setShowForm(false);
      setFormData({ leaveType: "paid", startDate: "", endDate: "", reason: "" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (detailed) {
    return (
      <div className="space-y-6">
        {/* Apply Leave Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Leave Requests</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              {showForm ? "Cancel" : "Apply Leave"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Leave Type
                  </label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="paid">Paid Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                    <option value="personal">Personal Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Reason
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                    placeholder="Reason for leave..."
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Leave Request"}
              </button>
            </form>
          )}

          {/* Leave Requests List */}
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-semibold capitalize">
                      {request.leaveType} Leave
                    </h4>
                    <p className="text-slate-300 text-sm">
                      {request.startDate} to {request.endDate} ({request.days} days)
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                    request.status === "approved" ? "bg-green-500/20 text-green-300" :
                    "bg-red-500/20 text-red-300"
                  }`}>
                    {request.status}
                  </span>
                </div>
                
                <p className="text-slate-300 text-sm mb-3">{request.reason}</p>
                
                {request.approvalComments && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-300 text-sm font-medium">Admin Comments:</p>
                    <p className="text-slate-300 text-sm">{request.approvalComments}</p>
                  </div>
                )}
              </div>
            ))}

            {requests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">No leave requests found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Leave Requests</h3>
        <span className="text-2xl">🏖️</span>
      </div>
      
      <div className="space-y-3">
        {requests.slice(0, 3).map((request) => (
          <div key={request._id} className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium capitalize">
                {request.leaveType} Leave
              </p>
              <p className="text-blue-300 text-xs">
                {request.startDate} - {request.endDate}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              request.status === "pending" ? "bg-yellow-500/30 text-yellow-300" :
              request.status === "approved" ? "bg-green-500/30 text-green-300" :
              "bg-red-500/30 text-red-300"
            }`}>
              {request.status}
            </span>
          </div>
        ))}
        
        {requests.length === 0 && (
          <p className="text-blue-300 text-sm">No recent leave requests</p>
        )}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
      >
        Apply for Leave
      </button>
    </div>
  );
}
