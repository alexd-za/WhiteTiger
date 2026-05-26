import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const BreakingPointScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Cage bars — vertical lines with slow closing animation
  const barSpacing = interpolate(frame, [30, durationInFrames * 0.7], [120, 105], {
    extrapolateRight: "clamp",
  });
  const barOpacity = interpolate(frame, [10, 40], [0, 0.22], { extrapolateRight: "clamp" });

  // Tiger pacing — a white shape moving left/right
  const tigerCycle = (frame % 90) / 90;
  const tigerX = tigerCycle < 0.5
    ? interpolate(tigerCycle, [0, 0.5], [30, 70])
    : interpolate(tigerCycle, [0.5, 1], [70, 30]);

  // Realization pulse
  const realization = spring({ frame: Math.max(0, frame - 75), fps, config: { damping: 15, stiffness: 50 } });
  const realizationScale = interpolate(realization, [0, 1], [0.85, 1]);
  const realizationOpacity = interpolate(frame - 75, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="dramatic">
      {/* Cage bars */}
      <AbsoluteFill
        className="pointer-events-none"
        style={{ opacity: barOpacity }}
      >
        {Array.from({ length: Math.ceil(1920 / barSpacing) }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-violet-500/60 to-transparent"
            style={{ left: `${(i * barSpacing / 19.2)}%` }}
          />
        ))}
      </AbsoluteFill>

      {/* Tiger pacer */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${tigerX}%`,
          bottom: "22%",
          transform: "translateX(-50%)",
          opacity: interpolate(frame, [25, 50], [0, 0.12], { extrapolateRight: "clamp" }),
        }}
      >
        <div className="w-16 h-8 bg-white rounded-full" />
      </div>

      <AbsoluteFill className="flex flex-col items-center justify-center text-center px-24">
        <KineticText role="label" delay={10} color="#8b5cf6">Delhi Zoo · The Enclosure</KineticText>
        <KineticText role="title" size="text-6xl" delay={18} className="text-white font-bold text-6xl mt-3 mb-6">
          The White Tiger
        </KineticText>

        <KineticText role="body" size="text-xl" delay={35} color="#cbd5e1" className="max-w-2xl">
          Born free in the Sunderbans. Now pacing twelve meters of concrete. Back and forth. Back and forth.
        </KineticText>

        {/* Realization moment */}
        <div
          className="mt-10 max-w-3xl border border-violet-800/50 bg-violet-950/40 p-8"
          style={{ transform: `scale(${realizationScale})`, opacity: realizationOpacity }}
        >
          <p className="text-amber-400 text-2xl italic font-light leading-relaxed">
            "He was the only animal in the zoo that was not looking at us."
          </p>
          <p className="text-violet-300/70 text-base mt-4 font-light">
            He was staring at something only he could see.
          </p>
        </div>

        <div className="mt-8">
          <WordReveal
            text="Balram looks at the tiger. The tiger does not look back. The decision is made."
            delay={105}
            wordsPerSecond={2.3}
            className="text-slate-300 text-xl font-light"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
