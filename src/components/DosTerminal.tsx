import React, { useState, useEffect, useRef } from 'react';
import { DosProgramResult, PhosphorTheme } from '../types/dos';
import { audioSynth } from '../utils/audioSynth';
import { parseAnsiText } from '../utils/ansiParser';
import { Play, RotateCcw, Terminal, Code, HelpCircle } from 'lucide-react';

interface DosTerminalProps {
  program: DosProgramResult | null;
  theme: PhosphorTheme;
}

interface CommandHistory {
  id: string;
  type: 'input' | 'output' | 'ansi' | 'canvas' | 'editor';
  text?: string;
  ansiSpans?: ReturnType<typeof parseAnsiText>;
}

export const DosTerminal: React.FC<DosTerminalProps> = ({ program, theme }) => {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistoryList, setCommandHistoryList] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isRunningProgram, setIsRunningProgram] = useState(false);
  const [interactiveBatchStep, setInteractiveBatchStep] = useState<number | null>(null);
  const [interactiveVars, setInteractiveVars] = useState<Record<string, string>>({});
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorFilename, setEditorFilename] = useState('');
  const [editorContent, setEditorContent] = useState('');

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initial boot sequence on mount
  useEffect(() => {
    runBootSequence();
  }, []);

  // When program changes, show notification in DOS prompt
  useEffect(() => {
    if (program) {
      audioSynth.playFloppySeek(3);
      setHistory((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type: 'output',
          text: `\r\nDrive A: Floppy disk inserted [${program.filename}].`,
        },
        {
          id: Math.random().toString(),
          type: 'output',
          text: `Type "RUN" or "${program.filename}" to execute.`,
        },
      ]);
    }
  }, [program]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isRunningProgram]);

  const runBootSequence = () => {
    audioSynth.playFloppySeek(5);
    setHistory([
      { id: '1', type: 'output', text: 'Starting MS-DOS...' },
      { id: '2', type: 'output', text: 'HIMEM: Testing extended memory... done.' },
      { id: '3', type: 'output', text: 'EMM386 4.49: Expanded Memory Manager installed.' },
      { id: '4', type: 'output', text: 'MS-DOS Version 6.22 (C)Copyright Microsoft Corp 1981-1994.' },
      { id: '5', type: 'output', text: 'C:\\> SET SOUND=C:\\SB16' },
      { id: '6', type: 'output', text: 'C:\\> SET BLASTER=A220 I5 D1 H5 P330 T6' },
      { id: '7', type: 'output', text: 'C:\\> PROMPT $P$G' },
      { id: '8', type: 'output', text: 'Ready. Type HELP for commands or RUN to launch loaded program.' },
    ]);
  };

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) {
      setHistory((prev) => [
        ...prev,
        { id: Math.random().toString(), type: 'input', text: 'C:\\>' },
      ]);
      return;
    }

    setCommandHistoryList((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toUpperCase();
    const arg = parts.slice(1).join(' ');

    const newEntries: CommandHistory[] = [
      { id: Math.random().toString(), type: 'input', text: `C:\\> ${trimmed}` },
    ];

    switch (cmd) {
      case 'CLS':
        setHistory([]);
        return;

      case 'VER':
        newEntries.push({
          id: Math.random().toString(),
          type: 'output',
          text: 'MS-DOS Version 6.22\r\n(C) Copyright Microsoft Corp 1981-1994.',
        });
        break;

      case 'DIR':
        audioSynth.playFloppySeek(4);
        const files = [
          { name: 'COMMAND .COM', size: '54,645', date: '05-31-94  6:22a' },
          { name: 'CONFIG  .SYS', size: '   428', date: '10-29-88  3:14p' },
          { name: 'AUTOEXEC.BAT', size: '   312', date: '10-29-88  3:15p' },
          { name: 'HIMEM   .SYS', size: '29,136', date: '05-31-94  6:22a' },
          { name: 'EMM386  .EXE', size: '120,926', date: '05-31-94  6:22a' },
          { name: 'QBASIC  .EXE', size: '194,309', date: '05-31-94  6:22a' },
          { name: 'DEBUG   .EXE', size: '15,715', date: '05-31-94  6:22a' },
          { name: 'MEM     .EXE', size: '32,150', date: '05-31-94  6:22a' },
          { name: 'CHOICE  .COM', size: ' 1,754', date: '05-31-94  6:22a' },
        ];

        if (program) {
          const parts = program.filename.split('.');
          const base = (parts[0] || 'APP').padEnd(8, ' ').slice(0, 8);
          const ext = (parts[1] || 'BAT').padEnd(3, ' ').slice(0, 3);
          files.unshift({
            name: `${base}.${ext}`,
            size: `${program.primaryCode.length.toLocaleString()}`.padStart(6, ' '),
            date: '10-29-88 12:00p',
          });
          if (program.companionFiles) {
            for (const cf of program.companionFiles) {
              const cParts = cf.filename.split('.');
              files.unshift({
                name: `${(cParts[0] || '').padEnd(8, ' ').slice(0, 8)}.${(cParts[1] || '').padEnd(3, ' ').slice(0, 3)}`,
                size: `${cf.content.length.toLocaleString()}`.padStart(6, ' '),
                date: '10-29-88 12:00p',
              });
            }
          }
        }

        let dirOutput = ` Volume in drive C has no label\r\n Volume Serial Number is 1988-1029\r\n Directory of C:\\\r\n\r\n`;
        for (const f of files) {
          dirOutput += `${f.name}   ${f.size.padStart(8, ' ')}  ${f.date}\r\n`;
        }
        dirOutput += `        ${files.length} file(s)        448,875 bytes\r\n                       14,250,496 bytes free`;
        newEntries.push({ id: Math.random().toString(), type: 'output', text: dirOutput });
        break;

      case 'MEM':
        audioSynth.playFloppySeek(2);
        const memReport = `Memory Type        Total  =   Used  +   Free\r\n----------------  ------     ------    ------\r\nConventional        640K        18K      622K\r\nUpper (UMB)         155K        48K      107K\r\nReserved            384K       384K        0K\r\nExtended (XMS)    7,168K     1,024K    6,144K\r\n----------------  ------     ------    ------\r\nTotal memory      8,347K     1,474K    6,873K\r\n\r\nTotal under 1 MB    795K        66K      729K\r\n\r\nLargest executable program size       621K (636,256 bytes)\r\nLargest free upper memory block       104K (106,496 bytes)\r\nMS-DOS is resident in the high memory area.`;
        newEntries.push({ id: Math.random().toString(), type: 'output', text: memReport });
        break;

      case 'TYPE':
        if (!arg) {
          newEntries.push({ id: Math.random().toString(), type: 'output', text: 'Required parameter missing.' });
        } else {
          audioSynth.playFloppySeek(3);
          const upperArg = arg.toUpperCase();
          if (program && (upperArg === program.filename.toUpperCase() || upperArg === program.filename.split('.')[0])) {
            if (program.primaryType === 'ANS') {
              newEntries.push({
                id: Math.random().toString(),
                type: 'ansi',
                ansiSpans: parseAnsiText(program.primaryCode),
              });
            } else {
              newEntries.push({
                id: Math.random().toString(),
                type: 'output',
                text: program.primaryCode,
              });
            }
          } else if (upperArg === 'CONFIG.SYS' && program?.companionFiles) {
            const cf = program.companionFiles.find((f) => f.filename.toUpperCase() === 'CONFIG.SYS');
            newEntries.push({ id: Math.random().toString(), type: 'output', text: cf ? cf.content : 'DEVICE=C:\\DOS\\HIMEM.SYS\r\nDOS=HIGH,UMB' });
          } else if (upperArg === 'AUTOEXEC.BAT' && program?.companionFiles) {
            const cf = program.companionFiles.find((f) => f.filename.toUpperCase() === 'AUTOEXEC.BAT');
            newEntries.push({ id: Math.random().toString(), type: 'output', text: cf ? cf.content : '@ECHO OFF\r\nPROMPT $P$G' });
          } else {
            newEntries.push({ id: Math.random().toString(), type: 'output', text: `File not found - ${arg}` });
          }
        }
        break;

      case 'BEEP':
        audioSynth.beep(800, 150);
        newEntries.push({ id: Math.random().toString(), type: 'output', text: 'PC Speaker: 800Hz / 150ms pulsed.' });
        break;

      case 'PLAY':
        const mml = arg || 'T140 O3 L8 C E G O4 C';
        newEntries.push({ id: Math.random().toString(), type: 'output', text: `Playing MML: "${mml}"` });
        audioSynth.playMML(mml);
        break;

      case 'HELP':
        newEntries.push({
          id: Math.random().toString(),
          type: 'output',
          text: `AVAILABLE MS-DOS COMMANDS:\r\n  RUN [file]   - Execute current compiled DOS program\r\n  DIR [/W]     - Display files on drive C:\r\n  TYPE [file]  - Display file contents / ANSI art\r\n  EDIT [file]  - Open vintage MS-DOS blue screen editor\r\n  MEM          - Display conventional (640K), UMB, XMS memory\r\n  VER          - Display MS-DOS version\r\n  PLAY [MML]   - Play Music Macro Language through PC speaker\r\n  BEEP         - Test 1-bit PC Speaker\r\n  DEBUG        - Enter 16-bit x86 debugger / disassembler\r\n  REBOOT       - Perform IBM BIOS cold boot sequence\r\n  CLS          - Clear screen`,
        });
        break;

      case 'DEBUG':
        audioSynth.beep(440, 80);
        newEntries.push({
          id: Math.random().toString(),
          type: 'output',
          text: program?.debugScript
            ? `DEBUG.EXE v2.4\r\n-r\r\nAX=0000  BX=0000  CX=002E  DX=0000  SP=FFEE  BP=0000  SI=0000  DI=0000\r\nDS=1B3C  ES=1B3C  SS=1B3C  CS=1B3C  IP=0100   NV UP EI PL NZ NA PO NC\r\n1B3C:0100 B80300        MOV     AX,0003\r\nScript ready. Type "RUN" to execute assembled COM.`
            : 'DEBUG.EXE v2.4\r\n-u 100 110\r\n1B3C:0100 B8004C        MOV     AX,4C00\r\n1B3C:0103 CD21          INT     21\r\n-q',
        });
        break;

      case 'EDIT':
        setIsEditorOpen(true);
        setEditorFilename(arg || (program ? program.filename : 'UNTITLED.TXT'));
        setEditorContent(program ? program.primaryCode : '@ECHO OFF\r\nECHO New DOS script\r\n');
        return;

      case 'REBOOT':
        runBootSequence();
        return;

      case 'RUN':
      case (program?.filename.toUpperCase() || ''):
      case (program?.filename.split('.')[0]?.toUpperCase() || ''):
        executeProgram();
        return;

      default:
        audioSynth.beep(200, 100);
        newEntries.push({
          id: Math.random().toString(),
          type: 'output',
          text: `Bad command or file name: "${trimmed}". Type HELP for available commands.`,
        });
        break;
    }

    setHistory((prev) => [...prev, ...newEntries]);
  };

  const executeProgram = () => {
    if (!program) {
      setHistory((prev) => [
        ...prev,
        { id: Math.random().toString(), type: 'input', text: 'C:\\> RUN' },
        { id: Math.random().toString(), type: 'output', text: 'No program loaded in drive A:. Compile a prompt first!' },
      ]);
      return;
    }

    audioSynth.playFloppySeek(4);
    setIsRunningProgram(true);

    const runHeader: CommandHistory = {
      id: Math.random().toString(),
      type: 'input',
      text: `C:\\> ${program.filename}`,
    };

    if (program.primaryType === 'ANS') {
      setHistory((prev) => [
        ...prev,
        runHeader,
        {
          id: Math.random().toString(),
          type: 'ansi',
          ansiSpans: parseAnsiText(program.primaryCode),
        },
      ]);
      setIsRunningProgram(false);
      return;
    }

    if (program.primaryType === 'BAS') {
      // QBASIC execution
      audioSynth.beep(660, 100);
      setTimeout(() => audioSynth.beep(880, 150), 120);

      const isGraphics = program.primaryCode.includes('SCREEN 13') || program.primaryCode.includes('SCREEN 1') || program.primaryCode.includes('PSET') || program.primaryCode.includes('FIRE');

      setHistory((prev) => [
        ...prev,
        runHeader,
        {
          id: Math.random().toString(),
          type: 'output',
          text: `Starting MS-DOS QBASIC 1.1 Interpreter...\r\nLoading "${program.filename}"...`,
        },
      ]);

      if (isGraphics) {
        // Render graphics canvas
        setTimeout(() => {
          setHistory((prev) => [
            ...prev,
            { id: Math.random().toString(), type: 'canvas' },
          ]);
          setIsRunningProgram(false);
          startCanvasDemo();
        }, 300);
      } else {
        // Parse simulated output
        setTimeout(() => {
          setHistory((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              type: 'output',
              text: `================================================================================\r\n                   ${program.title.toUpperCase()}\r\n================================================================================\r\nExecuting BASIC instructions... Output verified!\r\nPress any key to return to DOS prompt.\r\nProgram terminated normally.`,
            },
          ]);
          setIsRunningProgram(false);
        }, 500);
      }
      return;
    }

    if (program.primaryType === 'BAT') {
      // Batch file execution
      setHistory((prev) => [
        ...prev,
        runHeader,
        {
          id: Math.random().toString(),
          type: 'output',
          text: `@ECHO OFF\r\nExecuting ${program.filename}...\r\n`,
        },
        {
          id: Math.random().toString(),
          type: 'output',
          text: `------------------------------------------------------------------\r\n ${program.title.toUpperCase()}\r\n Universal Compatibility Mode: ACTIVE\r\n------------------------------------------------------------------\r\n[1] Run Primary Action\r\n[2] Run Subsystem Audit\r\n[Q] Exit Batch Script\r\n\r\nSelect Option [1, 2, Q]: 1\r\nExecuting test sequence... SUCCESS. Return code: ERRORLEVEL 0.\r\nBatch process completed.`,
        },
      ]);
      setIsRunningProgram(false);
      return;
    }

    if (program.primaryType === 'ASM_COM') {
      audioSynth.beep(1200, 80);
      setHistory((prev) => [
        ...prev,
        runHeader,
        {
          id: Math.random().toString(),
          type: 'output',
          text: `Executing 16-Bit Real Mode Binary [${program.filename}]...\r\nCS:IP = 1B3C:0100 (PSP 256 bytes verified)\r\nInterrupt calls INT 10h / INT 21h executed.\r\nProgram terminated with exit code 0 (INT 21h AH=4Ch).`,
        },
      ]);
      setIsRunningProgram(false);
      return;
    }

    // Default config / text
    setHistory((prev) => [
      ...prev,
      runHeader,
      {
        id: Math.random().toString(),
        type: 'output',
        text: `Configuration file verified.\r\n${program.primaryCode}`,
      },
    ]);
    setIsRunningProgram(false);
  };

  const startCanvasDemo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulate 320x200 Mode 13h pixel canvas
    const width = 320;
    const height = 200;
    canvas.width = width;
    canvas.height = height;

    let frame = 0;
    const fireData = new Uint8Array(width * height);

    const animate = () => {
      if (!canvasRef.current) return;
      frame++;

      // Seed bottom row
      for (let x = 30; x < width - 30; x++) {
        if (Math.random() > 0.35) {
          fireData[(height - 1) * width + x] = Math.floor(Math.random() * 255);
        } else {
          fireData[(height - 1) * width + x] = 0;
        }
      }

      // Propagate fire upward
      for (let y = 10; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const c1 = fireData[(y + 1) * width + x];
          const c2 = fireData[(y + 1) * width + (x - 1)];
          const c3 = fireData[(y + 1) * width + (x + 1)];
          const c4 = fireData[(y + 2 < height ? y + 2 : y + 1) * width + x];
          const avg = Math.max(0, Math.floor((c1 + c2 + c3 + c4) / 4) - 1);
          fireData[y * width + x] = avg;
        }
      }

      // Draw pixels to canvas
      const imgData = ctx.createImageData(width, height);
      for (let i = 0; i < fireData.length; i++) {
        const val = fireData[i];
        const pixelIdx = i * 4;
        if (val > 0) {
          // Flame thermal palette: Black -> Red -> Orange -> Yellow -> White
          imgData.data[pixelIdx] = Math.min(255, val * 2.2); // R
          imgData.data[pixelIdx + 1] = Math.min(255, Math.max(0, (val - 50) * 1.8)); // G
          imgData.data[pixelIdx + 2] = Math.min(255, Math.max(0, (val - 170) * 3)); // B
          imgData.data[pixelIdx + 3] = 255;
        } else {
          imgData.data[pixelIdx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Overlay retro text
      ctx.fillStyle = '#ffff55';
      ctx.font = '10px monospace';
      ctx.fillText('VGA MODE 13h (320x200x256) - RETRO CANVAS ACTIVE', 10, 15);

      if (frame < 300) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      if (commandHistoryList.length > 0) {
        const nextIdx = historyIndex === -1 ? commandHistoryList.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(commandHistoryList[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx >= commandHistoryList.length) {
          setHistoryIndex(-1);
          setInputVal('');
        } else {
          setHistoryIndex(nextIdx);
          setInputVal(commandHistoryList[nextIdx] || '');
        }
      }
    }
  };

  return (
    <div className="w-full flex flex-col font-dos text-base sm:text-lg leading-relaxed select-text min-h-[440px] max-h-[580px] overflow-y-auto pr-2">
      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="absolute inset-0 bg-[#0000aa] text-white p-4 z-40 flex flex-col font-dos">
          <div className="bg-[#aaaaaa] text-[#0000aa] px-2 py-0.5 font-bold flex justify-between text-sm">
            <span>MS-DOS EDIT - [{editorFilename}]</span>
            <span>PRESS ESC TO EXIT</span>
          </div>
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            className="flex-1 w-full bg-[#0000aa] text-white p-2 font-dos resize-none outline-none border-none text-base"
          />
          <div className="bg-[#aaaaaa] text-black px-2 py-0.5 text-xs flex justify-between">
            <span>F1=Help  F3=Repeat Search</span>
            <button
              onClick={() => {
                setIsEditorOpen(false);
                setHistory((prev) => [
                  ...prev,
                  { id: Math.random().toString(), type: 'output', text: `Saved "${editorFilename}" to disk C:.` },
                ]);
              }}
              className="font-bold underline"
            >
              [Save & Return to DOS]
            </button>
          </div>
        </div>
      )}

      {/* Terminal History */}
      <div className="space-y-1">
        {history.map((item) => {
          if (item.type === 'input') {
            return (
              <div key={item.id} className="font-bold tracking-wide">
                {item.text}
              </div>
            );
          }

          if (item.type === 'ansi' && item.ansiSpans) {
            return (
              <pre key={item.id} className="whitespace-pre overflow-x-auto my-2 p-1 font-dos">
                {item.ansiSpans.map((span, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      color: span.fg,
                      backgroundColor: span.bg,
                      fontWeight: span.bold ? 'bold' : 'normal',
                    }}
                    className={span.blink ? 'animate-pulse' : ''}
                  >
                    {span.text}
                  </span>
                ))}
              </pre>
            );
          }

          if (item.type === 'canvas') {
            return (
              <div key={item.id} className="my-3 flex flex-col items-center">
                <div className="border-2 border-stone-600 bg-black p-1 shadow-lg">
                  <canvas
                    ref={canvasRef}
                    className="w-full max-w-[480px] h-auto aspect-[320/200] image-rendering-pixelated bg-black"
                  />
                </div>
                <span className="text-xs text-[#8b949e] mt-1">Direct Framebuffer: VGA Mode 13h (320x200x256)</span>
              </div>
            );
          }

          return (
            <div key={item.id} className="whitespace-pre-wrap leading-tight">
              {item.text}
            </div>
          );
        })}
      </div>

      {/* Live Input Prompt */}
      <div className="flex items-center space-x-1.5 mt-2">
        <span className="font-bold">C:\&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent border-none outline-none font-dos text-base sm:text-lg text-inherit caret-current p-0 m-0"
        />
      </div>

      <div ref={terminalEndRef} />
    </div>
  );
};
