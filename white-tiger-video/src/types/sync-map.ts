export interface SyncEntry {
  id: string;
  title: string;
  segmentFile: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  startFrame: number;
  endFrame: number;
  scriptDurationFrames: number;
  scriptFromFrame: number;
  driftFrames: number;
  audioMeasured: boolean;
}

export interface SyncMap {
  totalDurationMs: number;
  fps: number;
  audioMeasured: boolean;
  scenes: SyncEntry[];
}

export interface SyncedTiming {
  /** Absolute frame within the full 54,000-frame composition */
  startFrame: number;
  endFrame: number;
  durationFrames: number;
  durationMs: number;
  /** Positive = audio longer than script slot; negative = shorter */
  driftFrames: number;
  /** True once generate-audio.ts has run and produced real measurements */
  audioMeasured: boolean;
}
