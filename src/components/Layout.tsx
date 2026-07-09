import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";
import { LayoutDashboard, UploadCloud, MessageSquare, Settings } from "lucide-react";
import { cn } from "../lib/utils";

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    storageUsed: number;
}

export function Layout({ children, activeTab, setActiveTab, storageUsed }: LayoutProps) {

    const navItems = [
        { id: 'upload', icon: UploadCloud, label: 'Upload' },
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
        { id: 'chat', icon: MessageSquare, label: 'Chat' },
        { id: 'settings', icon: Settings, label: 'Menu' },
    ];

    return (
        <div className="flex min-h-screen bg-background text-primary font-sans antialiased overflow-x-hidden selection:bg-accent/30 selection:text-accent">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} storageUsed={storageUsed} />
            </div>

            {/* Mobile Header / Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-subtle-border z-[60] px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                        <UploadCloud className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">DocAgent</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-6 w-px bg-subtle-border" />
                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase">Pro</span>
                </div>
            </div>

            <main className="flex-1 lg:ml-72 min-h-screen relative flex flex-col pt-16 lg:pt-0">
                {/* Cinematic Ambient Light */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    <div
                        className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] opacity-40 dark:opacity-100 animate-pulse-slow"
                        style={{ mixBlendMode: 'var(--ambient-blend)' as any }}
                    />
                    <div
                        className="absolute bottom-[-20%] left-[5%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] opacity-20 dark:opacity-100"
                        style={{ mixBlendMode: 'var(--ambient-blend)' as any }}
                    />
                </div>

                <div className="relative z-10 p-4 lg:p-10 max-w-7xl mx-auto w-full flex-1 mb-20 lg:mb-0">
                    {children}
                </div>
            </main>

            {/* Apple-style Bottom Tab Bar (Mobile Only) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-2xl border-t border-subtle-border z-[60] pb-safe">
                <div className="grid grid-cols-4 h-full max-w-md mx-auto px-2">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className="flex flex-col items-center justify-center gap-1.5 relative group"
                            >
                                <div className={cn(
                                    "p-2 rounded-2xl transition-all duration-300",
                                    isActive ? "bg-accent/10 text-accent scale-110 shadow-[0_0_20px_var(--accent-glow)]" : "text-secondary opacity-60"
                                )}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold tracking-tight transition-all duration-300",
                                    isActive ? "text-accent" : "text-secondary opacity-40"
                                )}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="mobileNav"
                                        className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-full"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    )
}
