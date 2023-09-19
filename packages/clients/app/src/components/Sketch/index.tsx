import React from "react";
import {
  // P5WrapperClassName,
  ReactP5Wrapper,
  Sketch as SketchData,
} from "@p5-wrapper/react";
// import { css } from "@emotion/react";

import { flowSketch, noiseSketch, shapesSketch } from "./scripts";

export interface SketchProps {
  background?: string;
  sketches?: SketchData[];
  colors?: string[];
}

export const Sketch: React.FC<SketchProps> = ({
  sketches = [shapesSketch, noiseSketch, flowSketch],
  background,
  colors,
}) => {
  return (
    <div
      className={`w-full h-full carousel ${
        background ? `bg-[${background}]` : ""
      }`}
    >
      {sketches?.map((sketch) => (
        <div className="carousel-item w-full" key={sketch.name}>
          <ReactP5Wrapper sketch={sketch} colors={colors} />
        </div>
      ))}
    </div>
  );
};
