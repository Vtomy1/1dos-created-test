import { SystemModelInfo, DosProgramResult } from '../types/dos';

export const SYSTEM_MODELS: SystemModelInfo[] = [
  {
    id: 'all',
    name: 'Universal / All Retro Systems',
    year: 1981,
    cpu: 'Intel 8086 / 8088 to Pentium',
    clockSpeed: '4.77 MHz - 200 MHz',
    ramMax: '64KB - 64MB',
    graphics: 'MDA / CGA / EGA / VGA / TGA',
    audio: 'PC Speaker / Tandy / SoundBlaster',
    dosVersion: 'MS-DOS 2.11 - 7.10 / FreeDOS',
    description: 'Enforces pure 16-bit real mode instructions, conventional 640KB RAM limits, and INT 21h BIOS interrupts for 100% universal compatibility.',
    badge: 'UNIVERSAL',
  },
  {
    id: 'ibm_5150',
    name: 'IBM PC 5150 / XT 5160',
    year: 1981,
    cpu: 'Intel 8088',
    clockSpeed: '4.77 MHz',
    ramMax: '64KB - 640KB',
    graphics: 'CGA 320x200 (4 colors) / MDA Text',
    audio: '1-bit PC Speaker (Port 61h timer)',
    dosVersion: 'PC-DOS 2.11 - 3.30',
    description: 'The machine that started the PC revolution. Strict 8086 opcodes, no 286/386 instructions, 640K conventional limit, 5.25" 360K floppies.',
    badge: '8088 ERA',
  },
  {
    id: 'pc_at_286',
    name: 'IBM PC/AT 5170 (286)',
    year: 1984,
    cpu: 'Intel 80286',
    clockSpeed: '6 - 12 MHz',
    ramMax: '512KB - 2MB (XMS)',
    graphics: 'EGA 640x350 16-colors / CGA',
    audio: 'PC Speaker / Early AdLib (optional)',
    dosVersion: 'PC-DOS 3.30 - 5.00',
    description: 'Introduced 16-bit ISA bus, 1.2MB 5.25" floppy, real time clock (RTC), and early protected mode / extended memory (HIMEM.SYS).',
    badge: '286 AT',
  },
  {
    id: 'pc_486_vga',
    name: '386 / 486 DX2-66 "Golden Age"',
    year: 1993,
    cpu: 'Intel 80486 DX2',
    clockSpeed: '66 MHz',
    ramMax: '4MB - 16MB',
    graphics: 'VGA 320x200 256-color (Mode 13h)',
    audio: 'SoundBlaster 16 / OPL2 / Roland MT-32',
    dosVersion: 'MS-DOS 6.22',
    description: 'The golden zenith of MS-DOS gaming! Mode 13h graphics, EMM386 / QEMM upper memory packing, SoundBlaster 16 DSP & Yamaha OPL3 FM synth.',
    badge: 'GOLDEN AGE',
  },
  {
    id: 'pentium_freedos',
    name: 'Pentium 133 / FreeDOS / Win98',
    year: 1996,
    cpu: 'Intel Pentium MMX',
    clockSpeed: '133 - 200 MHz',
    ramMax: '32MB - 128MB',
    graphics: 'VESA 2.0 SVGA (800x600+)',
    audio: 'SoundBlaster AWE32 / Live!',
    dosVersion: 'MS-DOS 7.10 / FreeDOS 1.3',
    description: 'Late-era DOS with FAT32 large partitions, CD-ROM MSCDEX, PCI audio emulation, and high-resolution VESA 2.0 linear framebuffers.',
    badge: 'LATE ERA',
  },
  {
    id: 'tandy_1000',
    name: 'Tandy 1000 / PCjr',
    year: 1985,
    cpu: 'Intel 8088 / 8086',
    clockSpeed: '4.77 - 9.54 MHz',
    ramMax: '128KB - 640KB',
    graphics: 'Tandy TGA 320x200 16-color',
    audio: 'TI SN76496 3-Voice Polyphonic Synth',
    dosVersion: 'Tandy MS-DOS 2.11 - 3.30',
    description: 'Legendary home multimedia PC! 16-color graphics at 320x200 without EGA, and 3-voice polyphonic music supported natively in Tandy GW-BASIC.',
    badge: '3-VOICE TANDY',
  },
  {
    id: 'pc_9801',
    name: 'NEC PC-9801 / PC-9821',
    year: 1989,
    cpu: 'NEC V30 / 386SX',
    clockSpeed: '8 - 20 MHz',
    ramMax: '640KB - 8MB',
    graphics: '640x400 16-color + Kanji ROM',
    audio: 'Yamaha YM2203 / YM2608 OPNA FM Synth',
    dosVersion: 'NEC MS-DOS 3.30 - 6.20',
    description: 'The dominant Japanese personal computer. Unique x86 architecture with 640x400 high-res graphics, dual graphic planes, and OPNA FM audio.',
    badge: 'PC-98 JAPAN',
  },
];

