import { useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";

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
  
  const timePeriods = ["1D", "1M", "1Y", "5Y"] as const;

  // Different path data for each time period
  const pathData = {
    "1D": "M1 110s30-20 60-10s40 30 80-5s20-40 60-15s40 25 80-10s30-35 60-5s40 20 80-15s30-25 60-10s40 15 80-5",
    "1M": "M1 120s50-40 100-20s80 60 120 10s60-80 100-30s80 50 120-40s60 70 100-20s80-60 120 30s60 40 100-50s80 20 100 40",
    "1Y": "M1 100s30-60 80-20s60 80 120-10s40-90 100-20s80 70 120-60s60 90 100-30s80-80 120 40s60 20 100-30s80 40 100 60",
    "5Y": "M1 80s20-40 60-10s40 60 100-20s30-70 80-15s60 50 100-30s40 80 80-10s60-60 100 20s40 30 80-20s60 20 100 30"
  };

  const fillData = {
    "1D": "M1 110s30-20 60-10s40 30 80-5s20-40 60-15s40 25 80-10s30-35 60-5s40 20 80-15s30-25 60-10s40 15 80-5V188H1V110z",
    "1M": "M1 120s50-40 100-20s80 60 120 10s60-80 100-30s80 50 120-40s60 70 100-20s80-60 120 30s60 40 100-50s80 20 100 40V188H1V120z",
    "1Y": "M1 100s30-60 80-20s60 80 120-10s40-90 100-20s80 70 120-60s60 90 100-30s80-80 120 40s60 20 100-30s80 40 100 60V188H1V100z",
    "5Y": "M1 80s20-40 60-10s40 60 100-20s30-70 80-15s60 50 100-30s40 80 80-10s60-60 100 20s40 30 80-20s60 20 100 30V188H1V80z"
  };

  // Spring animations for path morphing
  const pathSpring = useSpring({
    d: pathData[selectedPeriod],
    config: { tension: 300, friction: 30 }
  });

  const fillSpring = useSpring({
    d: fillData[selectedPeriod],
    config: { tension: 300, friction: 30 }
  });

  // Clip path spring for hover effect
  const clipPathSpring = useSpring({
    clipPath: `inset(0px 0px 0px 0px)`,
    config: { tension: 300, friction: 30 }
  });

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const distanceFromRight = Math.max(rect.right - e.clientX, 0);
    const percentageFromRight = Math.min(
      (distanceFromRight / rect.width) * 100,
      100,
    );
    clipPathSpring.clipPath.start(`inset(0px ${percentageFromRight}% 0px 0px)`);
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
                  clipPathSpring.clipPath.start(`inset(0px 0px 0px 0px)`);
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
        <animated.svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 644 188"
          style={{
            clipPath: clipPathSpring.clipPath,
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
        </animated.svg>
      </div>
      
      {/* Time Period Tabs */}
      <div className="flex justify-center mt-4 pb-4">
        <div className="flex bg-[var(--muted-background)] rounded-lg p-1">
          {timePeriods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedPeriod === period
                  ? "bg-[var(--primary-foreground)] text-[var(--primary-background)] shadow-sm"
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