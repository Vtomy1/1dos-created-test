/**
 * ANSI.SYS & Code Page 437 Parser
 * Renders MS-DOS ANSI color codes and IBM PC CP437 glyphs in HTML/React.
 */

// CGA / EGA / VGA 16-color palette
export const DOS_PALETTE = [
  '#000000', // 0: Black
  '#0000AA', // 1: Blue
  '#00AA00', // 2: Green
  '#00AAAA', // 3: Cyan
  '#AA0000', // 4: Red
  '#AA00AA', // 5: Magenta
  '#AA5500', // 6: Brown
  '#AAAAAA', // 7: Light Gray
  '#555555', // 8: Dark Gray
  '#5555FF', // 9: Bright Blue
  '#55FF55', // 10: Bright Green
  '#55FFFF', // 11: Bright Cyan
  '#FF5555', // 12: Bright Red
  '#FF55FF', // 13: Bright Magenta
  '#FFFF55', // 14: Yellow
  '#FFFFFF', // 15: Bright White
];

export interface AnsiSpan {
  text: string;
  fg: string;
  bg: string;
  bold: boolean;
  blink: boolean;
}

export function parseAnsiText(raw: string): AnsiSpan[] {
  const spans: AnsiSpan[] = [];
  let currentFg = DOS_PALETTE[7]; // Default light gray
  let currentBg = 'transparent';
  let isBold = false;
  let isBlink = false;

  // Regex to match ANSI escape codes: \x1b[...m or ESC[...m
  const ansiRegex = /(?:\x1b|\u001b|\[)\??([0-9;]*)([a-zA-Z])/g;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = ansiRegex.exec(raw)) !== null) {
    const textSegment = raw.substring(lastIndex, match.index);
    if (textSegment.length > 0) {
      spans.push({
        text: textSegment,
        fg: currentFg,
        bg: currentBg,
        bold: isBold,
        blink: isBlink,
      });
    }

    const params = match[1].split(';').map(p => parseInt(p, 10)).filter(p => !isNaN(p));
    const command = match[2];

    if (command === 'm') {
      if (params.length === 0) {
        // Reset
        currentFg = DOS_PALETTE[7];
        currentBg = 'transparent';
        isBold = false;
        isBlink = false;
      } else {
        for (const p of params) {
          if (p === 0) {
            currentFg = DOS_PALETTE[7];
            currentBg = 'transparent';
            isBold = false;
            isBlink = false;
          } else if (p === 1) {
            isBold = true;
          } else if (p === 5) {
            isBlink = true;
          } else if (p >= 30 && p <= 37) {
            // Standard FG
            const colorIdx = (isBold ? 8 : 0) + (p - 30);
            currentFg = DOS_PALETTE[colorIdx] || DOS_PALETTE[7];
          } else if (p >= 40 && p <= 47) {
            // BG
            currentBg = DOS_PALETTE[p - 40] || 'transparent';
          } else if (p >= 90 && p <= 97) {
            // High intensity FG
            currentFg = DOS_PALETTE[8 + (p - 90)] || DOS_PALETTE[15];
          }
        }
      }
    }

    lastIndex = ansiRegex.lastIndex;
  }

  // Remainder
  if (lastIndex < raw.length) {
    spans.push({
      text: raw.substring(lastIndex),
      fg: currentFg,
      bg: currentBg,
      bold: isBold,
      blink: isBlink,
    });
  }

  return spans.length > 0 ? spans : [{
    text: raw,
    fg: DOS_PALETTE[7],
    bg: 'transparent',
    bold: false,
    blink: false,
  }];
}
