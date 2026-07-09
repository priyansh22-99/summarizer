import { useState } from 'react'
import { Languages, ArrowRight, Copy } from 'lucide-react'

export function TranslationPanel({
    originalText,
    onTranslationChange
}: {
    originalText: string,
    onTranslationChange?: (translation: { lang: string, text: string } | null) => void
}) {
    const [targetLang, setTargetLang] = useState('es')
    const [isTranslating, setIsTranslating] = useState(false)
    const [translatedText, setTranslatedText] = useState('')

    const languages = [
        { code: 'te', name: 'Telugu' },
        { code: 'hi', name: 'Hindi' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'zh', name: 'Chinese' },
        { code: 'jp', name: 'Japanese' },
    ]

    const handleTranslate = async (langCode: string) => {
        setIsTranslating(true)
        setTranslatedText("")
        if (onTranslationChange) onTranslationChange(null);

        try {
            const langName = languages.find(l => l.code === langCode)?.name || langCode;
            const { translateTextStream } = await import('../lib/gemini');
            const result = await translateTextStream(originalText, langName, (chunk: string) => {
                setTranslatedText(chunk);
            });

            setTranslatedText(result);
            if (onTranslationChange) onTranslationChange({ lang: langName, text: result });
        } catch (error) {
            console.error(error);
            setTranslatedText("Error authenticating or translating. Please check console and API key.");
        } finally {
            setIsTranslating(false)
        }
    }

    const handleLanguageChange = (code: string) => {
        setTargetLang(code);
        handleTranslate(code);
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-card border border-subtle-border rounded-2xl p-6 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-primary">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <Languages className="w-5 h-5 text-accent" />
                        </div>
                        <span>Intelligence Translation</span>
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <select
                            value={targetLang}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="w-full appearance-none bg-surface-hover border border-subtle-border rounded-xl pl-4 pr-10 py-2.5 sm:py-2 text-sm focus:outline-none focus:border-accent text-primary cursor-pointer transition-all font-medium"
                        >
                            {languages.map(l => (
                                <option key={l.code} value={l.code}>{l.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-secondary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {!translatedText && !isTranslating && (
                    <button
                        onClick={() => handleTranslate(targetLang)}
                        className="w-full py-3 bg-surface-hover hover:scale-[0.99] border border-subtle-border rounded-xl text-sm font-bold text-secondary transition-all flex items-center justify-center gap-2 hover:text-primary hover:border-accent/30"
                    >
                        <span>Analyze & Translate</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}

                {isTranslating && (
                    <div className="h-24 flex items-center justify-center text-sm text-accent animate-pulse font-bold tracking-tight">
                        <Languages className="w-5 h-5 mr-3 animate-spin" />
                        Translating...
                    </div>
                )}

                {translatedText && (
                    <div className="space-y-3">
                        <div className="p-5 bg-surface-hover rounded-xl text-sm text-primary/80 font-medium leading-relaxed border border-subtle-border">
                            {translatedText}
                        </div>
                        <div className="flex justify-end">
                            <button className="text-xs flex items-center gap-2 text-secondary hover:text-accent transition-colors bg-card px-3 py-1.5 rounded-lg border border-subtle-border font-bold">
                                <Copy className="w-4 h-4" /> Copy Translation
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
