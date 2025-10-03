
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Component } from "@/data/components";

interface SearchProps {
  components: Component[];
  onComponentSelect: (index: number) => void;
  currentIndex: number;
}

export default function Search({ components, onComponentSelect, currentIndex }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const showInput = isHovered || isSearchFocused || !!searchQuery;

  // Filter components based on search query
  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return components;
    
    const query = searchQuery.toLowerCase();
    return components.filter(component => 
      component.title.toLowerCase().includes(query) ||
      component.description.toLowerCase().includes(query) ||
      component.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [components, searchQuery]);

  // Handle component selection from filtered results
  const handleFilteredComponentSelect = (filteredIndex: number) => {
    const selectedComponent = filteredComponents[filteredIndex];
    const originalIndex = components.findIndex(comp => comp.id === selectedComponent.id);
    onComponentSelect(originalIndex);
  };

  // No explicit activate/deactivate handlers needed; visibility is derived from hover/focus/query

  // Clear search when component changes externally
  useEffect(() => {
    if (searchQuery && !isSearchFocused) {
      setSearchQuery("");
    }
  }, [currentIndex, searchQuery, isSearchFocused]);

  // Handle input blur
  const handleInputBlur = () => {
    setIsSearchFocused(false);
    // Nothing else to do; visibility will collapse when not hovered and no query
  };

  return (
    <div className="w-[256px] h-full mr-4 bg-background border border-border rounded-xl flex flex-col justify-between overflow-hidden">
      <div className="h-full flex flex-col min-h-0">
        {/* Search Header */}
        <div className="border-b border-border p-4">
          <div 
            className={`flex items-center justify-between rounded-md transition-colors py-1.5 -my-1.5 px-2 -mx-2 overflow-hidden ${isSearchFocused ? '' : 'hover:bg-[var(--muted-background)]'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
            }}
          >
            <div className="flex items-center gap-2 cursor-pointer h-5 w-full">
              <motion.div
                className="flex flex-col w-full"
                animate={{ y: showInput ? -10 : 16 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm font-medium leading-5">{`${components.length} Components`}</span>
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={handleInputBlur}
                    placeholder="Search"
                    className={`w-full h-6 px-0 py-4 text-sm leading-5 font-medium bg-transparent border-0 focus:outline-none placeholder-text-foreground ${searchQuery ? 'cursor-text' : 'cursor-pointer'}`}
                  />
                </div>
              </motion.div>
            </div>
            
            {searchQuery ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="p-0 bg-transparent border-0 w-7 h-7 -m-1 rounded-md cursor-pointer hover:bg-[var(--muted-background)] transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ) : (
              <svg
                className="w-4.5 h-4.5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </div>
          
          
        </div>

        {/* Component Info */}
        <div className="px-4 py-4 space-y-4 flex-1 min-h-0">
          {searchQuery ? (
            // Show search results
            <div className="space-y-2 h-full flex flex-col min-h-0">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Search Results
              </h3>
              {filteredComponents.length > 0 ? (
                <div className="space-y-1 flex-1 overflow-y-auto">
                  {filteredComponents.map((component, index) => (
                    <button
                      key={component.id}
                      onClick={() => handleFilteredComponentSelect(index)}
                      className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors text-sm"
                    >
                      <div className="font-medium">{component.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {component.description}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  No components found
                </div>
              )}
            </div>
          ) : (
            // Show current component info
            <>
              <h2 className="text-sm font-semibold">{components[currentIndex]?.title}</h2>
              <p className="text-sm text-muted-foreground">{components[currentIndex]?.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {components[currentIndex]?.tags?.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-[var(--muted-background)] text-xs text-muted-foreground font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-[var(--border)] px-4 py-2 flex items-center justify-between bg-[var(--secondary-background)]">
        <button
          onClick={() => onComponentSelect(Math.max(currentIndex - 1, 0))}
          disabled={currentIndex === 0}
          className="p-1 disabled:opacity-30 hover:bg-[var(--muted-background)] rounded transition-colors cursor-pointer disabled:cursor-default disabled:hover:bg-transparent"
          aria-label="Previous"
        >
          <svg className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs font-mono text-muted-foreground">
          {String(currentIndex + 1).padStart(2, "0")} / {String(components.length).padStart(2, "0")}
        </span>
        <button
          onClick={() => onComponentSelect(Math.min(currentIndex + 1, components.length - 1))}
          disabled={currentIndex === components.length - 1}
          className="p-1 disabled:opacity-30 hover:bg-[var(--muted-background)] rounded transition-colors cursor-pointer disabled:cursor-default disabled:hover:bg-transparent"
          aria-label="Next"
        >
          <svg className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
