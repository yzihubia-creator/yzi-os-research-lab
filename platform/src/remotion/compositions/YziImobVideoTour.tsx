import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import type { VideoTourPlan } from "@/lib/yzi-imob/creative/video-tour/types";

export type YziImobVideoTourProps = {
  plan: VideoTourPlan;
  mediaSources: Readonly<Record<string, string>>;
  renderDurationSeconds?: number;
};

function Scene({
  source,
  motion,
  transition,
  title,
}: {
  source: string;
  motion: VideoTourPlan["scenes"][number]["motionPreset"];
  transition: VideoTourPlan["scenes"][number]["transition"];
  title?: string;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = motion === "slow_zoom_out" ? 1.1 - progress * 0.1 : 1 + progress * 0.1;
  const translateX =
    motion === "pan_left" ? -60 * progress : motion === "pan_right" ? 60 * progress : 0;
  const translateY = motion === "vertical_reveal" ? 80 - 80 * progress : 0;
  const opacity =
    transition === "cut"
      ? 1
      : interpolate(frame, [0, Math.min(10, durationInFrames / 3)], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  return (
    <AbsoluteFill style={{ backgroundColor: "#101820", opacity, overflow: "hidden" }}>
      <Img
        src={source}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,12,18,0.04) 45%, rgba(7,12,18,0.88) 100%)",
        }}
      />
      {title ? (
        <div
          style={{
            position: "absolute",
            left: 76,
            right: 76,
            bottom: 150,
            color: "white",
            fontFamily: "Arial, sans-serif",
            fontSize: 70,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

export function YziImobVideoTour({
  plan,
  mediaSources,
  renderDurationSeconds,
}: YziImobVideoTourProps) {
  const { fps } = useVideoConfig();
  const effectiveDuration = renderDurationSeconds ?? plan.duration;
  const sceneWindow = Math.max(0.5, effectiveDuration - Math.min(2.5, effectiveDuration / 3));
  const sourceDuration = plan.scenes.reduce((total, scene) => total + scene.duration, 0);
  const timedScenes = plan.scenes.map((scene, index) => ({
    scene,
    durationInFrames: Math.max(1, Math.round((scene.duration / sourceDuration) * sceneWindow * fps)),
    from: plan.scenes
      .slice(0, index)
      .reduce(
        (total, prior) =>
          total + Math.max(1, Math.round((prior.duration / sourceDuration) * sceneWindow * fps)),
        0,
      ),
  }));
  return (
    <AbsoluteFill style={{ backgroundColor: "#101820" }}>
      {timedScenes.map(({ scene, durationInFrames, from }) => {
        const source = mediaSources[scene.mediaId];
        if (!source) throw new Error("video_tour_media_source_missing");
        return (
          <Sequence key={scene.position} from={from} durationInFrames={durationInFrames}>
            <Scene
              source={source}
              motion={scene.motionPreset}
              transition={scene.transition}
              title={scene.position === 1 ? plan.title : scene.overlay}
            />
          </Sequence>
        );
      })}
      <Sequence from={Math.max(0, Math.round(sceneWindow * fps))}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            backgroundColor: "#101820",
            color: "white",
            display: "flex",
            fontFamily: "Arial, sans-serif",
            fontSize: 62,
            fontWeight: 700,
            justifyContent: "center",
            padding: 100,
            textAlign: "center",
          }}
        >
          {plan.cta}
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}
