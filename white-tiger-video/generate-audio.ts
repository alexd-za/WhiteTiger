/**
 * Audio generation pipeline for White Tiger video summary.
 *
 * Usage: npm run generate-audio
 *
 * Required env vars (in ../.env or .env):
 *   KEY_ONE   - Primary ElevenLabs API key
 *   KEY_TWO   - Fallback ElevenLabs API key (activated on KEY_ONE 429/quota)
 *
 * Optional env vars:
 *   VOICE_ID         - ElevenLabs voice ID (default: George - documentary narrator)
 *   GENERATE_SFX     - Set to "true" to auto-generate missing SFX via ElevenLabs
 *   SKIP_EXISTING    - Set to "false" to regenerate all segments (default: skip existing)
 */

import * as fs from "fs";
import * as path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { createWriteStream } from "fs";
import dotenv from "dotenv";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

// Load .env from this directory or the parent (repo root)
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const KEY_ONE = process.env.KEY_ONE;
const KEY_TWO = process.env.KEY_TWO;

if (!KEY_ONE || !KEY_TWO) {
  console.error(
    "❌  KEY_ONE and KEY_TWO must be set in .env\n" +
      "    Expected: KEY_ONE=sk_... KEY_TWO=sk_..."
  );
  process.exit(1);
}

// George – male, narrative, excellent for documentary voice-over
const VOICE_ID = process.env.VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
const MODEL_ID = "eleven_multilingual_v2";
const SKIP_EXISTING = process.env.SKIP_EXISTING !== "false";
const GENERATE_SFX = process.env.GENERATE_SFX === "true";

const DIRS = {
  segments: path.resolve(__dirname, "public/audio_segments"),
  sfx: path.resolve(__dirname, "public/sfx"),
  public: path.resolve(__dirname, "public"),
};

const OUTPUT = {
  voiceover: path.resolve(DIRS.public, "voiceover.mp3"),
  syncMap: path.resolve(DIRS.public, "sync-map.json"),
};

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
  /** Positive = audio longer than script slot; negative = audio shorter */
  driftFrames: number;
  audioMeasured: true;
}

interface SyncMap {
  totalDurationMs: number;
  fps: number;
  audioMeasured: true;
  scenes: SyncEntry[];
}

// ---------------------------------------------------------------------------
// SFX keyword → description map (used for generation and file lookup)
// ---------------------------------------------------------------------------

const SFX_KEYWORD_MAP: Record<string, string> = {
  tension:
    "building cinematic tension, low drone, dark ambient suspense",
  rain: "heavy rain on pavement, urban night, puddles",
  traffic: "busy Delhi traffic, car horns, motorcycles, city noise",
  market: "crowded Indian bazaar, vendors, footsteps, chatter",
  village: "rural Indian village ambience, birds, distant temple bells",
  city: "urban city ambience, distant traffic, nighttime",
  coal: "industrial coal mine, rumbling machinery, distant drills",
  zoo: "zoo ambience, distant animal calls, birds, footsteps",
  page: "paper pages turning, pen on paper, quiet office",
  chandelier:
    "quiet office at night, air conditioning hum, clock ticking",
  jungle: "deep jungle ambience, insects, birds, tropical nature",
};

function detectSfxKeyword(scene: ScriptScene): string | null {
  const haystack =
    (scene.title + " " + scene.spokenText.slice(0, 300)).toLowerCase();
  for (const keyword of Object.keys(SFX_KEYWORD_MAP)) {
    if (haystack.includes(keyword)) return keyword;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Key failover
// ---------------------------------------------------------------------------

let activeKey: string = KEY_ONE;
let primaryExhausted = false;

function getClient(): ElevenLabsClient {
  return new ElevenLabsClient({ apiKey: activeKey });
}

function trySwitchToFallback(): boolean {
  if (primaryExhausted) return false; // already on fallback
  console.warn(
    "  ⚠️  KEY_ONE quota/rate-limit hit — switching to KEY_TWO for remainder of queue"
  );
  activeKey = KEY_TWO!;
  primaryExhausted = true;
  return true;
}

// ---------------------------------------------------------------------------
// ElevenLabs TTS with failover + request stitching
// ---------------------------------------------------------------------------

async function streamToBuffer(readable: AsyncIterable<Uint8Array>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function generateSegment(
  scene: ScriptScene,
  previousText: string | undefined,
  nextText: string | undefined,
  outputPath: string
): Promise<void> {
  const attempt = async (): Promise<Buffer> => {
    const client = getClient();
    const stream = await client.textToSpeech.convert(VOICE_ID, {
      text: scene.spokenText,
      modelId: MODEL_ID,
      outputFormat: "mp3_44100_128",
      voiceSettings: {
        stability: 0.45,
        similarityBoost: 0.82,
        style: 0.15,
        useSpeakerBoost: true,
        speed: 0.95, // Slightly slower — documentary pacing
      },
      // Request stitching: give ElevenLabs surrounding context for
      // seamless tone continuity at scene boundaries
      ...(previousText ? { previousText: previousText.slice(-200) } : {}),
      ...(nextText ? { nextText: nextText.slice(0, 200) } : {}),
    });
    return streamToBuffer(stream as AsyncIterable<Uint8Array>);
  };

  let buffer: Buffer;
  try {
    buffer = await attempt();
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    const is429 =
      e?.status === 429 ||
      e?.message?.toLowerCase().includes("quota") ||
      e?.message?.toLowerCase().includes("rate");

    if (is429 && trySwitchToFallback()) {
      buffer = await attempt(); // retry with fallback key
    } else {
      throw err;
    }
  }

  fs.writeFileSync(outputPath, buffer);
}

// ---------------------------------------------------------------------------
// ffprobe — get audio duration in milliseconds
// ---------------------------------------------------------------------------

function getAudioDurationMs(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const seconds = metadata.format.duration ?? 0;
      resolve(Math.round(seconds * 1000));
    });
  });
}

