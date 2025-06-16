import { TextShimmer } from "@/components/TextShimmer";
import { Typewriter } from "@/components/Typewriter";
import { Showcase } from "@/components/Showcase";
import FeedbackPopover from "@/components/FeedbackPopover";
import SmoothButton from "@/components/SmoothButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white items-stretch">
      <div className="container-main pb-20">
        {/* Header */}
        <header className="w-full py-24">
          <h1 className="text-3xl font-bold text-left tracking-tight">UI Labolatory</h1>
        </header>

        {/* Text Shimmer Showcase */}
        <Showcase
          title="Text Shimmer"
          description="Use this area to describe the component, add tags, or provide instructions for testing."
          tags={["react", "css", "tailwind"]}
        >
          <TextShimmer duration={1.3} className="" disabled={false} />
        </Showcase>

        {/* Spacer */}
        <div className="h-16" />

        {/* Typewriter Showcase */}
        <Showcase
          title="Typewriter"
          description="Animated typewriter effect for cycling through text. Supports custom speed, cursor, and looping."
          tags={["react", "framer-motion", "animation"]}
        >
          <div className="whitespace-pre-wrap text-2xl font-normal">
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
          </div>
        </Showcase>

        {/* Spacer */}
        <div className="h-16" />

        {/* SmoothButton Showcase */}
        <Showcase
          title="Smooth Button"
          description="A button component with smooth state transitions between idle, loading, and success states."
          tags={["react", "framer-motion", "animation"]}
        >
          <SmoothButton />
        </Showcase>


        <div className="h-16" />

        <Showcase
          title="Feedback Popover"
          description="A feedback popover that allows users to give feedback on the component."
          tags={["react", "framer-motion", "animation"]}
        >
          <FeedbackPopover />
        </Showcase>


      </div>
    </div>
  );
}
