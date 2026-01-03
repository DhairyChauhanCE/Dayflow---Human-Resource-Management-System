import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Phone, MapPin, User, Briefcase, Calendar,
    MessageSquare, Send, CreditCard, FileText, Camera,
    Upload, Trash2, ShieldCheck, Plus, X, Pencil, Check, GripVertical
} from "lucide-react";

import { SalaryConfiguration } from "./SalaryConfiguration";

interface ProfileViewProps {
    employee: any;
    isAdminView?: boolean;
}

export function ProfileView({ employee, isAdminView }: ProfileViewProps) {
    const latestPayroll = useQuery(api.payroll.getLatestPayrollForEmployee, { employeeId: employee._id });
    const updateEmployee = useMutation(api.employees.updateEmployee);

    const [activeTab, setActiveTab] = useState<"private" | "salary" | "resume">("private");
    const [editingSection, setEditingSection] = useState<string | null>(null);

    // Form states for various sections
    const [basicInfo, setBasicInfo] = useState({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone || "",
        email: employee.email,
        location: employee.location || "",
    });

    const [aboutInfo, setAboutInfo] = useState({
        about: employee.about || "",
        whatILove: employee.whatILove || "",
        hobbies: employee.hobbies || "",
    });

    const [skills, setSkills] = useState<string[]>(employee.skills || []);
    const [certifications, setCertifications] = useState<string[]>(employee.certifications || []);

    const [newSkill, setNewSkill] = useState("");
    const [newCert, setNewCert] = useState("");

    const handleUpdate = async (field: string, value: any) => {
        try {
            await updateEmployee({
                employeeId: employee._id,
                [field]: value
            });
            toast.success("Updated successfully");
            setEditingSection(null);
        } catch (error: any) {
            toast.error("Failed to update: " + error.message);
        }
    };

    const handleAddSkill = async () => {
        if (!newSkill.trim()) return;
        const updatedSkills = [...skills, newSkill.trim()];
        setSkills(updatedSkills);
        await handleUpdate("skills", updatedSkills);
        setNewSkill("");
    };

    const handleRemoveSkill = async (index: number) => {
        const updatedSkills = skills.filter((_, i) => i !== index);
        setSkills(updatedSkills);
        await handleUpdate("skills", updatedSkills);
    };

    const handleAddCert = async () => {
        if (!newCert.trim()) return;
        const updatedCerts = [...certifications, newCert.trim()];
        setCertifications(updatedCerts);
        await handleUpdate("certifications", updatedCerts);
        setNewCert("");
    };

    const handleRemoveCert = async (index: number) => {
        const updatedCerts = certifications.filter((_, i) => i !== index);
        setCertifications(updatedCerts);
        await handleUpdate("certifications", updatedCerts);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <div className="relative">
                <h2 className="text-2xl text-slate-200 mb-6 font-medium italic opacity-80 tracking-wide border-b border-white/10 pb-2">
                    My Profile
                </h2>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* Profile Photo */}
                    <div className="relative group shrink-0">
                        <div className="w-48 h-48 rounded-full bg-[#3d2c2e] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                            {employee.profilePicture ? (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                    <User size={80} className="text-white/20" />
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Pencil size={32} className="text-white/10 rotate-12" />
                                    </div>
                                </div>
                            )}
                        </div>
                        {(isAdminView || true) && ( // Allow user to edit their own photo
                            <label className="absolute bottom-2 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full cursor-pointer transition-all backdrop-blur-md border border-white/10">
                                <Camera size={20} className="text-slate-300" />
                                <input type="file" className="hidden" accept="image/*" />
                            </label>
                        )}
                    </div>

                    {/* Basic Info & Company Info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                        {/* Left Column: Personal Identifiers */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-5xl text-white mb-2 pb-2 border-b-2 border-slate-500/50 inline-block min-w-[300px]">
                                    {employee.firstName} {employee.lastName}
                                </h1>
                            </div>

                            <div className="space-y-4 pt-2">
                                <InfoRow label="Login ID" value={employee.employeeId} />
                                <InfoRow label="Email" value={employee.email} />
                                <EditableInfoRow
                                    label="Mobile"
                                    value={basicInfo.phone}
                                    isEditing={editingSection === "basic"}
                                    onChange={(val) => setBasicInfo({ ...basicInfo, phone: val })}
                                    onEdit={() => setEditingSection("basic")}
                                    onSave={() => handleUpdate("phone", basicInfo.phone)}
                                    onCancel={() => {
                                        setBasicInfo({ ...basicInfo, phone: employee.phone || "" });
                                        setEditingSection(null);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right Column: Company Info */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm text-slate-400 mb-4 ml-1">Company</h3>
                            <div className="space-y-4 border-l-2 border-white/5 pl-6">
                                <InfoRow label="Company" value="Dayflow Inc." />
                                <InfoRow label="Department" value={employee.department} />
                                <InfoRow label="Manager" value={employee.position === "CEO" ? "Board" : "Reports to Manager"} />
                                <EditableInfoRow
                                    label="Location"
                                    value={basicInfo.location}
                                    isEditing={editingSection === "location"}
                                    onChange={(val) => setBasicInfo({ ...basicInfo, location: val })}
                                    onEdit={() => setEditingSection("location")}
                                    onSave={() => handleUpdate("location", basicInfo.location)}
                                    onCancel={() => {
                                        setBasicInfo({ ...basicInfo, location: employee.location || "" });
                                        setEditingSection(null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-end gap-1 border-b border-white/20 pt-8">
                <TabButton
                    active={activeTab === "private"}
                    onClick={() => setActiveTab("private")}
                    label="Private Info"
                />
                <TabButton
                    active={activeTab === "salary"}
                    onClick={() => setActiveTab("salary")}
                    label="Salary Info"
                />
                <TabButton
                    active={activeTab === "resume"}
                    onClick={() => setActiveTab("resume")}
                    label="Resume"
                />
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
                {/* Left Column: About/Interests */}
                <div className="space-y-8">
                    <EditableTextArea
                        title="About"
                        value={aboutInfo.about}
                        placeholder="Lorem Ipsum is simply dummy text..."
                        onSave={(val) => handleUpdate("about", val)}
                    />
                    <EditableTextArea
                        title="What I love about my job"
                        value={aboutInfo.whatILove}
                        placeholder="Lorem Ipsum is simply dummy text..."
                        onSave={(val) => handleUpdate("whatILove", val)}
                    />
                    <EditableTextArea
                        title="My interests and hobbies"
                        value={aboutInfo.hobbies}
                        placeholder="Lorem Ipsum is simply dummy text..."
                        onSave={(val) => handleUpdate("hobbies", val)}
                    />
                </div>

                {/* Right Column: Dynamic Content based on Tabs or Sidebar */}
                {/* Note: The design implies these sections might be visible always or part of tabs.
             Given the design, Skills and Certifications seem to be persistent sidebars or part of the view.
             I will place them in the right column. The "Tabs" might toggle what's shown ABOVE or BELOW.
             Actually, let's honor the tabs for the "Salary/Resume/Private" part, but keeping Skills always visible 
             might potentially clutter. 
             Looking at the design again, "Resume | Private Info | Salary Info" looks like a tab bar for a specific section.
             The "About", "What I love", "Interests" are in a box on the left.
             "Skills" and "Certification" are boxed on the right.
             
             Wait, looking at the image trace:
             The Tabs seem to control a specific area. But the About/Skills seem to be below the tabs line?
             Let's assume the Tabs toggle a middle section, OR the bottom area is "Private Info".
             However, typically "About" IS public info. "Salary" is private.
             
             Decision: 
             Top: Header
             Middle: Tabs (Private, Salary, Resume) -> These text content goes here.
             Bottom Left: About Sections
             Bottom Right: Skills & Certifications
         */}

                <div className="space-y-8">
                    {/* Tab Content Display - Only showing relevant if selected, 
                 but for layout purposes, I'll put the Tab Content here or in a separate row?
                 The design shows "About" and "Skills" taking up a lot of space.
                 Let's put the Tab content (Salary/Private details) in a container *above* the About/Skills columns
                 or make this Right Column contain the Skills, and the Tab Content appears in a modal or expandable area?
                 
                 Let's go with: Tab Content appears *between* Header and the 2-col layout.
             */}
                </div>
            </div>

            {/* Tab Content Area (Inserted between Header and Bottom Columns) */}
            <AnimatePresence mode="wait">
                {activeTab === "salary" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8"
                    >
                        {isAdminView ? (
                            <SalaryConfiguration employeeId={employee._id} currentPayroll={latestPayroll} />
                        ) : (
                            <SalaryView latestPayroll={latestPayroll} />
                        )}
                    </motion.div>
                )}
                {activeTab === "private" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8"
                    >
                        <PrivateInfoView employee={employee} />
                    </motion.div>
                )}
                {activeTab === "resume" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8"
                    >
                        <DocumentsView employee={employee} isAdminView={isAdminView} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <EditableTextArea
                        title="About"
                        value={aboutInfo.about}
                        placeholder="Tell us about yourself..."
                        onSave={(val) => handleUpdate("about", val)}
                    />
                    <EditableTextArea
                        title="What I love about my job"
                        value={aboutInfo.whatILove}
                        placeholder="What drives you?"
                        onSave={(val) => handleUpdate("whatILove", val)}
                    />
                    <EditableTextArea
                        title="My interests and hobbies"
                        value={aboutInfo.hobbies}
                        placeholder="What do you do for fun?"
                        onSave={(val) => handleUpdate("hobbies", val)}
                    />
                </div>
                <div className="space-y-6">
                    <ListSection
                        title="Skills"
                        items={skills}
                        onAdd={handleAddSkill}
                        onRemove={handleRemoveSkill}
                        newItem={newSkill}
                        setNewItem={setNewSkill}
                        placeholder="Add a skill (e.g. React)"
                    />
                    <ListSection
                        title="Certification"
                        items={certifications}
                        onAdd={handleAddCert}
                        onRemove={handleRemoveCert}
                        newItem={newCert}
                        setNewItem={setNewCert}
                        placeholder="Add certification (e.g. AWS)"
                    />
                </div>
            </div>

        </div>
    );
}

/* --- Sub Components --- */

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="group border-b border-white/10 pb-1">
            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
            <p className="text-lg text-slate-200">{value}</p>
        </div>
    )
}

function EditableInfoRow({ label, value, isEditing, onChange, onEdit, onSave, onCancel }: any) {
    return (
        <div className="group border-b border-white/10 pb-1">
            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                        className="bg-transparent border-b border-indigo-500 w-full text-lg text-white focus:outline-none"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        autoFocus
                    />
                    <button onClick={onSave}><Check size={16} className="text-green-400" /></button>
                    <button onClick={onCancel}><X size={16} className="text-rose-400" /></button>
                </div>
            ) : (
                <div className="flex justify-between items-center cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition-colors" onClick={onEdit}>
                    <p className="text-lg text-slate-200 font-handwriting">{value || "Not set"}</p>
                    <Pencil size={12} className="opacity-0 group-hover:opacity-50 text-slate-400" />
                </div>
            )}
        </div>
    )
}

