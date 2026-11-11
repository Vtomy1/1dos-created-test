import React, { useState, useEffect, useRef } from 'react';
import { SystemEvent, SystemEventType } from '../types/dos';
import { audioSynth } from '../utils/audioSynth';
import { downloadTextFile } from '../utils/fat12Floppy';
import { 
  Activity, 
  Terminal, 
  Cpu, 
  HardDrive, 
  Wrench, 
  Disc, 
  Volume2, 
  Monitor, 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  RotateCw, 
  Filter, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';

interface SystemEventsTabProps {
  events: SystemEvent[];
  onClearEvents: () => void;
  onAddCustomEvent?: (type: SystemEventType, title: string, detail: string) => void;
}

export const SystemEventsTab: React.FC<SystemEventsTabProps> = ({
  events,
  onClearEvents,
  onAddCustomEvent,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [paperTheme, setPaperTheme] = useState<'paper' | 'dark'>('paper');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isTickerPaused, setIsTickerPaused] = useState<boolean>(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const tapeEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll paper roll when new events arrive
  useEffect(() => {
    if (autoScroll) {
      tapeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, autoScroll]);

  const handleManualFeed = () => {
    audioSynth.playPaperFeed(4);
    if (tapeEndRef.current) {
      tapeEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExportTape = () => {
    audioSynth.playHardDriveSpinUp();
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
    const lines: string[] = [
      '================================================================================',
      '           DOSCraft TELETYPE TICKER TAPE - SYSTEM EVENTS & HARDWARE LOG         ',
      ` Export Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}          `,
      ' Format: Continuous Form Sprocket-Feed Terminal Log (IBM 3270 / Teletype ASR-33)',
      '================================================================================',
      '',
    ];

    events.forEach((ev) => {
      lines.push(`[${ev.timestamp}] CYC#${String(ev.cycle).padStart(6, '0')} [${ev.type.padEnd(8, ' ')}] ${ev.status.padEnd(4, ' ')} : ${ev.title}`);
      lines.push(`       >> ${ev.detail}`);
      if (ev.metadata) {
        lines.push(`       >> META: ${JSON.stringify(ev.metadata)}`);
      }
      lines.push('--------------------------------------------------------------------------------');
    });

    lines.push('');
    lines.push('*** END OF CONTINUOUS TICKER TAPE RECORD ***');
    downloadTextFile(`DOS_TICKER_LOG_${timestamp}.TXT`, lines.join('\r\n'));
  };

  const filteredEvents = events.filter((ev) => {
    if (selectedFilter === 'ALL') return true;
    return ev.type === selectedFilter;
  });

  const getEventBadgeClass = (status: SystemEvent['status']) => {
    switch (status) {
      case 'OK':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'WARN':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'ERR':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'INFO':
      default:
        return 'bg-blue-950 text-blue-300 border-blue-800';
    }
  };

  const getTypeIcon = (type: SystemEventType) => {
    switch (type) {
      case 'COMMAND':
        return <Terminal size={14} className="text-blue-500" />;
      case 'MEMORY':
        return <HardDrive size={14} className="text-emerald-500" />;
      case 'PATCH':
        return <Wrench size={14} className="text-amber-500" />;
      case 'DISK':
        return <Disc size={14} className="text-purple-500" />;
      case 'AUDIO':
        return <Volume2 size={14} className="text-yellow-500" />;
      case 'VIDEO':
        return <Monitor size={14} className="text-cyan-500" />;
      case 'BOOT':
        return <Cpu size={14} className="text-indigo-500" />;
      case 'HARDWARE':
      default:
        return <Activity size={14} className="text-rose-500" />;
    }
  };

  // Hardware stats breakdown
  const cmdCount = events.filter((e) => e.type === 'COMMAND').length;
  const patchCount = events.filter((e) => e.type === 'PATCH').length;
  const memCount = events.filter((e) => e.type === 'MEMORY').length;
  const diskCount = events.filter((e) => e.type === 'DISK').length;

  return (
    <div className="w-full space-y-6">
      {/* Top Telemetry Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-blue-950 text-blue-400 border border-blue-800/80 rounded-lg">
            <Terminal size={18} />
          </div>
          <div>
            <span className="text-[11px] text-[#8b949e] font-mono block">TERMINAL CMDS</span>
            <span className="text-lg font-bold text-white font-mono">{cmdCount} Executed</span>
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-lg">
            <HardDrive size={18} />
          </div>
          <div>
            <span className="text-[11px] text-[#8b949e] font-mono block">MEMORY CHECKS</span>
            <span className="text-lg font-bold text-white font-mono">{memCount} Audits</span>
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-amber-950 text-amber-400 border border-amber-800/80 rounded-lg">
            <Wrench size={18} />
          </div>
          <div>
            <span className="text-[11px] text-[#8b949e] font-mono block">ACTIVE PATCHES</span>
            <span className="text-lg font-bold text-white font-mono">{patchCount} Applied</span>
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-purple-950 text-purple-400 border border-purple-800/80 rounded-lg">
            <Disc size={18} />
          </div>
          <div>
            <span className="text-[11px] text-[#8b949e] font-mono block">DISK TRANSFERS</span>
            <span className="text-lg font-bold text-white font-mono">{diskCount} Cycles</span>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Live Ticker Tape Marquee */}
      <div className="relative w-full bg-[#0a0d12] border-2 border-[#30363d] rounded-xl overflow-hidden shadow-lg p-2 flex items-center">
        <div className="flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border-r border-amber-500/30 text-amber-400 text-xs font-mono font-bold whitespace-nowrap z-10 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>LIVE TICKER TAPE</span>
        </div>

        <div className="flex-1 overflow-hidden relative whitespace-nowrap">
          <div className={`inline-flex items-center space-x-8 text-xs font-mono text-[#e6edf3] ${isTickerPaused ? '' : 'animate-marquee'}`}>
            {events.slice(-10).map((ev) => (
              <span key={ev.id} className="inline-flex items-center space-x-2">
                <span className="text-amber-400 font-bold">[{ev.timestamp}]</span>
                <span className="px-1.5 py-0.2 rounded bg-[#21262d] text-[#8b949e] text-[10px] uppercase font-bold">
                  {ev.type}
                </span>
                <span className="text-white font-semibold">{ev.title}</span>
                <span className="text-[#6e7681]">•</span>
              </span>
            ))}
            {events.length === 0 && (
              <span className="text-[#8b949e] italic">No hardware events recorded yet. Run a command in CRT terminal!</span>
            )}
          </div>
        </div>

        <div className="pl-3 shrink-0 z-10">
          <button
            onClick={() => setIsTickerPaused(!isTickerPaused)}
            className="p-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition"
            title={isTickerPaused ? 'Resume Ticker Tape' : 'Pause Ticker Tape'}
          >
            {isTickerPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
      </div>

      {/* Ticker Tape Control Deck */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161b22] border border-[#30363d] p-3.5 rounded-xl text-xs font-mono">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[#8b949e] flex items-center mr-1">
            <Filter size={12} className="mr-1" /> Filter:
          </span>
          {(['ALL', 'COMMAND', 'HARDWARE', 'MEMORY', 'PATCH', 'DISK'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedFilter(cat);
                audioSynth.playKeyClick();
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                selectedFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tape Actions: Paper Feed, Style, Save, Clear */}
        <div className="flex items-center space-x-2">
          {/* Paper theme switch */}
          <div className="flex items-center space-x-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
            <button
              onClick={() => setPaperTheme('paper')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                paperTheme === 'paper' ? 'bg-[#fcf8ec] text-[#292524] shadow' : 'text-[#8b949e]'
              }`}
            >
              Teleprinter Paper
            </button>
            <button
              onClick={() => setPaperTheme('dark')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                paperTheme === 'dark' ? 'bg-[#30363d] text-emerald-400 shadow' : 'text-[#8b949e]'
              }`}
            >
              Terminal Tape
            </button>
          </div>

          {/* Paper Feed */}
          <button
            onClick={handleManualFeed}
            className="px-2.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] hover:text-white font-bold transition flex items-center space-x-1 cursor-pointer active:translate-y-0.5"
            title="Advance continuous sprocket feed paper roll"
          >
            <RotateCw size={12} />
            <span>Feed Paper</span>
          </button>

          {/* Auto Scroll toggle */}
          <label className="flex items-center space-x-1.5 cursor-pointer text-[#8b949e] hover:text-[#c9d1d9] px-2">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-[#21262d] border-[#30363d] text-blue-500 focus:ring-0"
            />
            <span className="text-[11px]">Pin Bottom</span>
          </label>

          {/* Export Tape */}
          <button
            onClick={handleExportTape}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-bold transition flex items-center space-x-1 shadow-sm"
            title="Download full teleprinter session log as .TXT"
          >
            <Download size={13} />
            <span>Save Tape</span>
          </button>

          {/* Clear */}
          <button
            onClick={() => {
              audioSynth.playFloppyDriveRead(2);
              onClearEvents();
            }}
            className="p-1.5 rounded-lg bg-[#21262d] hover:bg-rose-950/40 border border-[#30363d] text-[#8b949e] hover:text-rose-400 transition"
            title="Clear Ticker Tape History"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Continuous Sprocket-Feed Ticker Tape Paper Viewport */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-[#3a4049] bg-[#1a1d22] p-3 sm:p-5">
        {/* Top Paper Header Slot */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 bg-[#121519] border-b-2 border-dashed border-[#484f58] text-[11px] font-mono text-[#8b949e] mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#c9d1d9]">TELETYPE MODEL 33 ASR / MAIN LOG ROLL</span>
            <span>- 110 BAUD CURRENT LOOP</span>
          </div>
          <span>TOTAL EVENTS: {filteredEvents.length}</span>
        </div>

        {/* Paper Body with Left/Right Perforated Tractor Sprocket Holes */}
        <div
          className={`relative w-full max-h-[580px] overflow-y-auto rounded-lg shadow-inner font-mono text-xs transition-colors duration-200 ${
            paperTheme === 'paper'
              ? 'bg-[#faf6e9] text-[#292524] border border-[#e7e0cc]'
              : 'bg-[#0b0e14] text-[#a7f3d0] border border-[#1f2937]'
          }`}
        >
          {/* Top Perforated Tear Edge */}
          <div className="w-full h-3 border-b-2 border-dashed border-[#bfae90]/60 bg-gradient-to-b from-[#e8dec0] to-transparent" />

          <div className="flex w-full min-h-[450px]">
            {/* Left Sprocket Feed Strip */}
            <div className={`w-8 shrink-0 flex flex-col items-center py-4 space-y-5 border-r select-none ${
              paperTheme === 'paper' ? 'border-[#e0d6bd] bg-[#f4ecd5]/60' : 'border-[#1f2937] bg-[#07090d]'
            }`}>
              {Array.from({ length: Math.max(16, filteredEvents.length * 2) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full shadow-inner ${
                    paperTheme === 'paper' ? 'bg-[#3b342b]/80 border border-[#bfae90]' : 'bg-[#1f2937] border border-[#374151]'
                  }`}
                />
              ))}
            </div>

            {/* Main Ticker Tape Print Area */}
            <div className="flex-1 p-4 sm:p-6 space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-base font-bold uppercase tracking-wider mb-2 opacity-60">
                    -- TELETYPE TAPE IDLE --
                  </div>
                  <p className="text-xs opacity-50 max-w-sm mx-auto">
                    Awaiting hardware state updates, DOS commands, memory audits, or patch applications.
                  </p>
                </div>
              ) : (
                filteredEvents.map((ev, index) => {
                  const isExpanded = expandedEventId === ev.id;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                      className={`p-3 rounded-md transition border cursor-pointer ${
                        paperTheme === 'paper'
                          ? 'bg-[#ffffff]/80 hover:bg-[#ffffff] border-[#e2d8be] shadow-xs text-[#1c1917]'
                          : 'bg-[#111827]/70 hover:bg-[#111827] border-[#1f2937] text-[#e6edf3]'
                      }`}
                    >
                      {/* Event Heading Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(ev.type)}
                          <span className="font-bold text-xs uppercase tracking-wide">
                            {ev.title}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getEventBadgeClass(
                              ev.status
                            )}`}
                          >
                            {ev.badge || ev.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-[11px] opacity-75">
                          <span>CYC#{String(ev.cycle).padStart(6, '0')}</span>
                          <span className="flex items-center">
                            <Clock size={11} className="mr-1" />
                            {ev.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Event Detail Message */}
                      <div className="mt-1.5 text-xs font-mono leading-relaxed opacity-90 pl-5 border-l-2 border-[#3b82f6]/40">
                        {ev.detail}
                      </div>

                      {/* Expanded Metadata inspector if clicked */}
                      {isExpanded && ev.metadata && (
                        <div className={`mt-2.5 p-2 rounded text-[11px] font-code overflow-x-auto ${
                          paperTheme === 'paper' ? 'bg-[#f5ebd2] text-[#44403c]' : 'bg-[#030712] text-emerald-400'
                        }`}>
                          <div className="font-bold mb-1 opacity-75">REGISTER / BUFFER TELEMETRY DUMP:</div>
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(ev.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={tapeEndRef} />
            </div>

            {/* Right Sprocket Feed Strip */}
            <div className={`w-8 shrink-0 flex flex-col items-center py-4 space-y-5 border-l select-none ${
              paperTheme === 'paper' ? 'border-[#e0d6bd] bg-[#f4ecd5]/60' : 'border-[#1f2937] bg-[#07090d]'
            }`}>
              {Array.from({ length: Math.max(16, filteredEvents.length * 2) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full shadow-inner ${
                    paperTheme === 'paper' ? 'bg-[#3b342b]/80 border border-[#bfae90]' : 'bg-[#1f2937] border border-[#374151]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Perforated Tear Edge */}
          <div className="w-full h-3 border-t-2 border-dashed border-[#bfae90]/60 bg-gradient-to-t from-[#e8dec0] to-transparent" />
        </div>
      </div>
    </div>
  );
};
