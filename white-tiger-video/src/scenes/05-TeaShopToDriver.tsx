import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const TeaShopToDriverScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  const steps = [
    { label: "Tea Shop", sub: "Serving, watching", delay: 25 },
    { label: "Coal Shop", sub: "Carrying, counting", delay: 40 },
    { label: "Driver's Helper", sub: "Learning, waiting", delay: 55 },
    { label: "Driver №1", sub: "The position of power", delay: 70, highlight: true },
  ];

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="industrial">
      {/* Ladder rungs — vertical line with horizontal ticks */}
      <AbsoluteFill className="flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-zinc-800/60" />
      </AbsoluteFill>

      <AbsoluteFill className="flex flex-col items-center justify-center px-24">
        <div className="w-full max-w-3xl">
          <KineticText role="label" delay={8} color="#71717a">Dhanbad · Bihar</KineticText>
          <KineticText role="title" size="text-5xl" delay={15} className="text-white font-bold text-5xl mt-2 mb-10">
            The Climb
          </KineticText>

          <div className="space-y-5">
            {steps.map(({ label, sub, delay, highlight }) => {
              const stepOpacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateRight: "clamp" });
              const stepX = interpolate(
                spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 100 } }),
                [0, 1], [-40, 0]
              );
              return (
                <div
                  key={label}
                  className={`flex items-center gap-5 ${highlight ? "pl-0" : "pl-6"}`}
                  style={{ opacity: stepOpacity, transform: `translateX(${stepX}px)` }}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${highlight ? "bg-amber-400" : "bg-zinc-500"}`} />
                  <div>
                    <span className={`font-semibold text-xl ${highlight ? "text-amber-400" : "text-white"}`}>
                      {label}
                    </span>
                    <span className="text-zinc-500 text-base ml-3">— {sub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 pl-6">
            <WordReveal
              text="A driver is always near the boss — always near the money."
              delay={85}
              wordsPerSecond={2.5}
              className="text-amber-400/80 text-xl italic font-light"
            />
          </div>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
