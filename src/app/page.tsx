"use client";

// import { TextShimmer } from "@/components/TextShimmer";
// import Typewriter from "@/components/Typewriter";
// import { Spinner } from "@/components/Spinner";
import FeedbackPopover from "@/components/FeedbackPopover";
import SmoothButton from "@/components/SmoothButton";
import SmoothTabs from "@/components/SmoothTabs";
import SmoothList from "@/components/SmoothList";
import MultistepForm from "@/components/MultistepForm";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";

const components = [
  {
    id: "smooth-button",
    title: "Simple Button",
    description: "A button component with embedded loading state and success feedback.",
    component: <SmoothButton />,
    preview: <SmoothButton />,
    tags: ["react", "framer motion", "tailwind"],
  },
  {
    id: "smooth-tabs",
    title: "Smooth Tabs",
    description: "A tab component with smooth transitions between tabs.",
    component: <SmoothTabs />,
    preview: <SmoothTabs />,
    tags: ["react", "framer motion", "tailwind"],
  },
  {
    id: "smooth-list",
    title: "Smooth List",
    description: "A list component with smooth animations for items.",
    component: <SmoothList />,
    preview: (
      <div className="space-y-1">
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-10 bg-gray-200 rounded" />
      </div>
    ),
    tags: ["react", "framer motion"],
  },
  {
    id: "feedback-popover",
    title: "Feedback Popover",
    description: "A popover component with feedback for user interactions.",
    component: <FeedbackPopover />,
    preview: (
      <div className="space-y-1">
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-10 bg-gray-200 rounded" />
      </div>
    ),
    tags: ["react", "framer motion", "tailwind"],
  },
  {
    id: "multistep-form",
    title: "Multistep Form",
    description: "A multistep form component with smooth transitions between steps.",
    component: <MultistepForm />,
    preview: (
      <div className="space-y-1">
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-10 bg-gray-200 rounded" />
      </div>
    ),
    tags: ["react", "framer motion", "tailwind"],
  }
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const centerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (isScrolling) return;
    if (Math.abs(e.deltaY) < 10) return;
    setIsScrolling(true);

    let nextIndex = currentIndex;
    if (e.deltaY > 0) {
      nextIndex = Math.min(currentIndex + 1, components.length - 1);
      setDirection(1);
    } else if (e.deltaY < 0) {
      nextIndex = Math.max(currentIndex - 1, 0);
      setDirection(-1);
    }
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
    }

    setTimeout(() => {
      setIsScrolling(false);
    }, 600);
  }, [currentIndex, isScrolling]);

  useEffect(() => {
    const center = centerRef.current;
    if (!center) return;
    center.addEventListener('wheel', handleWheel, { passive: false });
    return () => center.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const navigateToComponent = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentComponent = components[currentIndex] || components[0];

  if (!currentComponent) {
    return null; // Or some error state
  }

  const variants = {
    enter: (direction: number) => ({
      y: direction === 1 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction === 1 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="w-full z-10 relative">
        <div className="container-main py-6">
          <div className="flex items-center">
            <label className="toggle-switch">
              <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
              <span className="toggle-slider"></span>
            </label>
            <h1 className="logo">UI Playground</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container-main pr-0" style={{ paddingRight: 256 }}>
        <div className="flex h-[calc(100vh-160px)]">
          {/* Left Column - Component Info */}
          <div className="w-[256px] bg-background border border-border rounded-xl flex flex-col justify-between overflow-hidden">
            <div className="h-full">
              <div className="flex items-center justify-between mb-6 border-b border-border p-4">
                <span className="text-sm font-medium">{components.length} Components</span>
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="sticky px-4 top-8 space-y-4">
                <h2 className="text-sm font-semibold">{currentComponent.title}</h2>
                <p className="text-sm text-muted-foreground">{currentComponent.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentComponent.tags?.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-[var(--muted-background)] text-xs text-muted-foreground font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-[var(--border)] px-4 py-2 flex items-center justify-between bg-[var(--secondary-background)]">
              <button
                onClick={() => navigateToComponent(Math.max(currentIndex - 1, 0))}
                disabled={currentIndex === 0}
                className="p-1 disabled:opacity-30"
                aria-label="Previous"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs font-mono text-muted-foreground">
                {String(currentIndex + 1).padStart(2, "0")} / {String(components.length).padStart(2, "0")}
              </span>
              <button
                onClick={() => navigateToComponent(Math.min(currentIndex + 1, components.length - 1))}
                disabled={currentIndex === components.length - 1}
                className="p-1 disabled:opacity-30"
                aria-label="Next"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Center Column - Component Display */}
          <div ref={centerRef} className="flex-1 flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full max-w-3xl"
              >
                {currentComponent.component}
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
      <div
        className="fixed top-0 right-0 h-screen overflow-y-auto z-20 flex flex-col scrollbar-none hide-scrollbar"
        style={{ width: 256 }}
      >
        <div className="h-full p-4">
          <div className="space-y-4">
            {components.map((component, index) => (
              <div
                key={component.id}
                onClick={() => navigateToComponent(index)}
                role="button"
                tabIndex={0}
                className={`group w-full aspect-square bg-background rounded-xl overflow-hidden border-1 transition-all cursor-pointer border-border
                  focus:outline-none focus:ring-0
                  hover:bg-[var(--secondary-background)]
                `}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigateToComponent(index); }}
                style={{ transition: 'background 0.2s' }}
              >
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <div
                    className="pointer-events-none flex items-center justify-center transition-transform"
                    style={{
                      transform: 'scale(0.4)',
                      transformOrigin: 'center',
                      width: '250%',
                      height: '250%'
                    }}
                  >
                    {component.preview}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
