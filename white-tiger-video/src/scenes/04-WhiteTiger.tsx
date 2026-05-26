import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";

export const WhiteTigerScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Spotlight radius expands slowly
  const spotlightSize = interpolate(frame, [0, durationInFrames * 0.6], [15, 45], {
    extrapolateRight: "clamp",
  });

  // Title pulses gently
  const pulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.4),
    [-1, 1],
    [0.97, 1.02]
  );

  const titleIn = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 20, stiffness: 70 } });
  const titleY = interpolate(titleIn, [0, 1], [60, 0]);
  const titleOpacity = interpolate(frame - 20, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="sparse">
      {/* Spotlight radial gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${spotlightSize}% at 50% 42%, rgba(251,191,36,0.06) 0%, transparent 70%)`,
        }}
      />

      <AbsoluteFill className="flex flex-col items-center justify-center text-center px-24">
        <KineticText role="label" delay={10} color="#6b7280">
          School Inspector · Laxmangarh
        </KineticText>

        <div
          style={{
            transform: `translateY(${titleY}px) scale(${pulse})`,
            opacity: titleOpacity,
          }}
          className="mt-6 mb-8"
        >
          <h2 className="text-white font-black leading-none" style={{ fontSize: "9rem" }}>
            White
          </h2>
          <h2 className="text-amber-400 font-black leading-none" style={{ fontSize: "9rem" }}>
            Tiger
          </h2>
        </div>

        <KineticText role="quote" size="text-2xl" delay={45} className="text-amber-300 italic text-2xl max-w-2xl leading-relaxed">
          "The rarest of animals — the creature that comes along only once in a generation."
        </KineticText>

        <div className="mt-10">
          <KineticText role="body" size="text-lg" delay={65} color="#9ca3af">
            The inspector sees something. Then the moment ends. School ends.
          </KineticText>
          <KineticText role="body" size="text-lg" delay={80} color="#6b7280">
            The White Tiger is put back in his cage.
          </KineticText>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
