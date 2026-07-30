import { Composition } from "remotion";

import { GrowthReelMock } from "./compositions/GrowthReelMock";
import { YziImobVideoTour, type YziImobVideoTourProps } from "./compositions/YziImobVideoTour";
import { MOCK_GROWTH_VIDEO_DATA } from "./data/mock-growth-video-data";

const VIDEO_TOUR_DEFAULTS: YziImobVideoTourProps = {
  plan: {
    kind: "video_tour_plan",
    propertyId: "00000000-0000-4000-8000-000000000000",
    duration: 15,
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    selectedMediaIds: [],
    scenes: [],
    title: "Imóvel",
    overlays: [],
    cta: "Agende uma visita",
    soundtrackPolicy: "silent",
    factualSources: [{ field: "title", source: "yzi_imob_properties" }],
    diagnostics: [],
  },
  mediaSources: {},
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="GrowthReelMock"
        component={GrowthReelMock}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: MOCK_GROWTH_VIDEO_DATA }}
      />
      <Composition
        id="YziImobVideoTour"
        component={YziImobVideoTour}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={VIDEO_TOUR_DEFAULTS}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.plan.duration * 30,
        })}
      />
    </>
  );
};
