import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [showLogin, setShowLogin] = useState(false);

  // If initial auth check is loading, show a minimal loader
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#050505] text-white">
        <Loader2 className="animate-spin text-white/20" size={48} />
      </div>
    );
  }

  // Route: Landing Page (Unauthenticated & Login not requested)
  if (!isAuthenticated && !showLogin) {
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
  }

  // Route: Main Application Frame (Handles both Login & Authenticated Dashboard)
  return (
    <div className="min-h-screen relative bg-[#050505] text-white">
      {/* Global Background from index.css applies here as well */}

      {/* App Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#050505]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                <span className="text-black font-bold text-lg">D</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Dayflow
              </h1>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <span className="text-xs text-green-400 font-mono border border-green-500/20 bg-green-500/10 px-2 py-0.5 rounded">ONLINE</span>
                <SignOutButton />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 pt-24 pb-12 px-4">
        {isAuthenticated ? (
          <AuthenticatedContent />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md relative">
              <button
                onClick={() => setShowLogin(false)}
                className="group absolute -top-16 left-0 text-gray-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
              </button>

              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Welcome Back</h1>
                <p className="text-gray-500">Sign in to access your workspace</p>
              </div>

              <SignInForm />
            </div>
          </div>
        )}
      </main>

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#12141C',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

// Sub-component to handle data syncing for logged-in users
function AuthenticatedContent() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const currentEmployee = useQuery(api.employees.getCurrentEmployee);
  const syncUser = useMutation(api.employees.syncUserWithEmployee);

  // Attempt sync if needed
  useEffect(() => {
    const handleSync = async () => {
      const pendingSync = localStorage.getItem("pending_signup_data");
      if (pendingSync && currentEmployee === null && loggedInUser) {
        try {
          const data = JSON.parse(pendingSync);
          await syncUser(data);
          localStorage.removeItem("pending_signup_data");
          toast.success("Profile created successfully!");
        } catch (error: any) {
          console.error("Sync error:", error);
          toast.error("Failed to create profile: " + error.message);
        }
      }
    };
    handleSync();
  }, [currentEmployee, loggedInUser, syncUser]);

  if (loggedInUser === undefined || currentEmployee === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-white/20" size={32} />
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Complete Profile</h2>
          <p className="text-gray-400 mb-8 text-sm">
            Link your account to an employee profile to continue.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              try {
                await syncUser({
                  employeeId: formData.get("employeeId") as string,
                  firstName: formData.get("firstName") as string,
                  lastName: formData.get("lastName") as string,
                  email: formData.get("email") as string,
                  role: formData.get("role") as "employee" | "hr",
                });
                toast.success("Profile linked successfully!");
                window.location.reload();
              } catch (err: any) {
                toast.error("Failed to link: " + err.message);
              }
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role</label>
              <select name="role" className="auth-input-field" required>
                <option value="employee" className="bg-black">Employee</option>
                <option value="hr" className="bg-black">Admin / HR</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                <input name="firstName" placeholder="John" required className="auth-input-field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                <input name="lastName" placeholder="Doe" required className="auth-input-field" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Employee ID</label>
              <input name="employeeId" placeholder="EMP-001" required className="auth-input-field" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work Email</label>
              <input name="email" type="email" placeholder="john@company.com" required className="auth-input-field" />
            </div>

            <button type="submit" className="premium-btn w-full flex justify-center">
              Complete Setup
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Dashboard employee={currentEmployee} />
    </div>
  );
}
