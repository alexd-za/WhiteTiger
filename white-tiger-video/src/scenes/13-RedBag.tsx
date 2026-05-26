import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";
import { WordReveal } from "../components/WordReveal";

export const RedBagScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // The red bag slides in from the left
  const bagIn = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 20, stiffness: 70 } });
  const bagX = interpolate(bagIn, [0, 1], [-200, 0]);
  const bagOpacity = interpolate(frame - 20, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Money amount counts up
  const money = Math.floor(
    interpolate(frame, [55, 110], [0, 700000], { extrapolateRight: "clamp" })
  );

  // Transaction parties appear
  const parties = [
    { name: "The Mongoose", role: "Delivers", delay: 70 },
    { name: "The Minister", role: "Receives", delay: 82 },
    { name: "The Stork", role: "Benefits", delay: 94 },
    { name: "The Great Socialist", role: "Takes the largest cut", delay: 106, accent: true },
  ];

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="tension">
      <AbsoluteFill className="flex items-center px-24 gap-16">
        {/* The red bag — visual focus */}
        <div
          className="flex-shrink-0 flex flex-col items-center"
          style={{ transform: `translateX(${bagX}px)`, opacity: bagOpacity }}
        >
          <div className="w-40 h-48 bg-red-800 border-2 border-red-600 relative flex items-center justify-center">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-5 bg-red-700 border border-red-500 rounded-t" />
            <div className="text-red-300/50 text-xs uppercase tracking-widest font-bold rotate-12">
              RED
            </div>
          </div>
          {/* Rupee count */}
          <div className="mt-4 text-center">
            <p className="text-red-400 text-xs uppercase tracking-wider">Inside</p>
            <p className="text-white font-mono font-bold text-xl mt-1">
              ₹{money.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1">
          <KineticText role="label" delay={10} color="#ef4444">Corruption · Delhi</KineticText>
          <KineticText role="title" size="text-5xl" delay={18} className="text-white font-bold text-5xl mt-2 mb-8">
            The Red Bag
          </KineticText>

          <div className="space-y-3 mb-8">
            {parties.map(({ name, role, delay, accent }) => (
              <div
                key={name}
                className="flex items-center gap-4"
                style={{ opacity: interpolate(frame - delay, [0, 12], [0, 1], { extrapolateRight: "clamp" }) }}
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${accent ? "bg-red-400" : "bg-red-800"}`} />
                <span className={`text-lg ${accent ? "text-red-400 font-semibold" : "text-slate-300"}`}>{name}</span>
                <span className="text-slate-600 text-base">— {role}</span>
              </div>
            ))}
          </div>

          <WordReveal
            text="This is democracy in action. Every license purchased. Every permit negotiated."
            delay={118}
            wordsPerSecond={2.5}
            className="text-red-200/70 text-xl font-light italic"
          />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
