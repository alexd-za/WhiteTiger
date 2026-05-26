import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const MasterServantScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // The two columns slowly converge then hold
  const leftOffset = interpolate(
    spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 22, stiffness: 60 } }),
    [0, 1], [-60, 0]
  );
  const rightOffset = interpolate(
    spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 22, stiffness: 60 } }),
    [0, 1], [60, 0]
  );

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="default">
      {/* Faint dividing line */}
      <AbsoluteFill className="flex items-center justify-center pointer-events-none">
        <div
          className="w-px bg-slate-800"
          style={{ height: "60%", opacity: interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" }) }}
        />
      </AbsoluteFill>

      <AbsoluteFill className="flex items-center px-24 gap-0">
        {/* Master side */}
        <div className="flex-1 pr-12" style={{ transform: `translateX(${leftOffset}px)` }}>
          <KineticText role="label" delay={15} color="#64748b">The Master</KineticText>
          <KineticText role="title" size="text-4xl" delay={22} className="text-white font-bold text-4xl mt-2 mb-5">
            Mr. Ashok
          </KineticText>
          <div className="space-y-3">
            {[
              ["Has", "the red bag"],
              ["Calls Balram", "by name"],
              ["Feels", "guilty, briefly"],
              ["Pays extra", "to settle it"],
            ].map(([verb, obj], i) => (
              <KineticText key={verb} role="body" size="text-lg" delay={35 + i * 10} color="#94a3b8">
                <span className="text-slate-400">{verb} </span>
                <span className="text-white">{obj}</span>
              </KineticText>
            ))}
          </div>
        </div>

        {/* Servant side */}
        <div className="flex-1 pl-12" style={{ transform: `translateX(${rightOffset}px)` }}>
          <KineticText role="label" delay={15} color="#64748b">The Servant</KineticText>
          <KineticText role="title" size="text-4xl" delay={22} className="text-amber-400 font-bold text-4xl mt-2 mb-5">
            Balram
          </KineticText>
          <div className="space-y-3">
            {[
              ["Carries", "the red bag"],
              ["Is called", "by name, once"],
              ["Signs", "the confession"],
              ["Receives", "the extra money"],
            ].map(([verb, obj], i) => (
              <KineticText key={verb} role="body" size="text-lg" delay={35 + i * 10} color="#94a3b8">
                <span className="text-slate-400">{verb} </span>
                <span className="text-amber-300">{obj}</span>
              </KineticText>
            ))}
          </div>
        </div>
      </AbsoluteFill>

      <div className="absolute bottom-20 left-0 right-0 flex justify-center px-24">
        <WordReveal
          text="Never before in human history have so few owed so much to so many."
          delay={90}
          wordsPerSecond={2.5}
          className="text-amber-400/70 text-xl italic font-light text-center"
        />
      </div>
    </SceneFrame>
  );
};
