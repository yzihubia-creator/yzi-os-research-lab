import { Composition } from "remotion";

import { GrowthReelMock } from "./compositions/GrowthReelMock";
import { MOCK_GROWTH_VIDEO_DATA } from "./data/mock-growth-video-data";

export const RemotionRoot = () => {
  return (
    <Composition
      id="GrowthReelMock"
      component={GrowthReelMock}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ data: MOCK_GROWTH_VIDEO_DATA }}
    />
  );
};
