import { PDFPanel } from './components/PDFPanel'
import { ChatPanel } from './components/ChatPanel'
import { useChat } from './hooks/useChat'
import { Github, Zap } from 'lucide-react'

function App() {
  const { 
    pdfMetadata, 
    messages, 
    isUploading, 
    isSending, 
    handleUpload, 
    sendMessage, 
    clearSession 
  } = useChat()

  return (
    <div className="h-screen w-full flex flex-col bg-base overflow-hidden">
      {/* Navbar */}
      <header className="h-16 shrink-0 border-b border-glass-border bg-surface/80 backdrop-blur-lg flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-accent to-secondary flex items-center justify-center shadow-lg shadow-accent/20">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <h1 className="text-xl font-syne font-bold tracking-wide text-transparent bg-clip-text bg-linear-to-r from-white to-text-muted">
            PDF Agent
          </h1>
        </div>
        
        <a 
          href="https://github.com/tezivindh/pdfagent" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-dmSans text-text-muted hover:text-text transition-colors"
        >
          <Github size={18} />
          <span>Source</span>
        </a>
      </header>

      {/* Main Content Split */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - 35% */}
        <div className="w-[35%] shrink-0 h-full relative z-20 shadow-2xl">
          <PDFPanel 
            pdfMetadata={pdfMetadata}
            isUploading={isUploading}
            onUpload={handleUpload}
            onClear={clearSession}
          />
        </div>

        {/* Right Panel - 65% */}
        <div className="flex-1 h-full relative z-10">
          <ChatPanel 
            messages={messages}
            isSending={isSending}
            onSendMessage={sendMessage}
            disabled={!pdfMetadata}
          />
        </div>
      </main>
    </div>
  )
}

export default App
