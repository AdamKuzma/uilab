import { TextShimmer } from "@/components/TextShimmer";
import { Typewriter } from "@/components/typewriter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white items-stretch">
      {/* Two-column layout for TextShimmer */}
      <div className="flex flex-1">
        {/* Left column */}
        <div className="w-full max-w-md p-8 flex flex-col gap-4 h-full">
          <h2 className="text-md font-bold">Text Shimmer</h2>
          <p className="text-base text-neutral-300 text-sm">
            Use this area to describe the component, add tags, or provide instructions for testing.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="bg-neutral-800 px-3 py-1 rounded text-xs">react</span>
            <span className="bg-neutral-800 px-3 py-1 rounded text-xs">css</span>
            <span className="bg-neutral-800 px-3 py-1 rounded text-xs">tailwind</span>
          </div>
        </div>
        {/* Right column */}
        <div className="flex-1 flex items-start justify-center p-8">
          <div className="w-full max-w-xl min-h-[400px] bg-[#141414] rounded-lg flex flex-col items-center justify-center border border-[#181818] gap-8 py-12">
            <TextShimmer />
          </div>
        </div>
      </div>
      {/* Spacer */}
      <div className="h-8" />
      {/* Two-column layout for Typewriter */}
      <div className="flex flex-1">
        {/* Left column */}
        <div className="w-full max-w-md p-8 flex flex-col gap-4 h-full">
          <h2 className="text-md font-bold">Typewriter</h2>
          <p className="text-base text-neutral-300 text-sm">
            Animated typewriter effect for cycling through text. Supports custom speed, cursor, and looping.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="bg-neutral-800 px-3 py-1 rounded text-xs">react</span>
            <span className="bg-neutral-800 px-3 py-1 rounded text-xs">framer-motion</span>
            <span className="bg-neutral-800 px-3 py-1 rounded text-xs">animation</span>
          </div>
        </div>
        {/* Right column */}
        <div className="flex-1 flex items-start justify-center p-8">
          <div className="w-full max-w-xl min-h-[200px] bg-[#141414] rounded-lg flex flex-col items-center justify-center border border-[#181818] gap-8 py-12">
            <p className="whitespace-pre-wrap md:text-4xl lg:text-5xl sm:text-3xl text-2xl font-normal">
              <span>{"We're born 🌞 to "}</span>
              <Typewriter
                text={[
                  "experience",
                  "dance",
                  "love",
                  "be alive",
                  "create things that make the world a better place",
                ]}
                speed={70}
                className="text-yellow-500"
                waitTime={1500}
                deleteSpeed={40}
                cursorChar={"_"}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
