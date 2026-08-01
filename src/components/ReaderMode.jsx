import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Clock, Settings, Type, ZoomIn, ZoomOut, Moon, Sun, BookOpenText } from 'lucide-react';

export default function ReaderMode({ title, content, onClose }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState('text-lg'); // text-base, text-lg, text-xl, text-2xl
  const [isSerif, setIsSerif] = useState(true);
  const [theme, setTheme] = useState('dark'); // 'dark', 'sepia', 'light'
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef(null);

  // Estimate Read Time: Average reading speed is 225 words per minute
  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 225));

  // Handle scroll tracking
  const handleScroll = () => {
    const element = containerRef.current;
    if (!element) return;
    const totalHeight = element.scrollHeight - element.clientHeight;
    if (totalHeight > 0) {
      const progress = (element.scrollTop / totalHeight) * 100;
      setScrollProgress(progress);
    }
  };

  // Basic markdown parser
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    // Process markdown string to html
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 tracking-tight">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4 tracking-tight border-b border-gray-700 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold mt-10 mb-6 tracking-tight">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // Blockquotes
      .replace(/^\>\s+(.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-4 py-1 my-4 italic text-slate-400 bg-emerald-950/20 rounded-r">$1</blockquote>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-black/50 p-4 rounded-lg my-6 overflow-x-auto border border-white/5"><code class="font-mono text-sm text-emerald-400">$1</code></pre>')
      // Inline code
      .replace(/`(.*?)`/gim, '<code class="font-mono text-sm px-1.5 py-0.5 rounded bg-black/40 text-rose-400 border border-white/5">$1</code>')
      // Lists (bullet)
      .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="list-disc ml-6 my-2">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-2 transition">$1</a>')
      // Paragraph split
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (
          trimmed.startsWith('<h') || 
          trimmed.startsWith('<li') || 
          trimmed.startsWith('<pre') || 
          trimmed.startsWith('</pre>') || 
          trimmed.startsWith('<blockquote') || 
          trimmed.startsWith('</blockquote>')
        ) {
          return line;
        }
        return trimmed ? `<p class="mb-5 leading-relaxed">${line}</p>` : '';
      })
      .join('\n');

    return html;
  };

  // Map theme variables to Tailwind classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#5b4636]';
      case 'light':
        return 'bg-white text-slate-900';
      case 'dark':
      default:
        return 'bg-brand-darker text-slate-200';
    }
  };

  const getCardThemeClasses = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#ebdcb9] border-[#d8c292] text-[#5b4636]';
      case 'light':
        return 'bg-slate-50 border-slate-200 text-slate-900';
      case 'dark':
      default:
        return 'bg-brand-card border-white/5 text-slate-100';
    }
  };

  const getProgressColor = () => {
    return theme === 'sepia' ? 'bg-[#5b4636]' : 'bg-emerald-500';
  };

  // Adjust font size
  const fontSizes = ['text-base', 'text-lg', 'text-xl', 'text-2xl'];
  const adjustFontSize = (direction) => {
    const currentIndex = fontSizes.indexOf(fontSize);
    if (direction === 'up' && currentIndex < fontSizes.length - 1) {
      setFontSize(fontSizes[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      setFontSize(fontSizes[currentIndex - 1]);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col font-sans transition-colors duration-300 animate-fade-in ${getThemeClasses()}`}>
      
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/10 z-50">
        <div 
          className={`h-full transition-all duration-75 ${getProgressColor()}`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Header */}
      <header className={`sticky top-0 z-40 border-b px-6 py-4 flex items-center justify-between backdrop-blur-md bg-opacity-80 transition-colors ${
        theme === 'dark' ? 'bg-brand-dark/80 border-white/5' : 
        theme === 'sepia' ? 'bg-[#f4ecd8]/80 border-[#ebdcb9]' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition duration-200 ${
              theme === 'dark' ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 
              theme === 'sepia' ? 'hover:bg-[#ebdcb9] text-[#5b4636]/80 hover:text-[#5b4636]' : 
              'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
            title="Back to Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <BookOpenText className="w-3.5 h-3.5" />
            <span>GROWTH READER</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Read Time Info */}
          <div className={`flex items-center gap-1.5 text-sm mr-2 ${theme === 'dark' ? 'text-slate-400' : theme === 'sepia' ? 'text-[#5b4636]/70' : 'text-slate-500'}`}>
            <Clock className="w-4 h-4" />
            <span>{readTime} min read</span>
          </div>

          {/* Reader Preferences Toggle */}
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-sm font-medium transition duration-200 ${
                theme === 'dark' ? 'bg-brand-card border-white/5 text-slate-300 hover:bg-brand-cardHover' : 
                theme === 'sepia' ? 'bg-[#ebdcb9] border-[#d8c292] text-[#5b4636] hover:bg-[#ebdcb9]/80' : 
                'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Appearance</span>
            </button>

            {/* Quick Appearance Panel */}
            {showSettings && (
              <div className={`absolute right-0 mt-2 w-72 rounded-2xl border p-4 shadow-xl z-50 flex flex-col gap-4 animate-slide-up ${getCardThemeClasses()}`}>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h4 className="font-semibold text-sm">Text Options</h4>
                  <button onClick={() => setShowSettings(false)} className="text-xs opacity-60 hover:opacity-100">Done</button>
                </div>

                {/* Typography Select */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs opacity-75 font-medium">Font Family</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setIsSerif(true)}
                      className={`py-1.5 px-3 rounded-lg text-sm font-serif border transition ${
                        isSerif 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' 
                          : 'border-white/5 bg-black/20 hover:bg-black/35'
                      }`}
                    >
                      Elegant Serif
                    </button>
                    <button 
                      onClick={() => setIsSerif(false)}
                      className={`py-1.5 px-3 rounded-lg text-sm font-sans border transition ${
                        !isSerif 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' 
                          : 'border-white/5 bg-black/20 hover:bg-black/35'
                      }`}
                    >
                      Modern Sans
                    </button>
                  </div>
                </div>

                {/* Size Controls */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs opacity-75 font-medium">Font Size</span>
                  <div className="flex items-center justify-between gap-2">
                    <button 
                      onClick={() => adjustFontSize('down')}
                      disabled={fontSize === 'text-base'}
                      className="flex-1 py-1.5 rounded-lg bg-black/20 border border-white/5 hover:bg-black/35 transition disabled:opacity-30 disabled:hover:bg-black/20 flex items-center justify-center"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold uppercase px-2">
                      {fontSize === 'text-base' && 'Small'}
                      {fontSize === 'text-lg' && 'Normal'}
                      {fontSize === 'text-xl' && 'Large'}
                      {fontSize === 'text-2xl' && 'Extra'}
                    </span>
                    <button 
                      onClick={() => adjustFontSize('up')}
                      disabled={fontSize === 'text-2xl'}
                      className="flex-1 py-1.5 rounded-lg bg-black/20 border border-white/5 hover:bg-black/35 transition disabled:opacity-30 disabled:hover:bg-black/20 flex items-center justify-center"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Theme Options */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs opacity-75 font-medium">Reader Theme</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition flex flex-col items-center gap-1 ${
                        theme === 'dark' ? 'border-emerald-500 bg-black/40 text-emerald-400' : 'border-white/5 bg-black/20 text-slate-300'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>
                    <button 
                      onClick={() => setTheme('sepia')}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition flex flex-col items-center gap-1 ${
                        theme === 'sepia' ? 'border-emerald-500 bg-[#ebdcb9] text-[#5b4636]' : 'border-white/5 bg-black/20 text-slate-300'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Sepia</span>
                    </button>
                    <button 
                      onClick={() => setTheme('light')}
                      className={`py-2 px-1 rounded-lg border text-xs font-medium transition flex flex-col items-center gap-1 ${
                        theme === 'light' ? 'border-slate-400 bg-white text-slate-900' : 'border-white/5 bg-black/20 text-slate-300'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reader Content Body */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-12 md:py-20 select-text"
      >
        <article className="max-w-2xl mx-auto">
          {/* Article Title */}
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-8 leading-tight ${
            isSerif ? 'font-serif' : 'font-sans'
          } ${theme === 'light' ? 'text-slate-950' : theme === 'sepia' ? 'text-[#483424]' : 'text-white'}`}>
            {title}
          </h1>

          {/* Separator */}
          <div className={`h-px w-full my-8 ${theme === 'dark' ? 'bg-white/10' : theme === 'sepia' ? 'bg-[#5b4636]/15' : 'bg-slate-200'}`} />

          {/* Parsed Markdown Body */}
          <div 
            className={`prose ${isSerif ? 'font-serif' : 'font-sans'} ${fontSize} ${
              theme === 'dark' ? 'prose-invert prose-emerald max-w-none text-slate-300' : 
              theme === 'sepia' ? 'max-w-none text-[#5b4636] prose-a:text-[#8b5a2b]' : 
              'max-w-none text-slate-800'
            }`}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
          
          {/* Footer separator for complete reading indication */}
          <div className="flex flex-col items-center justify-center mt-20 mb-10 text-center gap-3">
            <div className={`h-px w-24 ${theme === 'dark' ? 'bg-white/10' : theme === 'sepia' ? 'bg-[#5b4636]/15' : 'bg-slate-200'}`} />
            <span className="text-xs opacity-50 tracking-widest font-mono">END OF ARTIFACT</span>
            <button
              onClick={onClose}
              className={`mt-4 px-6 py-2.5 rounded-xl border font-semibold text-sm transition duration-200 ${
                theme === 'dark' ? 'bg-brand-card hover:bg-brand-cardHover border-white/5 text-slate-300' :
                theme === 'sepia' ? 'bg-[#ebdcb9] border-[#d8c292] text-[#5b4636] hover:bg-[#ebdcb9]/80' :
                'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Complete Growth Session
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
