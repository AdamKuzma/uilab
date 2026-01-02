import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import "./styles.css";

type Position = {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
};

type MagneticOffset = {
  x: number;
  y: number;
};

export default function MagneticHover() {
  const [position, setPosition] = useState<Position>({
    left: 0,
    top: 0,
    width: 0,
    height: 48, // Default height matching the hover element
    opacity: 0,
  });
  const cursorRef = useRef<HTMLLIElement>(null);
  const magneticOffsetRef = useRef<MagneticOffset>({ x: 0, y: 0 });
  const ulRef = useRef<HTMLUListElement>(null);

  return (
    <div className="flex justify-center w-full">
      <div className="bg-[var(--color-gray1)] border border-[var(--color-gray5)] rounded-2xl py-1 px-1 pr-2 inline-flex items-center justify-center shadow-xs overflow-hidden">
      <ul
        ref={ulRef}
        onMouseEnter={(e) => {
          if (!ulRef.current) return;
          
          const rect = ulRef.current.getBoundingClientRect();
          const mouseX = e.clientX;
          const mouseY = e.clientY;
          
          // Set initial position where cursor entered (for directional entry)
          const relativeX = mouseX - rect.left;
          const relativeY = mouseY - rect.top;
          
          setPosition((pv) => ({
            ...pv,
            left: relativeX,
            top: relativeY,
            width: 0, // Start with no width for smooth entry
            height: 0, // Start with no height for smooth entry
          }));
        }}
        onMouseLeave={(e) => {
          if (!ulRef.current) return;
          
          const rect = ulRef.current.getBoundingClientRect();
          const mouseX = e.clientX;
          const mouseY = e.clientY;
          
          // Calculate the relative position where the cursor exited
          const relativeX = mouseX - rect.left;
          const relativeY = mouseY - rect.top;
          
          setPosition((pv) => ({
            ...pv,
            left: relativeX - pv.width / 2, // Center the cursor on the exit point
            top: relativeY - pv.height / 2,
            opacity: 0,
          }));
          magneticOffsetRef.current = { x: 0, y: 0 };
        }}
        className="navigation flex items-center relative m-0 p-0 list-none w-auto gap-0"
      >
      <IconTab setPosition={setPosition} cursorRef={cursorRef} magneticOffsetRef={magneticOffsetRef} label="Top">
        <svg className="w-6 h-6 text-[var(--color-gray12)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(90deg)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 19.25H6.75a2 2 0 0 1-2-2V6.75c0-1.1.9-2 2-2h10.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2M8.25 16.25v-8.5"/>
        </svg>
      </IconTab>
      <IconTab setPosition={setPosition} cursorRef={cursorRef} magneticOffsetRef={magneticOffsetRef} label="Bottom">
        <svg className="w-6 h-6 text-[var(--color-gray12)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(-90deg)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 19.25H6.75a2 2 0 0 1-2-2V6.75c0-1.1.9-2 2-2h10.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2M8.25 16.25v-8.5"/>
        </svg>
      </IconTab>
      <IconTab setPosition={setPosition} cursorRef={cursorRef} magneticOffsetRef={magneticOffsetRef} label="Left">
        <svg className="w-6 h-6 text-[var(--color-gray12)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(0deg)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 19.25H6.75a2 2 0 0 1-2-2V6.75c0-1.1.9-2 2-2h10.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2M8.25 16.25v-8.5"/>
        </svg>
      </IconTab>
      <IconTab setPosition={setPosition} cursorRef={cursorRef} magneticOffsetRef={magneticOffsetRef} label="Right">
        <svg className="w-6 h-6 text-[var(--color-gray12)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(180deg)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 19.25H6.75a2 2 0 0 1-2-2V6.75c0-1.1.9-2 2-2h10.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2M8.25 16.25v-8.5"/>
        </svg>
      </IconTab>
      
      <Separator />
      
      <IconTab setPosition={setPosition} cursorRef={cursorRef} magneticOffsetRef={magneticOffsetRef} label="Row">
        <svg className="w-6 h-6 text-[var(--color-gray12)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.75 10.25h12.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1H5.75a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1M5.75 19.25h12.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1H5.75a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1"/>
        </svg>
      </IconTab>
      <IconTab setPosition={setPosition} cursorRef={cursorRef} magneticOffsetRef={magneticOffsetRef} label="Column">
        <svg className="w-6 h-6 text-[var(--color-gray12)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.75 19.25h3.5a1 1 0 0 0 1-1V5.75a1 1 0 0 0-1-1h-3.5a1 1 0 0 0-1 1v12.5a1 1 0 0 0 1 1M14.75 19.25h3.5a1 1 0 0 0 1-1V5.75a1 1 0 0 0-1-1h-3.5a1 1 0 0 0-1 1v12.5a1 1 0 0 0 1 1"/>
        </svg>
      </IconTab>
      <IconTab setPosition={setPosition} cursorRef={cursorRef} magneticOffsetRef={magneticOffsetRef} label="Grid">
        <svg className="w-6 h-6 text-[var(--color-gray12)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.75 19.25h3.5a1 1 0 0 0 1-1V5.75a1 1 0 0 0-1-1h-3.5a1 1 0 0 0-1 1v12.5a1 1 0 0 0 1 1M14.75 10.25h3.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1h-3.5a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1M14.75 19.25h3.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1h-3.5a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1"/>
        </svg>
      </IconTab>
      
      <Separator />
      
      <IconTab setPosition={setPosition} cursorRef={cursorRef} magneticOffsetRef={magneticOffsetRef} label="" className="!w-10 !flex !items-center !justify-center" innerClassName="!min-w-0">
        <svg className="w-6 h-6 text-[var(--color-gray12)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: '0.4', maxWidth: '24px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </IconTab>
      <Cursor position={position} cursorRef={cursorRef} magneticOffsetRef={magneticOffsetRef} />
      </ul>
      </div>
    </div>
  );
}

