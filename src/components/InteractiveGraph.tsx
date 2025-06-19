import { useSpring, useMotionTemplate, motion } from "framer-motion";
import { useRef, useState } from "react";


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
  const clipPathValue = useSpring(0, isHovering ? SPRING : SLOW_SPRING);
  const clipPathTemplate = useMotionTemplate`inset(0px ${clipPathValue}% 0px 0px)`;

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
          <path
            stroke="var(--muted-background)"
            strokeWidth="2"
            d="M1 118.5s82.308-15.501 113.735-29 74.769-1.713 121.217-12c37.596-8.328 58.517-15.006 93.781-30.5 80.146-35.215 123.213-16 154.141-24.5S635.97.849 644 1.5"
          />
          <path
            fill="url(#paint0_linear_gray)"
            d="M113.912 89.012C82.437 102.511 1 118.01 1 118.01V188h643V1.023c-8.043-.65-129.399 12.499-160.375 20.998-30.976 8.498-74.11-10.714-154.38 24.496-35.319 15.493-56.272 22.17-93.927 30.497-46.52 10.286-89.93-1.5-121.406 11.998"
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
          <path
            stroke="#7110C5"
            strokeWidth="2"
            d="M1 118.5s82.308-15.501 113.735-29 74.769-1.713 121.217-12c37.596-8.328 58.517-15.006 93.781-30.5 80.146-35.215 123.213-16 154.141-24.5S635.97.849 644 1.5"
          />
          <path
            fill="url(#paint0_linear_540_31)"
            d="M113.912 89.012C82.437 102.511 1 118.01 1 118.01V188h643V1.023c-8.043-.65-129.399 12.499-160.375 20.998-30.976 8.498-74.11-10.714-154.38 24.496-35.319 15.493-56.272 22.17-93.927 30.497-46.52 10.286-89.93-1.5-121.406 11.998"
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
    </div>
  );
}