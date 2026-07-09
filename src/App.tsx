import { useState, useMemo, useEffect } from 'react'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { FileUpload } from './components/FileUpload'
import { ChatInterface } from './components/ChatInterface'
import { SettingsPanel, type AppSettings } from './components/SettingsPanel'
import { parseSizeToBytes } from './lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import type { Document } from './types'

function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app-settings');
    const defaults: AppSettings = {
      modelPreference: 'gemini-2.0-flash',
      autoTranslate: false,
      summaryDetail: 'complex',
      offlineMode: false,
      theme: 'dark'
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  })

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));

    // Apply theme
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [settings]);

  const handleDocumentUploaded = (doc: Document) => {
    setDocuments(prev => {
      // Check if updating existing or adding new
      const index = prev.findIndex(p => p.id === doc.id);
      if (index !== -1) {
        const next = [...prev];
        next[index] = { ...next[index], ...doc };
        return next;
      }
      return [doc, ...prev];
    });
    setSelectedDocument(doc);
  }

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setActiveTab('upload');
  }

  const handleNewAnalysis = () => {
    setSelectedDocument(null);
    setActiveTab('upload');
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
  }

  const handleClearHistory = () => {
    setDocuments([]);
    setSelectedDocument(null);
  }

  const handleTranslationUpdate = (translation: { lang: string, text: string } | null) => {
    if (!selectedDocument) return;

    setDocuments(prev => prev.map(doc =>
      doc.id === selectedDocument.id ? { ...doc, translation: translation || undefined } : doc
    ));

    // Also update selected document so the view stays in sync
    setSelectedDocument(prev => prev ? { ...prev, translation: translation || undefined } : null);
  }

  const storageUsed = useMemo(() => {
    return documents.reduce((acc, doc) => acc + parseSizeToBytes(doc.size), 0);
  }, [documents]);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} storageUsed={storageUsed}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && (
            <Dashboard
              documents={documents}
              onDocumentClick={handleDocumentClick}
              onNewAnalysis={handleNewAnalysis}
              onDeleteDocument={handleDeleteDocument}
            />
          )}
          {activeTab === 'upload' && (
            <FileUpload
              onDocumentUploaded={handleDocumentUploaded}
              onTranslationUpdate={handleTranslationUpdate}
              selectedDocument={selectedDocument}
            />
          )}
          {activeTab === 'chat' && <ChatInterface documents={documents} />}
          {activeTab === 'settings' && (
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
              onClearHistory={handleClearHistory}
              documentCount={documents.length}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

export default App
