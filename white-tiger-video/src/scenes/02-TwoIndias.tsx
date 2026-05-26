import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { KineticText } from "../components/KineticText";
import { SceneFrame } from "../components/SceneFrame";

export const TwoIndiasScene: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Divider line draws from center outward
  const lineScale = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 25, stiffness: 60 } });

  // Panels slide in from sides
  const leftX = interpolate(
    spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 20, stiffness: 70 } }),
    [0, 1], [-80, 0]
  );
  const rightX = interpolate(
    spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 20, stiffness: 70 } }),
    [0, 1], [80, 0]
  );

  return (
    <SceneFrame durationInFrames={durationInFrames} variant="city">
      <AbsoluteFill className="flex">
        {/* Darkness panel — left */}
        <div
          className="flex-1 flex flex-col justify-center px-16 py-20 bg-gradient-to-r from-black to-transparent"
          style={{ transform: `translateX(${leftX}px)` }}
        >
          <KineticText role="label" delay={25} color="#6b7280">The India of</KineticText>
          <KineticText role="title" size="text-6xl" delay={30} color="#ffffff" className="font-black text-6xl mt-2 mb-6">
            Darkness
          </KineticText>
          <div className="space-y-2 mt-4">
            {["Bihar · UP · Gaya", "Rickshaw pullers", "Children in coal shops", "Four landlord families"].map(
              (item, i) => (
                <KineticText key={item} role="body" size="text-lg" delay={40 + i * 8} color="#9ca3af">
                  — {item}
                </KineticText>
              )
            )}
          </div>
        </div>

        {/* Central divider */}
        <div className="relative flex items-center justify-center w-px">
          <div
            className="w-px bg-gradient-to-b from-transparent via-slate-500 to-transparent"
            style={{ height: `${lineScale * 100}%` }}
          />
        </div>

        {/* Light panel — right */}
        <div
          className="flex-1 flex flex-col justify-center px-16 py-20 bg-gradient-to-l from-blue-950/60 to-transparent"
          style={{ transform: `translateX(${rightX}px)` }}
        >
          <KineticText role="label" delay={25} color="#6b7280">The India of</KineticText>
          <KineticText role="title" size="text-6xl" delay={30} color="#bfdbfe" className="font-black text-6xl mt-2 mb-6">
            Light
          </KineticText>
          <div className="space-y-2 mt-4">
            {["Bangalore · Gurgaon · Mumbai", "IT parks and call centers", "Glass towers at midnight", "India's tomorrow"].map(
              (item, i) => (
                <KineticText key={item} role="body" size="text-lg" delay={40 + i * 8} color="#93c5fd">
                  — {item}
                </KineticText>
              )
            )}
          </div>
        </div>
      </AbsoluteFill>

      {/* Bottom quote */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center">
        <KineticText role="quote" size="text-2xl" delay={80} className="text-amber-400 italic text-2xl font-light text-center max-w-2xl">
          "I am tomorrow."
        </KineticText>
      </div>
    </SceneFrame>
  );
};
