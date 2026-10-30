import React, { useState } from 'react';
import { PhosphorTheme } from '../types/dos';
import { audioSynth } from '../utils/audioSynth';
import { Volume2, VolumeX, Sparkles, Monitor, Sliders } from 'lucide-react';

interface CrtMonitorProps {
  children: React.ReactNode;
  theme: PhosphorTheme;
  onThemeChange: (theme: PhosphorTheme) => void;
  titleBar?: string;
}

export const CrtMonitor: React.FC<CrtMonitorProps> = ({
  children,
  theme,
  onThemeChange,
  titleBar = 'IBM 5153 COLOR DISPLAY / MULTISYNC II',
}) => {
  const [scanlines, setScanlines] = useState(true);
  const [curvature, setCurvature] = useState(true);
  const [flicker, setFlicker] = useState(false);
  const [isDegaussing, setIsDegaussing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleDegauss = () => {
    setIsDegaussing(true);
    audioSynth.playDegauss();
    setTimeout(() => {
      setIsDegaussing(false);
    }, 850);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioSynth.setMuted(next);
  };

  const getThemeClass = () => {
    switch (theme) {
      case 'amber':
        return 'glow-amber bg-[#120a00] text-[#ffb000]';
      case 'green':
        return 'glow-green bg-[#031303] text-[#33ff33]';
      case 'white':
        return 'glow-white bg-[#0a0d11] text-[#f0f6fc]';
      case 'vga':
      default:
        return 'glow-vga bg-[#000000] text-[#aaaaaa]';
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-6xl mx-auto">
      {/* Heavy vintage CRT Monitor Bezel (Beige / Warm Gray with textured depth) */}
      <div className="w-full bg-gradient-to-b from-[#2b2f36] via-[#22262c] to-[#1a1d22] border-4 border-[#3a4049] rounded-2xl p-4 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.15)] transition-all">
        
        {/* Top Monitor Ridge & Model Emblem */}
        <div className="flex items-center justify-between pb-3 px-2 border-b border-[#2d333b]/60 mb-4 text-xs font-mono tracking-wider text-[#8b949e]">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></span>
            <span className="font-bold text-[#c9d1d9]">{titleBar}</span>
            <span className="hidden sm:inline text-[#6e7681]">| 60Hz INTERLACED</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded bg-[#161b22] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition flex items-center space-x-1"
              title="Display Settings"
            >
              <Sliders size={14} />
              <span className="hidden md:inline text-[11px]">CRT Controls</span>
            </button>

            <button
              onClick={handleDegauss}
              disabled={isDegaussing}
              className="p-1.5 rounded bg-[#161b22] hover:bg-[#30363d] text-[#e3b341] hover:text-[#f2cc60] transition flex items-center space-x-1"
              title="Degauss CRT Tube"
            >
              <Sparkles size={14} />
              <span className="hidden md:inline text-[11px]">Degauss</span>
            </button>

            <button
              onClick={toggleMute}
              className={`p-1.5 rounded transition ${
                isMuted
                  ? 'bg-red-950/50 text-red-400'
                  : 'bg-[#161b22] hover:bg-[#30363d] text-[#8b949e] hover:text-white'
              }`}
              title={isMuted ? 'Unmute PC Speaker' : 'Mute PC Speaker'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        </div>

        {/* Display Settings drawer if toggled */}
        {showSettings && (
          <div className="mb-4 p-3 bg-[#13161a] border border-[#30363d] rounded-lg flex flex-wrap items-center gap-4 text-xs text-[#c9d1d9]">
            <div className="flex items-center space-x-2">
              <span className="text-[#8b949e]">Phosphor:</span>
              {(['vga', 'amber', 'green', 'white'] as PhosphorTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onThemeChange(t)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition ${
                    theme === t
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-[#21262d] text-[#8b949e] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 ml-auto">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scanlines}
                  onChange={(e) => setScanlines(e.target.checked)}
                  className="rounded bg-[#21262d] border-[#30363d] text-blue-500 focus:ring-0"
                />
                <span className="text-[11px]">Scanlines</span>
              </label>

              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={curvature}
                  onChange={(e) => setCurvature(e.target.checked)}
                  className="rounded bg-[#21262d] border-[#30363d] text-blue-500 focus:ring-0"
                />
                <span className="text-[11px]">CRT Curve</span>
              </label>

              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flicker}
                  onChange={(e) => setFlicker(e.target.checked)}
                  className="rounded bg-[#21262d] border-[#30363d] text-blue-500 focus:ring-0"
                />
                <span className="text-[11px]">60Hz Flicker</span>
              </label>
            </div>
          </div>
        )}

        {/* Inner Cathode Tube Screen Inset */}
        <div
          className={`relative overflow-hidden transition-all duration-300 ${
            curvature ? 'crt-screen-curved border-8 border-[#121519]' : 'border-4 border-[#121519]'
          } ${isDegaussing ? 'animate-degauss' : ''} ${flicker ? 'animate-crt-flicker' : ''}`}
        >
          {/* Phosphor Canvas Background */}
          <div className={`w-full min-h-[460px] p-4 sm:p-6 transition-colors duration-200 ${getThemeClass()}`}>
            {children}
          </div>

          {/* CRT Scanline Shader Overlay */}
          {scanlines && (
            <div className="absolute inset-0 crt-scanlines pointer-events-none z-20" />
          )}

          {/* Glass reflection gradient highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.04] pointer-events-none z-30" />
        </div>

        {/* Bottom monitor panel with authentic hardware badges */}
        <div className="mt-4 pt-3 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#6e7681] border-t border-[#2d333b]/40">
          <div className="flex items-center space-x-3">
            <span className="px-2 py-0.5 bg-[#161b22] border border-[#30363d] rounded text-[#8b949e]">
              VIDEO: CGA / EGA / VGA MODE 3h
            </span>
            <span className="hidden sm:inline">RESOLUTION: 720x400 @ 70Hz</span>
          </div>

          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>POWER ON</span>
            <span className="text-[#30363d]">|</span>
            <span className="text-[#8b949e]">SYNC LOCK: OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
