"use client";

import { useState } from "react";
import NestedMenu from "@/components/nested-menu/NestedMenu";
import NestedMenuSimple from "@/components/nested-menu/NestedMenuSimple";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import InboxIcon from "@/components/nested-menu/assets/inbox.svg";
import JournalIcon from "@/components/nested-menu/assets/journal.svg";

// Theme toggle component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
      <span className="toggle-slider"></span>
    </label>
  );
}

// Code block component with syntax highlighting
function CodeBlock({ code, language = "typescript", maxHeight }: { code: string; language?: string; maxHeight?: string }) {
  const { theme } = useTheme();
  
  return (
    <div className="my-6 rounded-lg border border-[var(--color-gray6)] overflow-hidden">
      <div className="px-4 py-2 border-b border-[var(--color-gray6)] bg-[var(--color-gray3)]">
        <span className="text-xs text-[var(--color-gray11)] font-mono">{language}</span>
      </div>
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        <SyntaxHighlighter
          language={language}
          style={theme === 'dark' ? vscDarkPlus : oneLight}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'var(--color-gray2)',
            fontSize: '13px',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Drop zone visualization component
function DropZoneVisualization() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const zones = [
    { id: 'above-inbox', label: 'above Inbox', top: '0%', height: '15%', hover: 'hover:bg-blue-500/10' },
    { id: 'inside-inbox', label: 'inside Inbox', top: '15%', height: '20%', hover: 'hover:bg-blue-500/20' },
    { id: 'below-inbox', label: 'below Inbox', top: '35%', height: '15%', hover: 'hover:bg-blue-500/10' },
    { id: 'above-journal', label: 'above Journal', top: '50%', height: '15%', hover: 'hover:bg-blue-500/10' },
    { id: 'inside-journal', label: 'inside Journal', top: '65%', height: '20%', hover: 'hover:bg-blue-500/20' },
    { id: 'below-journal', label: 'below Journal', top: '85%', height: '15%', hover: 'hover:bg-blue-500/10' },
  ];

  return renderDropZoneVisualization(zones, hoveredZone, setHoveredZone, 'Three drop zones');
}

// Normalized drop zone visualization component (with "between" zone)
function DropZoneVisualizationNormalized() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const zones = [
    { id: 'above-inbox', label: 'above Inbox', top: '0%', height: '15%', hover: 'hover:bg-blue-500/10' },
    { id: 'inside-inbox', label: 'inside Inbox', top: '15%', height: '20%', hover: 'hover:bg-blue-500/20' },
    { id: 'between', label: 'between items', top: '35%', height: '30%', hover: 'hover:bg-purple-500/10' },
    { id: 'inside-journal', label: 'inside Journal', top: '65%', height: '20%', hover: 'hover:bg-blue-500/20' },
    { id: 'below-journal', label: 'below Journal', top: '85%', height: '15%', hover: 'hover:bg-blue-500/10' },
  ];

  return renderDropZoneVisualization(zones, hoveredZone, setHoveredZone, 'Normalized drop zone');
}

