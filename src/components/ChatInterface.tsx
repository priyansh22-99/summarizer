import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Paperclip, Sparkles, MoreHorizontal, Loader2, Zap, FileSearch, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { chatWithGemini } from '../lib/gemini'
import type { Document } from '../types'

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
}

interface ChatInterfaceProps {
    documents: Document[];
}

export function ChatInterface({ documents }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'bot', content: 'Hello! I can help you understand your documents. Upload a file or ask me a question about your recent summaries.' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const quickPrompts = [
        { label: 'Summarize Document', icon: <Zap className="w-3.5 h-3.5 text-amber-500" />, text: 'Can you provide a concise summary of my uploaded documents?' },
        { label: 'Key Details', icon: <FileSearch className="w-3.5 h-3.5 text-blue-500" />, text: 'What are the three most important points or findings in these files?' },
        { label: 'Extract Info', icon: <Zap className="w-3.5 h-3.5 text-emerald-500" />, text: 'Extract any dates, names, or locations mentioned in the text.' },
        { label: 'Simplify Text', icon: <HelpCircle className="w-3.5 h-3.5 text-purple-500" />, text: 'Explain the main concepts here as if I were a beginner.' },
    ]

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || isTyping) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend }
        const newMessages = [...messages, userMsg];

        setMessages(newMessages)
        setInput('')
        setIsTyping(true)

        try {
            const botResponse = await chatWithGemini(
                newMessages.map(m => ({ role: m.role, content: m.content })),
                documents
            );

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: botResponse
            }
            setMessages(prev => [...prev, botMsg])
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: "I'm sorry, I encountered an error while trying to process your request."
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] max-w-5xl mx-auto glass-panel rounded-t-[2rem] lg:rounded-[32px] overflow-hidden relative"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />

            <header className="relative z-10 p-4 lg:p-6 border-b border-subtle-border flex items-center justify-between bg-surface-hover backdrop-blur-md">
                <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-tr from-accent to-indigo-600 p-[1px] shadow-lg shadow-accent/20">
                        <div className="w-full h-full bg-surface rounded-xl lg:rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-accent animate-pulse-slow" />
                        </div>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg lg:text-xl text-primary tracking-tight">Intelligence Assistant</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", documents.length > 0 ? "bg-emerald-500" : "bg-amber-500")} />
                            <p className="text-[10px] lg:text-xs text-secondary font-bold uppercase tracking-wide">
                                {documents.length > 0 ? `${documents.length} Docs in Context` : "No Docs Uploaded"}
                            </p>
                        </div>
                    </div>
                </div>
                <button className="hidden sm:block p-2 hover:bg-card rounded-full text-secondary hover:text-primary transition-colors">
                    <MoreHorizontal className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-8 relative z-10 scroll-smooth custom-scrollbar">
                {messages.length === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 max-w-2xl mx-auto mt-6 lg:mt-12 mb-8"
                    >
                        {quickPrompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(prompt.text)}
                                disabled={documents.length === 0}
                                className="flex items-center gap-3 p-4 bg-card hover:bg-surface-hover border border-subtle-border rounded-2xl text-left transition-all hover:scale-[1.02] hover:border-accent/40 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <div className="p-2 bg-surface rounded-xl border border-subtle-border group-hover:border-accent/20 transition-colors">
                                    {prompt.icon}
                                </div>
                                <span className="text-sm font-bold text-primary opacity-80 group-hover:opacity-100">{prompt.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}

                {messages.map((msg, idx) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className={cn("flex gap-3 lg:gap-5 max-w-[90%] lg:max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}
                    >
                        <div className={cn(
                            "w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shrink-0 shadow-soft border border-subtle-border",
                            msg.role === 'bot'
                                ? "bg-gradient-to-tr from-accent to-indigo-600 text-white"
                                : "bg-card text-secondary"
                        )}>
                            {msg.role === 'bot' ? <Bot className="w-4 h-4 lg:w-5 lg:h-5" /> : <User className="w-4 h-4 lg:w-5 lg:h-5" />}
                        </div>
                        <div className={cn(
                            "p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] text-sm lg:text-[15px] leading-relaxed shadow-soft backdrop-blur-md border transition-all",
                            msg.role === 'bot'
                                ? "bg-surface-hover border-subtle-border text-primary rounded-tl-sm"
                                : "bg-gradient-to-br from-accent to-indigo-600 border-accent/20 text-white rounded-tr-sm shadow-accent/20"
                        )}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="flex gap-5"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-card border border-subtle-border px-6 py-4 rounded-[2rem] rounded-tl-sm flex gap-1.5 items-center">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="w-2 h-2 bg-accent rounded-full"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                    className="w-2 h-2 bg-accent rounded-full"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                    className="w-2 h-2 bg-accent rounded-full"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 lg:p-6 bg-surface-hover border-t border-subtle-border backdrop-blur-md relative z-10 pb-safe">
                <div className="relative flex items-center max-w-4xl mx-auto group">
                    <div className="absolute inset-0 bg-accent/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <button className="absolute left-3 lg:left-4 p-2 hover:bg-card rounded-xl text-secondary transition-colors group-focus-within:text-accent">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={documents.length > 0 ? "Ask anything..." : "Upload to chat..."}
                        className="w-full bg-card border border-subtle-border rounded-full lg:rounded-[2rem] py-4 lg:py-5 pl-12 lg:pl-14 pr-14 lg:pr-16 text-sm focus:outline-none focus:border-accent/40 focus:bg-surface-hover transition-all placeholder:text-secondary/50 text-primary shadow-inner"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 lg:right-3 p-2.5 lg:p-3 bg-gradient-to-r from-accent to-indigo-600 shadow-lg shadow-accent/20 hover:shadow-accent/40 text-white rounded-full lg:rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}
