import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const ConfessionBetrayalScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Pinky Madam's silhouette walks away (simple right-to-edge motion)
  const figureX = interpolate(frame, [30, durationInFrames - 20], [60, 105], {
    extrapolateRight: "clamp",
  });
  const figureOpacity = interpolate(frame, [25, 40, durationInFrames - 30, durationInFrames - 10], [0, 0.15, 0.08, 0]);

  // Account balance ticks up
  const balance = Math.floor(interpolate(frame, [55, 95], [0, 5000], { extrapolateRight: "clamp" }));

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="sparse">
      {/* Walking figure silhouette (abstract) */}
      <AbsoluteFill className="pointer-events-none overflow-hidden">
        <div
          className="absolute bottom-1/3 w-4 h-10 bg-slate-600 rounded-sm"
          style={{ left: `${figureX}%`, opacity: figureOpacity }}
        />
      </AbsoluteFill>

      <AbsoluteFill className="flex flex-col justify-center px-32">
        <KineticText role="label" delay={10} color="#475569">Delhi · After the Incident</KineticText>
        <KineticText role="title" size="text-5xl" delay={18} className="text-white font-bold text-5xl mt-2 mb-10">
          Confession and Abandonment
        </KineticText>

        {/* Sequence of facts */}
        {[
          { text: "Pinky Madam boards a flight to America.", delay: 30, color: "#94a3b8" },
          { text: "She does not come back.", delay: 46, color: "#64748b" },
          { text: "Mr. Ashok drinks more. Speaks less.", delay: 62, color: "#64748b" },
        ].map(({ text, delay, color }) => (
          <KineticText key={text} role="body" size="text-xl" delay={delay} color={color} className="mb-3">
            {text}
          </KineticText>
        ))}

        {/* Account deposit */}
        <div
          className="mt-8 border border-slate-800 bg-slate-900/50 p-5 max-w-sm"
          style={{ opacity: interpolate(frame - 50, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}
        >
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Account Credit</p>
          <p className="text-white font-mono text-2xl">
            ₹{balance.toLocaleString("en-IN")}
          </p>
          <p className="text-slate-600 text-xs mt-1">No thank you. No meeting of eyes.</p>
        </div>

        <div className="mt-10">
          <WordReveal
            text="The coop holds him. He knows its shape now, knows where every wire is. The knowing makes it less bearable."
            delay={100}
            wordsPerSecond={2.3}
            className="text-slate-400 text-lg font-light italic"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
