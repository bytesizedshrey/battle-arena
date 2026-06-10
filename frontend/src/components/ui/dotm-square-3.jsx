"use client";



import { DotMatrixBase } from "@/components/ui/dotmatrix-core";
import { useDotMatrixPhases } from "@/components/ui/dotmatrix-hooks";
import { spiralInwardNormFromIndex, spiralInwardOrderValue } from "@/components/ui/dotmatrix-core";
import { usePrefersReducedMotion } from "@/components/ui/dotmatrix-hooks";




const animationResolver = ({ isActive, index, reducedMotion, phase }) => {
  if (!isActive) {
    return { className: "dmx-inactive" };
  }

  const order = spiralInwardOrderValue(index);
  const pathNorm = spiralInwardNormFromIndex(index);
  const style = { "--dmx-spiral-order": order } ;

  if (reducedMotion || phase === "idle") {
    return {
      style: {
        ...style,
        opacity: 0.16 + pathNorm * 0.78
      }
    };
  }

  return { className: "dmx-spiral-snake", style };
};

export function DotmSquare3({
  speed = 1.35,
  pattern = "full",
  animated = true,
  hoverAnimated = false,
  ...rest
}) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase: matrixPhase, onMouseEnter, onMouseLeave } = useDotMatrixPhases({
    animated: Boolean(animated && !reducedMotion),
    hoverAnimated: Boolean(hoverAnimated && !reducedMotion),
    speed
  });

  return (
    <DotMatrixBase
      {...rest}
      size={rest.size ?? 36}
      dotSize={rest.dotSize ?? 5}
      speed={speed}
      pattern={pattern}
      animated={animated}
      phase={matrixPhase}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      reducedMotion={reducedMotion}
      animationResolver={animationResolver}
    />
  );
}
