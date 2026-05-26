import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const ConclusionScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Chandelier rays — radiating from top center
  const rayCount = 12;
  const rayOpacity = interpolate(frame, [10, 60], [0, 0.12], { extrapolateRight: "clamp" });
  const rayLength = interpolate(frame, [10, 80], [0.3, 1], { extrapolateRight: "clamp" });

  // Final quote — the centrepiece
  const finaleIn = spring({ frame: Math.max(0, frame - 65), fps, config: { damping: 18, stiffness: 55 } });
  const finaleScale = interpolate(finaleIn, [0, 1], [0.88, 1]);
  const finaleOpacity = interpolate(frame - 65, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  // End fade to black — final 40 frames
  const endFade = interpolate(frame, [durationInFrames - 40, durationInFrames - 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="gold" showProgress={false}>
      {/* Chandelier rays */}
      <AbsoluteFill className="pointer-events-none overflow-hidden">
        {Array.from({ length: rayCount }).map((_, i) => {
          const angle = (i / rayCount) * 180 - 90; // -90 to +90 degrees (downward fan)
          const rad = (angle * Math.PI) / 180;
          const endY = Math.cos(rad) * 60 * rayLength;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                top: 0,
                left: "50%",
                width: "1px",
                height: `${endY}%`,
                background: "linear-gradient(to bottom, rgba(251,191,36,0.6), transparent)",
                transformOrigin: "top center",
                transform: `translateX(-50%) rotate(${angle}deg)`,
                opacity: rayOpacity,
              }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill className="flex flex-col items-center justify-center text-center px-24">
        <KineticText role="label" delay={10} color="#92400e">The Letters End · Bangalore</KineticText>
        <KineticText role="title" size="text-6xl" delay={18} className="text-white font-bold text-6xl mt-4 mb-4">
          The Chandelier
        </KineticText>

        <KineticText role="body" size="text-xl" delay={30} color="#d97706" className="max-w-2xl mb-8">
          Crystal, not plastic. His office. His city. His time.
        </KineticText>

        {/* Central revelation */}
        <div
          className="max-w-3xl border border-amber-800/40 bg-amber-950/30 p-10 mb-8"
          style={{ transform: `scale(${finaleScale})`, opacity: finaleOpacity }}
        >
          <p className="text-amber-400 text-3xl italic font-light leading-relaxed">
            "I am tomorrow."
          </p>
          <div className="h-px bg-amber-800/30 my-6" />
          <WordReveal
            text="He was born Munna. He was called a White Tiger. He is now the man who sits under his own chandelier and laughs."
            delay={80}
            wordsPerSecond={2.2}
            className="text-amber-200/80 text-xl font-light leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <KineticText role="body" size="text-lg" delay={120} color="#78716c">
            The second revolution is coming. Not of ideologies.
          </KineticText>
          <KineticText role="body" size="text-lg" delay={133} color="#78716c">
            The revolution of servants who refuse to wait in the coop.
          </KineticText>
          <KineticText role="quote" size="text-2xl" delay={148} className="text-amber-500 italic text-2xl mt-4">
            More white tigers are being born every day.
          </KineticText>
        </div>
      </AbsoluteFill>

      {/* Final fade to black */}
      <AbsoluteFill
        className="bg-black pointer-events-none"
        style={{ opacity: endFade }}
      />
    </SceneFrame>
  );
};
