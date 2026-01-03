import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  X,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  Ban
} from "lucide-react";

interface TimeOffViewProps {
  employee: any;
}

export function TimeOffView({ employee }: TimeOffViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "paid" as "paid" | "sick" | "unpaid",
    startDate: "",
    endDate: "",
    days: 1,
    reason: "",
    attachment: null as File | null
  });

  // Use Convex queries
  // Admin/HR sees all requests, Employees see only theirs (handled by backend)
  const timeOffRequests = useQuery(api.timeOff.getTimeOffRequests, {
    employeeId: employee.role === "admin" || employee.role === "hr" ? undefined : employee._id
  }) || [];

  const timeOffBalances = useQuery(api.timeOff.getTimeOffBalances) || {
    paid: 24,
    sick: 7,
    unpaid: 0
  };

  const createTimeOffRequest = useMutation(api.timeOff.createTimeOffRequest);
  const approveRequest = useMutation(api.timeOff.approveTimeOffRequest);
  const rejectRequest = useMutation(api.timeOff.rejectTimeOffRequest);
  const generateUploadUrl = useMutation(api.timeOff.generateUploadUrl);

  const isAdminOrHr = employee.role === "admin" || employee.role === "hr";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      let storageId: string | undefined = undefined;

      // Handle File Upload if attachment exists
      if (formData.attachment) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": formData.attachment.type },
          body: formData.attachment,
        });

        if (!result.ok) {
          throw new Error("Upload failed");
        }
        const { storageId: uploadedStorageId } = await result.json();
        storageId = uploadedStorageId;
      }

      await createTimeOffRequest({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: formData.days,
        reason: formData.reason,
        attachment: storageId as any
      });
      toast.success("Time off request submitted successfully!");
      setShowModal(false);
      setFormData({
        leaveType: "paid",
        startDate: "",
        endDate: "",
        days: 1,
        reason: "",
        attachment: null
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    }
  };

  const handleApprove = async (requestId: any) => {
    try {
      await approveRequest({ requestId });
      toast.success("Request approved");
    } catch (error: any) {
      toast.error("Failed to approve: " + error.message);
    }
  };

  const handleReject = async (requestId: any) => {
    try {
      await rejectRequest({ requestId });
      toast.info("Request rejected");
    } catch (error: any) {
      toast.error("Failed to reject: " + error.message);
    }
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Balances (Designed like Screenshot) */}
      <div className="bg-[#0A0A0A] border border-white/20 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 bg-rose-900/40 border border-rose-500/30 text-rose-200 text-sm font-bold tracking-wider rounded">
              Time Off
            </div>
            {!isAdminOrHr && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-1.5 bg-fuchsia-600/80 hover:bg-fuchsia-600 border border-fuchsia-400/50 text-white text-sm font-bold tracking-wider rounded transition-colors"
              >
                NEW
              </button>
            )}
          </div>
        </div>
        {/* Balance Row */}
        <div className="grid grid-cols-2 text-center divide-x divide-white/10">
          <div className="py-4 px-6 bg-blue-900/10 hover:bg-blue-900/20 transition-colors">
            <h3 className="text-blue-400 font-bold text-lg mb-1">Paid time Off</h3>
            <p className="text-slate-400 text-xs font-mono">{timeOffBalances.paid} Days Available</p>
          </div>
          <div className="py-4 px-6 bg-slate-900/10 hover:bg-slate-900/20 transition-colors">
            <h3 className="text-blue-400 font-bold text-lg mb-1">Sick time off</h3>
            <p className="text-slate-400 text-xs font-mono">{timeOffBalances.sick} Days Available</p>
          </div>
        </div>
      </div>

      {/* Time Off Requests Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left text-slate-400 font-normal text-sm py-4 px-6">Name</th>
                <th className="text-left text-slate-400 font-normal text-sm py-4 px-6">Start Date</th>
                <th className="text-left text-slate-400 font-normal text-sm py-4 px-6">End Date</th>
                <th className="text-left text-slate-400 font-normal text-sm py-4 px-6">Time off Type</th>
                <th className="text-left text-slate-400 font-normal text-sm py-4 px-6">Status</th>
                {isAdminOrHr && <th className="text-left text-slate-400 font-normal text-sm py-4 px-6">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {timeOffRequests.map((request: any) => (
                <tr key={request._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-white text-sm font-medium">
                    {request.employeeName || `${employee.firstName} ${employee.lastName}`}
                  </td>
                  <td className="py-4 px-6 text-slate-300 text-sm font-mono">{request.startDate}</td>
                  <td className="py-4 px-6 text-slate-300 text-sm font-mono">{request.endDate}</td>
                  <td className="py-4 px-6 text-blue-400 text-sm font-medium">
                    {request.leaveType === 'paid' ? 'Paid time Off' : request.leaveType === 'sick' ? 'Sick time Off' : 'Unpaid Leave'}
                  </td>
                  <td className="py-4 px-6">
                    {request.status === "pending" ? (
                      <span className="text-slate-500 italic text-sm">Pending Approval</span>
                    ) : (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span>{request.status}</span>
                      </div>
                    )}
                  </td>
                  {isAdminOrHr && (
                    <td className="py-4 px-6">
                      {request.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <Ban size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {timeOffRequests.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-20" />
              <p className="text-slate-500">No time off requests found</p>
            </div>
          )}
        </div>
      </div>

      {/* Time Off Types Info */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Calendar size={120} />
        </div>
        <h3 className="text-xl font-semibold text-yellow-100/80 mb-4 border-b border-white/10 pb-2 inline-block">
          TimeOff Types:
        </h3>
        <ul className="space-y-2 text-slate-300 font-medium">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Paid Time off
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> Sick Leave
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" /> Unpaid Leaves
          </li>
        </ul>
      </div>

      {/* Time Off Request Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] border border-white/20 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl text-white font-medium">Time off Type Request</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-slate-300 text-sm">Employee</label>
                  <p className="text-[#3b82f6] font-medium">[{employee.firstName} {employee.lastName}]</p>
                </div>

                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-slate-300 text-sm">Time off Type</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                    className="bg-transparent text-[#3b82f6] font-medium focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="paid" className="bg-[#0A0A0A] text-slate-300">[Paid time off]</option>
                    <option value="sick" className="bg-[#0A0A0A] text-slate-300">[Sick Leave]</option>
                    <option value="unpaid" className="bg-[#0A0A0A] text-slate-300">[Unpaid Leaves]</option>
                  </select>
                </div>

                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-slate-300 text-sm">Validity Period</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => {
                        const days = calculateDays(e.target.value, formData.endDate);
                        setFormData({ ...formData, startDate: e.target.value, days });
                      }}
                      className="bg-transparent text-[#3b82f6] font-medium focus:outline-none w-32 border-b border-white/10"
                      required
                    />
                    <span className="text-slate-500 text-xs">To</span>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => {
                        const days = calculateDays(formData.startDate, e.target.value);
                        setFormData({ ...formData, endDate: e.target.value, days });
                      }}
                      className="bg-transparent text-[#3b82f6] font-medium focus:outline-none w-32 border-b border-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-slate-300 text-sm">Allocation</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[#3b82f6] font-medium">
                      {formData.days.toFixed(2).padStart(5, '0')}
                    </span>
                    <span className="text-white font-medium">Days</span>
                  </div>
                </div>

                {/* Attachment Section */}
                <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                  <label className="text-slate-300 text-sm pt-2">Attachment:</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer group">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] || null })}
                      />
                      <div className="w-10 h-10 bg-[#3b82f6] rounded-lg flex items-center justify-center group-hover:bg-[#2563eb] transition-colors shadow-lg">
                        <Upload className="text-white" size={20} />
                      </div>
                    </label>
                    <span className="text-slate-500 text-sm">(For sick leave certificate)</span>
                    {formData.attachment && (
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        <Check size={12} /> {formData.attachment.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button
                    type="submit"
                    className="px-8 py-2 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold rounded-lg transition-all text-sm uppercase tracking-wide"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-2 bg-[#262626] hover:bg-[#333333] text-white font-bold rounded-lg transition-all text-sm uppercase tracking-wide"
                  >
                    Discard
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
