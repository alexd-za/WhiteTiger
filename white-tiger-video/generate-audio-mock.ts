/**
 * Mock audio generator — produces silent placeholder MP3s at the correct
 * duration for each script scene, then builds sync-map.json and voiceover.mp3.
 *
 * Run this when ElevenLabs is unavailable (e.g. cloud IP not allowlisted).
 * It lets you preview the full Remotion composition in Studio with correct
 * sync-map timing.  Re-run `npm run generate-audio` when ElevenLabs is
 * accessible to replace placeholders with real narration.
 *
 * Usage: npm run generate-audio-mock
 */

import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "@ffprobe-installer/ffprobe";
import ffmpeg from "fluent-ffmpeg";

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobe.path);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScriptScene {
  id: string;
  title: string;
  fromFrame: number;
  durationInFrames: number;
  keyQuote: string;
  spokenText: string;
}

interface SyncEntry {
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

interface SyncMap {
  totalDurationMs: number;
  fps: number;
  audioMeasured: boolean;
  scenes: SyncEntry[];
}

// ---------------------------------------------------------------------------
// Dirs
// ---------------------------------------------------------------------------

const ROOT = __dirname;
const DIRS = {
  segments: path.join(ROOT, "public/audio_segments"),
  public: path.join(ROOT, "public"),
};

const OUTPUT = {
  voiceover: path.join(DIRS.public, "voiceover.mp3"),
  syncMap: path.join(DIRS.public, "sync-map.json"),
};

// ---------------------------------------------------------------------------
// Generate a silent MP3 of exact duration using ffmpeg-static
// ---------------------------------------------------------------------------

function generateSilentMp3(durationSec: number, outputPath: string): void {
  if (!ffmpegPath) throw new Error("ffmpeg-static not found");
  execFileSync(ffmpegPath, [
    "-y",
    "-f", "lavfi",
    // anullsrc produces digital silence; we pipe it through aevalsrc to add
    // a barely-audible 40Hz sub-tone so waveform editors show a non-flat line
    "-i", `aevalsrc=0.002*sin(2*PI*40*t):s=44100:c=mono`,
    "-t", String(durationSec.toFixed(3)),
    "-c:a", "libmp3lame",
    "-q:a", "9",     // lowest quality — placeholder only, minimise disk use
    "-ar", "44100",
    outputPath,
  ], { stdio: "pipe" });
}

// ---------------------------------------------------------------------------
// Concatenate all segments via concat demuxer
// ---------------------------------------------------------------------------

function concatenateSegments(
  segmentPaths: string[],
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const listFile = path.join(DIRS.public, "_concat_list.txt");
    const lines = segmentPaths.map((p) => `file '${p}'`).join("\n");
    fs.writeFileSync(listFile, lines);

    ffmpeg()
      .input(listFile)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions(["-c:a", "libmp3lame", "-q:a", "9"])
      .output(outputPath)
      .on("end", () => { fs.unlinkSync(listFile); resolve(); })
      .on("error", (err) => { fs.unlinkSync(listFile); reject(err); })
      .run();
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🐯  White Tiger — Mock Audio Generator");
  console.log("   Producing silent placeholder MP3s at correct durations.\n");

  fs.mkdirSync(DIRS.segments, { recursive: true });

  const script: ScriptScene[] = JSON.parse(
    fs.readFileSync(path.join(ROOT, "src/data/script.json"), "utf-8")
  );

  const FPS = 30;
  const syncEntries: SyncEntry[] = [];
  const segmentPaths: string[] = [];
  let cumulativeMs = 0;

  for (let i = 0; i < script.length; i++) {
    const scene = script[i];
    const sceneNum = String(i + 1).padStart(2, "0");
    const segmentPath = path.join(DIRS.segments, `${scene.id}.mp3`);

    // Duration exactly matches script slot
    const durationMs = Math.round((scene.durationInFrames / FPS) * 1000);
    const durationSec = durationMs / 1000;

    process.stdout.write(
      `[${sceneNum}/${script.length}] ${scene.id}  ${durationSec.toFixed(1)}s … `
    );

    generateSilentMp3(durationSec, segmentPath);
    const sizekb = Math.round(fs.statSync(segmentPath).size / 1024);
    console.log(`✅  ${sizekb}KB`);

    const startMs = cumulativeMs;
    const endMs = cumulativeMs + durationMs;

    syncEntries.push({
      id: scene.id,
      title: scene.title,
      segmentFile: `audio_segments/${scene.id}.mp3`,
      startMs,
      endMs,
      durationMs,
      startFrame: Math.round((startMs / 1000) * FPS),
      endFrame: Math.round((endMs / 1000) * FPS),
      scriptDurationFrames: scene.durationInFrames,
      scriptFromFrame: scene.fromFrame,
      driftFrames: 0,  // placeholder matches script slot exactly
      audioMeasured: false,  // flag: not real ElevenLabs audio
    });

    segmentPaths.push(segmentPath);
    cumulativeMs += durationMs;
  }

  // Write sync-map
  const syncMap: SyncMap = {
    totalDurationMs: cumulativeMs,
    fps: FPS,
    audioMeasured: false,
    scenes: syncEntries,
  };
  fs.writeFileSync(OUTPUT.syncMap, JSON.stringify(syncMap, null, 2));
  console.log(`\n✅  sync-map.json written  (${(cumulativeMs / 60000).toFixed(1)} min)`);

  // Concatenate
  console.log(`\n🔗  Concatenating ${segmentPaths.length} segments → voiceover.mp3 …`);
  await concatenateSegments(segmentPaths, OUTPUT.voiceover);
  const sizeMb = (fs.statSync(OUTPUT.voiceover).size / 1024 / 1024).toFixed(1);
  console.log(`✅  voiceover.mp3 ready — ${sizeMb} MB`);
  console.log("\n   Run `npm run dev` to preview in Remotion Studio.");
  console.log("   Run `npm run generate-audio` to replace with real ElevenLabs narration.\n");
}

main().catch((err) => {
  console.error("\n❌  Error:", err);
  process.exit(1);
});
