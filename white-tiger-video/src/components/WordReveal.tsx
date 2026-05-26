import { interpolate, spring, useCurrentFrame } from "remotion";

interface WordRevealProps {
  text: string;
  delay?: number;       // frame offset before first word appears
  wordsPerSecond?: number;
  className?: string;
  fps?: number;
}

/**
 * Reveals words one-by-one with a spring animation.
 * Each word translates up from below with an opacity fade.
 */
export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  delay = 0,
  wordsPerSecond = 2.5,
  className = "text-slate-300 text-xl leading-relaxed font-light",
  fps = 30,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const framesPerWord = fps / wordsPerSecond;

  return (
    <p className={className} style={{ display: "flex", flexWrap: "wrap", gap: "0.3em" }}>
      {words.map((word, i) => {
        const wordStart = delay + Math.floor(i * framesPerWord);
        const localFrame = Math.max(0, frame - wordStart);

        const springProgress = spring({
          frame: localFrame,
          fps,
          config: { damping: 200, stiffness: 300, mass: 0.6 },
        });

        const translateY = interpolate(springProgress, [0, 1], [14, 0]);
        const opacity = interpolate(localFrame, [0, 8], [0, 1], {
          extrapolateRight: "clamp",
        });

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${translateY}px)`,
              opacity,
            }}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
};
