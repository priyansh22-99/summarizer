import { useState, useCallback, useEffect } from 'react'
import { UploadCloud, FileText, X, CheckCircle, Loader2, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatBytes } from '../lib/utils'
import { TranslationPanel } from './TranslationPanel'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import type { Document } from '../types'

interface FileUploadProps {
    onDocumentUploaded: (doc: Document) => void;
    onTranslationUpdate?: (translation: { lang: string, text: string } | null) => void;
    selectedDocument?: Document | null;
}

export function FileUpload({ onDocumentUploaded, onTranslationUpdate, selectedDocument }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(selectedDocument ? { name: selectedDocument.title, size: 0 } as any : null)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>(selectedDocument ? 'done' : 'idle')
    const [summary, setSummary] = useState<string | null>(selectedDocument?.summary || null)
    const [fullContent, setFullContent] = useState<string | null>(selectedDocument?.content || null)
    const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary')
    const [translationData, setTranslationData] = useState<{ lang: string, text: string } | null>(selectedDocument?.translation || null)

    // Update if selected document changes
    useEffect(() => {
        if (selectedDocument) {
            setFile({ name: selectedDocument.title, size: 0 } as any);
            setUploadStatus('done');
            setSummary(selectedDocument.summary);
            setFullContent(selectedDocument.content || null);
            setTranslationData(selectedDocument.translation || null);
        }
    }, [selectedDocument]);


    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }, [])

    const handleFile = (file: File) => {
        setFile(file)
    }

    // Trigger upload when file is set
    useEffect(() => {
        if (file && uploadStatus === 'idle') {
            handleUpload();
        }
    }, [file]);

    const handleUpload = async () => {
        if (!file) return;

        setUploadStatus('uploading');
        setUploadStatus('processing');

        try {
            let textContent = "";

            if (file.type === "text/plain") {
                textContent = await file.text();
            } else if (file.type === "application/pdf") {
                try {
                    const pdfjsLib = await import('pdfjs-dist');
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    let fullText = "";

                    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => item.str).join(' ');
                        fullText += pageText + "\n";
                    }
                    textContent = fullText;
                } catch (e) {
                    console.error("PDF Parsing failed", e);
                    textContent = `This is a document named "${file.name}". I cannot extract the text directly. Please generate a summary based on what a document with this title might generally contain in a business context.`;
                }
            } else {
                textContent = `This is a document named "${file.name}". Please generate a summary based on what a document with this title might generally contain in a business context.`;
            }

            const { generateSummaryStream } = await import('../lib/gemini');
            const generatedSummary = await generateSummaryStream(textContent, (chunk) => {
                setSummary(chunk);
            });

            setSummary(generatedSummary);
            setFullContent(textContent);
            setUploadStatus('done');

            const newDoc: Document = {
                id: Math.random().toString(36).substr(2, 9),
                title: file.name,
                date: "Just now",
                size: formatBytes(file.size),
                type: file.name.split('.').pop()?.toUpperCase() || "DOC",
                summary: generatedSummary,
                content: textContent
            };
            onDocumentUploaded(newDoc);

        } catch (error) {
            console.error("Upload/Processing Error:", error);
            setUploadStatus('idle');
            setSummary(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    const clearFile = () => {
        setFile(null)
        setUploadStatus('idle')
        setSummary(null)
        setFullContent(null)
        setViewMode('summary')
        setTranslationData(null)
    }

    const handleDownload = () => {
        if (!summary || !file) return;
        let content = viewMode === 'summary' ? summary : (fullContent || "");
        if (viewMode === 'summary' && translationData) {
            content += `\n\n---\n\n## Translation (${translationData.lang})\n\n${translationData.text}`;
        }
        const fileName = `${file.name.split('.')[0]}_${viewMode}${translationData ? '_translated' : ''}.md`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const handleTranslationChange = (data: { lang: string, text: string } | null) => {
        setTranslationData(data);
        if (onTranslationUpdate) onTranslationUpdate(data);
    }

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4 sm:px-6 h-full flex flex-col">
            <header className="mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-2 text-glow">Upload Document</h2>
                <p className="text-secondary text-base sm:text-lg font-light">Detailed AI analysis for your files.</p>
            </header>

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-0">
                {/* Left: Upload and Preview Area */}
                <div className="flex flex-col space-y-6 min-h-0">
                    <AnimatePresence mode="wait">
                        {!file ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex-1"
                            >
                                <section
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    className={cn(
                                        "relative group flex-1 glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed transition-all duration-500 overflow-hidden min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center cursor-pointer",
                                        isDragging ? "border-accent bg-accent/5" : "border-subtle-border hover:border-accent/40"
                                    )}
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.docx,.txt"
                                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                    />

                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-card border border-subtle-border flex items-center justify-center mb-6 shadow-xl group-hover:scale-105 transition-transform duration-500">
                                        <UploadCloud className={cn("w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-300", isDragging ? "text-accent" : "text-secondary group-hover:text-accent")} />
                                    </div>
                                    <div className="text-center space-y-4 max-w-sm px-6">
                                        <h3 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">Tap to upload or drag & drop</h3>
                                        <p className="text-secondary text-xs sm:text-sm font-medium leading-relaxed opacity-80">
                                            PDF, DOCX, TXT (MAX. 10MB)
                                        </p>
                                    </div>
                                </section>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full space-y-4"
                            >
                                <div className="bg-card border border-subtle-border rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 space-y-6 overflow-y-auto h-full shadow-soft">
                                    <div className="flex items-center justify-between group/file">
                                        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-accent/20 shrink-0">
                                                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-sm sm:text-base text-primary group-hover:text-accent transition-colors truncate">{file.name}</h4>
                                                <div className="text-[10px] sm:text-xs font-medium text-secondary mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                                                    {file.size > 0 && <span>{formatBytes(file.size)}</span>}
                                                    {uploadStatus === 'uploading' && <span className="text-accent flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</span>}
                                                    {uploadStatus === 'processing' && <span className="text-amber-500 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</span>}
                                                    {uploadStatus === 'done' && <span className="text-emerald-500 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Ready</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={clearFile}
                                            className="p-2 sm:p-2.5 hover:bg-surface-hover rounded-xl text-secondary hover:text-primary transition-colors shrink-0"
                                            disabled={uploadStatus !== 'done' && uploadStatus !== 'idle'}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Results Area */}
                <div className="flex flex-col h-full min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {(uploadStatus === 'done' || (uploadStatus === 'processing' && summary)) ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-card glass-panel rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl h-full overflow-y-auto custom-scrollbar flex flex-col"
                            >
                                <div className="flex bg-surface-hover p-1.5 rounded-2xl border border-subtle-border">
                                    <button
                                        onClick={() => setViewMode('summary')}
                                        className={cn(
                                            "flex-1 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300",
                                            viewMode === 'summary' ? "bg-accent text-white shadow-soft" : "text-secondary hover:text-primary"
                                        )}
                                    >
                                        AI Summary
                                    </button>
                                    <button
                                        onClick={() => setViewMode('full')}
                                        className={cn(
                                            "flex-1 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300",
                                            viewMode === 'full' ? "bg-accent text-white shadow-soft" : "text-secondary hover:text-primary"
                                        )}
                                    >
                                        Full Content
                                    </button>
                                </div>

                                <div className="prose max-w-none flex-1">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {viewMode === 'summary' ? summary : fullContent || ""}
                                    </ReactMarkdown>
                                </div>

                                {viewMode === 'summary' && (
                                    <div className="border-t border-subtle-border pt-8 mt-auto">
                                        <TranslationPanel
                                            originalText={summary || ''}
                                            onTranslationChange={handleTranslationChange}
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-subtle-border">
                                    <button
                                        onClick={handleDownload}
                                        className="w-full sm:w-auto px-6 py-3 text-sm font-bold bg-primary text-background hover:opacity-90 rounded-xl transition-all shadow-lg hover:shadow-accent/20 flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download {viewMode === 'summary' ? 'Summary' : 'Report'}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full border-2 border-dashed border-subtle-border rounded-[2rem] flex items-center justify-center text-center p-8 bg-card"
                            >
                                <div className="max-w-md space-y-4">
                                    <div className="relative group/icon mb-8">
                                        <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-2xl group-hover/icon:blur-[3rem] transition-all duration-500" />
                                        <div className="relative w-24 h-24 bg-card rounded-[2rem] border border-subtle-border flex items-center justify-center shadow-2xl mx-auto">
                                            <UploadCloud className="w-12 h-12 text-accent group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-primary/80 tracking-tight">Intelligence Ready</h3>
                                    <p className="text-secondary font-light text-base px-6">Upload a document to see the AI summary and translation here.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
