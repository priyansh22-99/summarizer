import { GoogleGenerativeAI } from "@google/generative-ai";

// Cache for runtime configuration overrides
let cachedSettings: any = null;

function getSettings() {
    if (cachedSettings) return cachedSettings;
    const saved = localStorage.getItem('app-settings');
    if (saved) {
        cachedSettings = JSON.parse(saved);
        return cachedSettings;
    }
    return null;
}

// Invalidate cache when localStorage changes
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key === 'app-settings') cachedSettings = null;
    });
}

function getApiKey() {
    return import.meta.env.VITE_GEMINI_API_KEY || "";
}

function getGenAI() {
    const key = getApiKey();
    return new GoogleGenerativeAI(key);
}

async function generateWithFallback(prompt: string, action: 'summary' | 'translation'): Promise<string> {
    const settings = getSettings();
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest", "gemini-pro-latest"];

    // If user preferred a specific model, try it first
    if (settings?.modelPreference) {
        modelsToTry.unshift(settings.modelPreference);
    }

    const genAI = getGenAI();
    let lastError: any;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting ${action} with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
        }
    }

    throw lastError;
}

async function streamWithFallback(
    prompt: string,
    action: 'summary' | 'translation',
    onChunk: (text: string) => void
): Promise<string> {
    const settings = getSettings();
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest", "gemini-pro-latest"];

    if (settings?.modelPreference) {
        modelsToTry.unshift(settings.modelPreference);
    }

    const genAI = getGenAI();
    let lastError: any;

    for (const modelName of modelsToTry) {
        let fullText = "";
        try {
            console.log(`Streaming ${action} with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContentStream(prompt);

            for await (const chunk of result.stream) {
                fullText += chunk.text();
                onChunk(fullText);
            }
            return fullText;
        } catch (error: any) {
            console.warn(`Streaming model ${modelName} failed:`, error.message);
            lastError = error;
        }
    }

    throw lastError;
}

// Fallback: Rule-Based / Offline Summarization
function generateOfflineSummary(text: string): string {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const title = lines[0] ? lines[0].substring(0, 100) : "Untitled Document";
    const date = new Date().toLocaleDateString();

    const contentLines = lines.slice(1);
    const summaryText = contentLines.slice(0, 5).join(' ').substring(0, 500) + "...";

    let keyPoints = contentLines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('•') || /^\d+\./.test(l.trim())).slice(0, 3);
    if (keyPoints.length === 0) {
        keyPoints = [
            contentLines[Math.floor(contentLines.length * 0.2)] || "Review document details.",
            contentLines[Math.floor(contentLines.length * 0.5)] || "Analyze key metrics.",
            contentLines[Math.floor(contentLines.length * 0.8)] || "Confirm next steps."
        ].filter(Boolean);
    }

    return `# Document Summary (Offline Mode)

**Title**: ${title}
**Analysis Date**: ${date}
**Note**: Generated offline due to API configuration.

## Key Extracted Points
${keyPoints.map(p => `- ${p.replace(/^[-•\d\.\s]+/, '')}`).join('\n')}

## Summary
${summaryText || "No text content available to summarize."}
`;
}

export async function generateSummary(text: string): Promise<string> {
    const settings = getSettings();
    const apiKey = getApiKey();

    if (settings?.offlineMode || !apiKey) {
        return generateOfflineSummary(text);
    }

    const complexity = settings?.summaryDetail || 'complex';
    const complexityInstruction = {
        brief: "Summarize this very concisely, focusing only on the most critical information in short bullet points (max 60 words).",
        complex: "Provide a balanced, structural analysis of the text, highlighting technical details and core arguments (about 150-200 words).",
        details: "Provide an extremely deep, comprehensive breakdown of every major point, nuance, and supporting evidence found in the text (350+ words)."
    }[complexity as 'brief' | 'complex' | 'details'];

    try {
        const prompt = `Please analyze the document text and provide a structured summary.
    ${complexityInstruction}
    
    Format:
    # Document Summary
    **Title**: [Extract title]
    **Analysis Date**: [Date]
    
    ## Key Executive Points
    - [Point 1]
    - [Point 2]
    - [Point 3]
    
    ## Detailed Summary
    [Paragraph(s) matching the complexity requested]
    
    ## Action Items
    1. [Action 1]
    2. [Action 2]

    Text:
    ${text.substring(0, 30000)}
    `;

        return await generateWithFallback(prompt, 'summary');
    } catch (error: any) {
        return generateOfflineSummary(text);
    }
}

export async function generateSummaryStream(
    text: string,
    onChunk: (text: string) => void
): Promise<string> {
    const settings = getSettings();
    const apiKey = getApiKey();

    if (settings?.offlineMode || !apiKey) {
        const result = generateOfflineSummary(text);
        onChunk(result);
        return result;
    }

    const complexity = settings?.summaryDetail || 'complex';
    const complexityInstruction = {
        brief: "Summarize this very concisely, focusing only on the most critical information in short bullet points (max 60 words).",
        complex: "Provide a balanced, structural analysis of the text, highlighting technical details and core arguments (about 150-200 words).",
        details: "Provide an extremely deep, comprehensive breakdown of every major point, nuance, and supporting evidence found in the text (350+ words)."
    }[complexity as 'brief' | 'complex' | 'details'];

    const prompt = `Please analyze the document text and provide a structured summary.
    ${complexityInstruction}
    
    Format:
    # Document Summary
    **Title**: [Extract title]
    **Analysis Date**: [Date]
    
    ## Key Executive Points
    - [Point 1]
    - [Point 2]
    - [Point 3]
    
    ## Detailed Summary
    [Paragraph(s) matching the complexity requested]
    
    ## Action Items
    1. [Action 1]
    2. [Action 2]

    Text:
    ${text.substring(0, 30000)}
    `;

    try {
        return await streamWithFallback(prompt, 'summary', onChunk);
    } catch (error: any) {
        const result = generateOfflineSummary(text);
        onChunk(result);
        return result;
    }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
    const apiKey = getApiKey();
    if (!apiKey) return "Error: API Key missing.";

    try {
        const prompt = `Translate to ${targetLanguage}. Maintain markdown formatting.
    
    Text:
    ${text}
    `;

        return await generateWithFallback(prompt, 'translation');
    } catch (error: any) {
        return `Translation Error: ${error.message}`;
    }
}

export async function translateTextStream(
    text: string,
    targetLanguage: string,
    onChunk: (text: string) => void
): Promise<string> {
    const apiKey = getApiKey();
    if (!apiKey) {
        const msg = "Error: API Key missing.";
        onChunk(msg);
        return msg;
    }

    const prompt = `Translate to ${targetLanguage}. Maintain markdown formatting.
    
    Text:
    ${text}
    `;

    try {
        return await streamWithFallback(prompt, 'translation', onChunk);
    } catch (error: any) {
        const msg = `Translation Error: ${error.message}`;
        onChunk(msg);
        return msg;
    }
}

export async function chatWithGemini(messages: { role: 'user' | 'bot', content: string }[], documents: any[]): Promise<string> {
    const apiKey = getApiKey();
    if (!apiKey) return "I can't chat right now because the API key is missing. Please check your environment variables.";

    // Prepare context from documents
    const docContext = documents.map(doc => `--- DOCUMENT: ${doc.title} ---\n${doc.content || doc.summary}`).join('\n\n');

    const chatHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    const prompt = `You are a professional Intelligence Assistant. You help the user understand their uploaded documents.
    
    Knowledge Context (Uploaded Documents):
    ${docContext.substring(0, 20000)}
    
    Recent Chat History:
    ${chatHistory}
    
    Instruction:
    - Answer the user's latest message based ON THE PROVIDED DOCUMENTS.
    - If the answer isn't in the documents, try to be helpful but mention that you couldn't find specific details in the files.
    - Be professional, concise, and clear.
    - Use Markdown for formatting.
    
    User: ${messages[messages.length - 1].content}
    Assistant:`;

    try {
        return await generateWithFallback(prompt, 'summary');
    } catch (error: any) {
        return `I encountered an error while processing your request: ${error.message}. Please try again.`;
    }
}