type IconTabProps = {
  children: React.ReactNode;
  label?: string;
  className?: string;
  innerClassName?: string;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
  cursorRef: React.RefObject<HTMLLIElement | null>;
  magneticOffsetRef: React.MutableRefObject<MagneticOffset>;
};

const IconTab = ({ children, label, className, innerClassName, setPosition, cursorRef, magneticOffsetRef }: IconTabProps) => {
  const containerRef = useRef<HTMLLIElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  
  // Separate position tracking for content
  const contentTargetPosRef = useRef({ x: 0, y: 0 });
  const contentCurrentPosRef = useRef({ x: 0, y: 0 });
  
  // Separate position tracking for cursor
  const cursorTargetPosRef = useRef({ x: 0, y: 0 });
  const cursorCurrentPosRef = useRef({ x: 0, y: 0 });

  const animate = () => {
    const ease = 0.2;
    
    // Animate content
    contentCurrentPosRef.current.x += (contentTargetPosRef.current.x - contentCurrentPosRef.current.x) * ease;
    contentCurrentPosRef.current.y += (contentTargetPosRef.current.y - contentCurrentPosRef.current.y) * ease;

    // Animate cursor
    cursorCurrentPosRef.current.x += (cursorTargetPosRef.current.x - cursorCurrentPosRef.current.x) * ease;
    cursorCurrentPosRef.current.y += (cursorTargetPosRef.current.y - cursorCurrentPosRef.current.y) * ease;

    // Apply transform to content
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${contentCurrentPosRef.current.x}px, ${contentCurrentPosRef.current.y}px)`;
    }

    // Update shared magnetic offset
    magneticOffsetRef.current = { 
      x: cursorCurrentPosRef.current.x, 
      y: cursorCurrentPosRef.current.y 
    };

    // Update cursor directly
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${cursorCurrentPosRef.current.x}px, ${cursorCurrentPosRef.current.y}px)`;
    }

    // Continue animation if still moving
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

  const parallaxIt = (e: React.MouseEvent<HTMLLIElement>) => {
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
    
    const maxDimension = Math.max(containerWidth, containerHeight);
    
    const normalizedX = dx / maxDimension;
    const normalizedY = dy / maxDimension;
    
    // Content - subtle movement
    const contentX = normalizedX * 1;
    const contentY = normalizedY * 1;
    
    // Cursor - more intense movement
    const cursorX = normalizedX * 8;
    const cursorY = normalizedY * 8;

    contentTargetPosRef.current = { x: contentX, y: contentY };
    cursorTargetPosRef.current = { x: cursorX, y: cursorY };

    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(animate);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLLIElement>) => {
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

  return (
    <li
      ref={containerRef}
      onMouseEnter={() => {
        if (!containerRef.current) return;

        const { width, height, left, top } = containerRef.current.getBoundingClientRect();
        const parentRect = containerRef.current.offsetParent?.getBoundingClientRect();
        const parentLeft = parentRect?.left || 0;
        const parentTop = parentRect?.top || 0;

        setPosition({
          width: width,
          height: height,
          opacity: 1,
          left: left - parentLeft,
          top: top - parentTop,
        });
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseOut}
      className={`navigationItem relative z-10 cursor-pointer list-none ${className || ''}`}
    >
      <div
        ref={contentRef}
        className={`navigationItemInner flex flex-col items-center justify-center ${innerClassName || ''}`}
        style={{ willChange: 'transform' }}
      >
        <div className="flex items-center justify-center">
          {children}
        </div>
        {label && (
          <div className="text-xs text-[var(--color-gray11)] mt-0.5 text-center font-regular">{label}</div>
        )}
      </div>
    </li>
  );
};

const Separator = () => {
  return (
    <li className="separator list-none h-10 bg-[var(--color-gray6)] mx-2"/>
  );
};

type CursorProps = {
  position: Position;
  cursorRef: React.RefObject<HTMLLIElement | null>;
  magneticOffsetRef: React.MutableRefObject<MagneticOffset>;
};

const Cursor = ({ position, cursorRef, magneticOffsetRef }: CursorProps) => {
  return (
    <motion.li 
      ref={cursorRef}
      animate={{
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        opacity: position.opacity,
      }}
      transition={{
        left: {
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 0.6,
        },
        top: {
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 0.6,
        },
        width: {
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 0.6,
        },
        height: {
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 0.6,
        },
        opacity: {
          duration: 0.3,
          ease: "easeOut",
        },
      }}
      style={{ willChange: 'transform', transformOrigin: 'center' }}
      className="navigationHover absolute z-0 list-none"
    />
  );
};
