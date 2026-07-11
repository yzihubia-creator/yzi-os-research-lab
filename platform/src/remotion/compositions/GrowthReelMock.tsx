import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import { MOCK_GROWTH_VIDEO_DATA, type MockGrowthVideoData } from "../data/mock-growth-video-data";

const DARK_BG = "#0b0d12";
const ICE = "#bcd8ff";
const LILAC = "#c9b6ff";
const TEXT_SECONDARY = "rgba(230, 236, 246, 0.72)";

function FadeIn({ children, delayInFrames = 0 }: { children: React.ReactNode; delayInFrames?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delayInFrames, [0, fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return <div style={{ opacity }}>{children}</div>;
}

export function GrowthReelMock({ data }: { data: MockGrowthVideoData }) {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        justifyContent: "flex-end",
        padding: 56,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Sequence from={0} layout="none">
        <FadeIn>
          <span
            style={{
              fontSize: 22,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: LILAC,
            }}
          >
            {data.channel} · Dados mockados
          </span>
        </FadeIn>
      </Sequence>

      <Sequence from={0.5 * fps} layout="none">
        <FadeIn delayInFrames={0.5 * fps}>
          <h1
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              color: "#f4f7fb",
              margin: "16px 0 8px",
            }}
          >
            {data.headline}
          </h1>
        </FadeIn>
      </Sequence>

      <Sequence from={1 * fps} layout="none">
        <FadeIn delayInFrames={1 * fps}>
          <p style={{ fontSize: 26, color: TEXT_SECONDARY, maxWidth: 720 }}>{data.supportingText}</p>
        </FadeIn>
      </Sequence>

      <Sequence from={1.5 * fps} layout="none">
        <FadeIn delayInFrames={1.5 * fps}>
          <div style={{ marginTop: 24, fontSize: 20, color: ICE }}>
            {data.propertyName} · {data.credits} créditos
          </div>
        </FadeIn>
      </Sequence>
    </AbsoluteFill>
  );
}

export function GrowthReelMockDefault() {
  return <GrowthReelMock data={MOCK_GROWTH_VIDEO_DATA} />;
}
