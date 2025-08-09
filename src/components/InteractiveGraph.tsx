import { useSpring, useMotionTemplate, motion } from "framer-motion";
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
  const clipPathValue = useSpring(0, isHovering ? SPRING : SLOW_SPRING);
  const clipPathTemplate = useMotionTemplate`inset(0px ${clipPathValue}% 0px 0px)`;
  const timePeriods = ["1D", "1M", "1Y", "5Y"] as const;

  // Different path data for each time period - all with same structure
  const pathData = {
    "1D": "M1 120 s 40 10 80 -25 s 40 -10 80 5 s 40 -50 80 -30 s 40 20 80 10 s 40 -30 80 -15 s 40 50 80 20 s 40 -60 80 -40 s 43 -10 83 -5",
    "1M": "M1 90 s 40 -100 80 0 s 40 50 80 -10 s 40 -70 80 -20 s 40 60 80 40 s 40 -50 80 -30 s 40 60 80 20 s 40 -30 80 -20 s 43 20 83 90",
    "1Y": "M1 130 s 40 -50 80 -60 s 40 20 80 20 s 40 -100 80 -80 s 40 90 80 60 s 40 -80 80 -70 s 40 90 80 50 s 40 -70 80 -60 s 43 80 83 40",
    "5Y": "M1 140 s 40 -10 80 -30 s 40 10 80 45 s 40 -10 80 -45 s 40 40 80 -25 s 40 50 80 -15 s 40 -50 80 -15 s 40 -10 80 -15 s 43 -30 83 -45"
  };

  const fillData = {
    "1D": "M1 120 s 40 10 80 -25 s 40 -10 80 5 s 40 -50 80 -30 s 40 20 80 10 s 40 -30 80 -15 s 40 50 80 20 s 40 -60 80 -40 s 43 -10 83 -5 V188 H1 Z",
    "1M": "M1 90 s 40 -100 80 0 s 40 50 80 -10 s 40 -70 80 -20 s 40 60 80 40 s 40 -50 80 -30 s 40 60 80 20 s 40 -30 80 -20 s 43 20 83 90 V188 H1 Z",
    "1Y": "M1 130 s 40 -50 80 -60 s 40 20 80 20 s 40 -100 80 -80 s 40 90 80 60 s 40 -80 80 -70 s 40 90 80 50 s 40 -70 80 -60 s 43 80 83 40 V188 H1 Z",
    "5Y": "M1 140 s 40 -10 80 -30 s 40 10 80 45 s 40 -10 80 -45 s 40 40 80 -25 s 40 50 80 -15 s 40 -50 80 -15 s 40 -10 80 -15 s 43 -30 83 -45 V188 H1 Z"
  };

  // React-spring animations for smooth path morphing
  const pathSpring = useReactSpring({
    d: pathData[selectedPeriod],
    config: { tension: 200, friction: 40, clamp: true }
  });

  const fillSpring = useReactSpring({
    d: fillData[selectedPeriod],
    config: { tension: 200, friction: 40, clamp: true }
  });

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const distanceFromRight = Math.max(rect.right - e.clientX, 0);
    const percentageFromRight = Math.min(
      (distanceFromRight / rect.width) * 100,
      100,
    );
    clipPathValue.set(percentageFromRight);
  }

  return (
    <div className="graph-container border-1 border-[var(--border)] bg-[var(--card)] px-6 pt-6 pb-0 mx-34 rounded-xl shadow-[0_2px_5px_-2px_rgba(0,0,0,0.0.08)]">
      <div className="flex items-start justify-between mb-[2px]">
        <div>
          <p className="text-sm text-[var(--muted-foreground)] mb-[2px]">June</p>
          <p className="text-md font-medium">Progress</p>
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
      </div>
      
      {/* Time Period Tabs */}
      <div className="flex justify-center pb-4">
        <div className="flex rounded-lg p-1">
          {timePeriods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
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