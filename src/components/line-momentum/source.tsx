"use client";

import {
  motion,
  useSpring,
  useMotionValueEvent,
  useScroll,
  MotionValue,
  useMotionValue,
} from "framer-motion";
import * as React from "react";

import "./system.css";

export const LINE_GAP = 20;
export const LINE_WIDTH = 1;
export const LINE_COUNT = 20;
export const LINE_HEIGHT = 80;
export const LINE_HEIGHT_ACTIVE = 80;

export const LINE_STEP = LINE_WIDTH + LINE_GAP;
export const MIN = 0;
export const MAX = LINE_STEP * (LINE_COUNT - 1);

// Controls scroll speed (higher = faster)
// Set to 1 for no smoothing at all
export const SCROLL_SMOOTHING = 1;

// Transformer constants - More controlled effect
export const DEFAULT_INTENSITY = 40; // Reduced from 40
export const DISTANCE_LIMIT = 200;   // Reduced from 300

// Utility functions
export function clamp(val: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(val, min), max);
}

// Linear interpolation function for smooth transitions
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export default function LineMomentum() {
  const scrollX = useScrollX(MAX);
  const { mouseX, onMouseMove, onMouseLeave } = useMouseX();

  return (
    <div className="w-full h-96 flex items-center justify-center">
      <div
        className="flex items-end"
        style={{ gap: LINE_GAP }}
        onPointerMove={onMouseMove}
        onPointerLeave={onMouseLeave}
      >
        {[...Array(LINE_COUNT)].map((_, i) => (
          <Line
            key={i}
            index={i}
            scrollX={scrollX}
            mouseX={mouseX}
            active={isActive(i, LINE_COUNT)}
          />
        ))}
      </div>
    </div>
  );
}

