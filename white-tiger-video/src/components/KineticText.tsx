import { interpolate, spring, useCurrentFrame } from "remotion";

type TextRole = "label" | "title" | "quote" | "body" | "number";

const STYLES: Record<TextRole, string> = {
  label:  "text-slate-400 text-sm tracking-[0.25em] uppercase font-light",
  title:  "text-white font-bold leading-tight",
  quote:  "text-amber-400 italic leading-relaxed font-light",
  body:   "text-slate-300 leading-relaxed font-light",
  number: "text-white/5 font-black leading-none select-none",
};

const SIZES: Record<TextRole, string> = {
  label:  "text-sm",
  title:  "text-5xl",
  quote:  "text-3xl",
  body:   "text-xl",
  number: "text-[20rem]",
};

interface KineticTextProps {
  children: React.ReactNode;
  role?: TextRole;
  size?: string;
  delay?: number;    // frames before animation starts
  className?: string;
  color?: string;
}

export const KineticText: React.FC<KineticTextProps> = ({
  children,
  role = "body",
  size,
  delay = 0,
  className = "",
  color,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const localFrame = Math.max(0, frame - delay);

  const translateY = interpolate(
    spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 80, mass: 1 } }),
    [0, 1],
    [40, 0]
  );

  const opacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      className={`${STYLES[role]} ${size ?? SIZES[role]} ${className}`}
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        color,
      }}
    >
      {children}
    </div>
  );
};
