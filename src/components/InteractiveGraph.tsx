import { useSpring, useMotionTemplate, motion, useMotionValueEvent, MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { useSpring as useReactSpring, animated } from "@react-spring/web";

const SPRING = {
    damping: 20,
    stiffness: 200,
}

const SLOW_SPRING = {
    damping: 40
}

export default function Graph() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"1D" | "1M" | "1Y" | "5Y">("1M");
  const [cursorValue, setCursorValue] = useState<number | null>(null);
  const clipPathValue = useSpring(0, isHovering ? SPRING : SLOW_SPRING);
  const clipPathTemplate = useMotionTemplate`inset(0px ${clipPathValue}% 0px 0px)`;
  const cursorX = useSpring(0, SPRING);
  const labelX = useSpring(0, SPRING);
  const pathRef = useRef<SVGPathElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timePeriods = ["1D", "1M", "1Y", "5Y"] as const;

  // Clamp helper
  const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
  // Adjustable horizontal padding for the label so it doesn't go past edges
  const LABEL_MARGIN = 30; // px

  // Different path data for each time period - all with same structure
  const pathData = {
    "1D": "M1 140 s 40 -10 80 -30 s 40 10 80 45 s 40 -10 80 -45 s 40 40 80 -25 s 40 50 80 -15 s 40 -50 80 -15 s 40 -10 80 -15 s 43 -30 83 -45",
    "1M": "M1 120 s 40 10 80 -25 s 40 -10 80 5 s 40 -50 80 -30 s 40 20 80 10 s 40 -30 80 -15 s 40 50 80 20 s 40 -60 80 -40 s 43 -10 83 -5",
    "1Y": "M1 150 s 40 -20 80 -20 s 40 20 80 -25 s 40 -15 80 -15 s 40 15 80 -10 s 40 -20 80 -20 s 40 15 80 -15 s 40 -10 80 -10 s 43 10 83 -5",
    "5Y": "M1 120 s 40 -20 80 -10 s 40 10 80 -15 s 40 -5 80 -10 s 40 15 80 -5 s 40 -10 80 -15 s 40 5 80 -10 s 40 -5 80 -10 s 43 5 83 -5"
  };

  const fillData = {
    "1D": "M1 140 s 40 -10 80 -30 s 40 10 80 45 s 40 -10 80 -45 s 40 40 80 -25 s 40 50 80 -15 s 40 -50 80 -15 s 40 -10 80 -15 s 43 -30 83 -45 V188 H1 Z",
    "1M": "M1 120 s 40 10 80 -25 s 40 -10 80 5 s 40 -50 80 -30 s 40 20 80 10 s 40 -30 80 -15 s 40 50 80 20 s 40 -60 80 -40 s 43 -10 83 -5 V188 H1 Z",
    "1Y": "M1 150 s 40 -20 80 -20 s 40 20 80 -25 s 40 -15 80 -15 s 40 15 80 -10 s 40 -20 80 -20 s 40 15 80 -15 s 40 -10 80 -10 s 43 10 83 -5 V188 H1 Z",
    "5Y": "M1 120 s 40 -20 80 -10 s 40 10 80 -15 s 40 -5 80 -10 s 40 15 80 -5 s 40 -10 80 -15 s 40 5 80 -10 s 40 -5 80 -10 s 43 5 83 -5 V188 H1 Z"
  };

  // React-spring animations for smooth path morphing
  const pathSpring = useReactSpring({
    d: pathData[selectedPeriod],
    config: { tension: 200, friction: 30, clamp: true }
  });

  const fillSpring = useReactSpring({
    d: fillData[selectedPeriod],
    config: { tension: 200, friction: 30, clamp: true }
  });

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const distanceFromRight = Math.max(rect.right - e.clientX, 0);
    const percentageFromRight = Math.min(
      (distanceFromRight / rect.width) * 100,
      100,
    );
    clipPathValue.set(percentageFromRight);
    // Update cursor line x-position (pixels from left within container)
    const xWithin = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    cursorX.set(xWithin);

    // Clamp label x within container bounds with margin so the label doesn't overflow
    const clampedX = clamp(xWithin, LABEL_MARGIN, rect.width - LABEL_MARGIN);
    labelX.set(clampedX);

    // We still compute the value text in ValueAtCursor, but the label's Y is fixed
  }

  return (
    <div className="graph-container border-1 border-[var(--border)] bg-[var(--card)] px-6 pt-6 pb-0 mx-34 rounded-xl shadow-[0_2px_5px_-2px_rgba(0,0,0,0.0.08)]">
        <div className="flex items-start justify-between mb-[12px]">
        <div>
          <p className="text-sm text-[var(--muted-foreground)] mb-[2px]">Total Return</p>
            <p className="text-lg font-medium">{cursorValue != null ? `$${cursorValue.toLocaleString()}` : "$0"}</p>
        </div>
        <div className="p-1 rounded-md hover:bg-[var(--muted-background)] transition-colors">
          <svg
            className="w-5 h-5 text-[var(--muted-foreground)]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <div 
          ref={containerRef}
          className="relative h-[200px]" 
          onPointerMove={onPointerMove} 
          onPointerLeave={() => {
              setIsHovering(false);
              timeoutRef.current = setTimeout(() => {
                  clipPathValue.set(0)
              }, 1000);
          }}
          onPointerEnter={() => {
              setIsHovering(true);
              if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
              }
          }}
      >
        {/* Background SVG - always visible */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 644 188"
          className="absolute inset-0 w-full h-full"
        >
          <animated.path
            d={pathSpring.d}
            stroke="var(--muted-background)"
            strokeWidth="2"
          />
          <animated.path
            d={fillSpring.d}
            fill="url(#paint0_linear_gray)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_gray"
              x1="322.5"
              x2="322.5"
              y1="1"
              y2="188"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--muted-background)" stopOpacity="0.4"></stop>
              <stop offset="1" stopColor="var(--muted-background)" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
        </svg>
        
        {/* Interactive SVG - with clip-path */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 644 188"
          style={{
            clipPath: clipPathTemplate,
          }}
          className="absolute inset-0 w-full h-full"
        >
          <animated.path
            ref={pathRef}
            d={pathSpring.d}
            stroke="#7110C5"
            strokeWidth="2"
          />
          <animated.path
            d={fillSpring.d}
            fill="url(#paint0_linear_540_31)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_540_31"
              x1="322.5"
              x2="322.5"
              y1="1"
              y2="188"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#7110C5" stopOpacity="0.4"></stop>
              <stop offset="1" stopColor="#7110C5" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Vertical cursor line */}
        {(
          <motion.div
            className="absolute top-[30px] bottom-[10px] w-px bg-[var(--muted-foreground)]/60 pointer-events-none will-change-transform"
            style={{ left: 0, x: cursorX, opacity: isHovering ? 1 : 0 }}
          />
        )}

        {/* Date label above the cursor line (clamped to container bounds) */}
        {(
          <motion.div
            className="absolute -translate-x-1/2 px-1.5 py-0 rounded text-[10px] leading-none text-[var(--foreground)] pointer-events-none will-change-transform"
            style={{ left: 0, x: labelX, top: 14, opacity: isHovering ? 1 : 0 }}
          >
            <DateAtCursor cursorX={cursorX} containerRef={containerRef} />
          </motion.div>
        )}

        {/* Hidden value updater to update header content */}
        <span className="hidden"><ValueAtCursor pathRef={pathRef} cursorX={cursorX} onValue={setCursorValue} /></span>
      </div>
      
      {/* Time Period Tabs */}
      <div className="flex justify-center pb-4 mt-[-10px]">
        <div className="flex rounded-lg p-1">
          {timePeriods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedPeriod === period
                  ? "bg-[var(--secondary-background)] text-[var(--primary-background)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div> 

      
    </div>
  );
}

