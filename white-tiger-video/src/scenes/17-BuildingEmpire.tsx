import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const BuildingEmpireScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Bar chart growing upward
  const bars = [
    { label: "Year 1", height: 0.2, delay: 35, color: "#d97706" },
    { label: "Year 2", height: 0.45, delay: 50, color: "#f59e0b" },
    { label: "Year 3", height: 0.72, delay: 65, color: "#fbbf24" },
    { label: "Now", height: 1.0, delay: 80, color: "#fcd34d" },
  ];

  // Company name stamp
  const stampIn = spring({ frame: Math.max(0, frame - 90), fps, config: { damping: 10, stiffness: 60 } });
  const stampScale = interpolate(stampIn, [0, 1], [0.5, 1]);
  const stampOpacity = interpolate(frame - 90, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Ambient call center glow
  const glowPulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 0.6);

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="gold">
      {/* Ambient glow */}
      <AbsoluteFill
        className="pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 70% 50%, rgba(251,191,36,${0.03 + glowPulse * 0.03}) 0%, transparent 70%)`,
        }}
      />

      <AbsoluteFill className="flex items-center px-24 gap-16">
        {/* Left content */}
        <div className="flex-1">
          <KineticText role="label" delay={8} color="#d97706">Bangalore · The New India</KineticText>
          <KineticText role="title" size="text-5xl" delay={15} className="text-white font-bold text-5xl mt-2 mb-3">
            White Tiger Drivers
          </KineticText>
          <KineticText role="body" size="text-xl" delay={25} color="#d97706" className="mb-8 font-semibold">
            "Ashok Sharma" — Founder & Director
          </KineticText>

          <div className="space-y-3 mb-8">
            {[
              { fact: "3 cars → 10 → 30", delay: 40 },
              { fact: "Midnight call center contracts", delay: 52 },
              { fact: "First bribe: the police inspector", delay: 64 },
              { fact: "Name: taken from the dead master", delay: 76 },
            ].map(({ fact, delay }) => (
              <KineticText key={fact} role="body" size="text-lg" delay={delay} color="#92400e">
                — {fact}
              </KineticText>
            ))}
          </div>

          <WordReveal
            text="He is not naive. He has become a master. The difference: he knows what a servant feels."
            delay={92}
            wordsPerSecond={2.5}
            className="text-amber-200/70 text-xl font-light italic"
          />
        </div>

        {/* Bar chart + company stamp */}
        <div className="w-72 flex flex-col items-center gap-6">
          {/* Growth bars */}
          <div className="flex items-end gap-4 h-44 w-full justify-center">
            {bars.map(({ label, height, delay, color }) => {
              const barH = interpolate(
                spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 25, stiffness: 80 } }),
                [0, 1], [0, height * 176]
              );
              return (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div
                    className="w-12 rounded-t-sm"
                    style={{ height: barH, backgroundColor: color, minHeight: 2 }}
                  />
                  <span className="text-amber-700 text-xs">{label}</span>
                </div>
              );
            })}
          </div>

          {/* Company stamp */}
          <div
            className="border-2 border-amber-600 px-6 py-4 text-center"
            style={{ transform: `scale(${stampScale})`, opacity: stampOpacity }}
          >
            <p className="text-amber-400 font-bold tracking-widest text-lg uppercase">White Tiger</p>
            <p className="text-amber-600/80 text-xs tracking-[0.2em] uppercase">Drivers · Bangalore</p>
          </div>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
