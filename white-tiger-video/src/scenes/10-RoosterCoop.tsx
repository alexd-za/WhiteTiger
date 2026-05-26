import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const RoosterCoopScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Wire grid — slowly closing in
  const gridOpacity = interpolate(frame, [0, 45], [0, 0.18], { extrapolateRight: "clamp" });
  const gridScale = interpolate(frame, [0, durationInFrames * 0.7], [1.15, 1.0], { extrapolateRight: "clamp" });

  // "99.9%" counter
  const percentProgress = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 30, stiffness: 50 } });
  const percent = interpolate(percentProgress, [0, 1], [0, 99.9]);

  // The quote explodes in
  const quoteIn = spring({ frame: Math.max(0, frame - 80), fps, config: { damping: 12, stiffness: 60 } });
  const quoteScale = interpolate(quoteIn, [0, 1], [0.7, 1]);
  const quoteOpacity = interpolate(frame - 80, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="dramatic">
      {/* Wire cage pattern overlay */}
      <AbsoluteFill
        className="pointer-events-none"
        style={{
          opacity: gridOpacity,
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(139,92,246,0.4) 0px, transparent 1px, transparent 59px, rgba(139,92,246,0.4) 60px),
            repeating-linear-gradient(90deg, rgba(139,92,246,0.4) 0px, transparent 1px, transparent 59px, rgba(139,92,246,0.4) 60px)
          `,
          transform: `scale(${gridScale})`,
        }}
      />

      <AbsoluteFill className="flex flex-col items-center justify-center px-24 text-center">
        <KineticText role="label" delay={8} color="#8b5cf6">The Central Metaphor</KineticText>

        <KineticText role="title" size="text-7xl" delay={20} className="font-black text-7xl mt-4 mb-2" color="#ffffff">
          The Rooster Coop
        </KineticText>

        {/* 99.9% stat */}
        <div
          className="flex items-baseline gap-2 my-6"
          style={{ opacity: interpolate(frame - 45, [0, 20], [0, 1], { extrapolateRight: "clamp" }) }}
        >
          <span className="text-violet-400 font-black" style={{ fontSize: "6rem", lineHeight: 1 }}>
            {percent.toFixed(1)}%
          </span>
          <span className="text-slate-400 text-2xl font-light">of us are inside.</span>
        </div>

        {/* The key quote */}
        <div
          style={{ transform: `scale(${quoteScale})`, opacity: quoteOpacity }}
          className="max-w-3xl border border-violet-900/50 bg-violet-950/30 p-8 mt-2"
        >
          <p className="text-amber-400 text-2xl italic font-light leading-relaxed">
            "The Rooster Coop is enforced not by chains but by love —<br />
            the servant's own love for his family, weaponized against him."
          </p>
        </div>

        <div className="mt-8">
          <WordReveal
            text="Only a man prepared to see his family destroyed can break out of the coop."
            delay={110}
            wordsPerSecond={2.5}
            className="text-slate-300 text-xl font-light"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
