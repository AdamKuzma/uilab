"use client";

import { Component as UIComponent } from "@/data/components";

interface RightColumnProps {
  components: UIComponent[];
  onSelect: (index: number) => void;
}

export default function RightColumn({ components, onSelect }: RightColumnProps) {
  return (
    <div
      className="fixed top-0 right-0 h-screen overflow-y-auto z-20 flex flex-col scrollbar-none hide-scrollbar max-[1000px]:hidden"
      style={{ width: 256 }}
    >
      <div className="h-full p-4">
        <div className="space-y-4">
          {components.map((component, index) => (
            <div
              key={component.id}
              onClick={() => onSelect(index)}
              role="button"
              tabIndex={0}
              className={`right-card group w-full aspect-square bg-background rounded-xl overflow-hidden border-1 transition-colors cursor-pointer border-border
                focus:outline-none focus:ring-0
                hover:bg-[var(--secondary-background)]
              `}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(index); }}
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
  );
}