function Line({
  active,
  mouseX,
  scrollX,
  index,
}: {
  active?: boolean;
  hovered?: boolean;
  mouseX: MotionValue<number>;
  scrollX: MotionValue<number>;
  index: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const translateX = useSpring(0, { damping: 50, stiffness: 400 }); // More controlled
  const centerX = index * LINE_STEP + LINE_WIDTH / 2;

  useProximityX(translateX, {
    ref,
    baseValue: 0,
    mouseX,
    scrollX,
    centerX,
  });

  return (
    <motion.div
      ref={ref}
      style={{
        width: LINE_WIDTH,
        height: active ? LINE_HEIGHT_ACTIVE : LINE_HEIGHT,
        backgroundColor: active ? 'var(--color-gray10)' : 'var(--color-gray8)',
        translateX,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    />
  );
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function transformTranslateX(
  distance: number,
  initialValue: number,
  baseValue: number,
  intensity: number
) {
  if (Math.abs(distance) > DISTANCE_LIMIT) {
    return baseValue;
  }
  
  // Calculate proximity factor (0 = far, 1 = close)
  const proximityFactor = (DISTANCE_LIMIT - Math.abs(distance)) / DISTANCE_LIMIT;
  
  // Create a smooth curve for natural movement
  const movementCurve = Math.pow(proximityFactor, 1.2);
  
  // FIXED: Use proportional lean, not full distance direction
  // The lean should be a small fraction of the distance, not binary direction
  const maxLeanRatio = 0.1; // Only lean 10% of the distance toward cursor
  const leanAmount = distance * movementCurve * maxLeanRatio;
  
  // Clamp the lean to prevent extreme movements
  const maxAbsoluteLean = intensity;
  const clampedLean = Math.max(-maxAbsoluteLean, Math.min(maxAbsoluteLean, leanAmount));
  
  return baseValue + clampedLean;
}

export interface ProximityOptions {
  ref: React.RefObject<HTMLElement | null>;
  baseValue: number;
  mouseX: MotionValue<number>;
  scrollX: MotionValue<number>;
  centerX: number;
  intensity?: number;
  reset?: boolean;
  transformer?: (
    distance: number,
    initialValue: number,
    baseValue: number,
    intensity: number
  ) => number;
}

export function useProximityX(
  value: MotionValue<number>,
  {
    ref,
    baseValue,
    mouseX,
    scrollX,
    centerX,
    intensity = DEFAULT_INTENSITY,
    reset = true,
    transformer = transformTranslateX,
  }: ProximityOptions
) {
  const initialValueRef = React.useRef<number>(null);

  React.useEffect(() => {
    if (!initialValueRef.current) {
      initialValueRef.current = value.get();
    }
  }, []);

  useMotionValueEvent(mouseX, "change", (latest) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const container = ref.current.closest('.flex')?.getBoundingClientRect();
    
    // Only respond if mouse is within reasonable bounds
    if (container && (latest < container.left - 50 || latest > container.right + 50)) {
      value.set(baseValue);
      return;
    }
    
    const lineCenterX = rect.left + rect.width / 2;
    const distance = latest - lineCenterX;
    
    // Apply transformation with smoother response
    const targetValue = transformer(distance, initialValueRef.current!, baseValue, intensity);
    value.set(targetValue);
  });

  useMotionValueEvent(scrollX, "change", (latest) => {
    const initialValue = initialValueRef.current!;
    const distance = latest - centerX;
    const targetTranslate = transformer(
      distance,
      initialValue,
      baseValue,
      intensity
    );

    if (reset) {
      const currentVelocity = Math.abs(scrollX.getVelocity());
      const velocityThreshold = 300;
      const velocityFactor = Math.min(1, currentVelocity / velocityThreshold);
      const lerped = lerp(initialValue, targetTranslate, velocityFactor);
      value.set(lerped);
    } else {
      value.set(targetTranslate);
    }
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function useScrollX(max: number = MAX) {
  const scrollX = useSpring(0, {
    stiffness: 500,
    damping: 40,
    // Lower mass for faster response
    mass: 0.8,
  });

  const { scrollY } = useScroll();
  const targetX = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    targetX.current = clamp(latest, [0, max]);
  });

  useRequestAnimationFrame(() => {
    const currentX = scrollX.get();
    const smoothX = lerp(currentX, targetX.current, SCROLL_SMOOTHING);
    // Only update if there's a meaningful difference
    if (Math.abs(smoothX - currentX) > 0.01) {
      scrollX.set(smoothX);
    }
  });

  return scrollX;
}

export function useMouseX() {
  const mouseX = useMotionValue<number>(0);

  function onPointerMove(e: React.PointerEvent) {
    mouseX.set(e.clientX);
  }

  function onPointerLeave() {
    mouseX.set(0);
  }

  return { mouseX, onMouseMove: onPointerMove, onMouseLeave: onPointerLeave };
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function useRequestAnimationFrame(callback: () => void) {
  const requestRef = React.useRef<number | null>(null);

  const animate = () => {
    callback();
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function isActive(index: number, count: number): boolean {
  // First and last ticks are always active
  if (index === 0 || index === count - 1) return true;
  // Calculate the step size between active ticks
  const step = count / (Math.floor(count / LINE_GAP) + 1);
  // Check if this index is close to a multiple of the step
  return Math.abs(index % step) < 0.5 || Math.abs((index % step) - step) < 0.5;
}

/////////////////////////////////////////////////////////////////////////////////////////////

export function Indicator({ x }: { x: MotionValue<number> }) {
  return (
    <motion.div
      className="flex flex-col bg-orange w-[1px] items-center absolute h-[100vh]! -top-8"
      style={{ x }}
    >
      <svg
        width="7"
        height="6"
        viewBox="0 0 7 6"
        fill="none"
        className="-translate-y-3"
      >
        <path
          d="M3.54688 6L0.515786 0.75L6.57796 0.75L3.54688 6Z"
          fill="var(--color-orange)"
        />
      </svg>
    </motion.div>
  );
}