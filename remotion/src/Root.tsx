import React from "react";
import { Composition } from "remotion";
import { TourVideo, TOUR_TOTAL } from "./TourVideo";
import { LearnVideo, LEARN_TOTAL } from "./LearnVideo";
import { VectorVideo, VECTOR_TOTAL } from "./VectorVideo";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="tour"
      component={TourVideo}
      durationInFrames={TOUR_TOTAL}
      fps={30}
      width={1600}
      height={900}
    />
    <Composition
      id="learn"
      component={LearnVideo}
      durationInFrames={LEARN_TOTAL}
      fps={30}
      width={1600}
      height={900}
    />
    <Composition
      id="vector"
      component={VectorVideo}
      durationInFrames={VECTOR_TOTAL}
      fps={30}
      width={1600}
      height={900}
    />
  </>
);
