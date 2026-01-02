"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface TextShimmerProps {
  children?: string;
  className?: string;
  duration?: number;
  disabled?: boolean;
}

export function TextShimmer({
  children = "Generating updates...",
  className,
  duration = 2,
  disabled = false,
}: TextShimmerProps) {
  const shimmerStyles = {
    color: "#a5a5a5a4",
    backgroundImage: "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.98) 50%, rgba(255, 255, 255, 0) 60%)",
    backgroundSize: "200% 100%",
    backgroundPosition: "0% 0%",
    backgroundRepeat: "no-repeat",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    display: "inline-block",
    animation: disabled ? "none" : `shine ${duration}s linear infinite`,
  } as const;

  return (
    <span
      className={cn("font-mono text-sm", className)}
      style={shimmerStyles}
    >
      {children}
    </span>
  );
}

// Add the keyframes animation
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shine {
      0% {
        background-position: 100%;
      }
      100% {
        background-position: -100%;
      }
    }
  `;
  document.head.appendChild(style);
} 

