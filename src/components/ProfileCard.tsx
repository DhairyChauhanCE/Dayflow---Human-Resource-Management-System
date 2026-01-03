import { useState } from "react";
import { User, Mail, MapPin, Briefcase, Phone, Camera, Save, X, FileText, Lock, Heart, Coffee, Award, Zap, ShieldCheck, CreditCard, Calendar, Upload, Send, MessageSquare } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileCardProps {
  employee: any;
  currentUserId?: string;
}

// Helper for currency format
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
};

// Helper for Percentage
const formatPercent = (val: number, total: number) => {
  if (!total) return "0.00%";
  return `${((val / total) * 100).toFixed(2)}%`;
}

export function ProfileCard({ employee, currentUserId }: ProfileCardProps) {
  const isOwnProfile = employee.userId === currentUserId;
  const updateEmployee = useMutation(api.employees.updateEmployee);
  // We prioritize salaryDetails from employee object, fallback to payroll if needed (though salaryDetails is for config)
  const viewer = useQuery(api.employees.getCurrentEmployee);
  const canViewSalary = viewer?.role === "admin" || viewer?.role === "hr";

  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<"details" | "salary" | "documents" | "resume" | "private">("details");

  const [formData, setFormData] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    phone: employee.phone || "",
    address: employee.address || "",
    bio: employee.bio || "",
    jobLove: employee.jobLove || "",
    hobbies: employee.hobbies || "",
    newSkill: "",
    newCertification: ""
  });

  const [skills, setSkills] = useState<string[]>(employee.skills || []);
  const [certifications, setCertifications] = useState<string[]>(employee.certifications || []);

  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    monthWage: employee.salaryDetails?.monthWage || 0,
    workingDaysPerWeek: employee.salaryDetails?.workingDaysPerWeek || 5,
    breakTimePerDay: employee.salaryDetails?.breakTimePerDay || "1 hr",
  });

  // Salary Calculations
  const calculateBreakdown = (wage: number) => {
    const basic = wage * 0.50;
    const hra = basic * 0.50; // 50% of Basic = 25% of Wage
    const standardAllowance = 4167;
    const performanceBonus = basic * 0.0833; // 8.33% of Basic
    const lta = basic * 0.0833; // 8.33% of Basic

    const totalFixedComponents = basic + hra + standardAllowance + performanceBonus + lta;
    // Fixed Allowance is the balancing figure
    // If wage is too low, fixed allowance handles the deficit (clamped to 0)
    const fixedAllowance = Math.max(0, wage - totalFixedComponents);

    const pfEmployee = basic * 0.12;
    const pfEmployer = basic * 0.12;
    const professionalTax = 200;

    const grossDeductions = pfEmployee + professionalTax;
    const netSalary = wage - grossDeductions;

    return {
      basic,
      hra,
      standardAllowance,
      performanceBonus,
      lta,
      fixedAllowance,
      pfEmployee,
      pfEmployer,
      professionalTax,
      netSalary,
      grossDeductions
    };
  };

  const breakdown = calculateBreakdown(salaryForm.monthWage);

  const handleSave = async () => {
    try {
      await updateEmployee({
        employeeId: employee._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        jobLove: formData.jobLove,
        hobbies: formData.hobbies,
        skills: skills,
        certifications: certifications
      });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Failed to update profile: " + error.message);
    }
  };

  const handleSalarySave = async () => {
    try {
      await updateEmployee({
        employeeId: employee._id,
        salaryDetails: {
          monthWage: salaryForm.monthWage,
          yearlyWage: salaryForm.monthWage * 12,
          workingDaysPerWeek: salaryForm.workingDaysPerWeek,
          breakTimePerDay: salaryForm.breakTimePerDay,
          breakdown: {
            basic: breakdown.basic,
            hra: breakdown.hra,
            standardAllowance: breakdown.standardAllowance,
            performanceBonus: breakdown.performanceBonus,
            lta: breakdown.lta,
            fixedAllowance: breakdown.fixedAllowance,
            pfEmployee: breakdown.pfEmployee,
            pfEmployer: breakdown.pfEmployer,
            professionalTax: breakdown.professionalTax
          }
        }
      });
      setIsEditingSalary(false);
      toast.success("Salary configuration updated");
    } catch (error: any) {
      toast.error("Failed to update salary config: " + error.message);
    }
  };

  const addSkill = (e: any) => {
    e.preventDefault();
    if (formData.newSkill.trim()) {
      setSkills([...skills, formData.newSkill.trim()]);
      setFormData({ ...formData, newSkill: "" });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const addCertification = (e: any) => {
    e.preventDefault();
    if (formData.newCertification.trim()) {
      setCertifications([...certifications, formData.newCertification.trim()]);
      setFormData({ ...formData, newCertification: "" });
    }
  };

  const removeCertification = (certToRemove: string) => {
    setCertifications(certifications.filter(c => c !== certToRemove));
  };

  return (
    <div className="glass-card w-full max-w-5xl mx-auto overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
      {/* Header Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
        <div className="absolute -bottom-16 left-8 flex items-end">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-black border-4 border-black overflow-hidden shadow-2xl">
              {employee.profilePicture ? (
                <img
                  src={`${import.meta.env.VITE_CONVEX_URL}/api/storage/${employee.profilePicture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <span className="text-4xl font-bold text-white">
                    {employee.firstName?.[0]}
                    {employee.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-700 shadow-lg cursor-pointer">
                <Camera size={16} />
              </button>
            )}
          </div>
          <div className="ml-6 mb-4">
            <h1 className="text-3xl font-bold text-white">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-blue-200 font-medium flex items-center gap-2">
              <Briefcase size={16} />
              {employee.position} • {employee.department}
            </p>
          </div>
        </div>

        {isOwnProfile && (
          <div className="absolute top-6 right-6">
            {isEditing ? (
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium shadow-lg">
                  <Save size={18} /> Save
                </button>
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium backdrop-blur-md">
                  <X size={18} /> Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium backdrop-blur-md">
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mt-20 px-8 border-b border-white/10">
        <div className="flex gap-8 overflow-x-auto pb-4">
          {[
            { id: "details", label: "Profile", icon: User },
            { id: "resume", label: "Resume", icon: FileText },
            ...(canViewSalary ? [{ id: "salary", label: "Salary Info", icon: Briefcase }] : []),
            { id: "documents", label: "Documents", icon: FileText },
            { id: "private", label: "Private Info", icon: Lock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 pb-2 px-2 transition-all duration-200 relative ${activeSection === tab.id ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
            >
              <tab.icon size={18} />
              <span className="font-medium whitespace-nowrap">{tab.label}</span>
              {activeSection === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          {/* Details Section */}
          {activeSection === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-blue-400" /> Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                        {isEditing ? (
                          <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-black/20 border border-t-white/10 border-b-white/5 rounded-lg px-3 py-2 text-white" />
                        ) : (<p className="text-slate-300 font-medium">{employee.firstName}</p>)}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                        {isEditing ? (
                          <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-black/20 border border-t-white/10 border-b-white/5 rounded-lg px-3 py-2 text-white" />
                        ) : (<p className="text-slate-300 font-medium">{employee.lastName}</p>)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                      <div className="flex items-center gap-3 text-slate-300"><Mail size={16} />{employee.email}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                      {isEditing ? (
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-black/20 border border-t-white/10 border-b-white/5 rounded-lg px-3 py-2 text-white" />
                      ) : (<div className="flex items-center gap-3 text-slate-300"><Phone size={16} />{employee.phone || "Not set"}</div>)}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                      {isEditing ? (
                        <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-black/20 border border-t-white/10 border-b-white/5 rounded-lg px-3 py-2 text-white" />
                      ) : (<div className="flex items-center gap-3 text-slate-300"><MapPin size={16} />{employee.address || "Not set"}</div>)}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-purple-400" /> About Me
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio</label>
                      {isEditing ? (
                        <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full bg-black/20 border border-t-white/10 border-b-white/5 rounded-lg px-3 py-2 text-white min-h-[80px]" placeholder="Tell us about yourself..." />
                      ) : (<p className="text-slate-300 leading-relaxed">{employee.bio || "No bio yet."}</p>)}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Heart size={12} className="text-pink-500" /> What I love about my job</label>
                      {isEditing ? (
                        <textarea value={formData.jobLove} onChange={(e) => setFormData({ ...formData, jobLove: e.target.value })} className="w-full bg-black/20 border border-t-white/10 border-b-white/5 rounded-lg px-3 py-2 text-white" placeholder="What drives you?" />
                      ) : (<p className="text-slate-300 leading-relaxed">{employee.jobLove || "Nothing specified."}</p>)}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Coffee size={12} className="text-orange-500" /> My Interests & Hobbies</label>
                      {isEditing ? (
                        <textarea value={formData.hobbies} onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })} className="w-full bg-black/20 border border-t-white/10 border-b-white/5 rounded-lg px-3 py-2 text-white" placeholder="What do you do for fun?" />
                      ) : (<p className="text-slate-300 leading-relaxed">{employee.hobbies || "Nothing specified."}</p>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-yellow-400" /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-sm flex items-center gap-2">
                        {skill}
                        {isEditing && <button onClick={() => removeSkill(skill)} className="hover:text-red-400"><X size={12} /></button>}
                      </span>
                    ))}
                    {skills.length === 0 && !isEditing && <p className="text-slate-500 text-sm">No skills listed.</p>}
                  </div>
                  {isEditing && (
                    <form onSubmit={addSkill} className="flex gap-2">
                      <input type="text" value={formData.newSkill} onChange={(e) => setFormData({ ...formData, newSkill: e.target.value })} placeholder="Add a skill" className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                      <button type="submit" className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"><Plus size={16} /></button>
                    </form>
                  )}
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Award size={20} className="text-green-400" /> Certifications
                  </h3>
                  <div className="space-y-2 mb-4">
                    {certifications.map((cert) => (
                      <div key={cert} className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 flex justify-between items-center">
                        <span className="text-green-300 text-sm">{cert}</span>
                        {isEditing && <button onClick={() => removeCertification(cert)} className="text-slate-500 hover:text-red-400"><X size={14} /></button>}
                      </div>
                    ))}
                    {certifications.length === 0 && !isEditing && <p className="text-slate-500 text-sm">No certifications listed.</p>}
                  </div>
                  {isEditing && (
                    <form onSubmit={addCertification} className="flex gap-2">
                      <input type="text" value={formData.newCertification} onChange={(e) => setFormData({ ...formData, newCertification: e.target.value })} placeholder="Add certification" className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                      <button type="submit" className="p-2 bg-green-600 rounded-lg text-white hover:bg-green-700"><Plus size={16} /></button>
                    </form>
                  )}
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><MapPin size={20} className="text-red-400" /> Office Location</h3>
                  <p className="text-slate-300">{employee.address || "Remote / Unspecified"}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* New Salary Section */}
          {activeSection === "salary" && canViewSalary && (
            <motion.div
              key="salary"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="bg-[#0A0A0A] border border-white/20 rounded-2xl p-8 space-y-8 shadow-2xl relative">

                {/* Edit Toggle (Top Right) */}
                <div className="absolute top-6 right-6">
                  {!isEditingSalary ? (
                    <button
                      onClick={() => setIsEditingSalary(true)}
                      className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Save size={16} /> Edit Configuration
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSalarySave}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditingSalary(false)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Header / Wage Inputs */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 inline-block pr-12">
                    Salary Info
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Wage Section */}
                    <div className="space-y-6">
                      <div className="group">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-slate-400 font-medium">Month Wage</label>
                          <span className="text-slate-500 text-sm">/ Month</span>
                        </div>
                        {isEditingSalary ? (
                          <input
                            type="number"
                            value={salaryForm.monthWage}
                            onChange={(e) => setSalaryForm({ ...salaryForm, monthWage: Number(e.target.value) })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        ) : (
                          <p className="text-3xl font-bold text-white border-b border-dashed border-white/10 pb-2">
                            {formatCurrency(salaryForm.monthWage)}
                          </p>
                        )}
                      </div>

                      <div className="group">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-slate-400 font-medium">Yearly wage</label>
                          <span className="text-slate-500 text-sm">/ Yearly</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-300 border-b border-dashed border-white/10 pb-2">
                          {formatCurrency(salaryForm.monthWage * 12)}
                        </p>
                      </div>
                    </div>

                    {/* Working Days / Break Time */}
                    <div className="space-y-8 pt-2">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <label className="text-slate-400">No of working days in a week:</label>
                        {isEditingSalary ? (
                          <input
                            type="number"
                            value={salaryForm.workingDaysPerWeek}
                            onChange={(e) => setSalaryForm({ ...salaryForm, workingDaysPerWeek: Number(e.target.value) })}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-right text-white w-24"
                          />
                        ) : (
                          <span className="text-white font-mono">{salaryForm.workingDaysPerWeek}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <label className="text-slate-400">Break Time:</label>
                        {isEditingSalary ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={salaryForm.breakTimePerDay}
                              onChange={(e) => setSalaryForm({ ...salaryForm, breakTimePerDay: e.target.value })}
                              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-right text-white w-24"
                            />
                            <span className="text-slate-500 text-sm">/hrs</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-white font-mono">{salaryForm.breakTimePerDay}</span>
                            <span className="text-slate-500 text-sm">/hrs</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salary Components Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-300 mb-6">Salary Components</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left Column: Earnings Details */}
                    <div className="space-y-6">
                      <DetailedRow
                        label="Basic Salary"
                        value={breakdown.basic}
                        percent={breakdown.basic / salaryForm.monthWage * 100}
                        displayPercent="50.00 %"
                        subtext="Define Basic salary from company cost compute it based on monthly Wages"
                      />
                      <DetailedRow
                        label="House Rent Allowance"
                        value={breakdown.hra}
                        percent={breakdown.hra / salaryForm.monthWage * 100}
                        displayPercent="25.00 %"
                        subtext="HRA provided to employees 50% of the basic salary"
                      />
                      <DetailedRow
                        label="Standard Allowance"
                        value={breakdown.standardAllowance}
                        percent={breakdown.standardAllowance / salaryForm.monthWage * 100}
                        subtext="A standard allowance is a predetermined, fixed amount"
                      />
                      <DetailedRow
                        label="Performance Bonus"
                        value={breakdown.performanceBonus}
                        percent={breakdown.performanceBonus / salaryForm.monthWage * 100}
                        displayPercent="4.17 %"
                        subtext="Variable amount paid during payroll"
                      />
                      <DetailedRow
                        label="Leave Travel Allowance"
                        value={breakdown.lta}
                        percent={breakdown.lta / salaryForm.monthWage * 100}
                        displayPercent="4.17 %"
                        subtext="LTA is paid by the company to employees to cover their travel expenses"
                      />
                      <DetailedRow
                        label="Fixed Allowance"
                        value={breakdown.fixedAllowance}
                        percent={breakdown.fixedAllowance / salaryForm.monthWage * 100}
                        subtext="Fixed allowance portion of wages is determined after calculating all salary components"
                      />
                    </div>

                    {/* Right Column: Deductions */}
                    <div className="space-y-8">
                      {/* PF Section */}
                      <div>
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                          <h4 className="text-slate-300 font-medium">Provident Fund (PF) Contribution</h4>
                        </div>
                        <div className="space-y-6">
                          <DetailedRow
                            label="Employee"
                            value={breakdown.pfEmployee}
                            percent={12}
                            displayPercent="12.00 %"
                            subtext="PF is calculated based on the basic salary"
                            isDeduction
                          />
                          <DetailedRow
                            label="Employer's"
                            value={breakdown.pfEmployer}
                            percent={12}
                            displayPercent="12.00 %"
                            subtext="PF is calculated based on the basic salary"
                            isDeduction
                          />
                        </div>
                      </div>

                      {/* Tax Section */}
                      <div>
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                          <h4 className="text-slate-300 font-medium">Tax Deductions</h4>
                        </div>
                        <DetailedRow
                          label="Professional Tax"
                          value={breakdown.professionalTax}
                          subtext="Professional Tax deducted from the Gross salary"
                          isDeduction
                        />
                      </div>

                      {/* Net Salary Highlight */}
                      <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-slate-400 text-sm mb-1">Net Take Home Salary</div>
                            <div className="text-slate-500 text-xs">(Gross Earnings - Deductions)</div>
                          </div>
                          <div className="text-4xl font-bold text-emerald-400 tracking-tight">
                            {formatCurrency(breakdown.netSalary)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "resume" && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12 bg-white/5 rounded-3xl border border-white/10"
            >
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Resume Viewer</h3>
              <p className="text-slate-400">Upload or generate your resume here (Coming Soon)</p>
            </motion.div>
          )}

          {activeSection === "documents" && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-white font-bold flex items-center gap-2"><FileText size={18} className="text-indigo-400" /> Official Documents</h4>
                <button className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"><Upload size={14} /> Upload New</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(employee.documents || []).length > 0 ? (
                  employee.documents.map((doc: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300"><FileText size={20} /></div>
                        <div><p className="text-white text-sm font-medium">{doc.name}</p><p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{doc.uploadedAt}</p></div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors"><Send size={16} /></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <FileText size={48} className="mx-auto text-slate-500 mb-4 opacity-20" />
                    <p className="text-slate-400">No documents uploaded yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === "private" && (
            <motion.div
              key="private"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12 bg-white/5 rounded-3xl border border-white/10"
            >
              <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Private Information</h3>
              <p className="text-slate-400">Sensitive personal details, bank info, and tax docs (Restricted Access)</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function Plus({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  )
}

function DetailedRow({ label, value, percent, displayPercent, subtext, isDeduction = false }: { label: string, value?: number, percent?: number, displayPercent?: string, subtext?: string, isDeduction?: boolean }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-300">{label}</span>
          {subtext && <p className="text-[10px] text-slate-500 leading-tight max-w-[300px] mt-0.5">{subtext}</p>}
        </div>
        <div className="flex items-center gap-8">
          <span className={`font-mono font-bold ${isDeduction ? 'text-rose-400' : 'text-emerald-300'}`}>
            {isDeduction ? '-' : ''} {formatCurrency(value || 0)} / month
          </span>
          <span className="text-xs font-mono text-slate-500 w-16 text-right">{displayPercent || (percent ? `${percent.toFixed(2)} %` : "")}</span>
        </div>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
        <div className={`h-full rounded-full ${isDeduction ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`} style={{ width: `${percent || 100}%` }}></div>
      </div>
    </div>
  )
}
