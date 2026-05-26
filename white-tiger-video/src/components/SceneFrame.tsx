import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export type SceneVariant =
  | "default"    // slate-950 → black
  | "warm"       // stone-950 → slate-950 (village, earthy)
  | "city"       // blue-950 → slate-950 (Delhi, urban)
  | "dramatic"   // violet-950 → black (Rooster Coop, trapped)
  | "tension"    // red-950 → black (hit-and-run, murder)
  | "gold"       // amber-950 → slate-950 (conclusion, triumph)
  | "industrial" // zinc-950 → slate-950 (coal, Dhanbad)
  | "sparse";    // pure black (confession, isolation)

const BG: Record<SceneVariant, string> = {
  default:    "from-slate-950 via-slate-900 to-black",
  warm:       "from-stone-950 via-stone-900 to-slate-950",
  city:       "from-blue-950 via-slate-900 to-black",
  dramatic:   "from-violet-950 via-slate-950 to-black",
  tension:    "from-red-950 via-slate-950 to-black",
  gold:       "from-amber-950 via-stone-950 to-black",
  industrial: "from-zinc-900 via-zinc-950 to-black",
  sparse:     "bg-black",
};

const ACCENT: Record<SceneVariant, string> = {
  default:    "bg-slate-600",
  warm:       "bg-amber-700",
  city:       "bg-blue-600",
  dramatic:   "bg-violet-600",
  tension:    "bg-red-600",
  gold:       "bg-amber-500",
  industrial: "bg-zinc-500",
  sparse:     "bg-slate-700",
};

interface SceneFrameProps {
  children: React.ReactNode;
  durationInFrames: number;
  variant?: SceneVariant;
  showProgress?: boolean;
}

export const SceneFrame: React.FC<SceneFrameProps> = ({
  children,
  durationInFrames,
  variant = "default",
  showProgress = true,
}) => {
  const frame = useCurrentFrame();

  // Fade in over first 18 frames, fade out over last 18 frames
  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  // Progress bar width
  const progressWidth = `${(frame / durationInFrames) * 100}%`;

  return (
    <AbsoluteFill
      className={`bg-gradient-to-br ${BG[variant]}`}
      style={{ opacity }}
    >
      {children}

      {/* Bottom progress bar */}
      {showProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
          <div
            className={`h-full ${ACCENT[variant]} transition-none`}
            style={{ width: progressWidth }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
