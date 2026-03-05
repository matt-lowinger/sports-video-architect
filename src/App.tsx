/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Video, 
  Upload, 
  Link as LinkIcon, 
  Play, 
  Activity, 
  Copy, 
  Check, 
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeSportsVideo } from './services/gemini';
import { SportType, Highlight } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SPORTS: SportType[] = ['Football', 'Squash', 'Basketball', 'Hockey', 'Baseball', 'Other'];

export default function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [sport, setSport] = useState<SportType>('Football');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Highlight[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const getEmbedUrl = (url: string) => {
    try {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('be/')[1]?.split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {}
    return null;
  };

  const generateYouTubeLink = (seconds: number) => {
    if (!youtubeUrl) return '#';
    try {
      const url = new URL(youtubeUrl);
      const startSeconds = Math.max(0, Math.floor(seconds - 3));
      // YouTube uses 't' parameter. It can be just seconds (e.g. t=120) or with 's' (e.g. t=120s)
      url.searchParams.set('t', `${startSeconds}s`);
      return url.toString();
    } catch (e) {
      return youtubeUrl;
    }
  };

  const handleAnalyze = async () => {
    if (!youtubeUrl) {
      setError('Please provide a YouTube URL.');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const data = await analyzeSportsVideo(youtubeUrl, sport);
      if (data.highlights) {
        const processedHighlights = data.highlights.map((h: any) => ({
          ...h,
          link: generateYouTubeLink(h.seconds)
        }));
        setResults(processedHighlights);
      } else {
        throw new Error('No highlights found in the analysis.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyAsMarkdown = () => {
    if (!results) return;

    const headers = '| Timestamp (MM:SS) | Event Type | Technical Description | Impact (1-10) | Clickable Highlight Link |';
    const divider = '| --- | --- | --- | --- | --- |';
    const rows = results.map(h => 
      `| ${h.timestamp} | ${h.eventType} | ${h.technicalDescription} | ${h.impact} | [View Highlight](${h.link}) |`
    ).join('\n');

    const markdown = `${headers}\n${divider}\n${rows}`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedUrl = getEmbedUrl(youtubeUrl);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-line p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ink flex items-center justify-center rounded-sm">
            <Video className="text-bg w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">Sports Video Architect</h1>
            <p className="text-[10px] uppercase opacity-50 font-mono tracking-widest">Broadcast Metadata Engine v1.0</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          {results && (
            <button 
              onClick={copyAsMarkdown}
              className="btn-primary flex items-center gap-2"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Markdown'}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[400px_1fr] overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="border-r border-line p-6 space-y-8 overflow-y-auto bg-white/30">
          <section className="space-y-4">
            <h2 className="col-header p-0 border-none">01. Source Configuration</h2>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold opacity-70">YouTube Video URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                <input 
                  type="text" 
                  placeholder="https://youtube.com/watch?v=..."
                  className="input-field pl-10"
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setResults(null);
                    setError(null);
                  }}
                />
              </div>
              <p className="text-[9px] opacity-50 italic">Provide a public YouTube link for analysis.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="col-header p-0 border-none">02. Analysis Parameters</h2>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold opacity-70">Sport Category</label>
              <select 
                className="input-field appearance-none cursor-pointer"
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
              >
                {SPORTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button 
              disabled={!youtubeUrl || isAnalyzing}
              onClick={handleAnalyze}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Analyzing Stream...
                </>
              ) : (
                <>
                  <Activity size={18} />
                  Run Metadata Architect
                </>
              )}
            </button>
          </section>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 flex gap-3 items-start rounded-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-xs font-mono">{error}</p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <section className="p-8 overflow-y-auto space-y-8">
          {embedUrl && (
            <div className="space-y-4">
              <h2 className="col-header p-0 border-none">Reference Monitor</h2>
              <div className="aspect-video bg-black rounded-sm overflow-hidden border border-line shadow-lg">
                <iframe 
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h2 className="col-header p-0 border-none">Highlight Log Output</h2>
              {results && (
                <span className="text-[10px] font-mono opacity-50 uppercase">
                  {results.length} Events Detected
                </span>
              )}
            </div>

            <div className="data-grid bg-white">
              <div className="data-row bg-black/5 font-bold">
                <div className="col-header border-none">Time</div>
                <div className="col-header border-none">Event</div>
                <div className="col-header border-none">Technical Breakdown</div>
                <div className="col-header border-none">Impact</div>
                <div className="col-header border-none">Action</div>
              </div>

              <AnimatePresence mode="popLayout">
                {isAnalyzing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-20 text-center space-y-4"
                  >
                    <Loader2 className="animate-spin mx-auto opacity-20" size={48} />
                    <div className="space-y-1">
                      <p className="font-mono text-sm uppercase tracking-widest">Processing Stream</p>
                      <p className="text-[10px] opacity-50">Gemini 3.1 Pro is analyzing the YouTube content via URL Context...</p>
                    </div>
                  </motion.div>
                ) : results ? (
                  results.map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="data-row group"
                    >
                      <div className="data-value flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-ink/20 group-hover:bg-bg/40" />
                        {h.timestamp}
                      </div>
                      <div className="data-value uppercase text-[11px] font-bold flex items-center">
                        {h.eventType}
                      </div>
                      <div className="text-xs opacity-80 flex items-center pr-4">
                        {h.technicalDescription}
                      </div>
                      <div className="data-value flex items-center justify-center">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-sm text-[10px]",
                          h.impact >= 8 ? "bg-red-100 text-red-700" : "bg-ink/5"
                        )}>
                          {h.impact}/10
                        </span>
                      </div>
                      <div className="flex items-center">
                        <a 
                          href={h.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono uppercase underline flex items-center gap-1 hover:opacity-70"
                        >
                          View Clip <ChevronRight size={10} />
                        </a>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-20 text-center opacity-30">
                    <LinkIcon className="mx-auto mb-4" size={48} />
                    <p className="font-mono text-sm uppercase tracking-widest">Awaiting Link</p>
                    <p className="text-[10px]">Paste a YouTube URL and run analysis to generate log.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Status Bar */}
      <footer className="border-t border-line px-6 py-2 bg-white flex justify-between items-center text-[10px] font-mono uppercase opacity-50">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Ready
          </div>
          <div>Engine: Gemini 3.1 Pro Preview (URL Context)</div>
        </div>
        <div>© 2026 Sports Broadcast Architect</div>
      </footer>
    </div>
  );
}
