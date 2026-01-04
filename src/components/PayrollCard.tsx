import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SalarySlip } from "./SalarySlip";

interface PayrollCardProps {
  records: any[];
  detailed?: boolean;
}

export function PayrollCard({ records, detailed = false }: PayrollCardProps) {
  if (detailed) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6">Payroll History</h3>

        <div className="space-y-4">
          {records.map((record) => (
            <div key={record._id} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-white font-semibold text-lg">
                    Pay Period: {record.payPeriod}
                  </h4>
                  <p className="text-slate-300 text-sm">
                    Status: <span className={`font-medium ${record.status === "paid" ? "text-green-300" :
                      record.status === "processed" ? "text-blue-300" :
                        "text-yellow-300"
                      }`}>
                      {record.status}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
<<<<<<< HEAD
                    ₹{record.netSalary.toLocaleString('en-IN')}
=======
                    ${record.netSalary.toLocaleString()}
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
                  </p>
                  <p className="text-slate-300 text-sm">Net Salary</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-green-300 text-sm font-medium">Base Salary</p>
                  <p className="text-white text-lg font-semibold">
<<<<<<< HEAD
                    ₹{record.baseSalary.toLocaleString('en-IN')}
=======
                    ${record.baseSalary.toLocaleString()}
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-300 text-sm font-medium">Allowances</p>
                  <p className="text-white text-lg font-semibold">
<<<<<<< HEAD
                    +₹{record.allowances.toLocaleString('en-IN')}
=======
                    +${record.allowances.toLocaleString()}
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
                  </p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-300 text-sm font-medium">Deductions</p>
                  <p className="text-white text-lg font-semibold">
<<<<<<< HEAD
                    -₹{record.deductions.toLocaleString('en-IN')}
=======
                    -${record.deductions.toLocaleString()}
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                {record.payDate && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-purple-300 text-sm">
                      Pay Date: <span className="text-white font-medium">{record.payDate}</span>
                    </p>
                  </div>
                )}
                <SalarySlip payroll={record} employee={record.employee} />
              </div>
            </div>
          ))}

          {records.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">No payroll records found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const latestRecord = records[0];

  return (
    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Latest Payroll</h3>
        <span className="text-2xl">💰</span>
      </div>

      {latestRecord ? (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-purple-300">Period:</span>
            <span className="text-white font-medium">{latestRecord.payPeriod}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-purple-300">Net Salary:</span>
            <span className="text-white font-semibold text-lg">
<<<<<<< HEAD
              ₹{latestRecord.netSalary.toLocaleString('en-IN')}
=======
              ${latestRecord.netSalary.toLocaleString()}
>>>>>>> fb47843803ad43db6f563f5bcadbbb6a3fe8f596
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-purple-300">Status:</span>
            <span className={`font-medium ${latestRecord.status === "paid" ? "text-green-300" :
              latestRecord.status === "processed" ? "text-blue-300" :
                "text-yellow-300"
              }`}>
              {latestRecord.status}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-purple-300 text-sm">No payroll data available</p>
      )}
    </div>
  );
}
