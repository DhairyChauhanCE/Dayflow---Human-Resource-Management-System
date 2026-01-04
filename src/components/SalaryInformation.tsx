import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Calculator, DollarSign, Percent, Settings, AlertCircle, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SalaryComponent {
  id: string;
  name: string;
  computationType: "fixed" | "percentage" | "calculated";
  value: number;
  calculatedAmount: number;
  basedOn?: string; // For percentage calculations
}

interface SalaryConfiguration {
  employeeId: string;
  wageType: "fixed";
  wageAmount: number;
  components: SalaryComponent[];
  deductions: {
    pfRate: number;
    professionalTax: number;
  };
}

export function SalaryInformation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  
  const employees = useQuery(api.employees.getAllEmployees);
  const updateSalaryConfiguration = useMutation(api.payroll.updateSalaryConfiguration);

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter((employee: any) => {
      const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [employees, searchTerm]);

  // Default salary configuration
  const defaultConfiguration: SalaryConfiguration = {
    employeeId: "",
    wageType: "fixed",
    wageAmount: 50000,
    components: [
      {
        id: "basic",
        name: "Basic",
        computationType: "percentage",
        value: 50,
        calculatedAmount: 0,
        basedOn: "wage"
      },
      {
        id: "hra",
        name: "House Rent Allowance",
        computationType: "percentage",
        value: 50,
        calculatedAmount: 0,
        basedOn: "basic"
      },
      {
        id: "standard",
        name: "Standard Allowance",
        computationType: "fixed",
        value: 4167,
        calculatedAmount: 4167
      },
      {
        id: "performance",
        name: "Performance Bonus",
        computationType: "percentage",
        value: 8.33,
        calculatedAmount: 0,
        basedOn: "wage"
      },
      {
        id: "lta",
        name: "Leave Travel Allowance",
        computationType: "percentage",
        value: 8.333,
        calculatedAmount: 0,
        basedOn: "wage"
      },
      {
        id: "fixed",
        name: "Fixed Allowance",
        computationType: "calculated",
        value: 0,
        calculatedAmount: 0
      }
    ],
    deductions: {
      pfRate: 12,
      professionalTax: 200
    }
  };

  const [configuration, setConfiguration] = useState<SalaryConfiguration>(defaultConfiguration);

  // Calculate salary components automatically
  const calculateComponents = useMemo(() => {
    const updatedComponents = configuration.components.map(component => {
      let calculatedAmount = component.value;

      if (component.computationType === "percentage" && component.basedOn) {
        if (component.basedOn === "wage") {
          calculatedAmount = (configuration.wageAmount * component.value) / 100;
        } else if (component.basedOn === "basic") {
          const basicComponent = configuration.components.find(c => c.id === "basic");
          if (basicComponent) {
            const basicAmount = (configuration.wageAmount * basicComponent.value) / 100;
            calculatedAmount = (basicAmount * component.value) / 100;
          }
        }
      }

      return { ...component, calculatedAmount };
    });

    // Calculate Fixed Allowance (wage - total of other components)
    const totalOtherComponents = updatedComponents
      .filter(c => c.id !== "fixed")
      .reduce((sum, c) => sum + c.calculatedAmount, 0);
    
    const fixedAllowance = Math.max(0, configuration.wageAmount - totalOtherComponents);
    
    const finalComponents = updatedComponents.map(component => 
      component.id === "fixed" 
        ? { ...component, calculatedAmount: fixedAllowance }
        : component
    );

    return finalComponents;
  }, [configuration.wageAmount, configuration.components]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalEarnings = calculateComponents.reduce((sum, comp) => sum + comp.calculatedAmount, 0);
    const pfDeduction = (calculateComponents.find(c => c.id === "basic")?.calculatedAmount || 0) * 
                       (configuration.deductions.pfRate / 100);
    const totalDeductions = pfDeduction + configuration.deductions.professionalTax;
    const netSalary = totalEarnings - totalDeductions;

    return {
      totalEarnings,
      pfDeduction,
      totalDeductions,
      netSalary
    };
  }, [calculateComponents, configuration.deductions]);

  const handleComponentChange = (componentId: string, field: keyof SalaryComponent, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === componentId ? { ...comp, [field]: value } : comp
      )
    }));
  };

  const handleWageChange = (wageAmount: number) => {
    setConfiguration(prev => ({ ...prev, wageAmount }));
  };

  const handleDeductionChange = (field: keyof typeof configuration.deductions, value: number) => {
    setConfiguration(prev => ({
      ...prev,
      deductions: { ...prev.deductions, [field]: value }
    }));
  };

  const handleSaveConfiguration = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    try {
      await updateSalaryConfiguration({
        employeeId: selectedEmployee,
        configuration: {
          ...configuration,
          employeeId: selectedEmployee,
          components: calculateComponents
        }
      });
      toast.success("Salary configuration saved successfully!");
      setIsConfiguring(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save salary configuration");
    }
  };

  const selectedEmployeeData = employees?.find((emp: any) => emp._id === selectedEmployee);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Salary Information</h1>
          <p className="text-slate-400">Define and manage salary structure for employees</p>
        </div>
        <button 
          onClick={() => setIsConfiguring(true)}
          disabled={!selectedEmployee}
          className="premium-btn flex items-center gap-2 disabled:opacity-50"
        >
          <Settings size={18} />
          Configure Salary
        </button>
      </div>

      {/* Employee Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050505] border border-white/20 rounded-lg pl-10 pr-4 py-3 text-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Employee List */}
          <div className="mt-4 rounded-xl border border-white/10 overflow-hidden bg-white/5 max-h-96 overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No employees found
              </div>
            ) : (
              filteredEmployees.map((employee: any) => (
                <motion.div
                  key={employee._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedEmployee(employee._id)}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                    selectedEmployee === employee._id 
                      ? "bg-indigo-500/20 border-indigo-500/30" 
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {employee.position} • {employee.department}
                      </p>
                    </div>
                    {selectedEmployee === employee._id && (
                      <CheckCircle className="text-indigo-400" size={20} />
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Selected Employee Info */}
        <div className="space-y-4">
          {selectedEmployeeData ? (
            <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 backdrop-blur-xl rounded-xl p-6 border border-indigo-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Current Configuration</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Employee</p>
                  <p className="text-white font-medium">
                    {selectedEmployeeData.firstName} {selectedEmployeeData.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Monthly Wage</p>
                  <p className="text-2xl font-bold text-indigo-400">
                    ₹{configuration.wageAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Net Salary</p>
                  <p className="text-xl font-bold text-emerald-400">
                    ₹{totals.netSalary.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
              <AlertCircle className="mx-auto text-slate-500 mb-3" size={32} />
              <p className="text-slate-400">Select an employee to view salary configuration</p>
            </div>
          )}
        </div>
      </div>

      {/* Salary Configuration Modal */}
      {isConfiguring && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Salary Configuration</h2>
              <button
                onClick={() => setIsConfiguring(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wage Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign size={20} className="text-indigo-400" />
                  Wage Type
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Wage Type</label>
                  <select
                    value={configuration.wageType}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, wageType: e.target.value as any }))}
                    className="w-full bg-[#050505] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="fixed">Fixed Wage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Monthly Wage Amount</label>
                  <input
                    type="number"
                    value={configuration.wageAmount}
                    onChange={(e) => handleWageChange(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#050505] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Deductions Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calculator size={20} className="text-rose-400" />
                  Deductions
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">PF Rate (%)</label>
                  <input
                    type="number"
                    value={configuration.deductions.pfRate}
                    onChange={(e) => handleDeductionChange("pfRate", parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#050505] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Professional Tax</label>
                  <input
                    type="number"
                    value={configuration.deductions.professionalTax}
                    onChange={(e) => handleDeductionChange("professionalTax", parseInt(e.target.value) || 0)}
                    className="w-full bg-[#050505] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Salary Components */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings size={20} className="text-emerald-400" />
                Salary Components
              </h3>

              <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
                <div className="grid grid-cols-5 p-4 text-slate-400 font-medium border-b border-white/10 bg-black/20">
                  <div>Component</div>
                  <div>Computation</div>
                  <div>Value</div>
                  <div>Calculated Amount</div>
                  <div>Based On</div>
                </div>

                <div className="divide-y divide-white/5">
                  {calculateComponents.map((component) => (
                    <div key={component.id} className="grid grid-cols-5 p-4 items-center">
                      <div className="text-white font-medium">{component.name}</div>
                      
                      <div>
                        {component.id !== "fixed" && (
                          <select
                            value={component.computationType}
                            onChange={(e) => handleComponentChange(component.id, "computationType", e.target.value)}
                            className="bg-[#050505] border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-indigo-500"
                          >
                            <option value="fixed">Fixed Amount</option>
                            <option value="percentage">Percentage</option>
                          </select>
                        )}
                        {component.id === "fixed" && (
                          <span className="text-slate-400 text-sm">Calculated</span>
                        )}
                      </div>

                      <div>
                        {component.id !== "fixed" && (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={component.value}
                              onChange={(e) => handleComponentChange(component.id, "value", parseFloat(e.target.value) || 0)}
                              className="w-20 bg-[#050505] border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                            {component.computationType === "percentage" && (
                              <Percent size={14} className="text-slate-400" />
                            )}
                          </div>
                        )}
                        {component.id === "fixed" && (
                          <span className="text-slate-400 text-sm">Auto</span>
                        )}
                      </div>

                      <div className="text-emerald-400 font-medium">
                        ₹{component.calculatedAmount.toLocaleString()}
                      </div>

                      <div className="text-slate-400 text-sm">
                        {component.basedOn === "wage" && "Wage"}
                        {component.basedOn === "basic" && "Basic"}
                        {component.id === "fixed" && "Remaining"}
                        {!component.basedOn && component.id !== "fixed" && "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-500/20 rounded-lg p-4 border border-emerald-500/30">
                <p className="text-emerald-300 text-sm">Total Earnings</p>
                <p className="text-white text-xl font-bold">₹{totals.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-rose-500/20 rounded-lg p-4 border border-rose-500/30">
                <p className="text-rose-300 text-sm">Total Deductions</p>
                <p className="text-white text-xl font-bold">₹{totals.totalDeductions.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-500/20 rounded-lg p-4 border border-indigo-500/30">
                <p className="text-indigo-300 text-sm">Net Salary</p>
                <p className="text-white text-xl font-bold">₹{totals.netSalary.toLocaleString()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => void handleSaveConfiguration()}
                className="flex-1 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-[#E5E5E5] transition-all"
              >
                Save Configuration
              </button>
              <button
                onClick={() => setIsConfiguring(false)}
                className="flex-1 bg-[#050505] border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
