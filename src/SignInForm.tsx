import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, UserPlus, LogIn, Ghost, Briefcase, Hash, ShieldCheck } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [roleSelection, setRoleSelection] = useState<"admin" | "employee" | null>(null);
  const syncUser = useMutation(api.employees.syncUserWithEmployee);

  // Handle post-signup sync
  const currentEmployee = useQuery(api.employees.getCurrentEmployee);

  useEffect(() => {
    const handleSync = async () => {
      const pendingSync = localStorage.getItem("pending_signup_data");
      if (pendingSync && currentEmployee === null) {
        try {
          const data = JSON.parse(pendingSync);
          await syncUser(data);
          localStorage.removeItem("pending_signup_data");
          toast.success("Profile synced successfully!");
        } catch (error: any) {
          console.error("Sync error:", error);
          // If it's a real error (not just unauthorized yet), we might want to inform the user
        }
      }
    };
    handleSync();
  }, [currentEmployee, syncUser]);

  if (!roleSelection) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Select Your Portal</h2>
          <p className="text-slate-400 text-sm">Please choose your role to proceed</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => setRoleSelection("admin")}
            className="group relative flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:border-indigo-500/50 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="p-4 bg-indigo-500/20 rounded-full text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Admin / HR Officer</h3>
            <p className="text-slate-400 text-sm text-center">Manage employees, approvals & payroll</p>
          </button>

          <button
            onClick={() => setRoleSelection("employee")}
            className="group relative flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/50 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="p-4 bg-emerald-500/20 rounded-full text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <UserPlus size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Employee</h3>
            <p className="text-slate-400 text-sm text-center">View profile, attendance & salary</p>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      <div className="text-center mb-4">
        <button
          onClick={() => setRoleSelection(null)}
          className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mx-auto mb-4 transition-colors"
        >
          ← Change Role
        </button>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${roleSelection === "admin" ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-300"
          }`}>
          {roleSelection === "admin" ? "Admin Portal" : "Employee Portal"}
        </span>
        <h2 className="text-2xl font-bold text-white mb-2">
          {flow === "signIn" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-slate-400 text-sm">
          {flow === "signIn" ? "Sign in to access your dashboard" : "Join Dayflow today"}
        </p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);

          if (flow === "signUp") {
            const password = formData.get("password") as string;
            if (password.length < 8) {
              toast.error("Password must be at least 8 characters long");
              return;
            }
            if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
              toast.error("Password must contain at least one number and one special character");
              return;
            }

            // Store details for sync after sign in
            localStorage.setItem("pending_signup_data", JSON.stringify({
              employeeId: formData.get("employeeId"),
              role: roleSelection === "admin" ? "hr" : "employee", // Map Admin selection to HR role initially
              firstName: formData.get("firstName"),
              lastName: formData.get("lastName"),
              email: formData.get("email"),
            }));
          }

          console.log("Starting sign in/up flow:", flow);
          setSubmitting(true);
          formData.set("flow", flow);
          void signIn("password", formData)
            .then(() => {
              console.log("Sign in success!");
            })
            .catch((error) => {
              console.error("Sign in failed:", error);
              let toastTitle = "";
              if (error.message.includes("Invalid password")) {
                toastTitle = "Invalid password. Please try again.";
              } else {
                toastTitle =
                  flow === "signUp" && error.message.includes("already exists")
                    ? "An account with this email already exists."
                    : flow === "signIn"
                      ? "Invalid credentials. Please check your email and password."
                      : "Could not complete the request. Please try again.";
              }
              toast.error(toastTitle);
              setSubmitting(false);
              localStorage.removeItem("pending_signup_data");
            });
        }}
      >
        <AnimatePresence mode="popLayout">
          {flow === "signUp" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="relative group">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  type="text"
                  name="employeeId"
                  placeholder="Employee ID (e.g., EMP001)"
                  required
                />
              </div>

              {/* Role selection is now handled by the initial screen */}
              <input type="hidden" name="role" value={roleSelection === "admin" ? "hr" : "employee"} />

              <div className="grid grid-cols-2 gap-4">
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  required
                />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  required
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            type="email"
            name="email"
            placeholder="Email Address"
            required
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>

        <button
          className="premium-btn py-3.5 flex items-center justify-center gap-2 group disabled:opacity-50"
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {flow === "signIn" ? <LogIn size={18} /> : <UserPlus size={18} />}
              <span>{flow === "signIn" ? "Sign In" : "Sign Up"}</span>
            </>
          )}
        </button>

        <div className="text-center text-sm">
          <span className="text-slate-400">
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Create One" : "Log In"}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="h-px grow bg-white/10" />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">or</span>
        <div className="h-px grow bg-white/10" />
      </div>

      <button
        className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-300 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
        onClick={() => {
          console.log("Attempting anonymous sign in");
          void signIn("anonymous");
        }}
      >
        <Ghost size={18} />
        <span>Continue Anonymously</span>
      </button>
    </motion.div>
  );
}