// Shared rendering logic for drop zone visualizations
function renderDropZoneVisualization(
  zones: Array<{ id: string; label: string; top: string; height: string; hover: string }>,
  hoveredZone: string | null,
  setHoveredZone: (zone: string | null) => void,
  defaultText: string
) {

  return (
    <div className="grid grid-cols-1 gap-0 mb-12 mt-6 px-8 py-8 rounded-xl border border-[var(--color-gray6)] bg-[var(--color-gray3)]">
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Static visualization of drop zones */}
        <div className="w-[340px] rounded-2xl">
          <div className="relative rounded-xl bg-[var(--color-gray2)] border border-[var(--color-gray6)] overflow-hidden">
            {/* Content */}
            <div className="flex items-center gap-3 py-5 px-3 relative z-10">
              <div className="w-5 h-5 mt-[-2px]">
                <InboxIcon className="w-full h-full text-[var(--color-gray11)]" />
              </div>
              <span className="text-sm font-medium text-[var(--color-gray12)]">Inbox</span>
            </div>
            <div className="flex items-center gap-3 py-5 px-3 relative z-10">
              <div className="w-5 h-5 mt-[-2px]">
                <JournalIcon className="w-full h-full text-[var(--color-gray11)]" />
              </div>
              <span className="text-sm font-medium text-[var(--color-gray12)]">Journal</span>
            </div>
            
            {/* Hoverable zones */}
            {zones.map((zone, index) => {
              const isFirst = index === 0;
              const isLast = index === zones.length - 1;
              
              return (
                <div
                  key={zone.id}
                  className={`absolute left-0 right-0 ${zone.hover} transition-colors duration-150 cursor-pointer z-20 ${
                    isFirst ? 'rounded-t-xl' : ''
                  } ${isLast ? 'rounded-b-xl' : ''}`}
                  style={{
                    top: zone.top,
                    height: zone.height,
                  }}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                />
              );
            })}
            
            {/* Zone separators (dotted lines) */}
            <div className="absolute left-0 right-0 top-[15%] border-t border-dashed border-gray-300 pointer-events-none z-30" />
            <div className="absolute left-0 right-0 top-[35%] border-t border-dashed border-gray-300 pointer-events-none z-30" />
              <div className="absolute left-0 right-0 top-[50%] border-t border-gray-300 pointer-events-none z-30" />
            <div className="absolute left-0 right-0 top-[65%] border-t border-dashed border-gray-300 pointer-events-none z-30" />
            <div className="absolute left-0 right-0 top-[85%] border-t border-dashed border-gray-300 pointer-events-none z-30" />
          </div>
        </div>
        
        {/* Dynamic zone label below */}
        <div className="text-xs text-[var(--color-gray11)] mt-2 mb-[-4px] flex items-center justify-center">
          <span className={hoveredZone ? 'capitalize' : ''}>
            {hoveredZone ? zones.find(z => z.id === hoveredZone)?.label : defaultText}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NestedMenuArticle() {
  const router = useRouter();
  const { toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b border-[var(--color-gray6)] sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div
              className="inline-flex items-center cursor-pointer logo-container"
              onClick={toggleTheme}
              role="button"
              aria-label="Toggle theme"
            >
              <ThemeToggle />
              <h1 className="logo text-xl">UI Playground</h1>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[var(--color-gray11)] hover:text-[var(--color-gray12)] transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Playground
            </button>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-12 py-16">
        
        {/* Title Section */}
        <div className="mb-20">
            <h1 className="p-section">Design Details of Nested Lists</h1>
            <p className="p-text">
                I recently worked on a project where I designed a nested list tree component that lets you expand, collapse, and reorganize items through drag-and-drop. The kind of pattern you see in Figma layers, Notion sidebar, or Finder in macOS.
            </p>

            <p className="p-text">
                What surprised me was how many small interaction details sit beneath a pattern that feels so familiar on the surface. Hundreds of invisible decisions that make it feel simple and dependable.
            </p>
            <p className="p-text">
                In this article, I&apos;ll break down some of those details and explore the interaction choices that make nested lists feel better to use.
            </p> 
            <div className="grid grid-cols-1 gap-0 mt-4 mb-5 px-8 py-0 rounded-xl border border-[var(--color-gray6)] bg-[var(--color-gray3)]">
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                        <NestedMenu height="380px" defaultExpandedItems={['Journal']}/>
                    </div>
                </div>
            </div>
        </div>

         {/* The Basics */}
         <div className="mb-20">
            <p className="p-section">
                The Basics
            </p>
            <p className="p-text">
                To make the basic list foundation, I created a recursive list component. A recursive component renders itself for each child node, which keeps the whole tree structured under a single, consistent source of truth. This makes it much easier to maintain and extend the component later.
            </p>
            <div className="mt-4">
                <CodeBlock maxHeight="320px" code={`const items = [
  {
    name: "Inbox",
    nodes: [
      { name: "Today" },
      { name: "Later" }
    ]
  },
  {
    name: "Journal",
    nodes: [
      { name: "Trips" },
      { name: "Events" }
    ]
  }
];

function TreeItem({ node, depth = 0 }) {
  return (
    <li style={{ paddingLeft: depth * 12 }}>
      {node.name}

      {node.nodes && (
        <ul>
          {node.nodes.map(child => (
            <TreeItem key={child.name} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Tree() {
  return (
    <ul>
      {items.map(node => (
        <TreeItem key={node.name} node={node} />
      ))}
    </ul>
  );
}`} language="typescript" />
            </div>
        </div>

        {/* Types of Nested Lists */}
        <div className="mb-20">
            <p className="p-section">
                Types of Nested Lists
            </p>

            <p className="p-text">
                Nested lists can follow different interaction models. Some, like macOS Finder, use a strict folder-file hierarchy where item roles are clear: folders expand, files open. Others, like Notion, use a more flexible page-inside-page structure where a single item can act as both a container and a document.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-6 px-8 py-6 rounded-xl border border-[var(--color-gray6)] bg-[var(--color-gray3)]">
                Image
            </div>
            <p className="p-text">
                The component I’m building follows this second model. That dual role, combined with the constraints of a sidebar, creates a different set of interaction requirements. A lot of the decisions below come directly from observing how Notion handles these nuances as well as my own implementation improvements.  
            </p>
        </div>


        {/* Managing Horizontal Space */}
        <div className="mb-16">
            <p className="p-section">
                Managing Horizontal Space
            </p>

            <p className="p-text">
                In a sidebar, horizontal space is limited, and nested lists amplify that constraint. Almost every design decision comes from managing this width and there are some tradeoffs to be made.
            </p>
            <p className="p-text">
                Indentation has to be big enough to communicate structure, but small enough to leave room for item names. With too much indentation, item label begins truncating early.  
            </p>
        </div>


        {/* Expanding vs Opening */}
        <div className="mb-20">
            <p className="p-section">
                Expanding vs Opening
            </p>

            <p className="p-text">
                Nested lists often carry two separate actions: opening the item and expanding its children. The row opens the page; the chevron reveals what’s inside. When these cues aren’t clear, the list feels unpredictable.
            </p>
            <p className="p-text">
              Keeping chevrons always visible makes the affordance obvious, but it costs horizontal space. Long titles truncate sooner and the list looks heavier.  
            </p>
            <p className="p-text">
              To balance this, I swapped the item’s icon for a chevron on hover. This reveals the affordance only when you need it, while letting the text breathe by default.  
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mt-4 mb-5 px-8 py-0 rounded-xl border border-[var(--color-gray6)] bg-[var(--color-gray3)]">
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                    <NestedMenu width="fill" showHeader={false} alwaysShowChevron={true} height="320px" defaultExpandedItems={['Bookmarks', 'Books']} hiddenItems={['Ideas', 'Notes']}/>
                    <p className="text-xs text-[var(--color-gray11)] mt-4">Chevrons always visible</p>
                    </div>
                </div>
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                    <NestedMenu width="fill" showHeader={false} height="320px" defaultExpandedItems={['Bookmarks', 'Books']} hiddenItems={['Ideas', 'Notes']}/>
                    <p className="text-xs text-[var(--color-gray11)] mt-4">Chevrons swap on hover</p>
                    </div>
                </div>
            </div>
            <p className="text-xs text-center text-[var(--color-gray9)] mb-8">
                Visible chevrons reduce the available space for text.
            </p>
            <p className="p-text">
              Since on touch screens there’s no hover, chevrons should stay visible at mobile breakpoints. This keeps the behavior consistent.
            </p>
        </div>


        {/* Drag & Drop */}
        <div className="mb-20">
            <p className="p-section">
                Drag & Drop
            </p>

            <p className="p-text">
                To support dragging to reorder or nest items, I used a <code className="code">dnd-kit</code> library, since it offers fine control over collision behavior, rendering, and movement transforms.
            </p>
            <div className="mt-4">
                <CodeBlock maxHeight="320px"  code={`import { DndContext, SortableContext, useSortable } from "@dnd-kit/core";

function TreeItem({ node }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: node.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      {node.name}

      {node.children && (
        <ul>
          {node.children.map(child => (
            <TreeItem key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Tree({ items }) {
  return (
    <DndContext>
      <SortableContext items={items.map(i => i.id)}>
        <ul>
          {items.map(node => (
            <TreeItem key={node.id} node={node} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}`} language="typescript" />
            </div>
            <p className="p-text">
                A drag handle improves discoverability, but also adds visual weight and consumes horizontal space. I decided not to show a drag handle and simply let users drag the list items to rearrange or nest them. 
            </p>
            <p className="p-text">
                This keeps the UI cleaner and maximizes usable width, at the cost of being slightly less explicit. In products with less technical audiences, I would expose a drag handle to make the affordance clearer.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-6 px-8 py-6 rounded-xl border border-[var(--color-gray6)] bg-[var(--color-gray3)]">
               Visual of drag handle vs no handle
            </div>
        </div>


        {/* Context Matters */}
         <div className="mb-20">
            <p className="p-section">
                Context matters
            </p>

            <p className="p-text">
                The right choice depends on the context and audience. In productivity tools where users interact with the hierarchy daily, hover-only arrows and implicit drag behavior keep the UI clean. In consumer products with broader audiences, exposing more affordances upfront can be the better design.
            </p>
        </div>


        {/* Hover Dead Zones */}
          <div className="mb-20">
            <p className="p-section">
                Hover dead zones
            </p>

            <p className="p-text">
                Nested items are indented to visually indicate nesting hierarchy, which creates empty space on the left. If you hover in that empty area, the pointer is technically outside the item which causes unstable hover and drag targets.
            </p>
            <p className="p-text">
                I expanded the interactive area of each row so it still counts as &quot;hovering&quot; even when the pointer is inside the indentation region. 
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mt-4 mb-5 px-8 py-0 rounded-xl border border-[var(--color-gray6)] bg-[var(--color-gray3)]">
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                    <NestedMenu showHeader={false} width="fill" height="360px" fullWidthHover={false} defaultExpandedItems={['Journal', 'Trips', 'Summer']} hiddenItems={['Inbox', 'Bookmarks', 'Ideas', 'Notes', 'Events']} />
                    <p className="text-xs text-[var(--color-gray11)] mt-4">With dead zones</p>
                    </div>
                </div>
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                    <NestedMenu showHeader={false} width="fill" height="360px" defaultExpandedItems={['Journal', 'Trips', 'Summer']} hiddenItems={['Inbox', 'Bookmarks', 'Ideas', 'Notes', 'Events']}/>
                    <p className="text-xs text-[var(--color-gray11)] mt-4">No dead zones</p>
                    </div>
                </div>
            </div>
            <p className="text-xs text-center text-[var(--color-gray9)] mb-12">
                Try hovering in the left side empty area to see the difference.
            </p>
            <p className="p-text">
                To do this, I used negative left margins paired with matching padding.
            </p>
            <div className="mt-[-16px]">
                <CodeBlock code={`<li
  className="item"
  style={{
    // Expand the hover area into the indentation
    marginLeft: \`-\${depth}rem\`,
    paddingLeft: \`calc(\${depth}rem + 0.5rem)\`
  }}
>
  {node.name}
</li>`} language="typescript" />
            </div>
        </div>


        {/* Drop indicators */}
        <div className="mb-20">
            <p className="p-section">
                Drop Indicators
            </p>
            <p className="p-text">
                When dragging items to rearrange, moving as you drag looks cool and can work well with smaller or single-level lists - this is what Linear does for their sidebar. Initially trying it out, I ran into a challenge where my list items were rapidly shifting when moved around other expanded list items.
            </p>
            <div className="grid grid-cols-1 gap-0 mb-5 mt-4 px-8 py-0 rounded-xl border border-[var(--color-gray6)] bg-[var(--color-gray3)]">
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                    <NestedMenuSimple showHeader={false} height="320px"/>
                    <p className="text-xs text-[var(--color-gray11)] opacity-90 mt-4">Items move as you drag</p>
                    </div>
                </div>
            </div>
            <p className="text-xs text-center text-[var(--color-gray9)] mb-12">
                Try dragging an item around. Notice what happens when you move expanded items.
            </p>
            

            <p className="p-text">
                To solve for that, a common pattern is to use drop indicators instead. I’ve used line drop indicators for same-level placement between siblings and row highlight to indicate nesting inside a parent
            </p>
            <p className="p-text">
                I&apos;ve also decided to not move items mid-drag and keep a ghost copy of the dragged item. This prevents the items from jumping and keeps the pointer predicable, making the lists feel more consistent.
            </p> 

            <div className="grid grid-cols-1 gap-0 mt-4 mb-5 px-8 py-0 rounded-xl border border-[var(--color-gray6)] bg-[var(--color-gray3)]">
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                    <NestedMenu showHeader={false} height="320px"/>
                    <p className="text-xs text-[var(--color-gray11)] mt-4">Drop indicators</p>
                    </div>
                </div>
            </div>
            <p className="text-xs text-center text-[var(--color-gray9)] mb-12">
               Notice the difference between nesting and reordering drop indicators.
            </p>

        </div>
       

        {/* Defining drop zones */}
        <div className="mb-20">
            <p className="p-section">
                Defining Drop Zones
            </p>

            <p className="p-text">
              Drop indicators depend on where the pointer sits relative to an item. A simple model divides each row into three vertical regions: above, into, and below.
            </p>

            <DropZoneVisualization />

            <p className="p-text">
              When dragging between two siblings, this model can create a distracting flicker. As the pointer crosses the boundary between items, the indicator rapidly switches between above and below states.
            </p>
            <p className="p-text">
              To fix this, I normalized the drop location so that adjacent siblings share a single boundary. This removes the flicker and makes the drag feel stable.
            </p>

            <DropZoneVisualizationNormalized />


            <p className="p-text">
              This normalization only applies to siblings at the same level. When moving between levels, transitions remain visible so the user understands whether they’re dropping into a list or outside of it.
            </p>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-5 mt-6 px-8 py-0 rounded-xl border border-[var(--color-gray6)] bg-[var(--color-gray3)]">
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                    <NestedMenu showHeader={false} width="fill" height="300px" enableNormalization={false}/>
                    <p className="text-xs text-[var(--color-gray11)] mt-4">Three drop zones</p>
                    </div>
                </div>
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                    <NestedMenu showHeader={false} width="fill" height="300px" enableNormalization={true}/>
                    <p className="text-xs text-[var(--color-gray11)] mt-4">Normalized drop zone</p>
                    </div>
                </div>
            </div>
            <p className="text-xs text-center text-[var(--color-gray9)] mb-12">
                Try slowly dragging an item between siblings. Can you spot which one feels better?
            </p>

            {/* <CodeBlock code={`// Normalize drop location: "below item2" and "above item3" are the same if they're siblings
const getNormalizedDropLocation = (id: string, position: DropPosition): { id: string; position: DropPosition } => {
    if (position === 'into') {
        return { id, position };
    }
    
    const context = findNodeContext(items, id);
    if (!context) return { id, position };
    
    const { parent, index } = context;
    
    // If position is 'below', try to normalize to 'above' the next sibling
    if (position === 'below' && index < parent.length - 1) {
        const nextSibling = parent[index + 1];
        return { id: nextSibling.name, position: 'above' };
    }
    
    // If position is 'above' and we have a previous sibling, keep it as 'above' (already normalized)
    return { id, position };
};
                
            `} language="typescript" maxHeight="320px"/> */}

        </div>

         {/* Drag Threshold */}
         <div className="mb-5">
            <p className="p-section">
                Drag Threshold
            </p>

            <p className="p-text">
                Without a drag threshold, clicking on a list item triggers the drag immediately. This causes a small visual flash as the pressed state and the ghost item fight for attention.
            </p>
            <p className="p-text">
                To solve that, I added a 4px drag activation threshold, meaning the drag only begins after the pointer moves at least 4 pixels. This keeps the active press state cleaner while still supporting a smooth drag interaction.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-2 mt-6 px-8 py-18 rounded-xl border border-[var(--color-gray6)] bg-[var(--color-gray3)]">
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                    <NestedMenu showHeader={false} width="fill" height="300px" enableDragThreshold={false} enableHoverThresholdAfterDrag={false}/>
                    <p className="text-xs text-[var(--color-gray11)] mt-4">No drag threshold</p>
                    </div>
                </div>
                <div>
                    <div className="flex flex-col items-center justify-center p-8">
                    <NestedMenu showHeader={false} width="fill" height="300px" enableDragThreshold={true} enableHoverThresholdAfterDrag={true}/>
                    <p className="text-xs text-[var(--color-gray11)] mt-4">4px drag threshold</p>
                    </div>
                </div>
            </div>
        </div>
        <p className="text-xs text-center text-[var(--color-gray9)] ">
            Try clicking on a list item. See if you can spot the difference.
        </p>


        {/* Preventing Invalid Drops */}
        <div className="mb-5 mt-16">
            <p className="p-section">
                Just a Start
            </p>

            <p className="p-text">
                There are several additional behaviors worth exploring - things like auto-expanding a parent after a hover delay while dragging, keyboard navigation, and clearer focus states. 
            </p>
            <p className="p-text">
                I wrote this article to highlight some of the small but meaningful design decisions involved in making nested lists interactions feel smooth and predictable. 
            </p>
            <p className="p-text">
                These details are easy to overlook, but in interfaces people use every day, they compound quickly and make a noticeable difference in how the product feels overall. 
            </p>
            <p className="p-text">
                I hope this article encourages you to look more closely at the small interaction choices that shape the tools you use and build.
            </p>
        </div>

        
       </article>

      {/* Footer */}
      <footer className="mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-xs text-[var(--color-gray11)]">Designed and built by Adam Kuzma</p>
        </div>
      </footer>
    </div>
  );
}