function TabButton({ active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 text-lg font-handwriting transition-all relative border-t border-x border-transparent rounded-t-lg
                ${active ? "bg-white/5 border-white/10 text-white translate-y-[1px]" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}
            `}
        >
            {label}
            {active && <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[#050505]" />}
            {/* The bg-[#050505] matches main bg to "hide" the border bottom */}
        </button>
    )
}

function EditableTextArea({ title, value, placeholder, onSave }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    // Update local state when prop changes (for initial load)
    if (!isEditing && localValue !== value) {
        setLocalValue(value);
    }

    return (
        <div className="border border-white/30 rounded-lg p-5 relative group">
            <h3 className="absolute -top-3 left-4 bg-[#050505] px-2 text-xl font-handwriting text-slate-200">
                {title}
            </h3>

            {isEditing ? (
                <div className="mt-2">
                    <textarea
                        className="w-full bg-white/5 rounded p-3 text-slate-300 font-handwriting text-lg focus:outline-none focus:ring-1 focus:ring-white/30 resize-none min-h-[120px]"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setLocalValue(value);
                            }}
                            className="px-3 py-1 text-sm text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onSave(localValue);
                                setIsEditing(false);
                            }}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm text-white"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className="mt-2 min-h-[100px] cursor-pointer hover:bg-white/5 p-2 -m-2 rounded transition-colors"
                    onClick={() => setIsEditing(true)}
                >
                    <p className="text-slate-400 font-handwriting text-lg leading-relaxed whitespace-pre-wrap">
                        {value || placeholder}
                    </p>
                </div>
            )}
        </div>
    )
}

function ListSection({ title, items, onAdd, onRemove, newItem, setNewItem, placeholder }: any) {
    return (
        <div className="border border-white/30 rounded-lg p-5 relative min-h-[200px] flex flex-col">
            <h3 className="absolute -top-3 left-4 bg-[#050505] px-2 text-xl font-handwriting text-slate-200">
                {title}
            </h3>

            <div className="flex-1 mt-2 space-y-2">
                {items.length > 0 ? (
                    items.map((item: string, idx: number) => (
                        <div key={idx} className="flex justify-between items-center group border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 px-2 rounded">
                            <span className="text-slate-300 font-handwriting text-lg">{item}</span>
                            <button
                                onClick={() => onRemove(idx)}
                                className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-600 font-handwriting italic p-2">No items yet.</p>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        className="bg-transparent border-b border-white/20 w-full text-slate-300 font-handwriting focus:outline-none focus:border-indigo-500 px-2 py-1"
                        placeholder={placeholder}
                        value={newItem}
                        onChange={(e: any) => setNewItem(e.target.value)}
                        onKeyDown={(e: any) => e.key === "Enter" && onAdd()}
                    />
                    <button
                        onClick={onAdd}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-handwriting">+ Add {title}</p>
            </div>
        </div>
    )
}

function SalaryView({ latestPayroll }: any) {
    if (!latestPayroll) return <div className="text-slate-400 italic">No payroll data available.</div>;

    const b = latestPayroll.breakdown || {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans">
            <div>
                <h4 className="text-lg text-emerald-400 mb-4 border-b border-white/10 pb-2 font-medium">Earnings</h4>
                <div className="space-y-3">
                    <SalaryRow label="Basic Salary" value={b.basic || latestPayroll.baseSalary} />
                    <SalaryRow label="House Rent Allowance" value={b.hra} />
                    {b.standardAllowance > 0 && <SalaryRow label="Standard Allowance" value={b.standardAllowance} />}
                    {b.performanceBonus > 0 && <SalaryRow label="Performance Bonus" value={b.performanceBonus} />}
                    {b.lta > 0 && <SalaryRow label="Leave Travel Allowance" value={b.lta} />}
                    {b.fixedAllowance > 0 && <SalaryRow label="Fixed Allowance" value={b.fixedAllowance} />}
                    {b.special > 0 && <SalaryRow label="Special Allowance" value={b.special} />}
                    {b.conveyance > 0 && <SalaryRow label="Conveyance" value={b.conveyance} />}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-slate-300">Gross Earnings</span>
                    <span className="text-white font-bold">₹{latestPayroll.baseSalary?.toLocaleString()}</span>
                </div>
            </div>
            <div>
                <h4 className="text-lg text-rose-400 mb-4 border-b border-white/10 pb-2 font-medium">Deductions</h4>
                <div className="space-y-3">
                    {b.pfEmployee > 0 && <SalaryRow label="PF (Employee)" value={b.pfEmployee} isDeduction />}
                    {b.tax > 0 && <SalaryRow label="Professional Tax" value={b.tax} isDeduction />}
                    {/* Fallback if breakdown not fully populated */}
                    {(!b.pfEmployee && !b.tax) && (
                        <SalaryRow label="Total Deductions" value={latestPayroll.deductions} isDeduction />
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-slate-300">Total Deductions</span>
                    <span className="text-rose-300 font-bold">-₹{latestPayroll.deductions?.toLocaleString()}</span>
                </div>
            </div>
            <div className="md:col-span-2 pt-6 border-t border-white/20 flex justify-between items-center">
                <div>
                    <span className="text-xl text-white block">Net Salary</span>
                    <span className="text-xs text-slate-500">Take home pay</span>
                </div>
                <span className="text-3xl text-emerald-400 font-bold">₹{latestPayroll.netSalary?.toLocaleString()}</span>
            </div>
        </div>
    )
}

function SalaryRow({ label, value, isDeduction }: any) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center text-sm group">
            <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{label}</span>
            <span className={`font-mono ${isDeduction ? 'text-rose-300' : 'text-slate-200'}`}>
                {isDeduction ? '-' : ''}₹{value.toLocaleString()}
            </span>
        </div>
    )
}

function PrivateInfoView({ employee }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-handwriting">
            <InfoRow label="Personal Email" value={employee.email} />
            <InfoRow label="Phone Number" value={employee.phone || "Not set"} />
            <div className="md:col-span-2">
                <InfoRow label="Home Address" value={employee.address || "Not set"} />
            </div>
            <InfoRow label="Hire Date" value={employee.hireDate} />
            <InfoRow label="Status" value={employee.status?.toUpperCase()} />
        </div>
    )
}

function DocumentsView({ employee, isAdminView }: any) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-white font-handwriting text-lg">My Documents</h4>
                <button className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-all">
                    <Upload size={14} /> Upload
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(employee.documents || []).length > 0 ? (
                    employee.documents.map((doc: any, i: number) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3 group">
                            <FileText className="text-indigo-400" />
                            <div className="overflow-hidden">
                                <p className="text-sm text-white truncate font-handwriting">{doc.name}</p>
                                <p className="text-xs text-slate-500">{doc.uploadedAt}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-8 text-slate-500 font-handwriting italic">
                        No documents found.
                    </div>
                )}
            </div>
        </div>
    )
}
