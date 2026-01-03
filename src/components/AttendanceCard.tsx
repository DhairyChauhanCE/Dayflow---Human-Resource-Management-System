import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AttendanceCardProps {
  attendance: any;
  detailed?: boolean;
}

export function AttendanceCard({ attendance, detailed = false }: AttendanceCardProps) {
  const checkIn = useMutation(api.attendance.checkIn);
  const checkOut = useMutation(api.attendance.checkOut);
  const attendanceHistory = useQuery(api.attendance.getAttendanceHistory);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await checkIn();
      toast.success("Checked in successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await checkOut();
      toast.success("Checked out successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString();
  const isCheckedIn = attendance?.checkIn && !attendance?.checkOut;
  const isCheckedOut = attendance?.checkIn && attendance?.checkOut;

  if (detailed) {
    return (
      <div className="space-y-6">
        {/* Today's Attendance */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Today's Attendance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Date</p>
              <p className="text-white font-semibold">{today}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Check In</p>
              <p className="text-white font-semibold">
                {attendance?.checkIn || "Not checked in"}
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Check Out</p>
              <p className="text-white font-semibold">
                {attendance?.checkOut || "Not checked out"}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleCheckIn}
              disabled={loading || isCheckedIn || isCheckedOut}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Check In"}
            </button>
            
            <button
              onClick={handleCheckOut}
              disabled={loading || !isCheckedIn || isCheckedOut}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Check Out"}
            </button>
          </div>

          {attendance?.hoursWorked && (
            <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <p className="text-blue-300 text-sm">Hours Worked Today</p>
              <p className="text-white text-lg font-semibold">{attendance.hoursWorked} hours</p>
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Attendance History</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-slate-300 font-medium py-3">Date</th>
                  <th className="text-left text-slate-300 font-medium py-3">Check In</th>
                  <th className="text-left text-slate-300 font-medium py-3">Check Out</th>
                  <th className="text-left text-slate-300 font-medium py-3">Hours</th>
                  <th className="text-left text-slate-300 font-medium py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory?.slice(0, 10).map((record) => (
                  <tr key={record._id} className="border-b border-white/5">
                    <td className="py-3 text-white">{record.date}</td>
                    <td className="py-3 text-slate-300">{record.checkIn || "-"}</td>
                    <td className="py-3 text-slate-300">{record.checkOut || "-"}</td>
                    <td className="py-3 text-slate-300">{record.hoursWorked || "-"}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === "present" ? "bg-green-500/20 text-green-300" :
                        record.status === "absent" ? "bg-red-500/20 text-red-300" :
                        record.status === "leave" ? "bg-blue-500/20 text-blue-300" :
                        "bg-yellow-500/20 text-yellow-300"
                      }`}>
                        {record.status}
                      </span>
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

  return (
    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Today's Attendance</h3>
        <span className="text-2xl">⏰</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-green-300">Status:</span>
          <span className={`font-semibold ${
            isCheckedOut ? "text-blue-300" :
            isCheckedIn ? "text-green-300" :
            "text-slate-300"
          }`}>
            {isCheckedOut ? "Completed" : isCheckedIn ? "Checked In" : "Not Started"}
          </span>
        </div>
        
        {attendance?.checkIn && (
          <div className="flex justify-between">
            <span className="text-green-300">Check In:</span>
            <span className="text-white font-medium">{attendance.checkIn}</span>
          </div>
        )}
        
        {attendance?.checkOut && (
          <div className="flex justify-between">
            <span className="text-green-300">Check Out:</span>
            <span className="text-white font-medium">{attendance.checkOut}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleCheckIn}
          disabled={loading || isCheckedIn || isCheckedOut}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check In
        </button>
        
        <button
          onClick={handleCheckOut}
          disabled={loading || !isCheckedIn || isCheckedOut}
          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Out
        </button>
      </div>
    </div>
  );
}
