import FeedbackPopover from "@/components/feedback-popover/FeedbackPopover";
import SmoothButton from "@/components/smooth-button/SmoothButton";
import SmoothTabs from "@/components/smooth-tabs/SmoothTabs";
import SmoothList from "@/components/smooth-list/SmoothList";
import MultistepForm from "@/components/multistep-form/MultistepForm";
import TrashAnimation from "@/components/trash-animation/TrashAnimation";
import InteractiveGraph from "@/components/interactive-graph/InteractiveGraph";
import LineMinimap from "@/components/line-minimap/source";
//import DictationWaveform from "@/components/dictation-waveform/main";
import NestedMenu from "@/components/nested-menu/NestedMenu";
// import MagneticHover from "@/components/magnetic-hover/MagneticHover";
// import { AvatarFallbackExamples } from "@/components/fallback-avatar/FallbackAvatar";
//import LiquidGlass from "@/components/liquid-glass/liquid-glass";

export interface Component {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  preview: React.ReactNode;
  tags: string[];
}

export const components: Component[] = [
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
    preview: <SmoothList />,
    tags: ["react", "framer motion"],
  },
  {
    id: "feedback-popover",
    title: "Feedback Popover",
    description: "A popover component with feedback for user interactions.",
    component: <FeedbackPopover />,
    preview: <FeedbackPopover />,
    tags: ["react", "framer motion", "tailwind"],
  },
  {
    id: "multistep-form",
    title: "Multistep Form",
    description: "A multistep form component with smooth transitions between steps.",
    component: <MultistepForm />,
    preview: <MultistepForm />,
    tags: ["react", "framer motion", "tailwind"],
  },
  // {
  //   id: "trash-animation",
  //   title: "Trash Animation",
  //   description: "A trash animation component with smooth transitions between steps.",
  //   component: <TrashAnimation />,
  //   preview: <TrashAnimation />,
  //   tags: ["react", "framer motion", "tailwind"],
  // },
  // {
  //   id: "interactive-graph",
  //   title: "Interactive Graph",
  //   description: "",
  //   component: <InteractiveGraph />,
  //   preview: <InteractiveGraph />,
  //   tags: ["react", "framer motion", "tailwind"],
  // },
  {
    id: "line-minimap",
    title: "Line Minimap",
    description: "An interactive minimap with proximity-based scaling and smooth hover tracking.",
    component: <LineMinimap />,
    preview: <LineMinimap />,
    tags: ["react", "framer motion", "hover"],
  },
  // {
  //   id: "dictation-waveform",
  //   title: "Dictation Waveform",
  //   description: "A live microphone waveform visualization with smooth scrolling bars and real-time audio level detection.",
  //   component: <DictationWaveform />,
  //   preview: <DictationWaveform />,
  //   tags: ["react", "canvas", "audio", "microphone"],
  // },
  {
    id: "nested-menu",
    title: "Nested Menu",
    description: "A recursive nested menu component with multiple levels that renders itself. Created for a client project.",
    component: <NestedMenu />,
    preview: <NestedMenu />,
    tags: ["react", "menu", "navigation"],
  },
  // {
  //   id: "fallback-avatar",
  //   title: "Fallback Avatar",
  //   description: "Generates colorful, unique fallback avatars based on user names using SVG patterns and deterministic randomization.",
  //   component: <AvatarFallbackExamples />,
  //   preview: <AvatarFallbackExamples />,
  //   tags: ["react", "radix-ui", "avatar", "svg"],
  // },
  // {
  //   id: "magnetic-hover",
  //   title: "Magnetic Hover",
  //   description: "Interactive elements that magnetically pull towards the cursor.",
  //   component: <MagneticHover />,
  //   preview: <MagneticHover />,
  //   tags: ["react", "animation", "mouse-effect"],
  // },
  // {
  //   id: "liquid-glass",
  //   title: "Liquid Glass",
  //   description: "A liquid glass component with smooth transitions and hover effects.",
  //   component: <LiquidGlass />,
  //   preview: <LiquidGlass />,
  //   tags: ["react", "glass", "hover"],
  // }
];

