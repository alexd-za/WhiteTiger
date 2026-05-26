import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const DelhiArrivalScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // City light streaks — diagonal motion lines
  const streakCount = 18;
  const streakSpeed = frame * 2.5;

  // Stat numbers count up
  const population = Math.floor(interpolate(frame, [30, 90], [0, 7], { extrapolateRight: "clamp" }));

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="city">
      {/* Motion-blur light streaks */}
      <AbsoluteFill className="overflow-hidden opacity-20 pointer-events-none">
        {Array.from({ length: streakCount }).map((_, i) => {
          const top = (i / streakCount) * 110 - 5;
          const length = 80 + (i % 5) * 40;
          const offset = ((streakSpeed * (0.4 + (i % 7) * 0.1)) % (length + 120)) - length;
          return (
            <div
              key={i}
              className="absolute h-px"
              style={{
                top: `${top}%`,
                left: `${offset}px`,
                width: `${length}px`,
                background: `linear-gradient(to right, transparent, rgba(147,197,253,${0.2 + (i % 4) * 0.15}), transparent)`,
                transform: `rotate(-${2 + (i % 4)}deg)`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill className="flex items-center justify-center px-24">
        <div className="w-full max-w-4xl">
          <KineticText role="label" delay={8} color="#60a5fa">New Delhi · Gurgaon</KineticText>
          <KineticText role="title" size="text-6xl" delay={15} className="font-black text-6xl mt-2 mb-4" color="#ffffff">
            The Capital
          </KineticText>

          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-blue-400 font-black" style={{ fontSize: "5rem", lineHeight: 1 }}>
              {population}M
            </span>
            <KineticText role="label" delay={28} color="#60a5fa">people. Two worlds.</KineticText>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Above", desc: "Glass towers. Call centers. Midnight shifts.", color: "#93c5fd" },
              { label: "Below", desc: "Migrants under bridges. Bihar on plastic sheets.", color: "#475569" },
            ].map(({ label, desc, color }, i) => (
              <div
                key={label}
                className="p-5 border border-blue-900/30 bg-blue-950/20"
                style={{
                  opacity: interpolate(frame - (50 + i * 15), [0, 15], [0, 1], { extrapolateRight: "clamp" }),
                  transform: `translateY(${interpolate(spring({ frame: Math.max(0, frame - (50 + i * 15)), fps, config: { damping: 25, stiffness: 90 } }), [0, 1], [20, 0])}px)`,
                }}
              >
                <p className="text-sm uppercase tracking-wider mb-1" style={{ color }}>{label}</p>
                <p className="text-slate-300 text-base font-light">{desc}</p>
              </div>
            ))}
          </div>

          <WordReveal
            text="Delhi is both the Light and the Darkness in one city, side by side, pretending not to see each other."
            delay={85}
            wordsPerSecond={2.8}
            className="text-slate-300 text-xl font-light leading-loose"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
