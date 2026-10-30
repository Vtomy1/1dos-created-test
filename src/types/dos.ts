export type DosFileType = 'BAT' | 'BAS' | 'ASM_COM' | 'ANS' | 'CONFIG';

export type TargetSystemId = 
  | 'all'
  | 'ibm_5150' 
  | 'pc_at_286' 
  | 'pc_486_vga' 
  | 'pentium_freedos' 
  | 'tandy_1000' 
  | 'pc_9801';

export interface SystemModelInfo {
  id: TargetSystemId;
  name: string;
  year: number;
  cpu: string;
  clockSpeed: string;
  ramMax: string;
  graphics: string;
  audio: string;
  dosVersion: string;
  description: string;
  badge: string;
}

export interface CompatibilityStatus {
  status: 'compatible' | 'needs_patch' | 'incompatible';
  reason: string;
}

export interface DosProgramResult {
  title: string;
  filename: string;
  primaryType: DosFileType;
  primaryCode: string;
  instructions: string;
  debugScript: string;
  memoryRequirements: {
    conventionalKB: number;
    requiresEMS: boolean;
    requiresXMS: boolean;
    minDosVersion: string;
  };
  audioVideoProfile: {
    videoMode: string;
    soundMode: string;
  };
  compatibilityMatrix: {
    ibm_5150: CompatibilityStatus;
    pc_at_286: CompatibilityStatus;
    pc_486_vga: CompatibilityStatus;
    pentium_freedos: CompatibilityStatus;
    tandy_1000: CompatibilityStatus;
    pc_9801: CompatibilityStatus;
  };
  compatibilityPatches: string[];
  companionFiles?: Array<{
    filename: string;
    content: string;
  }>;
}

export type PhosphorTheme = 'amber' | 'green' | 'white' | 'vga';
