import { ReactNode } from "react";

interface ShowcaseProps {
  title: string;
  description: string;
  tags: string[];
  children: ReactNode;
}

export function Showcase({
  title,
  description,
  tags,
  children,
}: ShowcaseProps) {
  return (
    <div className="flex justify-between flex-1">
      {/* Left column */}
      <div className="w-full max-w-md py-8 flex flex-col gap-4 h-full pr-16">
        <h2 className="text-sm font-bold">{title}</h2>
        <p className="text-sm text-neutral-400">{description}</p>
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span key={tag} className="bg-neutral-800 px-3 py-1 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right column */}
      <div className="flex-1 flex justify-end items-start">
        <div className="w-full max-w-3xl min-h-[320px] bg-[#141414] rounded-lg flex flex-col items-center justify-center border border-[#1a1a1a] gap-8 py-12">
          {children}
        </div>
      </div>
    </div>
  );
} 