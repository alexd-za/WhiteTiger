import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const PrologueScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Typewriter cursor blink (every 18 frames)
  const cursorOpacity = Math.floor(frame / 18) % 2 === 0 ? 1 : 0;

  // "Letter" frame slides in from top
  const letterY = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 60 } }),
    [0, 1],
    [-60, 0]
  );

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="default">
      {/* Giant ghost letter behind content */}
      <AbsoluteFill className="flex items-center justify-center overflow-hidden">
        <span
          className="text-white/[0.03] font-black select-none leading-none"
          style={{ fontSize: "40rem" }}
        >
          B
        </span>
      </AbsoluteFill>

      {/* Letter paper card */}
      <AbsoluteFill
        className="flex items-center justify-center px-24"
        style={{ transform: `translateY(${letterY}px)` }}
      >
        <div className="border border-slate-800 bg-slate-950/80 backdrop-blur-sm p-14 max-w-3xl w-full">
          {/* To: line */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-slate-700" />
            <KineticText role="label" delay={10}>Letter · Night One</KineticText>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          <KineticText role="title" size="text-4xl" delay={20} className="text-white font-bold text-4xl mb-6">
            To His Excellency<br />
            <span className="text-amber-400">Wen Jiabao</span>
          </KineticText>

          <div className="mt-6">
            <WordReveal
              text="My name is Balram Halwai, and I am going to tell you the truth about India — the real India, the one they never show at the trade delegations."
              delay={35}
              wordsPerSecond={2.2}
              className="text-slate-300 text-xl leading-loose font-light"
            />
          </div>

          {/* Typewriter cursor */}
          <span
            className="inline-block w-0.5 h-5 bg-amber-400 ml-1 align-middle"
            style={{ opacity: cursorOpacity }}
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
