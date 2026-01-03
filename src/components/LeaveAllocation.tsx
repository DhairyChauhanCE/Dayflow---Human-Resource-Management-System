import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plus, User, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface LeaveAllocation {
  employeeId: string;
  paidDays: number;
  sickDays: number;
  personalDays: number;
}

export function LeaveAllocation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allocations, setAllocations] = useState<Record<string, LeaveAllocation>>({});
  
  const employees = useQuery(api.employees.getAllEmployees);
  const updateLeaveAllocation = useMutation(api.employees.updateLeaveAllocation);

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter((employee: any) => {
      const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [employees, searchTerm]);

  // Mock allocation data (in real app, this would come from database)
  const mockAllocations: Record<string, LeaveAllocation> = {
    emp1: { employeeId: "emp1", paidDays: 24, sickDays: 7, personalDays: 5 },
    emp2: { employeeId: "emp2", paidDays: 20, sickDays: 10, personalDays: 3 },
  };

  const currentAllocations = { ...mockAllocations, ...allocations };

  const handleAllocationChange = (employeeId: string, type: keyof Omit<LeaveAllocation, 'employeeId'>, value: number) => {
    setAllocations(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        employeeId,
        [type]: value
      }
    }));
  };

  const handleSaveAllocation = async (employeeId: string) => {
    try {
      const allocation = currentAllocations[employeeId];
      if (allocation) {
        await updateLeaveAllocation({
          employeeId,
          paidDays: allocation.paidDays,
          sickDays: allocation.sickDays,
          personalDays: allocation.personalDays
        });
        toast.success("Leave allocation updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update leave allocation");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Allocation</h1>
          <p className="text-slate-400">Manage leave balances for employees</p>
        </div>
        <button className="premium-btn flex items-center gap-2">
          <Plus size={18} />
          Allocate Leave
        </button>
      </div>

      {/* Search */}
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

      {/* Employee Allocation Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
        <div className="grid grid-cols-6 p-4 text-slate-400 font-medium border-b border-white/10 bg-black/20">
          <div className="pl-4">Employee</div>
          <div className="text-center">Paid Days</div>
          <div className="text-center">Sick Days</div>
          <div className="text-center">Personal Days</div>
          <div className="text-center">Total</div>
          <div className="text-right pr-4">Actions</div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredEmployees === undefined ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">
              Loading employees...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No employees found.
            </div>
          ) : (
            filteredEmployees.map((employee: any) => {
              const allocation = currentAllocations[employee._id] || {
                employeeId: employee._id,
                paidDays: 24,
                sickDays: 7,
                personalDays: 5
              };
              
              const totalDays = allocation.paidDays + allocation.sickDays + allocation.personalDays;
              const hasChanges = allocations[employee._id];

              return (
                <motion.div
                  key={employee._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-6 p-4 text-slate-300 hover:bg-white/5 transition-colors items-center"
                >
                  <div className="pl-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                      <User size={16} className="text-white/30" />
                    </div>
                    <div>
                      <span className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </span>
                      <div className="text-xs text-slate-500">{employee.department}</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={allocation.paidDays}
                      onChange={(e) => handleAllocationChange(employee._id, 'paidDays', parseInt(e.target.value) || 0)}
                      className="w-20 bg-black/50 border border-white/10 rounded px-2 py-1 text-center text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="text-center">
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={allocation.sickDays}
                      onChange={(e) => handleAllocationChange(employee._id, 'sickDays', parseInt(e.target.value) || 0)}
                      className="w-20 bg-black/50 border border-white/10 rounded px-2 py-1 text-center text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="text-center">
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={allocation.personalDays}
                      onChange={(e) => handleAllocationChange(employee._id, 'personalDays', parseInt(e.target.value) || 0)}
                      className="w-20 bg-black/50 border border-white/10 rounded px-2 py-1 text-center text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                      {totalDays}
                    </span>
                  </div>
                  
                  <div className="text-right pr-4">
                    {hasChanges ? (
                      <button
                        onClick={() => void handleSaveAllocation(employee._id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm font-medium flex items-center gap-1 ml-auto"
                      >
                        <CheckCircle size={14} />
                        Save
                      </button>
                    ) : (
                      <div className="text-slate-500 text-sm">No changes</div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Total Paid Days</h3>
              <p className="text-3xl font-bold text-emerald-400">
                {Object.values(currentAllocations).reduce((sum, alloc) => sum + alloc.paidDays, 0)}
              </p>
              <p className="text-slate-400 text-sm">Across all employees</p>
            </div>
            <Calendar size={24} className="text-emerald-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Total Sick Days</h3>
              <p className="text-3xl font-bold text-blue-400">
                {Object.values(currentAllocations).reduce((sum, alloc) => sum + alloc.sickDays, 0)}
              </p>
              <p className="text-slate-400 text-sm">Across all employees</p>
            </div>
            <AlertCircle size={24} className="text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Total Personal Days</h3>
              <p className="text-3xl font-bold text-purple-400">
                {Object.values(currentAllocations).reduce((sum, alloc) => sum + alloc.personalDays, 0)}
              </p>
              <p className="text-slate-400 text-sm">Across all employees</p>
            </div>
            <User size={24} className="text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
