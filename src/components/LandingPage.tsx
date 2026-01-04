import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ShieldCheck, Zap, Mail, Phone, MapPin, Menu, X, Lock } from "lucide-react";

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#050505]/50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
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
            <main className="flex-grow pt-32 pb-20 px-6 bg-[#020202]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 mb-6">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                v2.0 Now Available
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.95] mb-6">
                                Master your <br />
                                <span className="text-gradient-workflow">Workflow.</span>
                            </h1>
                            <p className="text-lg text-gray-500 max-w-sm leading-relaxed mb-8">
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
                                className="group flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl active:scale-95"
                            >
                                Enter Workspace
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>

                        {/* Social Proof & Rating */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-12 pt-8"
                        >
                            <div className="space-y-3">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020202] bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Trusted by 100+ Companies</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex gap-1 text-yellow-500">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-600 font-medium">4.9/5 from Users</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 1, type: "spring" }}
                        className="relative hidden lg:flex items-center justify-center"
                    >
                        {/* Purple Glow behind the card */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/20 blur-[100px] rounded-full"></div>

                        <div className="relative animate-float">
                            <div className="glass-card w-[420px] p-8 rounded-[40px] border border-white/10 relative z-10">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-white font-bold text-xl">Team Velocity</h3>
                                        <p className="text-emerald-500 text-sm font-medium">+12.5% this week</p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-yellow-500 border border-white/5">
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                </div>
                                <div className="flex items-end gap-3 h-40 justify-between px-2">
                                    {[35, 65, 45, 85, 55, 75, 40].map((h, i) => (
                                        <div key={i} className="w-8 bg-white/5 rounded-xl relative group overflow-hidden border border-white/5" style={{ height: `${h}%` }}>
                                            <div className="absolute inset-0 bg-white/[0.08] transition-all duration-500"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Decorative small card behind */}
                            <div className="absolute -top-12 -left-12 w-24 h-24 glass-card rounded-3xl opacity-40 -z-10 flex items-center justify-center text-purple-400">
                                <BarChart3 size={32} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Features Heading */}
                <div id="features" className="max-w-7xl mx-auto mt-48 text-center">
                    <h2 className="text-5xl font-bold text-white mb-6">Everything needed to run your team.</h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-20 leading-relaxed">
                        Powerful features wrapped in a beautiful interface that your team will actually enjoy using.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
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
                    </div>
                </div>

                {/* Contact Us Section */}
                <div id="contact" className="max-w-7xl mx-auto mt-32">
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
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Company Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <textarea
                                    placeholder="Your Message"
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all"
                                >
                                    Send Message
                                </button>
                            </form>
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
                                            <p className="text-gray-400">chauhandhairy3@gmail.com</p>
                                            <p className="text-gray-400">dkc074837@gmail.com</p>
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
                                            <p className="text-gray-400">Suite 100, Morbi, NY 10001</p>
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
                        <div className="glass-card p-12 rounded-3xl border border-white/10">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-white">Privacy Policy</h2>
                                <button
                                    onClick={() => setShowPrivacy(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8 text-gray-300">
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-4">Information We Collect</h3>
                                    <p className="leading-relaxed">
                                        We collect information you provide directly to us, such as when you create an account,
                                        fill out a form, or contact us. This may include your name, email address, phone number,
                                        and professional information related to your employment.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-4">How We Use Your Information</h3>
                                    <p className="leading-relaxed mb-3">
                                        We use information we collect to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Provide, maintain, and improve our services</li>
                                        <li>Process transactions and send related information</li>
                                        <li>Send technical notices and support messages</li>
                                        <li>Respond to your comments, questions, and requests</li>
                                        <li>Monitor and analyze trends and usage</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-4">Data Security</h3>
                                    <p className="leading-relaxed">
                                        We implement appropriate technical and organizational measures to protect your personal
                                        data against unauthorized access, alteration, disclosure, or destruction. All data is encrypted
                                        using industry-standard protocols and stored in secure facilities.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-4">Your Rights</h3>
                                    <p className="leading-relaxed mb-3">
                                        You have the right to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Access and update your personal information</li>
                                        <li>Request deletion of your data</li>
                                        <li>Opt-out of marketing communications</li>
                                        <li>Request a copy of your data</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-4">Contact Us</h3>
                                    <p className="leading-relaxed">
                                        If you have any questions about this Privacy Policy, please contact us at:
                                        privacy@dayflow.com or call +91 9428280245.
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <p className="text-sm text-gray-500">
                                        Last updated: January 3, 2026
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Enhanced Footer */}
            <footer className="border-t border-white/5 py-12">
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
                                <li><a href="#security" className="text-gray-500 hover:text-white text-sm transition-colors">Security</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#about" className="text-gray-500 hover:text-white text-sm transition-colors">About</a></li>
                                <li><a href="#blog" className="text-gray-500 hover:text-white text-sm transition-colors">Blog</a></li>
                                <li><a href="#careers" className="text-gray-500 hover:text-white text-sm transition-colors">Careers</a></li>
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
                                <li><a href="#terms" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</a></li>
                                <li><a href="#cookies" className="text-gray-500 hover:text-white text-sm transition-colors">Cookie Policy</a></li>
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
        <div className="p-8 rounded-[32px] bg-[#0A0A0A] border border-white/[0.05] hover:border-white/10 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
        </div>
    )
}
