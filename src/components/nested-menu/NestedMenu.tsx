"use client";

import { useState } from "react";
import NotesIcon from "./assets/notes.svg";
import BookmarksIcon from "./assets/bookmarks.svg";
import IdeasIcon from "./assets/ideas.svg";
import InboxIcon from "./assets/inbox.svg";
import JournalIcon from "./assets/journal.svg";
import ChevronIcon from "./assets/chevron-right.svg";

import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// import "./styles.css";

type Node = {
    name: string;
    icon?: React.ComponentType<{ className?: string }>;
    nodes?: Node[];
}

const nodes: Node[] = [
    {name: 'Inbox', icon: InboxIcon, nodes: [
        {name: 'Today', icon: NotesIcon, nodes: [
            {name: 'Calls', icon: NotesIcon},
            {name: 'Emails', icon: NotesIcon},
            {name: 'Messages', icon: NotesIcon},
        ]}, 
        {name: 'Later', icon: NotesIcon, nodes: [
            {name: 'Calls', icon: NotesIcon},
            {name: 'Emails', icon: NotesIcon},
            {name: 'Messages', icon: NotesIcon},
        ]}, 
        {name: 'Past', icon: NotesIcon},
    ]},
    {name: 'Journal', icon: JournalIcon, nodes: [
        {name: 'Trips', icon: NotesIcon, nodes: [
            {name: 'Summer', icon: NotesIcon, nodes: [
                {name: 'Boston', icon: NotesIcon},
                {name: 'New York', icon: NotesIcon},
                {name: 'San Francisco', icon: NotesIcon},
            ]},
            {name: 'Spring', icon: NotesIcon, nodes: [
                {name: 'Japan', icon: NotesIcon},
                {name: 'Bangkok', icon: NotesIcon},
                {name: 'Shanghai', icon: NotesIcon},
            ]},
            {name: 'Winter', icon: NotesIcon, nodes: [
                {name: 'Guatemala', icon: NotesIcon},
                {name: 'Mexico City', icon: NotesIcon},
                {name: 'Sao Paulo', icon: NotesIcon},
            ]},
            {name: 'Autumn', icon: NotesIcon, nodes: [
                {name: 'Barcelona', icon: NotesIcon},
                {name: 'Porto', icon: NotesIcon},
                {name: 'Paris', icon: NotesIcon},
            ]},
        ]},
        {name: 'Events', icon: NotesIcon, nodes: [
        ]},
    ]},   
    {name: 'Notes', icon: NotesIcon, nodes: [
        {name: 'Work', icon: NotesIcon, nodes: [
            {name: 'Designs', icon: NotesIcon},
            {name: 'Clients', icon: NotesIcon},
            {name: 'Meetings', icon: NotesIcon},
        ]},
        {name: 'Personal', icon: NotesIcon, nodes: [
            {name: 'Health', icon: NotesIcon},
            {name: 'Investments', icon: NotesIcon},
            {name: 'Family', icon: NotesIcon},
        ]},
    ]},
    {name: 'Ideas', icon: IdeasIcon, nodes: [
        {name: 'Apps', icon: NotesIcon, nodes: [
            {name: 'Weather', icon: NotesIcon},
            {name: 'News', icon: NotesIcon},
            {name: 'Music', icon: NotesIcon},
        ]},
        {name: 'Components', icon: NotesIcon, nodes: [
            {name: 'Tabs', icon: NotesIcon},
            {name: 'Dropdown', icon: NotesIcon},
            {name: 'Menu', icon: NotesIcon},
        ]},
    ]},
    {name: 'Bookmarks', icon: BookmarksIcon, nodes: [
        {name: 'Books', icon: NotesIcon, nodes: [
            {name: 'The Great Gatsby', icon: NotesIcon},
            {name: 'To Kill a Mockingbird', icon: NotesIcon},
            {name: '1984', icon: NotesIcon},
        ]},
        {name: 'Movies', icon: NotesIcon, nodes: [
            {name: 'The Godfather', icon: NotesIcon},
            {name: 'The Dark Knight', icon: NotesIcon},
            {name: 'The Lord of the Rings', icon: NotesIcon},
        ]},
    ]},
];

