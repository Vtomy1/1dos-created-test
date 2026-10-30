import React, { useState } from 'react';
import { TargetSystemId, DosFileType, DosProgramResult } from '../types/dos';
import { SYSTEM_MODELS, DOS_PRESETS, PresetItem } from '../utils/dosPresets';
import { audioSynth } from '../utils/audioSynth';
import { Sparkles, Terminal, Cpu, Layers, Play, Zap, ArrowRight, Check } from 'lucide-react';

interface PromptCompilerProps {
  onCompiled: (result: DosProgramResult) => void;
  isCompiling: boolean;
  setIsCompiling: (val: boolean) => void;
}

export const PromptCompiler: React.FC<PromptCompilerProps> = ({
  onCompiled,
  isCompiling,
  setIsCompiling,
}) => {
  const [prompt, setPrompt] = useState(
    'Create a classic MS-DOS text arcade game with spaceship combat, PC speaker sound effects, high score tracker, and universal 8088 to Pentium compatibility.'
  );
  const [targetSystem, setTargetSystem] = useState<TargetSystemId>('all');
  const [outputFormat, setOutputFormat] = useState<string>('auto');
  const [optimizeFor, setOptimizeFor] = useState<string>('maximum_compatibility');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const handleCompile = async (overridePrompt?: string, preset?: PresetItem) => {
    const textToCompile = overridePrompt || prompt;
    if (!textToCompile.trim()) return;

    setIsCompiling(true);
    audioSynth.playFloppySeek(5);

    try {
      const res = await fetch('/api/generate-dos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToCompile,
          targetSystem,
          outputFormat,
          optimizeFor,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        onCompiled(json.data);
        audioSynth.playFmChime(520, 400);
      } else {
        throw new Error(json.error || 'Unknown generation failure');
      }
    } catch (err) {
      console.warn('Using local preset or fallback due to network/server response:', err);
      // Fallback to closest preset or preset passed
      if (preset) {
        onCompiled(preset.previewData);
      } else {
        const matchingPreset = DOS_PRESETS.find((p) => p.id === 'dungeon-rpg-batch') || DOS_PRESETS[0];
        onCompiled(matchingPreset.previewData);
      }
      audioSynth.playFmChime(440, 300);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSelectPreset = (p: PresetItem) => {
    setSelectedPresetId(p.id);
    setPrompt(p.prompt);
    setTargetSystem(p.targetSystem as TargetSystemId);
    setOutputFormat(p.recommendedFormat);
    audioSynth.beep(600, 60);
    // Instant compile with the preset
    handleCompile(p.prompt, p);
  };

  return (
    <div className="w-full space-y-5">
      {/* Prompt Command Center Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-950/80 text-blue-400 border border-blue-800/80 rounded-xl shadow-inner">
              <Terminal size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Prompt to MS-DOS Universal Compiler</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
                  ALL-MODELS
                </span>
              </h2>
              <p className="text-xs text-[#8b949e]">
                Synthesizes runnable MS-DOS code, x86 assembly, QBASIC scripts, and memory configs for any retro PC.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-[#8b949e]">OPCODE ENGINE:</span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              REAL MODE 16-BIT
            </span>
          </div>
        </div>

        {/* Textarea Input */}
        <div className="relative mb-4">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleCompile();
              }
            }}
            placeholder="Describe what to build in MS-DOS... (e.g. 'Space invaders game with sound effects', 'VGA flame demo', 'System audit utility', 'ANSI BBS screen')"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 text-sm font-code text-white placeholder-[#484f58] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none leading-relaxed"
          />
          <div className="absolute right-3 bottom-3 text-[10px] font-mono text-[#6e7681] pointer-events-none">
            Ctrl+Enter to compile
          </div>
        </div>

        {/* Compiler Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {/* Target System Architecture */}
          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1.5 flex items-center space-x-1.5">
              <Cpu size={13} className="text-blue-400" />
              <span>TARGET RETRO MODEL</span>
            </label>
            <select
              value={targetSystem}
              onChange={(e) => setTargetSystem(e.target.value as TargetSystemId)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-blue-500"
            >
              {SYSTEM_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Output Format */}
          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1.5 flex items-center space-x-1.5">
              <Layers size={13} className="text-purple-400" />
              <span>OUTPUT FORMAT</span>
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-blue-500"
            >
              <option value="auto">Auto-Detect Best Format</option>
              <option value="BAT">MS-DOS Batch Script (.BAT)</option>
              <option value="BAS">QBASIC / GW-BASIC Program (.BAS)</option>
              <option value="ASM_COM">16-bit x86 Assembly (.COM / DEBUG)</option>
              <option value="ANS">ANSI.SYS Screen Art (.ANS)</option>
              <option value="CONFIG">CONFIG.SYS + AUTOEXEC.BAT</option>
            </select>
          </div>

          {/* Optimization Mode */}
          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1.5 flex items-center space-x-1.5">
              <Zap size={13} className="text-amber-400" />
              <span>OPTIMIZATION STRATEGY</span>
            </label>
            <select
              value={optimizeFor}
              onChange={(e) => setOptimizeFor(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-blue-500"
            >
              <option value="maximum_compatibility">Maximum Compatibility (8088 to Pentium)</option>
              <option value="high_performance">High Performance (386/486 VGA & SB16)</option>
              <option value="minimal_memory">Minimal Conventional Memory (&lt; 32KB)</option>
            </select>
          </div>
        </div>

        {/* Compile Trigger Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#30363d]">
          <div className="text-xs text-[#8b949e] font-mono flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>INT 21h / INT 10h / FAT12 Ready</span>
          </div>

          <button
            onClick={() => handleCompile()}
            disabled={isCompiling || !prompt.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold font-mono transition flex items-center space-x-2 shadow-lg shadow-blue-900/30 cursor-pointer"
          >
            {isCompiling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Assembling DOS Binary...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Compile to MS-DOS</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instant Retro Presets Library */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-mono text-[#8b949e] uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles size={13} className="text-amber-400" />
            <span>Instant Retro Computing Presets (Ready to Run):</span>
          </span>
          <span className="text-[11px] text-[#6e7681]">Click to load & test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {DOS_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1b222d] border-blue-500 shadow-sm'
                    : 'bg-[#161b22] border-[#30363d] hover:bg-[#1f242c] hover:border-[#484f58]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e]">
                      {preset.category}
                    </span>
                    <span className="text-[10px] font-mono text-blue-400 font-semibold">
                      .{preset.recommendedFormat}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{preset.title}</h4>
                  <p className="text-[11px] text-[#8b949e] line-clamp-2 leading-snug">
                    {preset.prompt}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#30363d]/50 flex items-center justify-between text-[10px] font-mono text-[#6e7681]">
                  <span>Target: {preset.targetSystem.toUpperCase()}</span>
                  <span className="text-blue-400 font-bold flex items-center">
                    Launch <ArrowRight size={10} className="ml-1" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