// ---------------------------------------------------------------------------
// SFX: fetch or generate a sound effect file
// ---------------------------------------------------------------------------

async function ensureSfxFile(keyword: string): Promise<string | null> {
  const sfxPath = path.join(DIRS.sfx, `${keyword}.mp3`);
  if (fs.existsSync(sfxPath)) return sfxPath;

  if (!GENERATE_SFX) {
    return null; // no file, generation disabled — skip SFX for this scene
  }

  console.log(`  🎵  Generating SFX for keyword "${keyword}" via ElevenLabs…`);
  const description = SFX_KEYWORD_MAP[keyword];
  const client = getClient();

  try {
    const stream = await client.textToSoundEffects.convert({
      text: description,
      durationSeconds: 15,
      promptInfluence: 0.4,
    });
    fs.mkdirSync(DIRS.sfx, { recursive: true });
    await pipeline(
      Readable.from(stream as AsyncIterable<Buffer>),
      createWriteStream(sfxPath)
    );
    console.log(`  ✅  SFX saved: public/sfx/${keyword}.mp3`);
    return sfxPath;
  } catch (err) {
    console.warn(`  ⚠️  SFX generation failed for "${keyword}":`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// ffmpeg: mix voiceover segment with optional SFX layer
// ---------------------------------------------------------------------------

function mixSegmentWithSfx(
  voicePath: string,
  sfxPath: string,
  outputPath: string,
  durationMs: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const durationSec = durationMs / 1000;

    ffmpeg()
      .input(voicePath)
      .input(sfxPath)
      .complexFilter([
        // Loop SFX to fill the scene duration, then fade out last 2s
        `[1:a]aloop=loop=-1:size=2e+09,atrim=duration=${durationSec},afade=t=out:st=${Math.max(0, durationSec - 2)}:d=2,volume=0.18[sfx]`,
        // Mix voiceover (full volume) + SFX (18%)
        `[0:a][sfx]amix=inputs=2:normalize=0[out]`,
      ])
      .outputOptions(["-map", "[out]", "-c:a", "libmp3lame", "-q:a", "2"])
      .duration(durationSec)
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });
}

// ---------------------------------------------------------------------------
// ffmpeg: concatenate all final segment files into voiceover.mp3
// ---------------------------------------------------------------------------

function concatenateSegments(segmentPaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const listFile = path.join(DIRS.public, "_concat_list.txt");
    const lines = segmentPaths.map((p) => `file '${p}'`).join("\n");
    fs.writeFileSync(listFile, lines);

    ffmpeg()
      .input(listFile)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions(["-c:a", "libmp3lame", "-q:a", "2"])
      .output(outputPath)
      .on("end", () => {
        fs.unlinkSync(listFile);
        resolve();
      })
      .on("error", (err) => {
        fs.unlinkSync(listFile);
        reject(err);
      })
      .run();
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🐯  White Tiger — Audio Generation Pipeline\n");
  console.log(`   Voice: ${VOICE_ID}  |  Model: ${MODEL_ID}`);
  console.log(`   Keys: KEY_ONE=${KEY_ONE!.slice(0, 8)}…  KEY_TWO=${KEY_TWO!.slice(0, 8)}…`);
  console.log(`   Skip existing: ${SKIP_EXISTING}  |  Generate SFX: ${GENERATE_SFX}\n`);

  fs.mkdirSync(DIRS.segments, { recursive: true });
  fs.mkdirSync(DIRS.sfx, { recursive: true });

  const script: ScriptScene[] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "src/data/script.json"), "utf-8")
  );

  const syncEntries: SyncEntry[] = [];
  const finalSegmentPaths: string[] = [];
  let cumulativeMs = 0;

  for (let i = 0; i < script.length; i++) {
    const scene = script[i];
    const sceneNum = String(i + 1).padStart(2, "0");
    const segmentPath = path.join(DIRS.segments, `${scene.id}.mp3`);
    const mixedPath = path.join(DIRS.segments, `${scene.id}_mixed.mp3`);

    console.log(`[${sceneNum}/${script.length}] "${scene.title}"`);

    // ── 1. Generate TTS segment ─────────────────────────────────────────────
    if (SKIP_EXISTING && fs.existsSync(segmentPath)) {
      console.log(`  ⏭  Segment exists, skipping TTS generation`);
    } else {
      const prevText = i > 0 ? script[i - 1].spokenText : undefined;
      const nextText = i < script.length - 1 ? script[i + 1].spokenText : undefined;
      console.log(
        `  🎙  Generating TTS (${scene.spokenText.split(/\s+/).length} words)…`
      );
      await generateSegment(scene, prevText, nextText, segmentPath);
      console.log(`  ✅  Saved: audio_segments/${scene.id}.mp3`);
    }

    // ── 2. Measure exact audio duration ─────────────────────────────────────
    const durationMs = await getAudioDurationMs(segmentPath);
    console.log(
      `  ⏱  Duration: ${(durationMs / 1000).toFixed(2)}s` +
        `  (script slot: ${(scene.durationInFrames / 30).toFixed(2)}s)`
    );

    // ── 3. SFX detection and mixing ─────────────────────────────────────────
    const sfxKeyword = detectSfxKeyword(scene);
    let finalPath = segmentPath;

    if (sfxKeyword) {
      const sfxFile = await ensureSfxFile(sfxKeyword);
      if (sfxFile) {
        if (SKIP_EXISTING && fs.existsSync(mixedPath)) {
          console.log(`  ⏭  Mixed segment exists, skipping SFX mix`);
          finalPath = mixedPath;
        } else {
          console.log(`  🎚  Mixing SFX layer: "${sfxKeyword}"`);
          await mixSegmentWithSfx(segmentPath, sfxFile, mixedPath, durationMs);
          console.log(`  ✅  Mixed: audio_segments/${scene.id}_mixed.mp3`);
          finalPath = mixedPath;
        }
      }
    }

    finalSegmentPaths.push(finalPath);

    // ── 4. Build sync entry ─────────────────────────────────────────────────
    const fps = 30;
    const startMs = cumulativeMs;
    const endMs = cumulativeMs + durationMs;
    const startFrame = Math.round((startMs / 1000) * fps);
    const endFrame = Math.round((endMs / 1000) * fps);
    const audioDurationFrames = endFrame - startFrame;
    const driftFrames = audioDurationFrames - scene.durationInFrames;

    if (Math.abs(driftFrames) > 30) {
      console.warn(
        `  ⚠️  Drift warning: audio is ${driftFrames > 0 ? "+" : ""}${driftFrames} frames` +
          ` vs script slot`
      );
    }

    syncEntries.push({
      id: scene.id,
      title: scene.title,
      segmentFile: `audio_segments/${path.basename(finalPath)}`,
      startMs,
      endMs,
      durationMs,
      startFrame,
      endFrame,
      scriptDurationFrames: scene.durationInFrames,
      scriptFromFrame: scene.fromFrame,
      driftFrames,
      audioMeasured: true,
    });

    cumulativeMs += durationMs;
    console.log();
  }

  // ── 5. Write sync-map.json ───────────────────────────────────────────────
  const syncMap: SyncMap = {
    totalDurationMs: cumulativeMs,
    fps: 30,
    audioMeasured: true,
    scenes: syncEntries,
  };
  fs.writeFileSync(OUTPUT.syncMap, JSON.stringify(syncMap, null, 2));
  console.log(`✅  sync-map.json written (${(cumulativeMs / 60000).toFixed(2)} min total audio)\n`);

  // ── 6. Concatenate all segments into voiceover.mp3 ───────────────────────
  console.log(`🔗  Concatenating ${finalSegmentPaths.length} segments into voiceover.mp3…`);
  await concatenateSegments(finalSegmentPaths, OUTPUT.voiceover);
  const sizeMb = (fs.statSync(OUTPUT.voiceover).size / 1024 / 1024).toFixed(1);
  console.log(`✅  voiceover.mp3 ready — ${sizeMb} MB`);

  // ── 7. Summary ───────────────────────────────────────────────────────────
  const totalMin = (cumulativeMs / 60000).toFixed(2);
  const scriptMin = (54000 / 30 / 60).toFixed(2);
  const maxDrift = Math.max(...syncEntries.map((e) => Math.abs(e.driftFrames)));

  console.log("\n📊  Pipeline summary");
  console.log(`   Audio duration : ${totalMin} min`);
  console.log(`   Script duration: ${scriptMin} min`);
  console.log(
    `   Delta          : ${((cumulativeMs - 1800000) / 1000).toFixed(1)}s`
  );
  console.log(`   Max scene drift: ${maxDrift} frames`);
  if (primaryExhausted) console.log("   Key used       : KEY_TWO (KEY_ONE was exhausted)");
  else console.log("   Key used       : KEY_ONE");
  console.log("\n🐯  Done. Run `npm run dev` to preview in Remotion Studio.\n");
}

main().catch((err) => {
  console.error("\n❌  Fatal error:", err);
  process.exit(1);
});
