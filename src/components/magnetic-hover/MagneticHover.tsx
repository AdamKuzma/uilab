import React, { useRef, useEffect, RefObject } from "react";

interface Movement {
  x: number;
  y: number;
}

interface UseMagneticHoverOptions {
  contentMovement?: Movement;
  cursorMovement?: Movement;
  cursorRef?: RefObject<HTMLElement | null>;
  magneticOffsetRef?: RefObject<Movement>;
}

interface UseMagneticHoverReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseOut: () => void;
}

/**
 * Custom hook for magnetic hover effect with smooth animation
 */
const useMagneticHover = ({
  contentMovement = { x: 2, y: 2 },
  cursorMovement = { x: 8, y: 12 },
  cursorRef,
  magneticOffsetRef,
}: UseMagneticHoverOptions = {}): UseMagneticHoverReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  
  const contentTargetPosRef = useRef<Movement>({ x: 0, y: 0 });
  const contentCurrentPosRef = useRef<Movement>({ x: 0, y: 0 });
  
  const cursorTargetPosRef = useRef<Movement>({ x: 0, y: 0 });
  const cursorCurrentPosRef = useRef<Movement>({ x: 0, y: 0 });

  const animate = () => {
    const ease = 0.2;
    
    contentCurrentPosRef.current.x += (contentTargetPosRef.current.x - contentCurrentPosRef.current.x) * ease;
    contentCurrentPosRef.current.y += (contentTargetPosRef.current.y - contentCurrentPosRef.current.y) * ease;

    cursorCurrentPosRef.current.x += (cursorTargetPosRef.current.x - cursorCurrentPosRef.current.x) * ease;
    cursorCurrentPosRef.current.y += (cursorTargetPosRef.current.y - cursorCurrentPosRef.current.y) * ease;

    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${contentCurrentPosRef.current.x}px, ${contentCurrentPosRef.current.y}px)`;
    }

    if (magneticOffsetRef) {
      magneticOffsetRef.current = { 
        x: cursorCurrentPosRef.current.x, 
        y: cursorCurrentPosRef.current.y 
      };
    }

    if (cursorRef?.current) {
      cursorRef.current.style.transform = `translate(${cursorCurrentPosRef.current.x}px, ${cursorCurrentPosRef.current.y}px)`;
    }

    const contentDx = Math.abs(contentTargetPosRef.current.x - contentCurrentPosRef.current.x);
    const contentDy = Math.abs(contentTargetPosRef.current.y - contentCurrentPosRef.current.y);
    const cursorDx = Math.abs(cursorTargetPosRef.current.x - cursorCurrentPosRef.current.x);
    const cursorDy = Math.abs(cursorTargetPosRef.current.y - cursorCurrentPosRef.current.y);
    
    if (contentDx > 0.01 || contentDy > 0.01 || cursorDx > 0.01 || cursorDy > 0.01) {
      rafIdRef.current = requestAnimationFrame(animate);
    } else {
      rafIdRef.current = null;
    }
  };

  const parallaxIt = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const dx = relX - centerX;
    const dy = relY - centerY;
    
    // Normalize logic
    const maxDimension = Math.max(containerWidth, containerHeight);
    
    const normalizedX = dx / maxDimension;
    const normalizedY = dy / maxDimension;
    
    const contentX = normalizedX * contentMovement.x;
    const contentY = normalizedY * contentMovement.y;
    
    const cursorX = normalizedX * cursorMovement.x;
    const cursorY = normalizedY * cursorMovement.y;

    contentTargetPosRef.current = { x: contentX, y: contentY };
    cursorTargetPosRef.current = { x: cursorX, y: cursorY };

    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(animate);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    parallaxIt(e);
  };

  const handleMouseOut = () => {
    contentTargetPosRef.current = { x: 0, y: 0 };
    cursorTargetPosRef.current = { x: 0, y: 0 };
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    contentRef,
    handleMouseMove,
    handleMouseOut,
  };
};

interface MagneticItemProps {
  children: React.ReactNode;
  className?: string;
  movementX?: number;
  movementY?: number;
}

const MagneticItem = ({ 
  children, 
  className = "", 
  movementX = 2, 
  movementY = 2 
}: MagneticItemProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  // Using 0.5 implies the content moves 50% of the distance from center to mouse
  // Adjusting to larger numbers for visible effect as per original hook defaults (2, 2)
  const { containerRef, contentRef, handleMouseMove, handleMouseOut } = useMagneticHover({
    contentMovement: { x: movementX, y: movementY },
    cursorMovement: { x: movementX, y: movementY },
    cursorRef: outerRef
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseOut}
      className={`relative flex items-center justify-center`}
    >
        {/* We move this outerRef which represents the "container" visually */}
        <div ref={outerRef} className={`will-change-transform ${className}`}>
            <div ref={contentRef} className="will-change-transform">
                {children}
            </div>
        </div>
    </div>
  );
};

export default function MagneticHover() {
  return (
    <div className="flex flex-col gap-12 p-10 items-center justify-center w-full min-h-[500px] bg-neutral-50/50">
      
      {/* Cards Row */}
      <div className="flex flex-wrap gap-8 justify-center">
        <MagneticItem 
          movementX={10} 
          movementY={10}
          className="w-32 h-32 bg-white rounded-2xl shadow-sm border border-neutral-200 cursor-pointer hover:shadow-md transition-shadow group flex items-center justify-center"
        >
          <span className="text-3xl transition-transform group-hover:scale-110">👋</span>
        </MagneticItem>

      </div>
    </div>
  );
}
