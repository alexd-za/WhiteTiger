import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const StorksHouseholdScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Hierarchy diagram — boxes appearing in order
  const boxDelay = [20, 38, 52, 66, 52, 66];
  const boxes = [
    { label: "The Stork", level: 0, col: 1 },
    { label: "The Mongoose", level: 1, col: 0 },
    { label: "Mr. Ashok", level: 1, col: 2 },
    { label: "Pinky Madam", level: 2, col: 1 },
    { label: "Balram", level: 2, col: 0, accent: true },
    { label: "Other Servants", level: 2, col: 2 },
  ];

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="default">
      <AbsoluteFill className="flex items-center px-24 gap-16">
        {/* Left: hierarchy visual */}
        <div className="flex-1">
          <KineticText role="label" delay={8} color="#6b7280">The Compound · Dhanbad</KineticText>
          <KineticText role="title" size="text-5xl" delay={14} className="text-white font-bold text-5xl mt-2 mb-8">
            The Structure of Service
          </KineticText>

          <div className="relative h-52">
            {boxes.map(({ label, level, col, accent }, i) => {
              const boxOpacity = interpolate(frame - boxDelay[i], [0, 12], [0, 1], { extrapolateRight: "clamp" });
              return (
                <div
                  key={label}
                  className={`absolute border text-xs font-medium px-3 py-2 text-center ${
                    accent
                      ? "border-amber-600/70 bg-amber-950/40 text-amber-300"
                      : "border-slate-700/50 bg-slate-900/60 text-slate-300"
                  }`}
                  style={{
                    opacity: boxOpacity,
                    left: `${col * 35}%`,
                    top: `${level * 38}%`,
                    width: "28%",
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: the question */}
        <div className="w-96 border-l border-slate-800 pl-12">
          <KineticText role="quote" size="text-xl" delay={70} className="text-amber-400 italic text-xl leading-relaxed">
            "Do we loathe our masters behind a facade of love — or do we love them behind a facade of loathing?"
          </KineticText>
          <div className="mt-6">
            <WordReveal
              text="This question will follow him all the way to Bangalore."
              delay={90}
              wordsPerSecond={2.2}
              className="text-slate-400 text-base font-light"
            />
          </div>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
