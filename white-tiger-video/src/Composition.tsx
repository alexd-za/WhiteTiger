import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { useSyncedTiming } from "./hooks/useSyncedTiming";
import script from "./data/script.json";

import { PrologueScene } from "./scenes/01-Prologue";
import { TwoIndiasScene } from "./scenes/02-TwoIndias";
import { LaxmangarhScene } from "./scenes/03-Laxmangarh";
import { WhiteTigerScene } from "./scenes/04-WhiteTiger";
import { TeaShopToDriverScene } from "./scenes/05-TeaShopToDriver";
import { DhanbadDriverScene } from "./scenes/06-DhanbadDriver";
import { StorksHouseholdScene } from "./scenes/07-StorksHousehold";
import { DelhiArrivalScene } from "./scenes/08-DelhiArrival";
import { MasterServantScene } from "./scenes/09-MasterServant";
import { RoosterCoopScene } from "./scenes/10-RoosterCoop";
import { HitAndRunScene } from "./scenes/11-HitAndRun";
import { ConfessionBetrayalScene } from "./scenes/12-ConfessionBetrayal";
import { RedBagScene } from "./scenes/13-RedBag";
import { BreakingPointScene } from "./scenes/14-BreakingPoint";
import { TheMurderScene } from "./scenes/15-TheMurder";
import { EscapeScene } from "./scenes/16-Escape";
import { BuildingEmpireScene } from "./scenes/17-BuildingEmpire";
import { ConclusionScene } from "./scenes/18-Conclusion";

// ---------------------------------------------------------------------------
// Scene registry — maps script IDs to React components
// ---------------------------------------------------------------------------

type SceneComponent = React.FC<{ durationInFrames: number }>;

const SCENE_MAP: Record<string, SceneComponent> = {
  "01-prologue": PrologueScene,
  "02-two-indias": TwoIndiasScene,
  "03-laxmangarh": LaxmangarhScene,
  "04-white-tiger": WhiteTigerScene,
  "05-tea-shop-to-driver": TeaShopToDriverScene,
  "06-dhanbad-driver": DhanbadDriverScene,
  "07-storks-household": StorksHouseholdScene,
  "08-delhi-arrival": DelhiArrivalScene,
  "09-master-servant": MasterServantScene,
  "10-rooster-coop": RoosterCoopScene,
  "11-hit-and-run": HitAndRunScene,
  "12-confession-betrayal": ConfessionBetrayalScene,
  "13-red-bag": RedBagScene,
  "14-breaking-point": BreakingPointScene,
  "15-the-murder": TheMurderScene,
  "16-escape": EscapeScene,
  "17-building-empire": BuildingEmpireScene,
  "18-conclusion": ConclusionScene,
};

// ---------------------------------------------------------------------------
// Per-scene wrapper — isolated so each can call useSyncedTiming independently
// ---------------------------------------------------------------------------

const SceneWrapper: React.FC<{ sceneId: string }> = ({ sceneId }) => {
  const timing = useSyncedTiming(sceneId);
  const Component = SCENE_MAP[sceneId];
  if (!Component || timing.durationFrames === 0) return null;

  return (
    <Sequence from={timing.startFrame} durationInFrames={timing.durationFrames}>
      <Component durationInFrames={timing.durationFrames} />
    </Sequence>
  );
};

// ---------------------------------------------------------------------------
// Root composition — 54,000 frames · 30fps · 1920×1080
// ---------------------------------------------------------------------------

export const WhiteTigerSummary: React.FC = () => {
  return (
    <AbsoluteFill className="bg-black">
      {/* Audio: enable locally with `npm run dev` after running `npm run generate-audio` */}
      {false && <Audio src={staticFile("voiceover.mp3")} />}

      {script.map((scene) => (
        <SceneWrapper key={scene.id} sceneId={scene.id} />
      ))}
    </AbsoluteFill>
  );
};
