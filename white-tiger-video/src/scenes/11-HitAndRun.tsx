import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const HitAndRunScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Rain streaks
  const rainCount = 30;

  // Red pulse on impact moment (around frame 45)
  const impactFlash = interpolate(frame, [43, 45, 52], [0, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Document signature slides in
  const docIn = spring({ frame: Math.max(0, frame - 65), fps, config: { damping: 22, stiffness: 70 } });
  const docY = interpolate(docIn, [0, 1], [40, 0]);
  const docOpacity = interpolate(frame - 65, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="tension">
      {/* Red impact flash */}
      <AbsoluteFill style={{ background: `rgba(220,38,38,${impactFlash})` }} className="pointer-events-none" />

      {/* Rain streaks */}
      <AbsoluteFill className="overflow-hidden opacity-25 pointer-events-none">
        {Array.from({ length: rainCount }).map((_, i) => {
          const x = ((i / rainCount) * 110 - 5 + (frame * 0.3 * (i % 3 === 0 ? 1 : 0.5)) % 5) % 105;
          const yOffset = (frame * (1.5 + (i % 4) * 0.4) + i * 37) % 130;
          return (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-slate-400 to-transparent"
              style={{
                left: `${x}%`,
                top: `${yOffset - 15}%`,
                height: "20%",
                transform: "rotate(8deg)",
              }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill className="flex items-center px-24 gap-14">
        <div className="flex-1">
          <KineticText role="label" delay={10} color="#ef4444">Delhi · Late Night</KineticText>
          <KineticText role="title" size="text-5xl" delay={18} className="text-white font-bold text-5xl mt-2 mb-6">
            The Hit and Run
          </KineticText>
          <WordReveal
            text="Pinky Madam is drunk. She wants to drive. A shape in the road. A sound. They keep moving."
            delay={32}
            wordsPerSecond={2.2}
            className="text-red-200/80 text-xl font-light leading-loose"
          />
          <KineticText role="body" size="text-lg" delay={70} color="#f87171" className="mt-4">
            What follows is not grief. It is management.
          </KineticText>
        </div>

        {/* The confession document */}
        <div
          className="w-80 border border-red-900/60 bg-red-950/30 p-7"
          style={{ transform: `translateY(${docY}px)`, opacity: docOpacity }}
        >
          <p className="text-red-400/60 text-xs uppercase tracking-wider mb-4">False Confession</p>
          <p className="text-slate-300 text-base font-light leading-relaxed mb-6">
            I, <span className="text-white font-semibold">Balram Halwai</span>, was driving the vehicle on the night of…
          </p>
          <div className="border-t border-red-900/50 pt-4">
            <p className="text-amber-400 italic text-sm">Signed, in his own hand.</p>
            <p className="text-slate-500 text-xs mt-1">Family in Laxmangarh: the guarantee.</p>
          </div>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
