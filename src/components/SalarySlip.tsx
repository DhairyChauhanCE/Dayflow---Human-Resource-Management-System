import { useRef } from "react";
import { Download, FileText } from "lucide-react";
import { useReactToPrint } from "react-to-print";

interface SalarySlipProps {
    payroll: any;
    employee: any;
}

export function SalarySlip({ payroll, employee }: SalarySlipProps) {
    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        contentReference: componentRef,
    });

    if (!payroll || !employee) return null;

    const breakdown = payroll.breakdown || {
        basic: payroll.baseSalary * 0.5,
        hra: payroll.baseSalary * 0.3,
        conveyance: payroll.baseSalary * 0.2,
        special: payroll.allowances,
        tax: payroll.deductions * 0.7,
        pf: payroll.deductions * 0.3
    };

    return (
        <div>
            <div className="flex gap-4">
                <button
                    onClick={() => handlePrint()}
                    className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                    <Download size={16} />
                    Download Slip
                </button>
            </div>

            <div className="hidden">
                <div ref={componentRef} className="p-8 bg-white text-black max-w-[210mm] mx-auto min-h-[297mm]">
                    {/* Header */}
                    <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                        <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">Dayflow HRMS</h1>
                        <p className="text-slate-600 mt-2">123 Business Park, Tech City, India - 560100</p>
                        <p className="text-slate-600">contact@dayflow.com | +91 999 888 7777</p>
                        <h2 className="text-xl font-semibold mt-6 underline uppercase">Payslip for {payroll.payPeriod}</h2>
                    </div>

                    {/* Employee Details */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="font-semibold text-slate-700">Employee Name:</span>
                                <span>{employee.firstName} {employee.lastName}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="font-semibold text-slate-700">Employee ID:</span>
                                <span>{employee.employeeId}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="font-semibold text-slate-700">Department:</span>
                                <span>{employee.department}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="font-semibold text-slate-700">Pay Period:</span>
                                <span>{payroll.payPeriod}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="font-semibold text-slate-700">Pay Date:</span>
                                <span>{payroll.payDate || new Date().toISOString().split('T')[0]}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="font-semibold text-slate-700">Designation:</span>
                                <span>{employee.position}</span>
                            </div>
                        </div>
                    </div>

                    {/* Salary Details Table */}
                    <div className="border border-slate-300 mb-8">
                        <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-300 font-bold">
                            <div className="p-3 border-r border-slate-300 text-center">Earnings</div>
                            <div className="p-3 text-center">Deductions</div>
                        </div>
                        <div className="grid grid-cols-2">
                            {/* Earnings Column */}
                            <div className="border-r border-slate-300">
                                <div className="flex justify-between p-3 border-b border-slate-200">
                                    <span>Basic Salary</span>
                                    <span>₹{breakdown.basic.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-3 border-b border-slate-200">
                                    <span>HRA</span>
                                    <span>₹{breakdown.hra.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-3 border-b border-slate-200">
                                    <span>Conveyance</span>
                                    <span>₹{breakdown.conveyance.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-3 border-b border-slate-200">
                                    <span>Special Allowance</span>
                                    <span>₹{breakdown.special.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-3 font-bold bg-slate-50">
                                    <span>Total Earnings</span>
                                    <span>₹{(payroll.baseSalary + payroll.allowances).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Deductions Column */}
                            <div>
                                <div className="flex justify-between p-3 border-b border-slate-200">
                                    <span>Income Tax</span>
                                    <span>₹{breakdown.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-3 border-b border-slate-200">
                                    <span>Provident Fund</span>
                                    <span>₹{breakdown.pf.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-3 border-b border-slate-200">
                                    <span>Other Deductions</span>
                                    <span>₹{Math.max(0, payroll.deductions - breakdown.tax - breakdown.pf).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-3 opacity-0">
                                    <span>-</span>
                                    <span>-</span>
                                </div>
                                <div className="flex justify-between p-3 font-bold bg-slate-50">
                                    <span>Total Deductions</span>
                                    <span>₹{payroll.deductions.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Net Pay */}
                    <div className="flex justify-between items-center p-4 bg-slate-100 border border-slate-300 mb-8">
                        <span className="text-xl font-bold uppercase">Net Payable</span>
                        <span className="text-2xl font-bold">₹{payroll.netSalary.toLocaleString()}</span>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-8 border-t border-slate-300 flex justify-between">
                        <div className="text-center w-40">
                            <p className="border-b border-slate-400 mb-2"></p>
                            <p className="text-sm font-semibold">Employer Signature</p>
                        </div>
                        <div className="text-center w-40">
                            <p className="border-b border-slate-400 mb-2"></p>
                            <p className="text-sm font-semibold">Employee Signature</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-xs text-slate-500">
                        <p>This is a computer-generated document and does not require a physical signature.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
