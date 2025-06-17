"use client"

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "./Spinner";

type ButtonState = "idle" | "loading" | "success";

const buttonCopy = {
  idle: "Send Message",
  loading: <Spinner size={16} color="rgba(255, 255, 255, 0.65)" />,
  success: "Message Sent!",
} as const;

export default function SmoothButton() {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  return (
    <div className="outer-wrapper">
      <button 
        className={`smooth-button${buttonState === "loading" ? ' is-loading' : ''}${buttonState === "success" ? ' is-success' : ''}`}
        disabled={buttonState !== "idle"} 
        onClick={() => {
          setButtonState("loading");

          setTimeout(() => {
            setButtonState("success");
          }, 1750);

          setTimeout(() => {
            setButtonState("idle");
          }, 3500);
        }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span 
              key={buttonState} 
              initial={{ y: -25, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 25, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            >
              {buttonCopy[buttonState]}
            </motion.span>
          </AnimatePresence>
      </button>
    </div>
  ); 
}
