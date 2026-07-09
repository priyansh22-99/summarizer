import { useState, useRef, useEffect } from 'react'
import { FileText, MoreVertical, Clock, ArrowUpRight, Sparkles, Trash2, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

import type { Document } from '../types'

interface DashboardProps {
    documents: Document[];
    onDocumentClick: (doc: Document) => void;
    onNewAnalysis: () => void;
    onDeleteDocument: (id: string) => void;
}

export function Dashboard({ documents, onDocumentClick, onNewAnalysis, onDeleteDocument }: DashboardProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-12"
        >
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-subtle-border">
                <div className="space-y-1">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">Dashboard</h2>
                    <p className="text-secondary text-base sm:text-lg font-light">Your intelligence command center.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNewAnalysis}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-accent to-indigo-600 text-white rounded-2xl shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-shadow text-sm font-bold flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4" />
                    New Analysis
                </motion.button>
            </header>

            <section>
                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-6 px-1 opacity-70">Quick Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(documents.length > 0 ? documents.slice(0, 3) : []).map((doc, i) => (
                        <motion.div
                            key={i}
                            variants={item}
                            onClick={() => onDocumentClick(doc)}
                            className="group relative p-6 sm:p-8 glass-panel rounded-[1.5rem] sm:rounded-[2rem] hover:bg-surface-hover transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1">
                                <ArrowUpRight className="w-5 h-5 text-accent" />
                            </div>

                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 bg-card border border-subtle-border rounded-2xl group-hover:border-accent/30 group-hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300">
                                    <FileText className="w-8 h-8 text-secondary group-hover:text-accent transition-colors duration-300" />
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <h3 className="font-bold text-xl text-primary group-hover:text-accent transition-all duration-300 truncate">{doc.title}</h3>
                                <p className="text-sm text-secondary leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity line-clamp-3">
                                    {doc.summary ? doc.summary.substring(0, 100) + "..." : "Analysis pending..."}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-subtle-border flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-secondary/60">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{doc.date}</span>
                                </div>
                                <div className="text-[10px] uppercase tracking-wider font-bold text-accent/80 bg-accent/5 px-3 py-1.5 rounded-full border border-accent/20">AI Generated</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-6 px-1 opacity-70">Recent Uploads</h3>
                <motion.div variants={item} className="glass-panel rounded-[2rem] overflow-hidden divide-y divide-subtle-border relative z-10">
                    {documents.length === 0 ? (
                        <div className="p-12 text-center text-secondary border-2 border-dashed border-subtle-border rounded-[2rem] m-4 bg-card">
                            <FileText className="w-12 h-12 text-secondary/20 mx-auto mb-4" />
                            <p className="font-medium">No documents uploaded yet.</p>
                            <p className="text-sm mt-1 opacity-60">Go to the Upload tab to add files.</p>
                        </div>
                    ) : (
                        documents.map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-6 hover:bg-surface-hover transition-colors cursor-pointer group relative" onClick={() => onDocumentClick(doc)}>
                                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="flex items-center gap-4 sm:gap-6 relative z-10 min-w-0">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-card flex items-center justify-center border border-subtle-border group-hover:border-accent/30 group-hover:shadow-[0_0_15px_var(--accent-glow)] transition-all duration-300 shrink-0">
                                        <span className="text-[10px] sm:text-xs font-mono font-bold text-secondary group-hover:text-accent transition-colors">{doc.type}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-sm sm:text-base text-primary group-hover:text-accent transition-colors truncate">{doc.title}</h4>
                                        <div className="flex items-center gap-2 sm:gap-3 text-xs text-secondary mt-1 font-medium">
                                            <span>{doc.size}</span>
                                            <span className="divider w-1 h-1 rounded-full bg-secondary/20" />
                                            <span className="truncate">{doc.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative" ref={openMenuId === doc.id ? menuRef : null}>
                                    <button
                                        className="lg:opacity-0 group-hover:opacity-100 p-2 sm:p-3 hover:bg-card rounded-xl transition-all text-secondary hover:text-primary relative z-10 transform translate-x-1 lg:translate-x-4 group-hover:translate-x-0 duration-300"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                                        }}
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>

                                    <AnimatePresence>
                                        {openMenuId === doc.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-2xl shadow-xl z-[100] p-2 border border-subtle-border"
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDocumentClick(doc);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-secondary hover:bg-surface-hover hover:text-primary rounded-xl transition-colors"
                                                >
                                                    <Eye className="w-4 h-4 text-accent" />
                                                    View Analysis
                                                </button>
                                                <div className="h-px bg-subtle-border my-1" />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteDocument(doc.id);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete Document
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )))}
                </motion.div>
            </section>
        </motion.div>
    )
}
