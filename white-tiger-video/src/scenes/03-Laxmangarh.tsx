import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const LaxmangarhScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Dust particle — slow horizontal drift
  const dustX = interpolate(frame, [0, durationInFrames], [0, 120]);

  // Landlord names stagger in
  const landlords = [
    { name: "The Stork", color: "#9ca3af", delay: 60 },
    { name: "The Mongoose", color: "#9ca3af", delay: 72 },
    { name: "The Wild Boar", color: "#9ca3af", delay: 84 },
    { name: "The Buffalo", color: "#9ca3af", delay: 96 },
  ];

  const cardScale = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 22, stiffness: 80 },
  });

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="warm">
      {/* Dust streaks */}
      <AbsoluteFill className="overflow-hidden opacity-20 pointer-events-none">
        {[30, 55, 70, 85, 92].map((top, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-amber-700/40 to-transparent"
            style={{
              top: `${top}%`,
              left: `${dustX * (0.3 + i * 0.15) - 20}%`,
              width: `${20 + i * 8}%`,
            }}
          />
        ))}
      </AbsoluteFill>

      <AbsoluteFill className="flex items-center justify-center px-24">
        <div className="w-full max-w-4xl">
          <KineticText role="label" delay={8}>Gaya District · Bihar</KineticText>
          <KineticText role="title" size="text-6xl" delay={15} className="text-white font-bold text-6xl mt-3 mb-8">
            Laxmangarh
          </KineticText>

          <div className="grid grid-cols-4 gap-4 mb-10">
            {landlords.map(({ name, color, delay }) => (
              <div
                key={name}
                className="border border-stone-700/50 bg-stone-950/60 p-4 text-center"
                style={{ transform: `scale(${cardScale})`, opacity: interpolate(frame - delay, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}
              >
                <span className="text-sm font-light tracking-wide" style={{ color }}>
                  {name}
                </span>
              </div>
            ))}
          </div>

          <WordReveal
            text="Four landlord families own everything. The land, the river, the road, the bodies of the men who work them."
            delay={55}
            wordsPerSecond={2.8}
            className="text-stone-300 text-xl leading-loose font-light"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
