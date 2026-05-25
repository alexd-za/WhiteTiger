import rawSyncMap from "../../public/sync-map.json";
import type { SyncMap, SyncedTiming } from "../types/sync-map";

const syncMap = rawSyncMap as SyncMap;

// Pre-index by id for O(1) lookups — called at module init, not per-frame
const sceneIndex = new Map<string, (typeof syncMap.scenes)[0]>(
  syncMap.scenes.map((s) => [s.id, s])
);

/**
 * Returns precise audio-locked start/end frames for a scene.
 *
 * Before `generate-audio.ts` has been run, timing falls back to
 * the script.json slot (audioMeasured: false).  After generation,
 * sync-map.json is updated with real ffprobe measurements and
 * the hook automatically returns those tighter values.
 *
 * Usage inside a <Sequence>:
 *   const { startFrame, durationFrames } = useSyncedTiming("10-rooster-coop");
 *   const progress = (useCurrentFrame() - startFrame) / durationFrames;
 */
export function useSyncedTiming(sceneId: string): SyncedTiming {
  const entry = sceneIndex.get(sceneId);

  if (!entry) {
    // Scene not in sync map — should not happen in production
    console.warn(`useSyncedTiming: unknown sceneId "${sceneId}"`);
    return {
      startFrame: 0,
      endFrame: 0,
      durationFrames: 0,
      durationMs: 0,
      driftFrames: 0,
      audioMeasured: false,
    };
  }

  return {
    startFrame: entry.startFrame,
    endFrame: entry.endFrame,
    durationFrames: entry.endFrame - entry.startFrame,
    durationMs: entry.durationMs,
    driftFrames: entry.driftFrames,
    audioMeasured: entry.audioMeasured,
  };
}

/**
 * Given an absolute composition frame and a scene's timing,
 * returns a 0→1 progress value clamped to [0, 1].
 * Use this to drive spring() and interpolate() calls so animations
 * are strictly locked to audio position.
 */
export function sceneProgress(
  absoluteFrame: number,
  timing: SyncedTiming
): number {
  if (timing.durationFrames === 0) return 0;
  const local = absoluteFrame - timing.startFrame;
  return Math.max(0, Math.min(1, local / timing.durationFrames));
}
