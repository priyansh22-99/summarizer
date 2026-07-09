
import { FileText, MessageSquare, Settings, UploadCloud, LayoutDashboard } from "lucide-react"
import { cn, formatBytes } from "../lib/utils"
import { motion } from "framer-motion"
import { AnimatedSettingsIcon } from "./AnimatedSettingsIcon"

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    storageUsed: number;
}

export function Sidebar({ activeTab, setActiveTab, storageUsed }: SidebarProps) {
    const STORAGE_LIMIT = 1024 * 1024 * 1024; // 1 GB
    const percentage = Math.min((storageUsed / STORAGE_LIMIT) * 100, 100);
    const menuItems = [
        { id: 'upload', label: 'Start Upload', icon: UploadCloud },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'chat', label: 'Assistant', icon: MessageSquare },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    return (
        <div className="w-72 h-screen fixed left-0 top-0 glass-panel border-r border-subtle-border flex flex-col p-6 z-50">
            <div className="flex items-center gap-4 px-2 mb-12">
                <div className="relative group">
                    <div className="absolute inset-0 bg-accent/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500" />
                    <div className="relative p-3 bg-card rounded-xl border border-subtle-border shadow-soft">
                        <FileText className="w-6 h-6 text-accent group-hover:text-primary transition-colors duration-300" />
                    </div>
                </div>
                <div>
                    <h1 className="font-bold text-xl tracking-tight text-primary">DocAgent</h1>
                    <p className="text-[10px] text-accent tracking-widest uppercase font-mono mt-0.5">PRO</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "text-primary bg-accent/5 shadow-soft"
                                    : "text-secondary hover:text-primary hover:bg-surface-hover"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent border-l-2 border-accent"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            {item.id === 'settings' ? (
                                <div className={cn("w-5 h-5 relative z-10", isActive ? "text-accent" : "text-secondary group-hover:text-primary")}>
                                    <AnimatedSettingsIcon isActive={isActive} className="transition-colors duration-300" />
                                </div>
                            ) : (
                                <item.icon className={cn("w-5 h-5 relative z-10 transition-colors duration-300", isActive ? "text-accent" : "text-secondary group-hover:text-primary")} />
                            )}
                            <span className="relative z-10 tracking-wide">{item.label}</span>

                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--accent-glow)]"
                                />
                            )}
                        </button>
                    )
                })}
            </nav>

            <div className="mt-4 pt-4 border-t border-subtle-border space-y-4">

                <div className="relative p-5 glass-card rounded-2xl border border-subtle-border overflow-hidden group hover:border-accent/30 transition-all cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-semibold text-secondary group-hover:text-primary transition-colors">Storage Status</span>
                            <span className="text-xs font-mono text-accent">{Math.round(percentage)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-accent to-indigo-500 rounded-full shadow-soft"
                            />
                        </div>
                        <div className="text-[10px] text-secondary mt-2 flex justify-between">
                            <span>{formatBytes(storageUsed)} Used</span>
                            <span>1 GB Limit</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
