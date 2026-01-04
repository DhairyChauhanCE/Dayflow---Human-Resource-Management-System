import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X } from "lucide-react";
<<<<<<< HEAD
import { ProfileCard } from "./ProfileCard";
=======
import { ProfileView } from "./ProfileView";
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596

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
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Employee Management</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
          >
            {showForm ? "Cancel" : "Add Employee"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-6 bg-white/5 rounded-lg border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Hire Date
                </label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </form>
        )}

        {/* Selected Employee Profile View */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 right-4 z-[60] bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>
<<<<<<< HEAD
              <ProfileCard employee={selectedEmployee} isAdminView={true} />
=======
              <ProfileView employee={selectedEmployee} isAdminView={true} />
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
            </motion.div>
          </div>
        )}

        {/* Employee List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-slate-300 font-medium py-3">ID</th>
                <th className="text-left text-slate-300 font-medium py-3">Name</th>
                <th className="text-left text-slate-300 font-medium py-3 whitespace-nowrap">Email</th>
                <th className="text-left text-slate-300 font-medium py-3">Department</th>
                <th className="text-left text-slate-300 font-medium py-3">Role</th>
                <th className="text-left text-slate-300 font-medium py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id} className="border-b border-white/5 hover:bg-white/5 group transition-colors">
                  <td className="py-4 text-white font-mono text-xs">{employee.employeeId}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <span className="text-white font-medium">{employee.firstName} {employee.lastName}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-400 text-sm">{employee.email}</td>
                  <td className="py-4 text-slate-400 text-sm">{employee.department}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${employee.role === "admin" ? "bg-purple-500/20 text-purple-300" :
                      employee.role === "hr" ? "bg-blue-500/20 text-blue-300" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                      {employee.role}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => setSelectedEmployee(employee)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
