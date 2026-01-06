import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function PayrollManagement() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [formData, setFormData] = useState({
    employeeId: "",
    baseSalary: "",
    allowances: "",
    deductions: "",
    payDate: ""
  });
  const [loading, setLoading] = useState(false);

  const employees = useQuery(api.employees.getAllEmployees);
  const payrollRecords = useQuery(api.payroll.getAllPayroll, {
    payPeriod: selectedPeriod
  });

  const createPayroll = useMutation(api.payroll.createPayroll);
  const updatePayrollStatus = useMutation(api.payroll.updatePayrollStatus);
  const generateBatch = useMutation(api.payroll.generateBatchPayroll);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPayroll({
        employeeId: formData.employeeId as any,
        baseSalary: parseFloat(formData.baseSalary),
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        payPeriod: selectedPeriod,
        payDate: formData.payDate || undefined
      });
      toast.success("Payroll record created successfully!");
      setShowForm(false);
      setFormData({
        employeeId: "",
        baseSalary: "",
        allowances: "",
        deductions: "",
        payDate: ""
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    if (!confirm(`Generate payroll records for all active employees for ${selectedPeriod}?`)) return;

    setLoading(true);
    try {
      const result = (await generateBatch({ payPeriod: selectedPeriod })) as any;
      toast.success(`Successfully generated ${result.count || 0} payroll records!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (payrollId: string, status: "draft" | "processed" | "paid") => {
    try {
      await updatePayrollStatus({ payrollId: payrollId as any, status });
      toast.success(`Payroll status updated to ${status}!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const totalPayroll = payrollRecords?.reduce((sum, record) => sum + record.netSalary, 0) || 0;
  const processedCount = payrollRecords?.filter(r => r.status === "processed").length || 0;
  const paidCount = payrollRecords?.filter(r => r.status === "paid").length || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
          <p className="text-blue-300 text-sm font-medium">Total Payroll</p>
          <p className="text-white text-2xl font-bold">₹{totalPayroll.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
          <p className="text-purple-300 text-sm font-medium">Records</p>
          <p className="text-white text-2xl font-bold">{payrollRecords?.length || 0}</p>
        </div>

        <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
          <p className="text-yellow-300 text-sm font-medium">Processed</p>
          <p className="text-white text-2xl font-bold">{processedCount}</p>
        </div>

        <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
          <p className="text-green-300 text-sm font-medium">Paid</p>
          <p className="text-white text-2xl font-bold">{paidCount}</p>
        </div>
      </div>

      {/* Payroll Management */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-semibold text-white">Payroll Management</h3>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">
                Pay Period
              </label>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateBatch}
              disabled={loading}
              className="bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              Generate All
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
            >
              {showForm ? "Cancel" : "Add Payroll"}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-6 bg-white/5 rounded-lg border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Employee
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees?.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} ({employee.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Base Salary
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Allowances
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Deductions
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Pay Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.payDate}
                  onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Payroll Record"}
            </button>
          </form>
        )}

        {/* Payroll Records */}
        <div className="space-y-4">
          {payrollRecords?.map((record) => (
            <div key={record._id} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-2">
                    {record.employee?.firstName} {record.employee?.lastName}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-green-300 text-sm font-medium">Base Salary</p>
                      <p className="text-white text-lg font-semibold">
                        ₹{record.baseSalary.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-blue-300 text-sm font-medium">Allowances</p>
                      <p className="text-white text-lg font-semibold">
                        +₹{record.allowances.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-300 text-sm font-medium">Deductions</p>
                      <p className="text-white text-lg font-semibold">
                        -₹{record.deductions.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <p className="text-purple-300 text-sm font-medium">Net Salary</p>
                      <p className="text-white text-xl font-bold">
                        ₹{record.netSalary.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${record.status === "paid" ? "bg-green-500/20 text-green-300" :
                        record.status === "processed" ? "bg-blue-500/20 text-blue-300" :
                          "bg-yellow-500/20 text-yellow-300"
                      }`}>
                      {record.status}
                    </span>

                    {record.payDate && (
                      <span className="text-slate-300 text-sm">
                        Pay Date: {record.payDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {record.status === "draft" && (
                    <button
                      onClick={() => handleStatusUpdate(record._id, "processed")}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Process
                    </button>
                  )}

                  {record.status === "processed" && (
                    <button
                      onClick={() => handleStatusUpdate(record._id, "paid")}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {payrollRecords?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">No payroll records for {selectedPeriod}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
