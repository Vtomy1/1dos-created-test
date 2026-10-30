import React, { useState } from 'react';
import { DosProgramResult } from '../types/dos';
import { createFat12FloppyImage, downloadBinaryFile, downloadTextFile, DiskFile } from '../utils/fat12Floppy';
import { audioSynth } from '../utils/audioSynth';
import { Download, Disc, Copy, Check, Printer, FileText, Sparkles } from 'lucide-react';

interface FloppyDiskExportProps {
  program: DosProgramResult;
}

export const FloppyDiskExport: React.FC<FloppyDiskExportProps> = ({ program }) => {
  const [volumeLabel, setVolumeLabel] = useState('DOSCRAFT');
  const [copiedScript, setCopiedScript] = useState(false);
  const [diskType, setDiskType] = useState<'3.5' | '5.25'>('3.5');
  const [brandStyle, setBrandStyle] = useState<'DYSAN' | 'VERBATIM' | '3M' | 'MAXELL'>('VERBATIM');

  const handleDownloadFile = (filename: string, content: string) => {
    audioSynth.playFloppySeek(2);
    downloadTextFile(filename, content);
  };

  const handleDownloadFloppyImage = () => {
    audioSynth.playFloppySeek(6);

    const filesToPack: DiskFile[] = [
      {
        filename: program.filename,
        content: program.primaryCode,
      },
    ];

    if (program.companionFiles) {
      for (const cf of program.companionFiles) {
        filesToPack.push({
          filename: cf.filename,
          content: cf.content,
        });
      }
    }

    if (program.debugScript) {
      filesToPack.push({
        filename: `${program.filename.split('.')[0]}.SCR`,
        content: program.debugScript,
      });
    }

    const diskImgBytes = createFat12FloppyImage(filesToPack, volumeLabel || 'DOSCRAFT');
    downloadBinaryFile(`${(volumeLabel || 'DOSCRAFT').toLowerCase()}.img`, diskImgBytes);
  };

  const handleCopyDebugScript = () => {
    const textToCopy = program.debugScript || program.primaryCode;
    navigator.clipboard.writeText(textToCopy);
    setCopiedScript(true);
    audioSynth.beep(1000, 60);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Download Actions & Floppy Image Pack */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-[#30363d]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Disc size={18} className="text-blue-400" />
              <span>Virtual Floppy Disk (.IMG) & Binary Export</span>
            </h3>
            <p className="text-xs text-[#8b949e] mt-0.5">
              Generates byte-exact 1.44MB FAT12 floppy images mountable in DOSBox, 86Box, PCem, or writable to physical diskettes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              maxLength={11}
              value={volumeLabel}
              onChange={(e) => setVolumeLabel(e.target.value.toUpperCase().replace(/[^A-Z0-9_\-]/g, ''))}
              placeholder="VOL_LABEL"
              className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white uppercase w-28 text-center outline-none focus:border-blue-500"
              title="FAT12 Volume Label (Max 11 chars)"
            />
            <button
              onClick={handleDownloadFloppyImage}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold font-mono transition flex items-center space-x-2 shadow-sm"
            >
              <Download size={14} />
              <span>Download 1.44M Floppy (.IMG)</span>
            </button>
          </div>
        </div>

        {/* Direct Individual File Downloads */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#8b949e] uppercase tracking-wider block mb-2">
            Direct File Downloads (8.3 MS-DOS Format):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDownloadFile(program.filename, program.primaryCode)}
              className="px-3 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-xs font-mono text-white transition flex items-center space-x-2"
            >
              <FileText size={14} className="text-blue-400" />
              <span>{program.filename}</span>
              <span className="text-[10px] text-[#8b949e]">({program.primaryCode.length} bytes)</span>
            </button>

            {program.companionFiles?.map((cf, idx) => (
              <button
                key={idx}
                onClick={() => handleDownloadFile(cf.filename, cf.content)}
                className="px-3 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-xs font-mono text-white transition flex items-center space-x-2"
              >
                <FileText size={14} className="text-emerald-400" />
                <span>{cf.filename}</span>
                <span className="text-[10px] text-[#8b949e]">({cf.content.length} bytes)</span>
              </button>
            ))}

            {program.debugScript && (
              <button
                onClick={() => handleDownloadFile(`${program.filename.split('.')[0]}.SCR`, program.debugScript)}
                className="px-3 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-xs font-mono text-white transition flex items-center space-x-2"
              >
                <FileText size={14} className="text-purple-400" />
                <span>{program.filename.split('.')[0]}.SCR (DEBUG)</span>
              </button>
            )}

            <button
              onClick={handleCopyDebugScript}
              className="px-3 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-xs font-mono text-[#c9d1d9] transition flex items-center space-x-1.5 ml-auto"
            >
              {copiedScript ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Retro Floppy Diskette Label Designer */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#30363d]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles size={16} className="text-amber-400" />
              <span>Vintage Floppy Diskette Label Generator</span>
            </h3>
            <p className="text-xs text-[#8b949e]">
              Printable authentic retro sticker labels with physical write-protect notch styling.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
              <button
                onClick={() => setDiskType('3.5')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  diskType === '3.5' ? 'bg-blue-600 text-white' : 'text-[#8b949e]'
                }`}
              >
                3.5" HD (1.44M)
              </button>
              <button
                onClick={() => setDiskType('5.25')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  diskType === '5.25' ? 'bg-blue-600 text-white' : 'text-[#8b949e]'
                }`}
              >
                5.25" DS/DD (360K)
              </button>
            </div>

            <div className="flex items-center space-x-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
              {(['VERBATIM', 'DYSAN', '3M', 'MAXELL'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBrandStyle(b)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    brandStyle === b ? 'bg-[#30363d] text-white' : 'text-[#8b949e]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.print()}
              className="p-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white rounded-lg transition"
              title="Print Label"
            >
              <Printer size={15} />
            </button>
          </div>
        </div>

        {/* Physical Floppy Diskette Rendering */}
        <div className="flex justify-center p-6 bg-[#0c0d0e] rounded-xl border border-[#21262d]">
          {diskType === '3.5' ? (
            /* 3.5" High Density Plastic Shutter Floppy */
            <div className="relative w-72 h-76 bg-gradient-to-b from-[#1e2329] to-[#121519] rounded-t-xl rounded-b-md p-3 shadow-2xl border border-[#30363d] flex flex-col justify-between">
              {/* Metal Sliding Shutter */}
              <div className="w-32 h-14 bg-gradient-to-r from-[#94a3b8] via-[#cbd5e1] to-[#64748b] rounded-t-sm mx-auto shadow-inner flex items-center justify-center border-b border-[#475569]">
                <div className="w-8 h-8 rounded-full bg-[#334155] border-2 border-[#1e293b] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#0f172a]" />
                </div>
              </div>

              {/* Diskette Paper Label */}
              <div className="w-full bg-[#fdfbf7] text-[#1c1917] p-3 rounded shadow-md border border-[#e2e8f0] font-mono text-xs my-auto">
                <div className="flex justify-between items-center border-b border-red-500 pb-1 mb-2">
                  <span className="font-extrabold text-red-600 tracking-wider text-sm">{brandStyle}</span>
                  <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.2 rounded">MF2-HD</span>
                </div>

                <div className="text-sm font-bold text-black truncate uppercase">
                  {program.title}
                </div>
                <div className="text-[11px] text-[#44403c] font-semibold mt-0.5">
                  MAIN: <span className="text-blue-700">{program.filename}</span>
                </div>
                <div className="text-[10px] text-[#78716c] mt-2 border-t border-dashed border-[#cbd5e1] pt-1 flex justify-between">
                  <span>FORMAT: FAT12 (1.44 MB)</span>
                  <span>BAD SEC: 0</span>
                </div>
                <div className="text-[9px] text-[#a8a29e] mt-1 italic">
                  Run at DOS prompt: A:\&gt; {program.filename}
                </div>
              </div>

              {/* Bottom Notches: High Density Hole (right) & Write Protect Switch (left) */}
              <div className="flex justify-between items-center px-1 text-[10px] text-[#64748b] font-mono">
                <div className="w-3 h-3.5 bg-black rounded-xs border border-[#475569] shadow-inner" title="Write-Protect Locked" />
                <span className="text-[9px] font-bold tracking-widest text-[#475569]">HIGH DENSITY 2.0MB UNFORMATTED</span>
                <div className="w-3 h-3.5 bg-black rounded-xs border border-[#475569] shadow-inner" title="1.44M HD Sensor Hole" />
              </div>
            </div>
          ) : (
            /* 5.25" Flexible Jacket Floppy */
            <div className="relative w-80 h-80 bg-[#171717] rounded-sm p-4 shadow-2xl border-2 border-[#262626] flex flex-col justify-between">
              {/* Write Protect Notch (upper right) */}
              <div className="absolute top-8 right-0 w-3 h-4 bg-[#0c0d0e] border-l border-y border-[#333]" />

              {/* Top Paper Label */}
              <div className="w-full bg-[#fef08a] text-[#713f12] p-2.5 rounded-xs shadow border border-[#facc15] font-mono text-xs">
                <div className="flex justify-between items-center border-b border-[#ca8a04] pb-1 mb-1">
                  <span className="font-extrabold text-[#854d0e] tracking-wider text-sm">{brandStyle} 5.25"</span>
                  <span className="text-[10px] font-bold text-[#854d0e]">DOUBLE SIDED / DOUBLE DENSITY</span>
                </div>
                <div className="font-bold text-[#422006] text-sm truncate uppercase">{program.title}</div>
                <div className="text-[11px] text-[#713f12]">{program.filename} | 360 KB (48 TPI)</div>
              </div>

              {/* Center Spindle Hole & Read Head Oval Cutout */}
              <div className="relative flex flex-col items-center justify-center my-auto">
                <div className="w-20 h-20 rounded-full bg-[#0c0d0e] border-4 border-[#262626] flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-[#171717]" />
                </div>
                {/* Index Sensor Hole */}
                <div className="absolute top-2 right-24 w-2 h-2 rounded-full bg-[#0c0d0e]" />
                {/* Magnetic Read/Write Head Slot */}
                <div className="w-6 h-12 bg-[#0c0d0e] rounded-full border border-[#262626] mt-2 shadow-inner" />
              </div>

              <div className="text-center text-[10px] text-[#525252] font-mono">
                IBM PC / XT 5150 / 5160 COMPATIBLE - 300 RPM
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
