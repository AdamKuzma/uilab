"use client";

import { motion, useSpring, useMotionValueEvent, MotionValue, useMotionValue } from "framer-motion";
import * as React from "react";
import "./system.css";

// Configuration constants

export const LINE_GAP = 9;
export const LINE_WIDTH = 1;
export const LINE_COUNT = 40;
export const LINE_HEIGHT = 50;
export const LINE_HEIGHT_ACTIVE = 65;

// Transformer constants
export const DEFAULT_INTENSITY = 4;
export const DISTANCE_LIMIT = 48;


export default function LineMinimap() {
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
  index,
}: {
  active?: boolean;
  mouseX: MotionValue<number>;
  index: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const scaleY = useSpring(1, { damping: 45, stiffness: 600 });

  useProximity(scaleY, {
    ref,
    baseValue: 1,
    mouseX,
  });

  return (
    <motion.div
      ref={ref}
      style={{
        width: LINE_WIDTH,
        height: active ? LINE_HEIGHT_ACTIVE : LINE_HEIGHT,
        backgroundColor: active ? 'var(--color-gray11)' : 'var(--color-gray8)',
        scaleY,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    />
  );
}

// Core functions

export function transformScale(
  distance: number,
  initialValue: number,
  baseValue: number,
  intensity: number
) {
  if (Math.abs(distance) > DISTANCE_LIMIT) {
    return initialValue;
  }
  const normalizedDistance = initialValue - Math.abs(distance) / DISTANCE_LIMIT;
  const scaleFactor = normalizedDistance * normalizedDistance;
  return baseValue + intensity * scaleFactor;
}

export interface ProximityOptions {
  ref: React.RefObject<HTMLElement | null>;
  baseValue: number;
  mouseX: MotionValue<number>;
  intensity?: number;
  transformer?: (
    distance: number,
    initialValue: number,
    baseValue: number,
    intensity: number
  ) => number;
}

export function useProximity(
  value: MotionValue<number>,
  {
    ref,
    baseValue,
    mouseX,
    intensity = DEFAULT_INTENSITY,
    transformer = transformScale,
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
    const centerX = rect.left + rect.width / 2;
    const distance = latest - centerX;
    
    value.set(
      transformer(distance, initialValueRef.current!, baseValue, intensity)
    );
  });
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

export function isActive(index: number, count: number): boolean {
  // First and last ticks are always active
  if (index === 0 || index === count - 1) return true;
  // Calculate the step size between active ticks
  const step = count / (Math.floor(count / LINE_GAP) + 1);
  // Check if this index is close to a multiple of the step
  return Math.abs(index % step) < 0.5 || Math.abs((index % step) - step) < 0.5;
}