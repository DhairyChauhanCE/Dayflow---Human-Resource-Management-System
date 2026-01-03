import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
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
                    <button
                        onClick={onGetStarted}
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Login
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Left Content */}
                    <div className="space-y-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-6">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                v2.0 Now Available
                            </div>
                            <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tighter leading-[1.1] mb-6">
                                Master your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">Workflow.</span>
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
                                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] active:scale-95"
                            >
                                Enter Workspace
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="flex items-center gap-8 pt-8 border-t border-white/5"
                        >
                            <div>
                                <p className="text-3xl font-bold text-white">100+</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Companies</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">99.9%</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Uptime</p>
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
                        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

                        {/* Floating UI Cards */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                className="glass-card p-6 rounded-3xl border border-white/10 relative z-20"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Real-time Analytics</h3>
                                        <p className="text-gray-500 text-sm">Team Performance</p>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-lg">
                                        <BarChart3 className="text-white" />
                                    </div>
                                </div>
                                <div className="flex items-end gap-2 h-32 justify-between px-2">
                                    {[40, 70, 50, 90, 60, 80].map((h, i) => (
                                        <div key={i} className="w-8 bg-white/10 rounded-t-lg relative group overflow-hidden" style={{ height: `${h}%` }}>
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Background Cards */}
                            <motion.div
                                animate={{ y: [0, -15, 0], rotate: [-5, -7, -5] }}
                                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                                className="absolute top-10 -left-20 w-64 glass-card p-5 rounded-3xl z-10 opacity-60 scale-90 pointer-events-none"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20"></div>
                                    <div className="space-y-2">
                                        <div className="w-24 h-2 bg-white/20 rounded-full"></div>
                                        <div className="w-16 h-2 bg-white/10 rounded-full"></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Zap size={24} />}
                        title="Lightning Fast"
                        desc="Optimized for speed. Every interaction feels instantaneous."
                    />
                    <FeatureCard
                        icon={<ShieldCheck size={24} />}
                        title="Bank-Grade Security"
                        desc="Your data is encrypted and protected by enterprise standards."
                    />
                    <FeatureCard
                        icon={<BarChart3 size={24} />}
                        title="Deep Insights"
                        desc="Make data-driven decisions with our advanced analytics suite."
                    />
                </div>
            </main>

            {/* Simplified Footer */}
            <footer className="border-t border-white/5 py-10 text-center">
                <p className="text-gray-600 text-sm">© 2026 Dayflow Inc. Crafted for excellence.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </div>
    )
}
