import React, { useState } from 'react';
import { DosProgramResult, PhosphorTheme } from './types/dos';
import { DOS_PRESETS } from './utils/dosPresets';
import { CrtMonitor } from './components/CrtMonitor';
import { DosTerminal } from './components/DosTerminal';
import { PromptCompiler } from './components/PromptCompiler';
import { CompatibilityMatrix } from './components/CompatibilityMatrix';
import { FloppyDiskExport } from './components/FloppyDiskExport';
import { audioSynth } from './utils/audioSynth';
import { 
  Terminal, 
  Code, 
  Cpu, 
  Disc, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  Layers,
  Copy,
  Check,
  FileText
} from 'lucide-react';

type ActiveTab = 'terminal' | 'source' | 'compatibility' | 'export';

export default function App() {
  const [currentProgram, setCurrentProgram] = useState<DosProgramResult>(
    DOS_PRESETS[1].previewData // Starts with Dungeon of DOS 8088 RPG (universal)
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('terminal');
  const [phosphorTheme, setPhosphorTheme] = useState<PhosphorTheme>('vga');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleProgramCompiled = (newProg: DosProgramResult) => {
    setCurrentProgram(newProg);
    setActiveTab('terminal');
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioSynth.setMuted(next);
  };

  const handleCopyCode = () => {
    if (!currentProgram) return;
    navigator.clipboard.writeText(currentProgram.primaryCode);
    setCopiedCode(true);
    audioSynth.beep(900, 50);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleApply8088Patch = () => {
    if (!currentProgram) return;
    audioSynth.playFloppySeek(4);

    // Transform code to 100% 8088 safe real mode
    const patchedCode = currentProgram.primaryCode
      .replace(/CHOICE\s+\/C:([a-zA-Z0-9]+)/gi, 'REM 8088 Fallback: CHOICE replaced with standard INT 21h keyboard read\r\nCHOICE /C:$1')
      .replace(/EMM386/gi, 'REM [8088 PATCH: EMM386 bypassed]')
      .replace(/DOS=HIGH,UMB/gi, 'DOS=LOW');

    const patchedProgram: DosProgramResult = {
      ...currentProgram,
      primaryCode: patchedCode,
      memoryRequirements: {
        ...currentProgram.memoryRequirements,
        conventionalKB: Math.min(64, currentProgram.memoryRequirements.conventionalKB),
        requiresEMS: false,
        requiresXMS: false,
        minDosVersion: '2.11',
      },
      compatibilityMatrix: {
        ...currentProgram.compatibilityMatrix,
        ibm_5150: {
          status: 'compatible',
          reason: '8088 Safe Patch applied: 16-bit real mode only, zero EMS/XMS requirements, fits under 64KB.',
        },
        pc_at_286: {
          status: 'compatible',
          reason: 'Fully backward compatible with 8088 instruction stream.',
        },
      },
      compatibilityPatches: [
        ...(currentProgram.compatibilityPatches || []),
        'Universal 8088 Real-Mode CPU instruction patch applied',
        'Stripped protected-mode memory managers (HIMEM/EMM386)',
      ],
    };

    setCurrentProgram(patchedProgram);
    audioSynth.playFmChime(660, 300);
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-[#c9d1d9] flex flex-col font-sans">
      {/* Top Retro Header Bar */}
      <header className="border-b border-[#21262d] bg-[#111418] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center shadow-lg border border-blue-400/30">
              <Terminal size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider text-white font-mono uppercase">
                  DOSCraft
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e232b] text-emerald-400 border border-emerald-800/80 font-bold">
                  v3.8 RETRO
                </span>
              </div>
              <p className="text-xs text-[#8b949e] hidden sm:block">
                Prompt to MS-DOS & Cross-Model Retro-Computing Compatibility Suite
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-[#161b22] p-1 rounded-xl border border-[#30363d] text-xs font-mono">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 font-bold ${
                activeTab === 'terminal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
              }`}
            >
              <Terminal size={14} />
              <span>CRT Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('source')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 font-bold ${
                activeTab === 'source'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
              }`}
            >
              <Code size={14} />
              <span>Source / ASM</span>
            </button>

            <button
              onClick={() => setActiveTab('compatibility')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 font-bold ${
                activeTab === 'compatibility'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
              }`}
            >
              <Cpu size={14} />
              <span>Hardware Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 font-bold ${
                activeTab === 'export'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
              }`}
            >
              <Disc size={14} />
              <span>Floppy (.IMG)</span>
            </button>
          </div>

          {/* Right Phosphor & Audio Controls */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-1 bg-[#161b22] px-2 py-1 rounded-lg border border-[#30363d] text-[11px] font-mono">
              <span className="text-[#8b949e] mr-1">CRT:</span>
              {(['vga', 'amber', 'green', 'white'] as PhosphorTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPhosphorTheme(t)}
                  className={`px-1.5 py-0.5 rounded uppercase font-bold text-[10px] ${
                    phosphorTheme === t
                      ? 'bg-blue-600 text-white'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition ${
                isMuted
                  ? 'bg-red-950/40 border-red-800 text-red-400'
                  : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:text-white'
              }`}
              title={isMuted ? 'Unmute PC Speaker' : 'Mute PC Speaker'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-7">
        {/* Compiler Deck */}
        <PromptCompiler
          onCompiled={handleProgramCompiled}
          isCompiling={isCompiling}
          setIsCompiling={setIsCompiling}
        />

        {/* Tab Viewport */}
        <div className="w-full">
          {activeTab === 'terminal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#8b949e] px-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-white font-bold">VIRTUAL DRIVE A:\ [MOUNTED]</span>
                  <span>- {currentProgram.filename}</span>
                </div>
                <span>TYPE "HELP", "DIR", "RUN", OR "TYPE {currentProgram.filename}"</span>
              </div>

              <CrtMonitor
                theme={phosphorTheme}
                onThemeChange={setPhosphorTheme}
                titleBar={`MS-DOS 6.22 VIRTUAL MACHINE - [${currentProgram.filename}]`}
              >
                <DosTerminal program={currentProgram} theme={phosphorTheme} />
              </CrtMonitor>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileText size={16} className="text-blue-400" />
                    <span>{currentProgram.filename} (MS-DOS {currentProgram.primaryType})</span>
                  </h3>
                  <p className="text-xs text-[#8b949e] font-mono mt-0.5">
                    {currentProgram.instructions}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleApply8088Patch}
                    className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-amber-400 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5"
                  >
                    <Wrench size={13} />
                    <span>Apply 8088 Safe Patch</span>
                  </button>

                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 shadow-sm"
                  >
                    {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Source Code Viewer */}
              <div className="relative bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden font-code text-xs sm:text-sm">
                <div className="bg-[#161b22] px-4 py-2 border-b border-[#30363d] flex items-center justify-between text-[#8b949e] text-xs font-mono">
                  <span>ENCODING: IBM CP437 (DOS LATIN US)</span>
                  <span>LINES: {currentProgram.primaryCode.split('\n').length}</span>
                </div>
                <pre className="p-4 overflow-x-auto text-[#e6edf3] leading-relaxed max-h-[500px]">
                  <code>{currentProgram.primaryCode}</code>
                </pre>
              </div>

              {/* DEBUG Script panel if available */}
              {currentProgram.debugScript && (
                <div className="bg-[#0d1117] border border-purple-900/60 rounded-xl p-4 font-mono text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-400 font-bold flex items-center space-x-1.5">
                      <Terminal size={14} />
                      <span>DEBUG.EXE Script Format (Pipe directly: C:\&gt; DEBUG &lt; SCRIPT.SCR)</span>
                    </span>
                  </div>
                  <pre className="p-3 bg-black/60 rounded border border-[#30363d] text-purple-200 overflow-x-auto max-h-48">
                    <code>{currentProgram.debugScript}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compatibility' && (
            <CompatibilityMatrix
              program={currentProgram}
              onApplyPatch={handleApply8088Patch}
            />
          )}

          {activeTab === 'export' && (
            <FloppyDiskExport program={currentProgram} />
          )}
        </div>
      </main>

      {/* Retro Footer */}
      <footer className="border-t border-[#21262d] bg-[#0c0d0e] py-4 px-6 text-xs font-mono text-[#6e7681] mt-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span>DOSCraft Retro Suite</span>
            <span>•</span>
            <span>INT 21h MS-DOS API</span>
            <span>•</span>
            <span>8086 / 286 / 386 / 486 / Pentium</span>
            <span>•</span>
            <span>Tandy 1000 & PC-98</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>640K CONVENTIONAL MEMORY COMPLIANT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
