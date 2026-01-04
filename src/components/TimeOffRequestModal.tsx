import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface TimeOffRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: any;
}

export function TimeOffRequestModal({ isOpen, onClose, employee }: TimeOffRequestModalProps) {
  const [formData, setFormData] = useState({
    employeeId: employee?._id || "",
    leaveType: "paid" as "paid" | "sick" | "unpaid" | "personal",
    startDate: "",
    endDate: "",
    reason: "",
    attachment: null as File | null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const applyLeave = useMutation(api.leaves.applyLeave);

  const employees = useQuery(api.employees.getAllEmployees);

  // Calculate days between dates
  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await applyLeave({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });
      
      toast.success("Leave request submitted successfully!");
      void onClose();
      // Reset form
      setFormData({
        employeeId: employee?._id || "",
        leaveType: "paid",
        startDate: "",
        endDate: "",
        reason: "",
        attachment: null
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit leave request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, attachment: file }));
    }
  };

  const leaveTypes = [
    { value: "paid", label: "Paid Time off" },
    { value: "sick", label: "Sick Leave" },
    { value: "unpaid", label: "Unpaid Leaves" },
    { value: "personal", label: "Personal Leave" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Time off Type Request</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Employee
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
              className="w-full bg-[#050505] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              required
            >
              <option value="">Select Employee</option>
              {employees?.map((emp: any) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Time off Type
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value as any }))}
              className="w-full bg-[#050505] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              {leaveTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Validity Period */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Validity Period
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">From</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-[#050505] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">To</label>
                <input
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-[#050505] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Allocation */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Allocation
            </label>
            <div className="bg-[#050505] border border-white/20 rounded-lg px-4 py-3">
              <span className="text-white font-medium">
                {calculateDays().toFixed(2)} Days
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reason
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full bg-[#050505] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
              rows={4}
              placeholder="Please provide reason for leave request..."
              required
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Attachment
            </label>
            <div className="bg-[#050505] border border-white/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Upload size={20} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="attachment"
                  />
                  <label
                    htmlFor="attachment"
                    className="cursor-pointer text-slate-300 hover:text-white transition-colors"
                  >
                    {formData.attachment ? formData.attachment.name : "Choose file or drag and drop"}
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    (For sick leave certificate)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Time Off Types Info */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-medium text-white mb-3">TimeOff Types:</h3>
            <div className="space-y-2">
              {leaveTypes.map(type => (
                <div key={type.value} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span className="text-sm text-slate-300">{type.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-[#E5E5E5] transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#050505] border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Discard
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
