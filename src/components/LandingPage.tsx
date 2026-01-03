import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, BarChart3, ShieldCheck, Zap, Mail, Phone, MapPin, Eye, EyeOff, Menu, X, Lock, UserCheck, Check, Star, Globe, Users, Briefcase, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white selection:bg-indigo-500/30">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none"></div>

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#050505]/70 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
                            <span className="text-black font-bold text-xl">D</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">Dayflow</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</a>
                        <a href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</a>
                        <a href="#testimonials" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Testimonials</a>
                        <button
                            onClick={() => setShowPrivacy(!showPrivacy)}
                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Lock size={14} />
                            Privacy
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg hover:shadow-white/20"
                        >
                            Login
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-white p-2"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl absolute w-full"
                    >
                        <div className="px-6 py-6 space-y-4">
                            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white">Features</a>
                            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white">Pricing</a>
                            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white">Testimonials</a>
                            <button
                                onClick={() => {
                                    setShowPrivacy(!showPrivacy);
                                    setMobileMenuOpen(false);
                                }}
                                className="block text-gray-400 hover:text-white"
                            >
                                Privacy Policy
                            </button>
                            <button
                                onClick={() => {
                                    onGetStarted();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full bg-white text-black px-6 py-3 rounded-xl font-bold mt-4"
                            >
                                Login to Workspace
                            </button>
                        </div>
                    </motion.div>
                )}
            </header>

            {/* Hero Section */}
            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[600px]">

                    {/* Left Content */}
                    <div className="space-y-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-6 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                v2.0 Now Available
                            </div>
                            <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tighter leading-[1.1] mb-6">
                                Master your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient">Workflow.</span>
                            </h1>
                            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
                                The premium HRMS for modern teams. Experience seamless payroll, advanced analytics, and effortless attendance tracking.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="flex flex-wrap gap-4"
                        >
                            <button
                                onClick={onGetStarted}
                                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] active:scale-95"
                            >
                                Enter Workspace
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white border border-white/10 hover:bg-white/5 transition-all"
                            >
                                Book Demo
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="flex items-center gap-8 pt-8 border-t border-white/5"
                        >
                            <div>
                                <div className="flex -space-x-2 mb-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-black flex items-center justify-center text-[10px] text-white font-bold">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Trusted by 100+ Companies</p>
                            </div>
                            <div className="h-10 w-px bg-white/10"></div>
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 font-medium">4.9/5 from Users</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Visual - 3D Card Stack */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 1, type: "spring" }}
                        className="relative hidden lg:block h-[600px]"
                    >
                        {/* Abstract decorative elements */}
                        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>

                        {/* Floating UI Cards */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md perspective-1000">
                            <motion.div
                                animate={{ y: [0, -20, 0], rotateX: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                className="glass-card p-6 rounded-3xl border border-white/10 relative z-20 backdrop-blur-xl shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Team Velocity</h3>
                                        <p className="text-green-400 text-sm font-medium">+12.5% this week</p>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                        <Zap className="text-yellow-400" size={20} />
                                    </div>
                                </div>
                                <div className="flex items-end gap-2 h-32 justify-between px-2">
                                    {[40, 60, 45, 90, 75, 85].map((h, i) => (
                                        <div key={i} className="w-8 bg-indigo-500/20 rounded-t-lg relative group overflow-hidden border-t border-indigo-500/30" style={{ height: `${h}%` }}>
                                            <div className="absolute inset-0 bg-indigo-500/40 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Background Cards */}
                            <motion.div
                                animate={{ y: [0, -15, 0], rotate: [-6, -8, -6], x: [-20, -25, -20] }}
                                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                                className="absolute top-10 -left-10 w-72 glass-card p-5 rounded-3xl z-10 opacity-60 scale-95 pointer-events-none bg-black/40 border border-white/5"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><UserCheck size={20} /></div>
                                    <div>
                                        <div className="w-24 h-2 bg-white/20 rounded-full mb-2"></div>
                                        <div className="w-16 h-2 bg-white/10 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-2 bg-white/5 rounded-full"></div>
                                    <div className="w-full h-2 bg-white/5 rounded-full"></div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div id="features" className="py-20 relative">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Everything needed to run your team.</h2>
                        <p className="text-gray-400 text-lg">Powerful features wrapped in a beautiful interface that your team will actually enjoy using.</p>
                    </div>

                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap size={24} />}
                            title="Lightning Fast"
                            desc="Optimized for speed with Edge caching. Every interaction feels instantaneous, no matter where your team is located."
                        />
                        <FeatureCard
                            icon={<ShieldCheck size={24} />}
                            title="Bank-Grade Security"
                            desc="Your data is encrypted at rest and in transit. Role-based access control ensures data privacy at every level."
                        />
                        <FeatureCard
                            icon={<BarChart3 size={24} />}
                            title="Deep Insights"
                            desc="Make data-driven decisions with our advanced analytics suite. Visualize attendance, productivity, and payroll trends."
                        />
                        <FeatureCard
                            icon={<Globe size={24} />}
                            title="Remote Ready"
                            desc="Built for distributed teams. Manage time zones, holidays, and localized compliance effortlessly."
                        />
                        <FeatureCard
                            icon={<Users size={24} />}
                            title="Employee Portal"
                            desc="Empower your team with self-service profiles, leave requests, and document management."
                        />
                        <FeatureCard
                            icon={<Briefcase size={24} />}
                            title="Payroll Automation"
                            desc="Automated calculations for tax, PF, and allowances. One-click payslip generation."
                        />
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="py-20 relative">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing.</h2>
                        <p className="text-gray-400 text-lg">Start free, upgrade as you grow. No hidden fees.</p>
                    </div>

                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                        {/* Starter */}
                        <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all">
                            <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                            <div className="text-4xl font-bold text-white mb-6">₹0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                            <p className="text-gray-400 mb-8 h-12">Perfect for small startups and teams just getting started.</p>
                            <ul className="space-y-4 mb-8">
                                {['Up to 10 Employees', 'Basic Attendance', 'Standard Profiles', 'Community Support'].map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <Check size={16} className="text-emerald-400" /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={onGetStarted}
                                className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/10 transition-colors"
                            >
                                Start Free
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="glass-card p-8 rounded-3xl border border-indigo-500/50 bg-indigo-500/5 hover:border-indigo-500/80 transition-all relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                            <div className="text-4xl font-bold text-white mb-6">₹2,499<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                            <p className="text-gray-400 mb-8 h-12">For growing companies requiring advanced features.</p>
                            <ul className="space-y-4 mb-8">
                                {['Up to 50 Employees', 'Advanced Analytics', 'Payroll Automation', 'Priority Support'].map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <Check size={16} className="text-emerald-400" /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={onGetStarted}
                                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25"
                            >
                                Get Started
                            </button>
                        </div>

                        {/* Enterprise */}
                        <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all">
                            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                            <div className="text-4xl font-bold text-white mb-6">Custom</div>
                            <p className="text-gray-400 mb-8 h-12">Tailored solutions for large organizations.</p>
                            <ul className="space-y-4 mb-8">
                                {['Unlimited Employees', 'Custom Integrations', 'Dedicated Account Manager', 'SLA Guarantee'].map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <Check size={16} className="text-emerald-400" /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/10 transition-colors"
                            >
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>

                {/* Testimonials */}
                <div id="testimonials" className="py-20 relative bg-white/[0.02]">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-4xl font-bold text-white mb-16 text-center">Loved by HR Leaders</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <TestimonialCard
                                quote="Dayflow transformed how we handle attendance. It's incredibly intuitive and the team loves it."
                                name="Sarah Jenkins"
                                role="HR Director, TechFlow"
                            />
                            <TestimonialCard
                                quote="The payroll automation saved us days of work every month. Highly recommended for any growing startup."
                                name="Michael Chen"
                                role="Founder, StartScale"
                            />
                            <TestimonialCard
                                quote="Best-in-class UI/UX. Finally an HR tool that doesn't look like it was built in the 90s."
                                name="Emma Wilson"
                                role="Operations Head, DesignCo"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Us Section */}
                <div id="contact" className="max-w-7xl mx-auto mt-32 mb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Get in Touch</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Have questions? We're here to help. Reach out to our team for support, demos, or partnerships.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="glass-card p-8 rounded-3xl border border-white/10">
                            <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
                            <ContactForm />
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-8">
                            <div className="glass-card p-8 rounded-3xl border border-white/10">
                                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold mb-1">Email</p>
                                            <p className="text-gray-400">dkc074837@gmail.com</p>
                                            <p className="text-gray-400">chauhandhairy3@gmail.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold mb-1">Phone</p>
                                            <p className="text-gray-400">+91 9428280245</p>
                                            <p className="text-gray-400">Mon-Fri 9AM-6PM EST</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold mb-1">Office</p>
                                            <p className="text-gray-400">123 Business Ave</p>
                                            <p className="text-gray-400">Suite 100, MORBI , NY 10001</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-3xl border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-4">Business Hours</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Monday - Friday</span>
                                        <span className="text-white">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Saturday</span>
                                        <span className="text-white">10:00 AM - 2:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Sunday</span>
                                        <span className="text-white">Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Privacy Policy Section */}
                {showPrivacy && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-7xl mx-auto mt-32 mb-20"
                    >
                        <div className="glass-card p-12 rounded-3xl border border-white/10 bg-[#0A0A0A]">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-white">Privacy Policy</h2>
                                <button
                                    onClick={() => setShowPrivacy(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                {/* Privacy Content - Truncated for brevity as requested by user expanding landing page */}
                                <p className="text-gray-300 leading-relaxed">
                                    At Dayflow, we take your privacy seriously. This policy describes how we collect, use, and handle your data.
                                    (Full privacy policy content would go here...)
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Enhanced Footer */}
            <footer className="border-t border-white/5 py-12 bg-black/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
                                    <span className="text-black font-bold text-lg">D</span>
                                </div>
                                <span className="text-white font-bold text-lg">Dayflow</span>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Modern HR management solution for growing teams.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-gray-500 hover:text-white text-sm transition-colors">Features</a></li>
                                <li><a href="#pricing" className="text-gray-500 hover:text-white text-sm transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Security</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">About</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Careers</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => setShowPrivacy(!showPrivacy)}
                                        className="text-gray-500 hover:text-white text-sm transition-colors text-left"
                                    >
                                        Privacy Policy
                                    </button>
                                </li>
                                <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-600 text-sm">© 2026 Dayflow Inc. All rights reserved. Crafted for excellence.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group hover:border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">{icon}</div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-6 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors duration-300 shadow-lg shadow-black/20">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
        </div>
    )
}

function ContactForm() {
    const submitMessage = useMutation(api.contact.submitMessage);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setSubmitting(true);

        try {
            await submitMessage({
                firstName: formData.get('firstName') as string,
                lastName: formData.get('lastName') as string,
                email: formData.get('email') as string,
                company: (formData.get('company') as string) || undefined,
                message: formData.get('message') as string,
            });
            toast.success("Message sent successfully! We'll get back to you soon.");
            (e.target as HTMLFormElement).reset();
        } catch (error: any) {
            toast.error("Failed to send message: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
                type="text"
                name="company"
                placeholder="Company Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {submitting && <Loader2 className="animate-spin" size={18} />}
                {submitting ? "Sending..." : "Send Message"}
            </button>
        </form>
    );
}

function TestimonialCard({ quote, name, role }: { quote: string, name: string, role: string }) {
    return (
        <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/10 hover:border-white/20 transition-all relative">
            <div className="text-indigo-500 text-4xl font-serif absolute top-6 left-6 opacity-30">"</div>
            <p className="text-gray-300 italic mb-6 relative z-10 pt-4 leading-relaxed">
                {quote}
            </p>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm">{name}</h4>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">{role}</p>
                </div>
            </div>
        </div>
    )
}
