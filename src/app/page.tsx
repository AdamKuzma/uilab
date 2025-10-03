"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { components } from "@/data/components";
import Search from "@/app/search";
import RightColumn from "@/app/right-column";

// Client-only theme toggle component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <label className="toggle-switch">
        <input type="checkbox" checked={false} readOnly />
        <span className="toggle-slider"></span>
      </label>
    );
  }

  return (
    <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
      <span className="toggle-slider"></span>
    </label>
  );
}


function HomeContent() {
  // Move ALL hooks to the top, before any conditional logic
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const scrollLockRef = useRef(false);
  const centerRef = useRef<HTMLDivElement>(null);
  const { toggleTheme } = useTheme();

  // Now handle the component parameter logic
  const componentParam = searchParams.get('component');
  const isPreviewMode = !!componentParam;
  const previewComponent = components.find(c => c.id === componentParam);

  // Initialize the current index from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currentComponentIndex');
      const index = saved ? parseInt(saved, 10) : 0;
      setCurrentIndex(index);
    }
    setIsLoading(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (scrollLockRef.current) return;
    const threshold = 10;
    const dy = e.deltaY;
    if (Math.abs(dy) < threshold) return;

    const delta = dy > 0 ? 1 : -1;
    setDirection(delta);
    e.preventDefault();

    setCurrentIndex(prevIndex => {
      const maxIndex = components.length - 1;
      const nextIndex = Math.min(Math.max(prevIndex + delta, 0), maxIndex);
      if (nextIndex !== prevIndex) {
        localStorage.setItem('currentComponentIndex', nextIndex.toString());
        scrollLockRef.current = true;
        setTimeout(() => {
          scrollLockRef.current = false;
        }, 400);
      }
      return nextIndex;
    });
  }, []);

  useEffect(() => {
    // No-op: wheel handled via React onWheel; keep dependency length stable
  }, [handleWheel]);

  const navigateToComponent = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    // Save the current index to localStorage
    localStorage.setItem('currentComponentIndex', index.toString());
  };

  const currentComponent = components[currentIndex] || components[0];

  if (!currentComponent || isLoading) {
    return null; // Or some error state
  }

  // AFTER all hooks are called, then do conditional rendering
  if (isPreviewMode && previewComponent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="w-full z-10 relative">
          <div className="container-main py-6">
            <div className="flex items-center justify-between">
              <div
                className="inline-flex items-center cursor-pointer logo-container"
                onClick={toggleTheme}
                role="button"
                aria-label="Toggle theme"
              >
                <ThemeToggle />
                <h1 className="logo">UI Playground</h1>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Playground
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-8 bg-background" style={{ backgroundImage: 'none' }}>
          {previewComponent.component}
        </main>
      </div>
    );
  }

  const variants = {
    enter: (direction: number) => ({
      y: direction === 1 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction === 1 ? -500 : 500,
      opacity: 0,
    }),
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="w-full z-10 relative">
        <div className="container-main py-6">
          <div
            className="inline-flex items-center cursor-pointer"
            onClick={toggleTheme}
            role="button"
            aria-label="Toggle theme"
          >
            <ThemeToggle />
            <h1 className="logo">UI Playground</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container-main pr-0">
         <div className="flex items-stretch h-[calc(100vh-160px)] mr-0">
          {/* Left Column - Search Component (hidden ≤787px) */}
          <div className="h-full max-[787px]:hidden">
            <Search 
              components={components}
              onComponentSelect={navigateToComponent}
              currentIndex={currentIndex}
            />
          </div>

          {/* Center Column - Component Display */}
          <div
            ref={centerRef}
            className="relative overflow-hidden flex-1 flex items-center justify-center"
            onWheel={(e) => handleWheel(e.nativeEvent)}
          >
            <AnimatePresence initial={false} custom={direction} mode="sync">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-full max-w-3xl">
                  {currentComponent.component}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 mb-8">
          <p className="text-xs text-muted-foreground">Designed and built by Adam Kuzma</p>
        </footer>
      </div>

      {/* Right Column - Fixed, Full Height */}
      {/* <RightColumn components={components} onSelect={navigateToComponent} /> */}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}
