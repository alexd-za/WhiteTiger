import "./index.css";
import { Composition } from "remotion";
import { WhiteTigerSummary } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WhiteTigerSummary"
        component={WhiteTigerSummary}
        durationInFrames={54000}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