// Sample a path's y at a given x in SVG coords (approximate by scanning length)
function getYAtXOnPath(path: SVGPathElement, x: number): number | null {
  try {
    const total = path.getTotalLength();
    // Binary search over path length to find point with matching x
    let start = 0;
    let end = total;
    const targetX = x;
    let bestY = null as number | null;
    for (let i = 0; i < 25; i++) {
      const mid = (start + end) / 2;
      const pt = path.getPointAtLength(mid);
      if (Math.abs(pt.x - targetX) < 0.5) {
        bestY = pt.y;
        break;
      }
      if (pt.x < targetX) start = mid; else end = mid;
      bestY = pt.y;
    }
    return bestY;
  } catch (err) {
    return null;
  }
}

function ValueAtCursor({ pathRef, cursorX, onValue }: { pathRef: React.RefObject<SVGPathElement | null>, cursorX: MotionValue<number>, onValue?: (v: number) => void }) {
  const [text, setText] = useState<string>("");
  const rafRef = useRef<number | null>(null);
  const latestX = useRef<number>(0);

  useMotionValueEvent(cursorX, "change", (xPixels: number) => {
    latestX.current = xPixels;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const path = pathRef.current;
      const svg = path?.ownerSVGElement;
      if (!path || !svg) return;
      const rect = svg.getBoundingClientRect();
      const viewBoxWidth = 644;
      const viewBoxHeight = 188;
      const xSvg = (latestX.current / rect.width) * viewBoxWidth;
      const ySvg = getYAtXOnPath(path, xSvg);
      if (ySvg == null) return;
      const base = Math.max(0, viewBoxHeight - ySvg);
      const value = Math.round(base * 1234);
      setText(String(value));
      onValue?.(value);
    });
  });

  return <span>{text}</span>;
}

function DateAtCursor({ cursorX, containerRef }: { cursorX: MotionValue<number>, containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [text, setText] = useState<string>("");
  const rafRef = useRef<number | null>(null);
  const latestX = useRef<number>(0);

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const start = new Date(2024, 0, 1); // Jan 1, 2025
  const end = new Date(2024, 11, 31, 23, 59, 59, 999); // Dec 31, 2025
  const totalMs = end.getTime() - start.getTime();

  useMotionValueEvent(cursorX, "change", (xPixels: number) => {
    latestX.current = xPixels;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const t = Math.max(0, Math.min(1, latestX.current / rect.width));
      const date = new Date(start.getTime() + t * totalMs);
      setText(formatter.format(date));
    });
  });

  return <span>{text}</span>;
}