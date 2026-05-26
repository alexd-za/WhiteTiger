import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const TheMurderScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Rain — heavy, vertical
  const rainCount = 40;

  // Moment of the act — red bloom at frame 60
  const redBloom = interpolate(frame, [58, 62, 72], [0, 0.45, 0.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Single white text line — the action
  const actIn = spring({ frame: Math.max(0, frame - 55), fps, config: { damping: 25, stiffness: 80 } });
  const actOpacity = interpolate(frame - 55, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="tension">
      {/* Red act flash */}
      <AbsoluteFill
        className="pointer-events-none"
        style={{ background: `rgba(220,38,38,${redBloom})` }}
      />

      {/* Heavy rain */}
      <AbsoluteFill className="overflow-hidden opacity-30 pointer-events-none">
        {Array.from({ length: rainCount }).map((_, i) => {
          const x = (i / rainCount) * 105 - 2;
          const yOff = (frame * (2.2 + (i % 5) * 0.3) + i * 29) % 120;
          return (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"
              style={{ left: `${x}%`, top: `${yOff - 15}%`, height: "22%" }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill className="flex flex-col justify-center px-32">
        <KineticText role="label" delay={10} color="#ef4444">Delhi · Rain · Night</KineticText>
        <KineticText role="title" size="text-6xl" delay={18} className="text-white font-bold text-6xl mt-2 mb-8">
          The Night on the Road
        </KineticText>

        {[
          { text: "Mr. Ashok is tired. Slightly drunk. On his phone.", delay: 28, color: "#94a3b8" },
          { text: "He does not notice anything different about his driver.", delay: 42, color: "#64748b" },
          { text: "Why would he? Balram has been invisible for years.", delay: 56, color: "#475569" },
        ].map(({ text, delay, color }) => (
          <KineticText key={text} role="body" size="text-xl" delay={delay} color={color} className="mb-3">
            {text}
          </KineticText>
        ))}

        {/* The act */}
        <div
          className="mt-10 border-l-4 border-red-600 pl-6"
          style={{ opacity: actOpacity, transform: `translateX(${interpolate(actIn, [0, 1], [-20, 0])}px)` }}
        >
          <p className="text-red-400 text-2xl font-light italic leading-relaxed">
            "I drowned him and I sang while I did it."
          </p>
        </div>

        <div className="mt-8">
          <WordReveal
            text="Kindness inside a corrupt system is still the system. He takes the red bag."
            delay={85}
            wordsPerSecond={2.3}
            className="text-slate-400 text-xl font-light italic"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
