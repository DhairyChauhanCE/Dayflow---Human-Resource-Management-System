import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X } from "lucide-react";
import { ProfileCard } from "./ProfileCard";

interface EmployeeManagementProps {
  employees: any[];
}

export function EmployeeManagement({ employees }: EmployeeManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    position: "",
    hireDate: "",
    role: "employee" as const
  });
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const createEmployee = useMutation(api.employees.createEmployee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createEmployee(formData);
      toast.success("Employee created successfully!");
      setShowForm(false);
      setFormData({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        department: "",
        position: "",
        hireDate: "",
        role: "employee"
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Dynamic Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Staff" value={employees.length.toString()} trend="+2 this month" color="indigo" />
        <StatCard title="Active Now" value={Math.floor(employees.length * 0.8).toString()} trend="Live" color="emerald" />
        <StatCard title="On Leave" value="4" trend="Today" color="amber" />
      </div>

      <div className="bg-[#050505]/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/5 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Personnel Directory</h3>
            <p className="text-gray-500 text-sm">Manage and monitor your global workforce</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-xl active:scale-95"
          >
            <X size={18} className="rotate-45 group-hover:rotate-90 transition-transform duration-300" />
            Add Employee
          </button>
        </div>

        {/* Improved Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                <th className="text-left px-4 py-2">Member</th>
                <th className="text-left px-4 py-2">ID & Dept</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-right px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id} className="group transition-all duration-300">
                  <td className="bg-white/[0.02] group-hover:bg-white/[0.05] border-y border-l border-white/5 rounded-l-2xl px-4 py-4 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 font-black border border-white/5 group-hover:scale-110 transition-transform">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <div>
                        <p className="text-white font-bold">{employee.firstName} {employee.lastName}</p>
                        <p className="text-gray-500 text-xs">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="bg-white/[0.02] group-hover:bg-white/[0.05] border-y border-white/5 px-4 py-4 transition-all">
                    <p className="text-white text-xs font-mono font-bold tracking-tighter opacity-70 mb-1">{employee.employeeId}</p>
                    <p className="text-gray-400 text-xs">{employee.department}</p>
                  </td>
                  <td className="bg-white/[0.02] group-hover:bg-white/[0.05] border-y border-white/5 px-4 py-4 transition-all">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${employee.role === "admin" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                      employee.role === "hr" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      }`}>
                      {employee.role}
                    </span>
                  </td>
                  <td className="bg-white/[0.02] group-hover:bg-white/[0.05] border-y border-white/5 px-4 py-4 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-gray-400 text-xs font-medium">Active</span>
                    </div>
                  </td>
                  <td className="bg-white/[0.02] group-hover:bg-white/[0.05] border-y border-r border-white/5 rounded-r-2xl px-4 py-4 text-right transition-all">
                    <button
                      onClick={() => setSelectedEmployee(employee)}
                      className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            ></motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#080808] border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white tracking-tight">New Employee Onboarding</h3>
                <button onClick={() => setShowForm(false)} className="p-2 text-gray-500 hover:text-white rounded-xl bg-white/5">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label="Employee ID" value={formData.employeeId} onChange={(v) => setFormData({ ...formData, employeeId: v })} placeholder="EMP-001" required />
                  <FormInput label="First Name" value={formData.firstName} onChange={(v) => setFormData({ ...formData, firstName: v })} placeholder="John" required />
                  <FormInput label="Last Name" value={formData.lastName} onChange={(v) => setFormData({ ...formData, lastName: v })} placeholder="Doe" required />
                  <FormInput label="Email" type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} placeholder="john@company.com" required />
                  <FormInput label="Department" value={formData.department} onChange={(v) => setFormData({ ...formData, department: v })} placeholder="Engineering" required />
                  <FormInput label="Position" value={formData.position} onChange={(v) => setFormData({ ...formData, position: v })} placeholder="Senior Lead" required />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Company Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white appearance-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <FormInput label="Hire Date" type="date" value={formData.hireDate} onChange={(v) => setFormData({ ...formData, hireDate: v })} required />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-5 rounded-[24px] font-black text-lg hover:shadow-[0_0_30px_rgb(99,102,241,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Registering..." : "Complete Registration"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Employee Profile View */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedEmployee(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          ></motion.div>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-6 right-6 z-[110] bg-white text-black p-3 rounded-2xl shadow-2xl hover:bg-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
            <ProfileCard employee={selectedEmployee} isAdminView={true} />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, trend, color }: { title: string, value: string, trend: string, color: 'indigo' | 'emerald' | 'amber' }) {
  const colors = {
    indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400'
  };

  return (
    <div className={`p-6 rounded-[28px] border bg-gradient-to-br ${colors[color]} relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
        <div className={`w-12 h-12 rounded-full border-2 border-current`}></div>
      </div>
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-3xl font-black text-white mb-2">{value}</h4>
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400">
        <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
        {trend}
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string,
  value: string,
  onChange: (v: string) => void,
  placeholder?: string,
  type?: string,
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder:text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
      />
    </div>
  );
}
