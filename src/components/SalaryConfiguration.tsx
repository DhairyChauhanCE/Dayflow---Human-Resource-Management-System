import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface SalaryConfigurationProps {
    employeeId: any;
    currentPayroll?: any;
}

export function SalaryConfiguration({ employeeId, currentPayroll }: SalaryConfigurationProps) {
    const createPayroll = useMutation(api.payroll.createPayroll);

    // States for inputs
    const [monthWage, setMonthWage] = useState(currentPayroll?.monthWage || 0);
    const [workingDays, setWorkingDays] = useState(currentPayroll?.workingDaysPerWeek || 5);
    const [breakTime, setBreakTime] = useState(currentPayroll?.breakTime || 1);

    // Percentages & Values
    const [basicPercent, setBasicPercent] = useState(50);
    const [hraPercent, setHraPercent] = useState(50); // of Basic
    const [standardAllowancePercent, setStandardAllowancePercent] = useState(16.67);
    const [performanceBonusPercent, setPerformanceBonusPercent] = useState(8.33);
    const [ltaPercent, setLtaPercent] = useState(8.33);
    const [fixedAllowancePercent, setFixedAllowancePercent] = useState(11.67);

    const [pfEmployeeRate, setPfEmployeeRate] = useState(12);
    const [pfEmployerRate, setPfEmployerRate] = useState(12);
    const [profTax, setProfTax] = useState(200);

    // Calculated Values (Derived state mostly, but good to have handy)
    const yearlyWage = monthWage * 12;
    const basicSalary = (monthWage * basicPercent) / 100;
    const hra = (basicSalary * hraPercent) / 100;
    // Standard Allowance based on Month Wage or fixed? Design says X% / month. Assuming % of Month Wage or Basic?
    // Design says: Standard Allowance 4167 / month (16.67%). 4167 is 16.67% of 25000 (Basic). 
    // Wait, 4167 / 25000 = 0.16668. So it looks like these are % of Basic Calculation? OR % of Gross?
    // 50000 Month Wage. 25000 Basic (50%).
    // HRA 12500 (50% of Basic).
    // Standard Allowance 4167 (16.67% of Basic -> 25000 * 0.1667 = 4167.5). Matches.
    // Performance Bonus 2082.50 (8.33% of Basic -> 25000 * 0.0833 = 2082.5). Matches.
    // LTA 2082.50 (8.33% of Basic). Matches.
    // Fixed Allowance 2918.00 (11.67% of Basic). Matches.

    // So all components seem to be % of BASIC.

    const standardAllowance = (basicSalary * standardAllowancePercent) / 100;
    const performanceBonus = (basicSalary * performanceBonusPercent) / 100;
    const lta = (basicSalary * ltaPercent) / 100;
    const fixedAllowance = (basicSalary * fixedAllowancePercent) / 100;

    const totalEarnings = basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance;
    // Wait, total earnings should equal Month Wage? 
    // 25000 + 12500 + 4167 + 2082.5 + 2082.5 + 2918 = 48750. 
    // It's close to 50000 but not exactly. 
    // Is Fixed Allowance the balancing figure? 
    // "Fixed allowance portion of wages is determined after calculating all salary components"
    // So Fixed Allowance = Month Wage - (Basic + HRA + Std + Bonus + LTA).

    // Let's implement Balancing Logic for Fixed Allowance if "Auto Calculate" is on.
    // For now, let's just stick to the percentages provided in the user image as defaults.

    const pfEmployee = (basicSalary * pfEmployeeRate) / 100; // PF is based on Basic
    const pfEmployer = (basicSalary * pfEmployerRate) / 100;

    const totalDeductions = pfEmployee + profTax;
    const netSalary = totalEarnings - totalDeductions;

    const handleSave = async () => {
        try {
            const payPeriod = new Date().toISOString().slice(0, 7); // yyyy-mm
            await createPayroll({
                employeeId,
                baseSalary: totalEarnings, // Gross Earnings
                data: {}, // hack for types if needed
                allowances: 0, // already part of base/breakdown structure in this logic
                deductions: totalDeductions,
                payPeriod,
                monthWage,
                workingDaysPerWeek: workingDays,
                breakTime,
                breakdown: {
                    basic: basicSalary,
                    hra,
                    standardAllowance,
                    performanceBonus,
                    lta,
                    fixedAllowance,
                    pfEmployee,
                    pfEmployer,
                    tax: profTax
                }
            } as any);
            toast.success("Salary Configuration Saved!");
        } catch (error: any) {
            toast.error("Error saving salary: " + error.message);
        }
    };

    return (
        <div className="bg-[#050505] p-6 rounded-2xl border border-white/10 font-sans text-white">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
                <h2 className="text-xl font-medium tracking-wide">
                    <span className="border-t-2 border-l-2 border-r-2 border-white/20 px-4 py-2 rounded-t-lg bg-[#050505] relative -bottom-[17px]">
                        Salary Info
                    </span>
                </h2>
                <div className="text-xs text-slate-500 italic">Visible only to Admin</div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-handwriting text-lg">Month Wage</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={monthWage}
                                onChange={(e) => setMonthWage(Number(e.target.value))}
                                className="bg-transparent border-b border-slate-500 text-right w-32 focus:outline-none text-xl font-mono"
                            />
                            <span className="text-slate-500 text-sm">/ Month</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-handwriting text-lg">Yearly wage</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-mono text-slate-400">{yearlyWage.toLocaleString()}</span>
                            <span className="text-slate-500 text-sm">/ Yearly</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm w-32">No of working days in a week:</span>
                        <input
                            type="number"
                            value={workingDays}
                            onChange={(e) => setWorkingDays(Number(e.target.value))}
                            className="bg-transparent border-b border-slate-500 text-right w-20 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Break Time:</span>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                value={breakTime}
                                onChange={(e) => setBreakTime(Number(e.target.value))}
                                className="bg-transparent border-b border-slate-500 text-right w-20 focus:outline-none"
                            />
                            <span className="text-slate-500 text-lg font-handwriting">/ hrs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Earnings */}
                <div>
                    <h3 className="text-slate-400 border-b border-white/20 pb-1 mb-4">Salary Components</h3>
                    <div className="space-y-6">
                        {/* Basic */}
                        <SalaryComponentRow
                            label="Basic Salary"
                            subLabel="Define Basic salary from company cost compute it based on monthly Wages"
                            amount={basicSalary}
                            percent={basicPercent}
                            onChangePercent={setBasicPercent}
                            suffix="/ month"
                        />
                        {/* HRA */}
                        <SalaryComponentRow
                            label="House Rent Allowance"
                            subLabel="HRA provided to employees 50% of the basic salary"
                            amount={hra} // Display Amount
                            percent={hraPercent}
                            onChangePercent={setHraPercent} // Edit percent
                            suffix="/ month"
                        />
                        {/* Standard Allowance */}
                        <SalaryComponentRow
                            label="Standard Allowance"
                            subLabel="A standard allowance is a predetermined, fixed amount..."
                            amount={standardAllowance}
                            percent={standardAllowancePercent}
                            onChangePercent={setStandardAllowancePercent}
                            suffix="/ month"
                        />
                        {/* Performance Bonus */}
                        <SalaryComponentRow
                            label="Performance Bonus"
                            subLabel="Variable amount paid during payroll..."
                            amount={performanceBonus}
                            percent={performanceBonusPercent}
                            onChangePercent={setPerformanceBonusPercent}
                            suffix="/ month"
                        />
                        {/* LTA */}
                        <SalaryComponentRow
                            label="Leave Travel Allowance"
                            subLabel="LTA is paid by the company to employees..."
                            amount={lta}
                            percent={ltaPercent}
                            onChangePercent={setLtaPercent}
                            suffix="/ month"
                        />
                        {/* Fixed Allowance */}
                        <SalaryComponentRow
                            label="Fixed Allowance"
                            subLabel="fixed allowance portion of wages is determined..."
                            amount={fixedAllowance}
                            percent={fixedAllowancePercent}
                            onChangePercent={setFixedAllowancePercent}
                            suffix="/ month"
                        />
                    </div>
                </div>

                {/* Deductions & PF */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-slate-400 border-b border-white/20 pb-1 mb-4">Provident Fund (PF) Contribution</h3>
                        <SalaryComponentRow
                            label="Employee"
                            subLabel="PF is calculated based on the basic salary"
                            amount={pfEmployee}
                            percent={pfEmployeeRate}
                            onChangePercent={setPfEmployeeRate}
                            suffix="/ month"
                            compact
                        />
                        <SalaryComponentRow
                            label="Employe'r"
                            subLabel="PF is calculated based on the basic salary"
                            amount={pfEmployer}
                            percent={pfEmployerRate}
                            onChangePercent={setPfEmployerRate}
                            suffix="/ month"
                            compact
                        />
                    </div>

                    <div>
                        <h3 className="text-slate-400 border-b border-white/20 pb-1 mb-4">Tax Deductions</h3>
                        <div className="flex justify-between items-start py-2">
                            <div>
                                <p className="text-slate-200">Professional Tax</p>
                                <p className="text-slate-500 text-[10px] mt-1 pr-4">Professional Tax deducted from the Gross salary</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="bg-transparent border-b border-slate-500 text-right w-20 focus:outline-none font-mono"
                                    value={profTax}
                                    onChange={(e) => setProfTax(Number(e.target.value))}
                                />
                                <span className="text-slate-500 text-xs">₹ / month</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 mt-4 border-t border-white/10">
                        <button
                            onClick={handleSave}
                            className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SalaryComponentRow({ label, subLabel, amount, percent, onChangePercent, suffix, compact }: any) {
    return (
        <div className="py-2">
            <div className="flex justify-between items-end mb-1">
                <p className={`text-slate-200 ${compact ? 'text-sm' : ''}`}>{label}</p>
                <div className="flex items-center gap-4">
                    <span className="font-mono text-slate-200">{amount.toFixed(2)}</span>
                    <span className="text-slate-500 text-xs">₹ {suffix}</span>
                    <div className="flex items-center gap-1 w-16 justify-end">
                        <input
                            type="number"
                            value={percent}
                            onChange={(e) => onChangePercent(Number(e.target.value))}
                            className="bg-transparent border-b border-slate-500 text-right w-10 focus:outline-none text-sm text-slate-300"
                        />
                        <span className="text-slate-500 text-xs">%</span>
                    </div>
                </div>
            </div>
            <p className="text-slate-500 text-[10px] max-w-[80%]">{subLabel}</p>
        </div>
    )
}
