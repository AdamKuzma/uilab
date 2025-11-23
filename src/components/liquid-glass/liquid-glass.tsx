"use client";

import { useState, useEffect } from "react";
import "./styles.css";

export default function LiquidGlass() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [displacementMap, setDisplacementMap] = useState("");
  
  // Controls
  const [bezelWidth, setBezelWidth] = useState(15); // Size of the glass effect area
  const [refractionScale, setRefractionScale] = useState(20); // "Thickness" / scale of displacement
  const [frosting, setFrosting] = useState(0); // Blur amount for frosting effect
  const [cornerRadius, setCornerRadius] = useState(32);
  const [cardWidth, setCardWidth] = useState(300);
  const [cardHeight, setCardHeight] = useState(200);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = cardWidth;
    canvas.height = cardHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(cardWidth, cardHeight);
    const data = imageData.data;

    // Surface function: Convex Circle (Spherical)
    // x is normalized distance from edge (0 to 1)
    const f = (x: number) => {
      // y = sqrt(1 - (1 - x)^2)
      const val = Math.max(0, Math.min(1, x));
      return Math.sqrt(1 - Math.pow(1 - val, 2));
    };

    // Calculate distance from point to the nearest edge of a rounded rectangle
    // Returns positive value inside, increasing as we go deeper
    const getDistanceFromEdge = (x: number, y: number) => {
      // Transform to center-relative
      const cx = x - cardWidth / 2;
      const cy = y - cardHeight / 2;

      // Box half-extents reduced by radius
      const bx = cardWidth / 2 - cornerRadius;
      const by = cardHeight / 2 - cornerRadius;

      // Closest point on the "spine" (the rectangle inside the rounded corners)
      const closestX = Math.max(-bx, Math.min(bx, cx));
      const closestY = Math.max(-by, Math.min(by, cy));

      // Vector from spine to point
      const dx = cx - closestX;
      const dy = cy - closestY;
      const distToSpine = Math.sqrt(dx * dx + dy * dy);

      // We are inside the shape if distToSpine < cornerRadius (mostly)
      // But standard SDF for rounded box:
      // dist = length(max(q, 0)) + min(max(q.x, q.y), 0) - r
      // where q = abs(p) - b
      
      // Let's use the explicit logic:
      // The boundary is at distance 'cornerRadius' from the spine.
      // So distance from boundary = cornerRadius - distToSpine
      
      // We also need the direction FROM the edge TO the center (gradient of distance)
      // Vector from point TO spine is (-dx, -dy). 
      // This vector points inwards.
      
      let dirX = 0;
      let dirY = 0;
      
      if (distToSpine > 0) {
        dirX = -dx / distToSpine;
        dirY = -dy / distToSpine;
      } else {
        // Exactly on spine or center.
        // For the spine, the normal is axis aligned.
        // If inside the central flat area, gradient is 0.
        // But here we need valid directions for the bezel.
      }

      return {
        dist: cornerRadius - distToSpine,
        dirX,
        dirY
      };
    };

    const delta = 0.001; // Small value to approximate derivative

    for (let y = 0; y < cardHeight; y++) {
      for (let x = 0; x < cardWidth; x++) {
        const i = (y * cardWidth + x) * 4;

        // 1. Calculate distance and direction from edge
        const { dist, dirX, dirY } = getDistanceFromEdge(x, y);

        // If outside the shape (dist < 0), we want 0 displacement (128, 128)
        // Or if we are in the flat center (dist > bezelWidth)
        if (dist < 0) {
           data[i] = 128;     // R (Neutral)
           data[i + 1] = 128; // G (Neutral)
           data[i + 2] = 128; // B
           data[i + 3] = 0;   // Alpha (transparent outside)
           continue;
        }

        // Normalize distance for the surface function
        const normalizedDist = Math.min(dist / bezelWidth, 1);
        
        // 2. Calculate derivative of height function
        // User's snippet adapted:
        // const y1 = f(distanceFromSide - delta);
        // const y2 = f(distanceFromSide + delta);
        // const derivative = (y2 - y1) / (2 * delta);
        
        const h1 = f(normalizedDist - delta);
        const h2 = f(normalizedDist + delta);
        const slope = (h2 - h1) / (2 * delta);

        // 3. Map slope to 2D displacement
        // The slope is along the direction 'dir'.
        // Displacement vector = slope * dir
        // We need to map this to 0-255 range where 128 is 0.
        
        const displacementX = slope * dirX;
        const displacementY = slope * dirY;
        
        // Map [-1, 1] to [0, 255]
        const r = 128 + displacementX * 127;
        const g = 128 + displacementY * 127;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = 128; // B (unused)
        data[i + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(imageData, 0, 0);
    setDisplacementMap(canvas.toDataURL());
  }, [bezelWidth, cornerRadius, cardWidth, cardHeight]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="flex items-center justify-center h-[600px] bg-cover bg-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1528459199957-0ff28496a7f6?q=80&w=1343&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="glass-card"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? "grabbing" : "grab",
          borderRadius: `${cornerRadius}px`,
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <p className="text-black text-lg font-medium relative z-10 select-none">
          Liquid Glass
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col gap-4 p-4 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 text-white w-64">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/70">
            <label>Corner Radius</label>
            <span>{cornerRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={cornerRadius}
            onChange={(e) => setCornerRadius(Number(e.target.value))}
            className="accent-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/70">
            <label>Bezel Width</label>
            <span>{bezelWidth}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={bezelWidth}
            onChange={(e) => setBezelWidth(Number(e.target.value))}
            className="accent-white"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/70">
            <label>Frosting (Blur)</label>
            <span>{frosting}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={frosting}
            onChange={(e) => setFrosting(Number(e.target.value))}
            className="accent-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/70">
            <label>Refraction Scale</label>
            <span>{refractionScale}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={refractionScale}
            onChange={(e) => setRefractionScale(Number(e.target.value))}
            className="accent-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/70">
            <label>Width</label>
            <span>{cardWidth}px</span>
          </div>
          <input
            type="range"
            min="50"
            max="600"
            value={cardWidth}
            onChange={(e) => setCardWidth(Number(e.target.value))}
            className="accent-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/70">
            <label>Height</label>
            <span>{cardHeight}px</span>
          </div>
          <input
            type="range"
            min="50"
            max="600"
            value={cardHeight}
            onChange={(e) => setCardHeight(Number(e.target.value))}
            className="accent-white"
          />
        </div>
      </div>

      {/* SVG Filter */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="displacementFilter">
          {displacementMap && (
            <feImage
              href={displacementMap}
              result="displacementImage"
              x="0" 
              y="0"
              width={cardWidth}
              height={cardHeight}
            />
          )}
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacementImage"
            scale={refractionScale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation={frosting} />
        </filter>
      </svg>
    </div>
  );
}