export default function NestedMenu() {
    const [items, setItems] = useState(nodes);
    const [activeNode, setActiveNode] = useState<Node | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Helper function to find a node by id
    const findNodeById = (items: Node[], id: string): Node | null => {
        for (const item of items) {
            if (item.name === id) return item;
            if (item.nodes) {
                const found = findNodeById(item.nodes, id);
                if (found) return found;
            }
        }
        return null;
    };

    // Helper function to find and update nested items
    const findAndReorderNested = (items: Node[], activeId: string, overId: string): Node[] => {
        return items.map(item => {
            if (item.nodes) {
                const activeIndex = item.nodes.findIndex(n => n.name === activeId);
                const overIndex = item.nodes.findIndex(n => n.name === overId);
                
                if (activeIndex !== -1 && overIndex !== -1) {
                    // Found the items in this level, reorder them
                    const newNodes = [...item.nodes];
                    const [movedItem] = newNodes.splice(activeIndex, 1);
                    newNodes.splice(overIndex, 0, movedItem);
                    return { ...item, nodes: newNodes };
                }
                
                // Recursively search deeper
                return { ...item, nodes: findAndReorderNested(item.nodes, activeId, overId) };
            }
            return item;
        });
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const node = findNodeById(items, active.id as string);
        setActiveNode(node);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            setItems((items) => {
                // Try top level first
                const oldIndex = items.findIndex(item => item.name === active.id);
                const newIndex = items.findIndex(item => item.name === over.id);
                
                if (oldIndex !== -1 && newIndex !== -1) {
                    // Top level reorder
                    const newItems = [...items];
                    const [movedItem] = newItems.splice(oldIndex, 1);
                    newItems.splice(newIndex, 0, movedItem);
                    return newItems;
                }
                
                // Try nested levels
                return findAndReorderNested(items, active.id as string, over.id as string);
            });
        }
        
        setActiveNode(null);
    };

    return (
        <div className="w-[260px] h-[420px] bg-[var(--color-gray1)] border border-[var(--color-gray6)] overflow-x-hidden overscroll-y-contain rounded-xl py-2 max-w-sm overflow-y-auto my-0 mx-auto shadow-[0_2px_5px_-2px_rgba(0,0,0,0.0.08)]" onWheel={(e) => e.stopPropagation()}>
            <div className="px-4.5 pt-2.5 pb-4 mb-3 border-b border-[var(--color-gray6)]">
                <p className="text-[var(--color-gray12)] text-sm font-medium mb-[-2px]">Adam Kuzma</p>
                <span className="text-[var(--color-gray11)] text-sm">menu@component.com</span>
            </div>
            <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                <SortableContext items={items.map(item => item.name)} strategy={verticalListSortingStrategy}>
                    <ul className="px-2">
                        {items.map((node) => (
                            <FilesystemItem 
                                key={node.name} 
                                node={node} 
                                expandedItems={expandedItems}
                                setExpandedItems={setExpandedItems}
                            />
                        ))}                   
                    </ul>
                </SortableContext>
                <DragOverlay>
                    {activeNode ? (
                        <div className="opacity-50">
                            <DragOverlayItem node={activeNode} expandedItems={expandedItems} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

function FilesystemItem({ 
    node, 
    depth = 0, 
    expandedItems, 
    setExpandedItems 
}: { 
    node: Node; 
    depth?: number;
    expandedItems: Set<string>;
    setExpandedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
        id: node.name 
    });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };
    
    const isOpen = expandedItems.has(node.name);
    const Icon = node.icon;

    const iconColor = depth === 0 
        ? "text-[var(--color-gray11)]" 
        : depth === 1 
        ? "text-[var(--color-gray9)] opacity-80"
        : "text-[var(--color-gray9)] opacity-80";

    return (
        <li ref={setNodeRef} style={style} key={node.name} className="">
            <span 
                className="group flex items-center justify-between gap-1.5 transition duration-200 hover:bg-[var(--color-gray3)] rounded-md pl-2 pr-1 py-1 cursor-pointer"
            >     
                <span 
                    className="flex items-center gap-0"
                    {...attributes}
                    {...listeners}
                > 
                    {Icon && <Icon className={`${iconColor} scale-95`} />}
                    <span className="text-[14px] text-[var(--color-gray12)] font-medium ml-1.5 select-none">
                        {node.name}
                    </span>
                </span>
                
                
                {node.nodes && node.nodes.length > 0 && (
                    <button 
                        className="p-0 transition duration-200 cursor-pointer hover:bg-[var(--color-gray5)] rounded-sm" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpandedItems(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(node.name)) {
                                    newSet.delete(node.name);
                                } else {
                                    newSet.add(node.name);
                                }
                                return newSet;
                            });
                        }}
                    >
                        <ChevronIcon className={`scale-100 opacity-0 group-hover:opacity-60 transition-all duration-200 ${isOpen ? 'rotate-90' : ''}`}/>
                    </button>
                )}
            </span>
            {isOpen && node.nodes && node.nodes.length > 0 && (
                <SortableContext items={node.nodes.map(n => n.name)} strategy={verticalListSortingStrategy}>
                    <ul className="pl-4">
                        {node.nodes.map(childNode => (
                            <FilesystemItem 
                                key={childNode.name} 
                                node={childNode} 
                                depth={depth + 1}
                                expandedItems={expandedItems}
                                setExpandedItems={setExpandedItems}
                            />
                        ))}
                    </ul>
                </SortableContext>
            )}
        </li>   
    );
}

// Drag overlay component - shows tree structure matching the actual expanded state
function DragOverlayItem({ 
    node, 
    depth = 0, 
    expandedItems 
}: { 
    node: Node; 
    depth?: number;
    expandedItems: Set<string>;
}) {
    const Icon = node.icon;
    const isExpanded = expandedItems.has(node.name);
    
    const iconColor = depth === 0 
        ? "text-[var(--color-gray11)]" 
        : depth === 1 
        ? "text-[var(--color-gray9)] opacity-80"
        : "text-[var(--color-gray9)] opacity-80";
    
    return (
        <div>
            <div className="flex items-center justify-between gap-1.5 rounded-md pl-2 pr-1 py-1">
                <span className="flex items-center gap-0">
                    {Icon && <Icon className={`${iconColor} scale-95`} />}
                    <span className="text-[14px] text-[var(--color-gray12)] font-medium ml-1.5 select-none">
                        {node.name}
                    </span>
                </span>
                {node.nodes && node.nodes.length > 0 && (
                    <ChevronIcon className={`scale-100 opacity-60 ${isExpanded ? 'rotate-90' : ''}`} />
                )}
            </div>
            {isExpanded && node.nodes && node.nodes.length > 0 && (
                <div className="pl-4">
                    {node.nodes.map(childNode => (
                        <DragOverlayItem 
                            key={childNode.name} 
                            node={childNode} 
                            depth={depth + 1}
                            expandedItems={expandedItems}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}