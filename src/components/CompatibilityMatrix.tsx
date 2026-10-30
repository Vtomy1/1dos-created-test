import React from 'react';
import { DosProgramResult, TargetSystemId } from '../types/dos';
import { SYSTEM_MODELS } from '../utils/dosPresets';
import { CheckCircle2, AlertTriangle, XCircle, Cpu, HardDrive, Volume2, Monitor, ShieldCheck, Wrench } from 'lucide-react';

interface CompatibilityMatrixProps {
  program: DosProgramResult;
  onApplyPatch?: () => void;
}

export const CompatibilityMatrix: React.FC<CompatibilityMatrixProps> = ({
  program,
  onApplyPatch,
}) => {
  const getStatusBadge = (status: 'compatible' | 'needs_patch' | 'incompatible') => {
    switch (status) {
      case 'compatible':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 size={12} className="mr-1" />
            100% COMPATIBLE
          </span>
        );
      case 'needs_patch':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800/80">
            <AlertTriangle size={12} className="mr-1" />
            NEEDS PATCH
          </span>
        );
      case 'incompatible':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-800/80">
            <XCircle size={12} className="mr-1" />
            INCOMPATIBLE
          </span>
        );
    }
  };

  const getSystemStatus = (sysId: TargetSystemId) => {
    if (sysId === 'all') return null;
    return program.compatibilityMatrix?.[sysId] || { status: 'compatible', reason: 'Verified standard DOS instruction set.' };
  };

  const modelsList = SYSTEM_MODELS.filter((m) => m.id !== 'all');

  return (
    <div className="w-full space-y-6">
      {/* Top System Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Conventional Memory Gauge */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 flex items-start space-x-3">
          <div className="p-2 bg-blue-950/60 text-blue-400 border border-blue-800/60 rounded-lg">
            <HardDrive size={18} />
          </div>
          <div>
            <span className="text-xs text-[#8b949e] font-mono">CONVENTIONAL RAM</span>
            <div className="text-lg font-bold text-white font-mono">
              {program.memoryRequirements.conventionalKB} KB / 640 KB
            </div>
            <div className="w-full bg-[#21262d] h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (program.memoryRequirements.conventionalKB / 640) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Video Mode Specification */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 flex items-start space-x-3">
          <div className="p-2 bg-purple-950/60 text-purple-400 border border-purple-800/60 rounded-lg">
            <Monitor size={18} />
          </div>
          <div>
            <span className="text-xs text-[#8b949e] font-mono">VIDEO SUBSYSTEM</span>
            <div className="text-sm font-bold text-white font-mono truncate">
              {program.audioVideoProfile.videoMode}
            </div>
            <span className="text-[11px] text-[#8b949e]">BIOS INT 10h Compliant</span>
          </div>
        </div>

        {/* Audio Driver / Chipset */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 flex items-start space-x-3">
          <div className="p-2 bg-amber-950/60 text-amber-400 border border-amber-800/60 rounded-lg">
            <Volume2 size={18} />
          </div>
          <div>
            <span className="text-xs text-[#8b949e] font-mono">AUDIO HARDWARE</span>
            <div className="text-sm font-bold text-white font-mono truncate">
              {program.audioVideoProfile.soundMode}
            </div>
            <span className="text-[11px] text-[#8b949e]">Port 61h / SB16 DSP</span>
          </div>
        </div>

        {/* Kernel / DOS Version */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 flex items-start space-x-3">
          <div className="p-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded-lg">
            <Cpu size={18} />
          </div>
          <div>
            <span className="text-xs text-[#8b949e] font-mono">KERNEL BASELINE</span>
            <div className="text-sm font-bold text-white font-mono">
              MS-DOS {program.memoryRequirements.minDosVersion}+
            </div>
            <span className="text-[11px] text-[#8b949e]">
              {program.memoryRequirements.requiresEMS ? 'EMS 4.0 Required' : 'No EMS Required'}
            </span>
          </div>
        </div>
      </div>

      {/* Applied Compatibility Patches Banner */}
      {program.compatibilityPatches && program.compatibilityPatches.length > 0 && (
        <div className="bg-[#121f17] border border-emerald-900/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck size={16} />
              <span>Cross-Retro Model Compatibility Optimizations</span>
            </div>
            <span className="text-xs font-mono text-emerald-500/80">
              {program.compatibilityPatches.length} PATCHES ACTIVE
            </span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#c9d1d9] font-mono">
            {program.compatibilityPatches.map((patch, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{patch}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Retro Systems Matrix Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-[#21262d]/60 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Cpu size={16} className="text-blue-400" />
              <span>Multi-Model Retro Computing Compatibility Audit</span>
            </h3>
            <p className="text-xs text-[#8b949e]">
              Hardware validation matrix across distinct computing eras and microprocessor architectures.
            </p>
          </div>

          {onApplyPatch && (
            <button
              onClick={onApplyPatch}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              <Wrench size={13} />
              <span>Apply Universal 8088 Patch</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#30363d] bg-[#111418] text-[#8b949e]">
                <th className="py-2.5 px-4 font-semibold">Retro Computer Model</th>
                <th className="py-2.5 px-4 font-semibold">Architecture & Clock</th>
                <th className="py-2.5 px-4 font-semibold">Graphics & Sound</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold">Hardware Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/60 text-[#c9d1d9]">
              {modelsList.map((model) => {
                const statusInfo = getSystemStatus(model.id);
                return (
                  <tr key={model.id} className="hover:bg-[#1c2128] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{model.name}</div>
                      <div className="text-[11px] text-[#8b949e]">Year: {model.year} | {model.badge}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">{model.cpu}</div>
                      <div className="text-[11px] text-[#8b949e]">{model.clockSpeed} | Max {model.ramMax}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white truncate max-w-[160px]">{model.graphics}</div>
                      <div className="text-[11px] text-[#8b949e] truncate max-w-[160px]">{model.audio}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {statusInfo ? getStatusBadge(statusInfo.status) : getStatusBadge('compatible')}
                    </td>
                    <td className="py-3 px-4 text-[#8b949e] max-w-xs text-[11px] leading-relaxed">
                      {statusInfo ? statusInfo.reason : model.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
