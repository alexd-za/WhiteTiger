import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const EscapeScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Train windows — horizontal streaks moving left
  const streakOffset = -(frame * 8);

  // Zigzag route dots
  const routePoints = [
    { city: "Delhi", x: 12, y: 35, delay: 15 },
    { city: "Hyderabad", x: 35, y: 65, delay: 28 },
    { city: "Kolkata", x: 62, y: 28, delay: 41 },
    { city: "Mumbai", x: 25, y: 72, delay: 54 },
    { city: "Bangalore", x: 45, y: 80, delay: 70, final: true },
  ];

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="default">
      {/* Train window streaks */}
      <AbsoluteFill className="overflow-hidden opacity-15 pointer-events-none">
        {[20, 38, 55, 70, 82].map((top, i) => (
          <div
            key={i}
            className="absolute h-px"
            style={{
              top: `${top}%`,
              left: `${streakOffset % 160}px`,
              width: `${60 + i * 20}px`,
              background: `linear-gradient(to right, transparent, rgba(148,163,184,${0.4 + i * 0.1}), transparent)`,
            }}
          />
        ))}
      </AbsoluteFill>

      <AbsoluteFill className="flex items-center px-24 gap-16">
        <div className="flex-1">
          <KineticText role="label" delay={8} color="#64748b">India · Various Trains</KineticText>
          <KineticText role="title" size="text-5xl" delay={15} className="text-white font-bold text-5xl mt-2 mb-6">
            Flight
          </KineticText>
          <WordReveal
            text="Not direct routes. Zigzag patterns. Cash. False names at lodging houses."
            delay={28}
            wordsPerSecond={2.3}
            className="text-slate-300 text-xl font-light leading-loose"
          />
          <div className="mt-8">
            <KineticText role="body" size="text-lg" delay={65} color="#94a3b8">
              He goes back for the boy. He cannot leave Dharam.
            </KineticText>
            <KineticText role="quote" size="text-xl" delay={80} className="text-amber-400 italic text-xl mt-4">
              "Only a man prepared to see his family destroyed can break out of the coop."
            </KineticText>
          </div>
        </div>

        {/* Zigzag route map */}
        <div className="w-80 relative h-72 border border-slate-800/50">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 288">
            {routePoints.slice(0, -1).map((point, i) => {
              const next = routePoints[i + 1];
              const lineOpacity = interpolate(frame - (point.delay + 8), [0, 15], [0, 0.3], { extrapolateRight: "clamp" });
              return (
                <line
                  key={i}
                  x1={point.x * 3.2}
                  y1={point.y * 2.88}
                  x2={next.x * 3.2}
                  y2={next.y * 2.88}
                  stroke="#64748b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity={lineOpacity}
                />
              );
            })}
          </svg>
          {routePoints.map(({ city, x, y, delay, final }) => {
            const dotOpacity = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div
                key={city}
                className="absolute flex flex-col items-center"
                style={{ left: `${x}%`, top: `${y}%`, opacity: dotOpacity }}
              >
                <div className={`w-2 h-2 rounded-full ${final ? "bg-amber-400" : "bg-slate-500"}`} />
                <span className={`text-xs mt-1 ${final ? "text-amber-400 font-semibold" : "text-slate-500"}`}>{city}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
