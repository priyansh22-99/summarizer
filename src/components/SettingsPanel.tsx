import { Shield, Zap, Database, Trash2, Cpu, Sun, Moon } from 'lucide-react'
import { cn } from '../lib/utils'

export interface AppSettings {
    modelPreference: string;
    autoTranslate: boolean;
    summaryDetail: 'brief' | 'complex' | 'details';
    offlineMode: boolean;
    theme: 'light' | 'dark';
}

interface SettingsProps {
    settings: AppSettings;
    onSettingsChange: (settings: AppSettings) => void;
    onClearHistory: () => void;
    documentCount: number;
}

export function SettingsPanel({ settings, onSettingsChange, onClearHistory, documentCount }: SettingsProps) {

    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        onSettingsChange({ ...settings, [key]: value })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-20 px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="pb-6 border-b border-subtle-border">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-2">Settings</h2>
                <p className="text-secondary text-base lg:text-lg font-light">Configure your AI workspace and display preferences.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* AI Configuration */}
                <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 text-accent mb-2">
                        <Cpu className="w-5 h-5" />
                        <h3 className="font-bold uppercase tracking-wider text-sm">AI Engine</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary">Analysis Complexity</label>
                            <div className="flex bg-card p-1 rounded-xl border border-subtle-border">
                                {(['brief', 'complex', 'details'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => updateSetting('summaryDetail', level)}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                                            settings.summaryDetail === level
                                                ? "bg-accent text-white shadow-soft"
                                                : "text-secondary hover:text-primary"
                                        )}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-secondary italic mt-1 opacity-70">
                                {settings.summaryDetail === 'brief' && "Fast, concise points."}
                                {settings.summaryDetail === 'complex' && "Structural & technical analysis."}
                                {settings.summaryDetail === 'details' && "Deep, comprehensive breakdown."}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Appearance & Behavior */}
                <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 text-accent mb-2">
                        <Zap className="w-5 h-5" />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Interface</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary">Display Harmony</label>
                            <div className="flex bg-card p-1 rounded-xl border border-subtle-border">
                                <button
                                    onClick={() => updateSetting('theme', 'dark')}
                                    className={cn(
                                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                        settings.theme === 'dark' ? "bg-accent text-white shadow-soft" : "text-secondary hover:text-primary"
                                    )}
                                >
                                    <Moon className="w-3.5 h-3.5" /> Dark
                                </button>
                                <button
                                    onClick={() => updateSetting('theme', 'light')}
                                    className={cn(
                                        "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                        settings.theme === 'light' ? "bg-accent text-white shadow-soft" : "text-secondary hover:text-primary"
                                    )}
                                >
                                    <Sun className="w-3.5 h-3.5" /> Light
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-subtle-border">
                            <div className="space-y-0.5">
                                <span className="text-sm font-medium text-primary">Force Offline Mode</span>
                                <p className="text-[11px] text-secondary opacity-70">Skip API calls, use rule-based analysis.</p>
                            </div>
                            <button
                                onClick={() => updateSetting('offlineMode', !settings.offlineMode)}
                                className={cn(
                                    "w-10 h-5 rounded-full relative transition-colors duration-300",
                                    settings.offlineMode ? "bg-accent" : "bg-card border border-subtle-border"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm",
                                    settings.offlineMode ? "left-6" : "left-0.5"
                                )} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Data Management */}
                <section className="glass-panel rounded-3xl p-6 sm:p-8 lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 text-rose-500 mb-2">
                        <Database className="w-5 h-5" />
                        <h3 className="font-bold uppercase tracking-wider text-sm text-primary">Data & Privacy</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 sm:p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-4">
                            <div className="flex items-center gap-3 text-rose-500">
                                <Trash2 className="w-5 h-5" />
                                <span className="font-bold">Clear All Data</span>
                            </div>
                            <p className="text-sm text-secondary opacity-80">
                                This will permanently delete all {documentCount} analyzed documents and reset your history.
                            </p>
                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
                                        onClearHistory()
                                    }
                                }}
                                className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                            >
                                Clear Analysis History
                            </button>
                        </div>

                        <div className="p-5 sm:p-6 bg-accent/5 border border-accent/10 rounded-2xl space-y-4 flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-accent">
                                <Shield className="w-5 h-5" />
                                <span className="font-bold">Security Status</span>
                            </div>
                            <ul className="text-xs text-secondary opacity-80 space-y-2 list-disc pl-4">
                                <li>All preferences are stored only in your browser (LocalStorage).</li>
                                <li>Documents are analyzed in-memory and not stored on any server.</li>
                                <li>TLS 1.3 Encryption active for all AI requests.</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
