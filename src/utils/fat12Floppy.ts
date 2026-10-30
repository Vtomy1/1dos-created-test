/**
 * FAT12 1.44MB Floppy Disk Image (.IMG) Generator
 * Creates an exact 1,474,560 byte binary disk image conforming to the
 * standard MS-DOS / PC-DOS 3.5" High Density FAT12 specification.
 */

export interface DiskFile {
  filename: string; // 8.3 format e.g. "GAME.BAT" or "CONFIG.SYS"
  content: string | Uint8Array;
}

export function createFat12FloppyImage(files: DiskFile[], diskLabel = "DOSCRAFT"): Uint8Array {
  const TOTAL_SIZE = 1474560; // 2880 sectors * 512 bytes
  const SECTOR_SIZE = 512;
  const SECTORS_PER_FAT = 9;
  const ROOT_DIR_ENTRIES = 224;
  const ROOT_DIR_SECTORS = (ROOT_DIR_ENTRIES * 32) / SECTOR_SIZE; // 14 sectors
  const RESERVED_SECTORS = 1; // Boot sector
  const DATA_START_SECTOR = RESERVED_SECTORS + (2 * SECTORS_PER_FAT) + ROOT_DIR_SECTORS; // 1 + 18 + 14 = 33

  const disk = new Uint8Array(TOTAL_SIZE);

  // 1. Boot Sector (Sector 0)
  // Standard x86 boot jump: JMP SHORT 3C NOP
  disk[0] = 0xEB;
  disk[1] = 0x3C;
  disk[2] = 0x90;

  // OEM Identifier: "MSDOS5.0"
  const oem = "MSDOS5.0";
  for (let i = 0; i < 8; i++) {
    disk[3 + i] = oem.charCodeAt(i);
  }

  // BIOS Parameter Block (BPB)
  const view = new DataView(disk.buffer);
  view.setUint16(11, SECTOR_SIZE, true); // Bytes per sector (512)
  disk[13] = 1; // Sectors per cluster
  view.setUint16(14, RESERVED_SECTORS, true); // Reserved sectors (1)
  disk[16] = 2; // Number of FATs
  view.setUint16(17, ROOT_DIR_ENTRIES, true); // Root entries (224)
  view.setUint16(19, 2880, true); // Total sectors 16-bit
  disk[21] = 0xF0; // Media descriptor (1.44M 3.5" HD)
  view.setUint16(22, SECTORS_PER_FAT, true); // Sectors per FAT (9)
  view.setUint16(24, 18, true); // Sectors per track (18)
  view.setUint16(26, 2, true); // Number of heads (2)
  view.setUint32(28, 0, true); // Hidden sectors
  view.setUint32(32, 0, true); // Total sectors 32-bit

  // Extended BPB
  disk[36] = 0x00; // Drive number (A:)
  disk[37] = 0x00; // Reserved / dirty flag
  disk[38] = 0x29; // Extended boot signature
  view.setUint32(39, 0x19881029, true); // Volume serial number

  // Volume Label (11 bytes)
  const paddedLabel = (diskLabel.toUpperCase() + "           ").slice(0, 11);
  for (let i = 0; i < 11; i++) {
    disk[43 + i] = paddedLabel.charCodeAt(i);
  }

  // File system type "FAT12   "
  const fsType = "FAT12   ";
  for (let i = 0; i < 8; i++) {
    disk[54 + i] = fsType.charCodeAt(i);
  }

  // Boot signature
  disk[510] = 0x55;
  disk[511] = 0xAA;

  // FAT Tables Setup
  // First 3 bytes of FAT12: Media descriptor + 0xFF 0xFF
  const fat1Offset = RESERVED_SECTORS * SECTOR_SIZE; // 512
  const fat2Offset = (RESERVED_SECTORS + SECTORS_PER_FAT) * SECTOR_SIZE; // 512 + 4608 = 5120

  disk[fat1Offset] = 0xF0;
  disk[fat1Offset + 1] = 0xFF;
  disk[fat1Offset + 2] = 0xFF;

  disk[fat2Offset] = 0xF0;
  disk[fat2Offset + 1] = 0xFF;
  disk[fat2Offset + 2] = 0xFF;

  // Root Directory Setup
  const rootDirOffset = (RESERVED_SECTORS + 2 * SECTORS_PER_FAT) * SECTOR_SIZE; // Sector 19 * 512 = 9728

  // Helper to set FAT12 entry
  const setFatEntry = (cluster: number, value: number) => {
    const bitOffset = cluster * 12;
    const byteOffset = Math.floor(bitOffset / 8);
    const isOdd = (cluster % 2) !== 0;

    for (const fOffset of [fat1Offset, fat2Offset]) {
      let b0 = disk[fOffset + byteOffset];
      let b1 = disk[fOffset + byteOffset + 1];

      if (!isOdd) {
        // Even cluster: lower 12 bits of 16-bit word
        b0 = value & 0xFF;
        b1 = (b1 & 0xF0) | ((value >> 8) & 0x0F);
      } else {
        // Odd cluster: upper 12 bits of 16-bit word
        b0 = (b0 & 0x0F) | ((value << 4) & 0xF0);
        b1 = (value >> 4) & 0xFF;
      }

      disk[fOffset + byteOffset] = b0;
      disk[fOffset + byteOffset + 1] = b1;
    }
  };

  // Helper to convert 8.3 filename
  const format83 = (rawName: string) => {
    const parts = rawName.toUpperCase().split('.');
    const base = (parts[0] || '').replace(/[^A-Z0-9_\-]/g, '').padEnd(8, ' ').slice(0, 8);
    const ext = (parts[1] || '').replace(/[^A-Z0-9_\-]/g, '').padEnd(3, ' ').slice(0, 3);
    return base + ext;
  };

  // Volume label entry in root directory (entry 0)
  let dirIndex = 0;
  const labelEntryOffset = rootDirOffset + (dirIndex++ * 32);
  for (let i = 0; i < 11; i++) {
    disk[labelEntryOffset + i] = paddedLabel.charCodeAt(i);
  }
  disk[labelEntryOffset + 11] = 0x08; // Attribute: Volume ID

  let nextFreeCluster = 2; // Data clusters begin at 2

  // Write each file
  for (const file of files) {
    if (dirIndex >= ROOT_DIR_ENTRIES) break;

    const fileBytes = typeof file.content === 'string'
      ? new TextEncoder().encode(file.content.replace(/\r?\n/g, '\r\n')) // Standard CRLF
      : file.content;

    const fileSize = fileBytes.length;
    const clustersNeeded = Math.max(1, Math.ceil(fileSize / SECTOR_SIZE));
    const startCluster = nextFreeCluster;

    // Allocate clusters in FAT
    let currentCluster = startCluster;
    for (let c = 0; c < clustersNeeded; c++) {
      const isLast = c === clustersNeeded - 1;
      const targetCluster = nextFreeCluster + c;
      const nextClusterVal = isLast ? 0xFFF : targetCluster + 1;
      setFatEntry(targetCluster, nextClusterVal);

      // Write data to sector
      const sectorNumber = DATA_START_SECTOR + (targetCluster - 2);
      const diskDataOffset = sectorNumber * SECTOR_SIZE;
      const chunkStart = c * SECTOR_SIZE;
      const chunkEnd = Math.min(fileSize, chunkStart + SECTOR_SIZE);
      const chunk = fileBytes.subarray(chunkStart, chunkEnd);
      disk.set(chunk, diskDataOffset);
    }
    nextFreeCluster += clustersNeeded;

    // Write directory entry (32 bytes)
    const entryOffset = rootDirOffset + (dirIndex++ * 32);
    const formattedName = format83(file.filename);
    for (let i = 0; i < 11; i++) {
      disk[entryOffset + i] = formattedName.charCodeAt(i);
    }
    disk[entryOffset + 11] = 0x20; // Attribute: Archive

    // Time & Date: Set to 1988 or modern DOS epoch
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

    view.setUint16(entryOffset + 22, dosTime, true);
    view.setUint16(entryOffset + 24, dosDate, true);
    view.setUint16(entryOffset + 26, startCluster, true); // Starting cluster
    view.setUint32(entryOffset + 28, fileSize, true); // File size
  }

  return disk;
}

/**
 * Trigger browser file download from Uint8Array
 */
export function downloadBinaryFile(filename: string, data: Uint8Array, mimeType = 'application/octet-stream') {
  // Use Uint8Array directly in Blob to avoid SharedArrayBuffer type incompatibility
  const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain') {
  const crlfContent = content.replace(/\r?\n/g, '\r\n');
  const blob = new Blob([crlfContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
