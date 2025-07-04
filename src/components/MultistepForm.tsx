"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import useMeasure from "react-use-measure";

export default function MultiStepComponent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ref, bounds] = useMeasure();

  const content = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <h2 className="heading text-md font-medium">This is step one</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Usually in this step we would explain why this thing exists and
              what it does. Also, we would show a button to go to the next step.
            </p>
            <div className="skeletons">
              <div className="skeleton" style={{ width: 256 }} />
              <div className="skeleton" style={{ width: 192 }} />
              <div className="skeleton" />
              <div className="skeleton" style={{ width: 384 }} />
            </div>
          </>
        );
      case 1:
        return (
          <>
            <h2 className="heading text-md font-medium">This is step two</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Usually in this step we would explain why this thing exists and
              what it does. Also, we would show a button to go to the next step.
            </p>
            <div className="skeletons">
              <div className="skeleton" style={{ width: 256 }} />
              <div className="skeleton" style={{ width: 192 }} />
              <div className="skeleton" style={{ width: 384 }} />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="heading text-md font-medium">This is step three</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Usually in this step we would explain why this thing exists and
              what it does. Also, we would show a button to go to the next step.
            </p>
            <div className="skeletons">
              <div className="skeleton" style={{ width: 256 }} />
              <div className="skeleton" style={{ width: 192 }} />
              <div className="skeleton" style={{ width: 128 }} />
              <div className="skeleton" style={{ width: 224 }} />
              <div className="skeleton" style={{ width: 384 }} />
            </div>
          </>
        );
    }
  }, [currentStep]);

  return (
    <MotionConfig transition={{ type: "spring", duration: 0.5, bounce: 0 }}>
      <motion.div 
        className="multi-step-wrapper" 
        animate={{ height: bounds.height }}
      >
        <div className="multi-step-inner" ref={ref}>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div 
              key={currentStep}
              variants={variants}
              initial="initial"
              animate="active"
              exit="exit"
              custom={direction}
              >
                {content}
              </motion.div>
          </AnimatePresence>
            <motion.div className="actions" layout>
              <button
                className="secondary-button"
                disabled={currentStep === 0}
                onClick={() => {
                  if (currentStep === 0) {
                    return;
                  }
                  setDirection(-1);
                  setCurrentStep((prev) => prev - 1);
                }}
              >
                Back
              </button>
              <button
                className="primary-button"
                disabled={currentStep === 2}
                onClick={() => {
                  if (currentStep === 2) {
                    setCurrentStep(0);
                    setDirection(-1);
                    return;
                  }
                  setCurrentStep((prev) => prev + 1);
                  setDirection(1);
                }}
              >
                Continue
              </button>
            </motion.div>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

const variants = {      
  initial: (direction: number) => {
    return { x: `${110 * direction}%`, opacity: 0 };
  },
  active: { opacity: 1, x: 0 },
  exit: (direction: number) => {
    return { x: `${-110 * direction}%`, opacity: 0 };
  },
};