export interface PresetItem {
  id: string;
  category: 'Game' | 'Demo' | 'Utility' | 'Audio' | 'ANSI' | 'Assembly';
  title: string;
  prompt: string;
  recommendedFormat: string;
  targetSystem: string;
  previewData: DosProgramResult;
}

export const DOS_PRESETS: PresetItem[] = [
  {
    id: 'qbasic-mode13h-fire',
    category: 'Demo',
    title: 'VGA Mode 13h Plasma Fire Demo',
    prompt: 'Create a smooth flame and plasma particle effect in VGA 320x200 Mode 13h using QBASIC with 256-color palette rotation.',
    recommendedFormat: 'BAS',
    targetSystem: 'pc_486_vga',
    previewData: {
      title: "VGA Mode 13h Flame & Particle Demo",
      filename: "FIRE13H.BAS",
      primaryType: "BAS",
      primaryCode: `10 REM ========================================================
20 REM  VGA MODE 13H FIRE & PLASMA DEMO (QBASIC 1.1 / 4.5)
30 REM ========================================================
40 SCREEN 13: CLS: RANDOMIZE TIMER
50 REM Set custom smooth thermal fire palette
60 FOR C = 0 TO 63
70   OUT &H3C8, C: OUT &H3C9, C: OUT &H3C9, 0: OUT &H3C9, 0
80   OUT &H3C8, C + 64: OUT &H3C9, 63: OUT &H3C9, C: OUT &H3C9, 0
90   OUT &H3C8, C + 128: OUT &H3C9, 63: OUT &H3C9, 63: OUT &H3C9, C
100 NEXT C
110 DIM FIRE(320, 200)
120 LOCATE 1, 1: PRINT "VGA 320x200 256-COLOR FIRE DEMO - [Q] TO EXIT"
130 REM Ignite flame embers along base line
140 FOR X = 40 TO 280
150   IF RND > 0.3 THEN PSET (X, 198), INT(RND * 180) + 70
160 NEXT X
170 REM Convect thermal energy upward
180 FOR Y = 10 TO 197
190   FOR X = 40 TO 280 STEP 2
200     C1 = POINT(X, Y + 1)
210     C2 = POINT(X - 1, Y + 1)
220     C3 = POINT(X + 1, Y + 1)
230     C4 = POINT(X, Y + 2)
240     AVG = INT((C1 + C2 + C3 + C4) / 4) - 1
250     IF AVG < 0 THEN AVG = 0
260     PSET (X, Y), AVG
270   NEXT X
280 NEXT Y
290 K$ = INKEY$: IF K$ = "" THEN 140
300 SCREEN 0: WIDTH 80: CLS: COLOR 7, 0
310 PRINT "Flame demo ended. Returning to MS-DOS prompt."
320 END`,
      instructions: "Execute in QBASIC: QBASIC /RUN FIRE13H.BAS",
      debugScript: "",
      memoryRequirements: {
        conventionalKB: 64,
        requiresEMS: false,
        requiresXMS: false,
        minDosVersion: "5.0",
      },
      audioVideoProfile: {
        videoMode: "VGA Mode 13h 320x200",
        soundMode: "None",
      },
      compatibilityMatrix: {
        ibm_5150: { status: "incompatible", reason: "Requires VGA BIOS (INT 10h AH=00h AL=13h) and 256 colors." },
        pc_at_286: { status: "needs_patch", reason: "Requires VGA card installed in 16-bit ISA slot." },
        pc_486_vga: { status: "compatible", reason: "Native VGA Mode 13h hardware support." },
        pentium_freedos: { status: "compatible", reason: "Fully supported on FreeDOS and MS-DOS 7.1." },
        tandy_1000: { status: "incompatible", reason: "Tandy graphics adapter supports 16-colors, not 256-color Mode 13h." },
        pc_9801: { status: "incompatible", reason: "PC-98 uses 640x400 planar graphics, not IBM Mode 13h." },
      },
      compatibilityPatches: [
        "Uses direct port 3C8h/3C9h DAC palette register writes for silky smooth thermal gradients",
        "Includes graceful SCREEN 0 restoration before DOS exit",
      ],
      companionFiles: []
    }
  },
  {
    id: 'dungeon-rpg-batch',
    category: 'Game',
    title: 'Dungeon of DOS 8088 RPG',
    prompt: 'Interactive dungeon crawler RPG written in MS-DOS batch script compatible with DOS 2.11 through 6.22, featuring inventory, battle rolls, and ASCII dungeon map.',
    recommendedFormat: 'BAT',
    targetSystem: 'all',
    previewData: {
      title: "Dungeon of DOS 8088 RPG",
      filename: "DUNGEON.BAT",
      primaryType: "BAT",
      primaryCode: `@ECHO OFF
REM =====================================================================
REM  DUNGEON OF DOS - CLASSIC TEXT RPG
REM  100% Compatible with DOS 2.11, 3.30, 5.00, 6.22, FreeDOS
REM =====================================================================
CLS
SET HP=20
SET GOLD=0
SET POTIONS=2
SET MONSTER=0
ECHO.
ECHO  *****************************************************************
ECHO  *                   D U N G E O N   O F   D O S                 *
ECHO  *            16-Bit Real-Mode Adventure (8088 to Pentium)       *
ECHO  *****************************************************************
ECHO.
ECHO  You awaken in the damp catacombs beneath the IBM XT mainframe.
ECHO  Your trusty debug sword glows with a pale phosphor amber hue.
ECHO.

:DUNGEON_HUB
ECHO -----------------------------------------------------------------
ECHO  HEALTH: %HP%/20   GOLD: %GOLD%   POTIONS: %POTIONS%
ECHO -----------------------------------------------------------------
ECHO  [1] Delve deeper into the Dark Vault
ECHO  [2] Search the sarcophagus for relics
ECHO  [3] Drink healing potion (+10 HP)
ECHO  [4] Inspect surrounding stone runes
ECHO  [Q] Flee to the DOS Prompt (Quit)
ECHO.

CHOICE /C:1234Q /N "Your choice? " > NUL
IF ERRORLEVEL 5 GOTO QUIT
IF ERRORLEVEL 4 GOTO RUNES
IF ERRORLEVEL 3 GOTO DRINK
IF ERRORLEVEL 2 GOTO SEARCH
IF ERRORLEVEL 1 GOTO MONSTER_ENCOUNTER

:MONSTER_ENCOUNTER
CLS
ECHO.
ECHO  ! ! ! A WILD PARITY CHECK ERROR DEMON EMERGES ! ! !
ECHO.
ECHO  Demon HP: 12
SET DEMONHP=12

:BATTLE_LOOP
ECHO.
ECHO  [1] Attack with Assembler Blade
ECHO  [2] Cast NOP Spell
ECHO  [3] Attempt to Flee
CHOICE /C:123 /N "Battle Action [1-3]: " > NUL
IF ERRORLEVEL 3 GOTO FLEE
IF ERRORLEVEL 2 GOTO NOP_SPELL
IF ERRORLEVEL 1 GOTO STRIKE

:STRIKE
ECHO.
ECHO  *SLASH!* You land a clean critical hit for 5 damage!
SET DEMONHP=7
ECHO  Demon lashes back with an INT 00h Divide by Zero strike!
ECHO  You take 4 damage!
SET HP=16
ECHO.
ECHO  You deliver the final crushing blow! The demon dissolves!
SET GOLD=35
ECHO  You recover 35 gold coins!
PAUSE
CLS
GOTO DUNGEON_HUB

:NOP_SPELL
ECHO.
ECHO  You cast NOP! The demon is momentarily stunned in an idle loop!
PAUSE
GOTO BATTLE_LOOP

:FLEE
ECHO.
ECHO  You scramble back through the stone archway!
PAUSE
CLS
GOTO DUNGEON_HUB

:SEARCH
CLS
ECHO.
ECHO  You pry open the sarcophagus lid...
ECHO  Found 1x Health Potion and a vintage 360K 5.25" floppy disk!
SET POTIONS=3
PAUSE
CLS
GOTO DUNGEON_HUB

:DRINK
IF %POTIONS% LEQ 0 GOTO NOPOTION
SET POTIONS=1
SET HP=20
ECHO.
ECHO  *GLUG* Warm thermal brew restores your health to full!
PAUSE
CLS
GOTO DUNGEON_HUB

:NOPOTION
ECHO.
ECHO  Your pouch contains no potions!
PAUSE
CLS
GOTO DUNGEON_HUB

:RUNES
CLS
ECHO.
ECHO  The ancient runes read:
ECHO  "HE WHO PACKS THE UMB HIGH WITH EMM386 SHALL INHERIT 622K"
PAUSE
CLS
GOTO DUNGEON_HUB

:QUIT
CLS
ECHO Returning to MS-DOS. Farewell, adventurer!
`,
      instructions: "Run directly in MS-DOS: C:\\> DUNGEON.BAT",
      debugScript: "",
      memoryRequirements: {
        conventionalKB: 16,
        requiresEMS: false,
        requiresXMS: false,
        minDosVersion: "3.3",
      },
      audioVideoProfile: {
        videoMode: "Text 80x25",
        soundMode: "PC Speaker",
      },
      compatibilityMatrix: {
        ibm_5150: { status: "compatible", reason: "Standard batch commands, operates within 16KB conventional memory." },
        pc_at_286: { status: "compatible", reason: "Runs flawlessly on PC-DOS 3.30 and 5.0." },
        pc_486_vga: { status: "compatible", reason: "100% MS-DOS 6.22 compatible." },
        pentium_freedos: { status: "compatible", reason: "Works in FreeDOS and Win98 DOS box." },
        tandy_1000: { status: "compatible", reason: "Full compatibility on Tandy MS-DOS." },
        pc_9801: { status: "compatible", reason: "Standard INT 21h batch file execution." },
      },
      compatibilityPatches: [
        "Pure ERRORLEVEL branching with no OS-specific extensions",
        "Deterministic variable arithmetic avoiding 32-bit shell dependencies",
      ],
      companionFiles: []
    }
  },
  {
    id: 'cyberpunk-ansi-bbs',
    category: 'ANSI',
    title: 'Cyberpunk 1988 BBS ANSI Screen',
    prompt: 'Authentic MS-DOS ANSI.SYS BBS login screen with cybernetic skull, blinking neon status text, and Code Page 437 box-drawing borders.',
    recommendedFormat: 'ANS',
    targetSystem: 'all',
    previewData: {
      title: "Cyberpunk 1988 BBS ANSI Screen",
      filename: "CYBER.ANS",
      primaryType: "ANS",
      primaryCode: `\x1b[2J\x1b[1;36m
  ╔════════════════════════════════════════════════════════════════════════════╗
  ║ \x1b[1;33m       ███╗   ██╗███████╗████████╗██████╗  ██████╗   ██████╗ ███████╗       \x1b[1;36m║
  ║ \x1b[1;33m       ████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗  ██╔══██╗██╔════╝       \x1b[1;36m║
  ║ \x1b[1;33m       ██╔██╗ ██║█████╗     ██║   ██████╔╝██║   ██║  ██████╔╝███████╗       \x1b[1;36m║
  ║ \x1b[1;33m       ██║╚██╗██║██╔══╝     ██║   ██╔══██╗██║   ██║  ██╔══██╗╚════██║       \x1b[1;36m║
  ║ \x1b[1;33m       ██║ ╚████║███████╗   ██║   ██║  ██║╚██████╔╝  ██████╔╝███████║       \x1b[1;36m║
  ║ \x1b[1;33m       ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝   ╚═════╝ ╚══════╝       \x1b[1;36m║
  ╠════════════════════════════════════════════════════════════════════════════╣
  ║ \x1b[1;35m [NODE 01] \x1b[1;37mBAUD RATE: \x1b[1;32m14,400 V.32bis  \x1b[1;35m[SYSOPS] \x1b[1;37mZER0_C00L ^& ACID_BURN       \x1b[1;36m║
  ║ \x1b[1;35m [SYSTEM]  \x1b[1;37m386DX-40MHz 8MB RAM       \x1b[1;35m[STORAGE]\x1b[1;37mCONNER 120MB IDE DRIVE      \x1b[1;36m║
  ╠════════════════════════════════════════════════════════════════════════════╣
  ║                                                                            ║
  ║   \x1b[1;31m         ░▒▓██████████████▓▒░                                            \x1b[1;36m║
  ║   \x1b[1;31m       ░▒▓█\x1b[1;37m[ 0 ]      [ 0 ]\x1b[1;31m█▓▒░       \x1b[1;33mACCESS GRANTED: LEVEL 9 CLEARANCE     \x1b[1;36m║
  ║   \x1b[1;31m       ░▒▓█     \x1b[1;37m▲▲\x1b[1;31m     █▓▒░       \x1b[1;37mEnter handle and cryptographic key    \x1b[1;36m║
  ║   \x1b[1;31m         ░▒▓██████████████▓▒░                                            \x1b[1;36m║
  ║                                                                            ║
  ║   \x1b[1;32m [F] File Library    [M] Message Base    [D] Door Games    [G] Goodbye   \x1b[1;36m║
  ╚════════════════════════════════════════════════════════════════════════════╝\x1b[0m`,
      instructions: "Ensure ANSI.SYS is loaded in CONFIG.SYS: DEVICE=C:\\DOS\\ANSI.SYS. Then TYPE CYBER.ANS",
      debugScript: "",
      memoryRequirements: {
        conventionalKB: 8,
        requiresEMS: false,
        requiresXMS: false,
        minDosVersion: "2.11",
      },
      audioVideoProfile: {
        videoMode: "Text 80x25",
        soundMode: "None",
      },
      compatibilityMatrix: {
        ibm_5150: { status: "compatible", reason: "Standard ANSI.SYS escape parser supported from DOS 2.0+." },
        pc_at_286: { status: "compatible", reason: "Fully supported on EGA/VGA text modes." },
        pc_486_vga: { status: "compatible", reason: "Standard ANSI display on MS-DOS 6.22." },
        pentium_freedos: { status: "compatible", reason: "FreeDOS NANSI.SYS provides ultra-fast rendering." },
        tandy_1000: { status: "compatible", reason: "Supports ANSI on Tandy MS-DOS with ANSI driver." },
        pc_9801: { status: "needs_patch", reason: "Requires PC-98 specific ANSI escape codes." },
      },
      compatibilityPatches: [
        "Tested against standard ANSI.SYS 80x25 wrap boundaries",
        "Includes standard reset \\x1B[0m at termination to prevent prompt color corruption",
      ],
      companionFiles: [
        {
          filename: "VIEW.BAT",
          content: `@ECHO OFF\r\nTYPE CYBER.ANS\r\nPAUSE\r\n`
        }
      ]
    }
  },
  {
    id: 'tandy-canon-sound',
    category: 'Audio',
    title: 'Tandy 1000 3-Voice Polyphonic Canon',
    prompt: '3-voice polyphonic musical arrangement for Tandy 1000 SN76496 sound chip using GW-BASIC PLAY commands.',
    recommendedFormat: 'BAS',
    targetSystem: 'tandy_1000',
    previewData: {
      title: "Tandy 1000 3-Voice Canon",
      filename: "CANON.BAS",
      primaryType: "BAS",
      primaryCode: `10 REM ========================================================
20 REM  TANDY 1000 3-VOICE POLYPHONIC CANON IN D
30 REM  TEXAS INSTRUMENTS SN76496 SOUND CHIP / PC SPEAKER FALLBACK
40 REM ========================================================
50 CLS : SCREEN 0 : COLOR 14, 1
60 PRINT "================================================================================"
70 PRINT "               T A N D Y   1 0 0 0   3 - V O I C E   C A N O N                  "
80 PRINT "          (Polyphonic SN76496 Sound Chip or PC Speaker Fallback)                "
90 PRINT "================================================================================"
100 COLOR 11, 0 : PRINT ""
110 PRINT " Playing Johann Pachelbel's Canon in D..."
120 COLOR 10, 0
130 REM Melody Voice 1
140 M1$ = "MB T120 O4 L4 F# E D C# < B A B > C#"
150 REM Melody Voice 2 (Harmonic response)
160 M2$ = "O3 L4 D C# < B A G F# G A"
170 REM Bass line Voice 3
180 M3$ = "O2 L4 D < A B F# G D G A"
190 PRINT " [VOICE 1] Melody..."
200 PLAY M1$
210 PRINT " [VOICE 2] Harmony..."
220 PLAY M2$
230 PRINT " [VOICE 3] Ground Bass..."
240 PLAY M3$
250 COLOR 15, 0 : PRINT ""
260 PRINT " Music playback complete. Returning to MS-DOS..."
270 END`,
      instructions: "Run in Tandy Deskmate BASIC or QBASIC: QBASIC /RUN CANON.BAS",
      debugScript: "",
      memoryRequirements: {
        conventionalKB: 32,
        requiresEMS: false,
        requiresXMS: false,
        minDosVersion: "2.11",
      },
      audioVideoProfile: {
        videoMode: "Text 80x25",
        soundMode: "Tandy 3-Voice",
      },
      compatibilityMatrix: {
        ibm_5150: { status: "compatible", reason: "Standard QBASIC/GW-BASIC plays sequential voices on single PC speaker." },
        pc_at_286: { status: "compatible", reason: "Plays through PC speaker." },
        pc_486_vga: { status: "compatible", reason: "Full QBASIC 1.1 PLAY command support." },
        pentium_freedos: { status: "compatible", reason: "Supported in FreeDOS GW-BASIC." },
        tandy_1000: { status: "compatible", reason: "Native hardware 3-voice polyphony on SN76496 chip." },
        pc_9801: { status: "needs_patch", reason: "PC-98 uses YM2203 FM MML syntax." },
      },
      compatibilityPatches: [
        "Structured in standardized MML compatible with both mono PC speaker and Tandy 3-voice chip",
        "Includes tempo locking (T120) for consistent playback across varying CPU speeds",
      ],
      companionFiles: []
    }
  },
  {
    id: 'x86-asm-tiny-ball',
    category: 'Assembly',
    title: 'Tiny 64-Byte x86 Bouncing Ball COM',
    prompt: 'Write an ultra-compact 16-bit 8086 assembly .COM program that bounces a ball across the screen in Mode 13h or text mode, executable via DEBUG.EXE script.',
    recommendedFormat: 'ASM_COM',
    targetSystem: 'all',
    previewData: {
      title: "Tiny 64-Byte x86 COM Bouncing Ball",
      filename: "BALL.COM",
      primaryType: "ASM_COM",
      primaryCode: `; =====================================================================
;  TINY 8086 REAL-MODE BOUNCING BALL (.COM FORMAT)
;  100% Compatible with Intel 8088 / 8086 to modern Pentium CPUs
; =====================================================================
ORG 100h

start:
    mov ax, 0003h       ; BIOS INT 10h: Set 80x25 16-color text mode
    int 10h

    mov ax, 0B800h      ; Video memory segment for color text mode
    mov es, ax

    mov di, (12 * 80 + 40) * 2  ; Start in center of screen
    mov dx, (1 * 80 + 1) * 2    ; Velocity: Y=+1, X=+1

main_loop:
    ; Draw ball (character 02h = smiley face, color 0Eh = yellow)
    mov word [es:di], 0E02h

    ; Delay loop calibrated for vintage 4.77MHz to 486 speeds
    mov cx, 0FFFFh
delay:
    loop delay

    ; Erase old ball position
    mov word [es:di], 0720h

    ; Update position
    add di, dx

    ; Check if key was pressed (INT 16h AH=01h)
    mov ah, 01h
    int 16h
    jnz exit_program

    jmp main_loop

exit_program:
    ; Read key to clear buffer
    mov ah, 00h
    int 16h

    ; Return to DOS (INT 21h AH=4Ch)
    mov ax, 4C00h
    int 21h`,
      instructions: "Assemble with DEBUG.EXE: C:\\> DEBUG < BALL.SCR then run C:\\> BALL.COM",
      debugScript: `a 100
mov ax, 0003
int 10
mov ax, B800
mov es, ax
mov di, 07D0
mov dx, 00A2
mov word [es:di], 0E02
mov cx, FFFF
loop 0113
mov word [es:di], 0720
add di, dx
mov ah, 01
int 16
jnz 0128
jmp 010F
mov ah, 00
int 16
mov ax, 4C00
int 21

rcx
2E
n BALL.COM
w
q`,
      memoryRequirements: {
        conventionalKB: 1,
        requiresEMS: false,
        requiresXMS: false,
        minDosVersion: "2.0",
      },
      audioVideoProfile: {
        videoMode: "Text 80x25",
        soundMode: "None",
      },
      compatibilityMatrix: {
        ibm_5150: { status: "compatible", reason: "Direct 8088 machine opcodes, direct B800h video segment access." },
        pc_at_286: { status: "compatible", reason: "Native real mode 16-bit x86 execution." },
        pc_486_vga: { status: "compatible", reason: "Executes in DOS 6.22 real or V86 mode." },
        pentium_freedos: { status: "compatible", reason: "Supported directly on FreeDOS." },
        tandy_1000: { status: "compatible", reason: "B800h color text mapping standard." },
        pc_9801: { status: "needs_patch", reason: "PC-98 text video RAM resides at A000h/A200h." },
      },
      compatibilityPatches: [
        "Pure 8086 opcodes: No 286/386 register extensions",
        "Self-contained DEBUG.EXE assembly script produces bit-exact 46-byte executable without third party assembler",
      ],
      companionFiles: [
        {
          filename: "BALL.SCR",
          content: `a 100\r\nmov ax, 0003\r\nint 10\r\nmov ax, B800\r\nmov es, ax\r\nmov di, 07D0\r\nmov dx, 00A2\r\nmov word [es:di], 0E02\r\nmov cx, FFFF\r\nloop 0113\r\nmov word [es:di], 0720\r\nadd di, dx\r\nmov ah, 01\r\nint 16\r\njnz 0128\r\njmp 010F\r\nmov ah, 00\r\nint 16\r\nmov ax, 4C00\r\nint 21\r\n\r\nrcx\r\n2E\r\nn BALL.COM\r\nw\r\nq\r\n`
        }
      ]
    }
  },
  {
    id: 'memory-optimizer-config',
    category: 'Utility',
    title: 'Ultimate 622K Conventional RAM Optimizer',
    prompt: 'Universal multi-boot CONFIG.SYS and AUTOEXEC.BAT configuration for MS-DOS 6.22 / FreeDOS maximizing conventional RAM to 622KB with menu choices for EMS, XMS, and CD-ROM.',
    recommendedFormat: 'CONFIG',
    targetSystem: 'pc_486_vga',
    previewData: {
      title: "Ultimate 622K Conventional Memory Optimizer",
      filename: "CONFIG.SYS",
      primaryType: "CONFIG",
      primaryCode: `[MENU]
MENUITEM=GAMING_EMS, MS-DOS 6.22 Golden Age Gaming (622K + EMS 4.0)
MENUITEM=GENERAL_XMS, Standard Productivity (XMS + No EMS)
MENUITEM=CLEAN_BOOT, Pure Conventional 8088 Clean Boot (No Drivers)
MENUDEFAULT=GAMING_EMS, 5

[GAMING_EMS]
DEVICE=C:\\DOS\\HIMEM.SYS /TESTMEM:OFF
DEVICE=C:\\DOS\\EMM386.EXE RAM HIGHSCAN I=B000-B7FF AUTO
DOS=HIGH,UMB
DEVICEHIGH=C:\\DOS\\ANSI.SYS
DEVICEHIGH=C:\\SB16\\DRV\\CTSB16.SYS /UNIT=0 /BLASTER=A220 I5 D1 H5
DEVICEHIGH=C:\\DRV\\OAKCDROM.SYS /D:MSCD001
FILES=40
BUFFERS=20,0
FCBS=4,0
STACKS=9,256
LASTDRIVE=Z

[GENERAL_XMS]
DEVICE=C:\\DOS\\HIMEM.SYS /TESTMEM:OFF
DEVICE=C:\\DOS\\EMM386.EXE NOEMS
DOS=HIGH,UMB
DEVICEHIGH=C:\\DOS\\ANSI.SYS
FILES=40
BUFFERS=30
LASTDRIVE=Z

[CLEAN_BOOT]
DOS=LOW
FILES=20
BUFFERS=10

[COMMON]
SHELL=C:\\DOS\\COMMAND.COM C:\\DOS /E:1024 /P`,
      instructions: "Place in C:\\ root directory alongside AUTOEXEC.BAT and reboot system.",
      debugScript: "",
      memoryRequirements: {
        conventionalKB: 622,
        requiresEMS: true,
        requiresXMS: true,
        minDosVersion: "6.0",
      },
      audioVideoProfile: {
        videoMode: "Text 80x25",
        soundMode: "Sound Blaster 16 / OPL2",
      },
      compatibilityMatrix: {
        ibm_5150: { status: "incompatible", reason: "HIMEM and EMM386 require 286/386 hardware." },
        pc_at_286: { status: "needs_patch", reason: "EMM386 requires 386 CPU; use HIMEM.SYS only on 286." },
        pc_486_vga: { status: "compatible", reason: "Optimal target: delivers 622KB free conventional RAM." },
        pentium_freedos: { status: "compatible", reason: "FreeDOS HIMEMX / JEMMEX equivalents provide similar packing." },
        tandy_1000: { status: "incompatible", reason: "Tandy hardware does not support standard EMM386." },
        pc_9801: { status: "needs_patch", reason: "PC-98 uses specialized HIMEM98.SYS." },
      },
      compatibilityPatches: [
        "High-scan monochrome region mapping (I=B000-B7FF) recovers 32KB of Upper Memory Blocks (UMBs)",
        "Menu default 5-second timer allows unattended cold boots",
      ],
      companionFiles: [
        {
          filename: "AUTOEXEC.BAT",
          content: `@ECHO OFF\r\nPROMPT $P$G\r\nPATH C:\\DOS;C:\\BAT;C:\\SB16\r\nSET TEMP=C:\\TEMP\r\nSET BLASTER=A220 I5 D1 H5 P330 T6\r\nSET MIDI=SYNTH:1 MAP:E MODE:0\r\nGOTO %CONFIG%\r\n\r\n:GAMING_EMS\r\nLH C:\\DOS\\MSCDEX.EXE /D:MSCD001 /L:D /M:12\r\nLH C:\\SB16\\DRV\\CTMMSYS.SYS\r\nLH C:\\DOS\\DOSKEY\r\nLH C:\\MOUSE\\MOUSE.EXE\r\nMEM /C\r\nECHO System loaded with 622K conventional memory free!\r\nGOTO END\r\n\r\n:GENERAL_XMS\r\nLH C:\\DOS\\DOSKEY\r\nLH C:\\MOUSE\\MOUSE.EXE\r\nMEM /C\r\nGOTO END\r\n\r\n:CLEAN_BOOT\r\nECHO Clean 8088 fallback boot completed.\r\nMEM\r\nGOTO END\r\n\r\n:END\r\n`
        }
      ]
    }
  }
];
