import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const DhanbadDriverScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Road line animation — lines moving toward viewer
  const roadOffset = (frame * 4) % 120;

  // Mr. Ashok and Pinky Madam cards slide in
  const cardAIn = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 20, stiffness: 80 } });
  const cardBIn = spring({ frame: Math.max(0, frame - 55), fps, config: { damping: 20, stiffness: 80 } });

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="industrial">
      {/* Animated road dashes */}
      <AbsoluteFill className="overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 flex flex-col gap-12"
          style={{ transform: `translateY(${-roadOffset}px) translateX(-50%)`, bottom: "-120px", height: "200%" }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-0.5 h-16 bg-zinc-400 mx-auto" />
          ))}
        </div>
      </AbsoluteFill>

      <AbsoluteFill className="flex items-center justify-center px-24">
        <div className="w-full max-w-4xl">
          <KineticText role="label" delay={8} color="#71717a">The Stork's Household</KineticText>
          <KineticText role="title" size="text-5xl" delay={15} className="text-white font-bold text-5xl mt-2 mb-8">
            Driver Number One
          </KineticText>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div
              className="border border-slate-700/50 bg-slate-900/50 p-6"
              style={{ opacity: interpolate(cardAIn, [0, 1], [0, 1]), transform: `translateX(${interpolate(cardAIn, [0, 1], [-30, 0])}px)` }}
            >
              <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">The Master</p>
              <p className="text-white font-semibold text-2xl">Mr. Ashok</p>
              <p className="text-slate-400 text-base mt-1">American-educated. Conflicted. Kind.</p>
            </div>
            <div
              className="border border-slate-700/50 bg-slate-900/50 p-6"
              style={{ opacity: interpolate(cardBIn, [0, 1], [0, 1]), transform: `translateX(${interpolate(cardBIn, [0, 1], [30, 0])}px)` }}
            >
              <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">The Madam</p>
              <p className="text-white font-semibold text-2xl">Pinky Madam</p>
              <p className="text-slate-400 text-base mt-1">Beautiful. Impatient. American.</p>
            </div>
          </div>

          <WordReveal
            text="The perfect servant sees everything and says nothing. He files everything away."
            delay={75}
            wordsPerSecond={2.5}
            className="text-slate-300 text-xl font-light leading-loose"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
