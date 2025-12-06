"use client";

import React, { useState } from "react";
import NotesIcon from "./assets/notes.svg";
import BookmarksIcon from "./assets/bookmarks.svg";
import IdeasIcon from "./assets/ideas.svg";
import InboxIcon from "./assets/inbox.svg";
import JournalIcon from "./assets/journal.svg";
import ChevronIcon from "./assets/chevron-right.svg";
import EllipsisIcon from "./assets/dots-horizontal.svg";

import { Avatar } from "@/components/fallback-avatar/FallbackAvatar";
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
        ]},
        {name: 'Events', icon: NotesIcon, nodes: []},
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

export default function NestedMenuSimple({ 
    showHeader = true, 
    height = "420px",
    fullWidthHover = true,
    defaultExpandedItems = [],
    hiddenItems = [],
    enableDragThreshold = true
}: { 
    showHeader?: boolean; 
    height?: string;
    fullWidthHover?: boolean;
    defaultExpandedItems?: string[];
    hiddenItems?: string[];
    enableDragThreshold?: boolean;
}) {
    // Filter out hidden items from the tree
    const filterHiddenItems = (nodes: Node[]): Node[] => {
        return nodes
            .filter(node => !hiddenItems.includes(node.name))
            .map(node => ({
                ...node,
                nodes: node.nodes ? filterHiddenItems(node.nodes) : undefined
            }));
    };
    
    const [items, setItems] = useState(filterHiddenItems(nodes));
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(defaultExpandedItems));
    
    // Configure sensors with optional distance threshold
    const mouseSensor = useSensor(MouseSensor, enableDragThreshold ? {
        activationConstraint: { distance: 4 },
    } : {});
    
    const touchSensor = useSensor(TouchSensor, enableDragThreshold ? {
        activationConstraint: { distance: 4 },
    } : {});
    
    const sensors = useSensors(mouseSensor, touchSensor);
    
    // Helper to find node by id
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
    
    // Helper to find parent array containing an item
    const findParentArray = (items: Node[], id: string, parent: Node[] = items): Node[] | null => {
        for (let i = 0; i < parent.length; i++) {
            if (parent[i].name === id) {
                return parent;
            }
            if (parent[i].nodes) {
                const found = findParentArray(items, id, parent[i].nodes);
                if (found) return found;
            }
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        // Drag started - no overlay needed
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (!over || active.id === over.id) {
            return;
        }
        
        setItems((currentItems) => {
            // Deep clone that preserves icon components
            const cloneTree = (nodes: Node[]): Node[] => {
                return nodes.map(node => ({
                    ...node,
                    icon: node.icon, // Preserve the icon component reference
                    nodes: node.nodes ? cloneTree(node.nodes) : undefined
                }));
            };
            
            const newItems = cloneTree(currentItems);
            
            // Find the parent arrays
            const activeParent = findParentArray(newItems, active.id as string);
            const overParent = findParentArray(newItems, over.id as string);
            
            if (activeParent && overParent && activeParent === overParent) {
                // Simple reorder within same parent
                const oldIndex = activeParent.findIndex(item => item.name === active.id);
                const newIndex = activeParent.findIndex(item => item.name === over.id);
                
                if (oldIndex !== -1 && newIndex !== -1) {
                    const reordered = arrayMove(activeParent, oldIndex, newIndex);
                    // Update the parent array
                    activeParent.splice(0, activeParent.length, ...reordered);
                }
            }
            
            return newItems;
        });
    };

    return (
        <div className="w-[260px] bg-[var(--color-gray1)] border border-[var(--color-gray6)] overflow-x-hidden overscroll-y-contain rounded-xl py-2 max-w-sm overflow-y-auto my-0 mx-auto shadow-[0_2px_5px_-2px_rgba(0,0,0,0.0.08)]" style={{ height }}>
            {showHeader && (
                <div className="px-4.5 pt-2 pb-4 mb-3 border-b border-[var(--color-gray6)] flex items-center gap-2.5">
                    <Avatar.Fallback size={22}>D</Avatar.Fallback>
                    <div className="flex flex-col items-start gap-0">
                        <p className="text-[var(--color-gray12)] text-sm font-medium mb-[-2px]">Adam Kuzma</p>
                    </div>
                </div>
            )}
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext items={items.map(item => item.name)} strategy={verticalListSortingStrategy}>
                    <ul className="px-2">
                        {items.map((node) => (
                            <FilesystemItem 
                                key={node.name} 
                                node={node} 
                                expandedItems={expandedItems}
                                setExpandedItems={setExpandedItems}
                                fullWidthHover={fullWidthHover}
                            />
                        ))}                   
                    </ul>
                </SortableContext>
            </DndContext>
        </div>
    );
}

function FilesystemItem({ 
    node, 
    depth = 0, 
    expandedItems, 
    setExpandedItems,
    fullWidthHover = true,
}: { 
    node: Node; 
    depth?: number;
    expandedItems: Set<string>;
    setExpandedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
    fullWidthHover?: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
        id: node.name,
        data: { type: 'item', node: node }
    });
    
    // Only show the top-level item being dragged (hide children during drag)
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    
    const isOpen = expandedItems.has(node.name) && !isDragging; // Collapse when dragging
    const Icon = node.icon;

    const iconColor = depth === 0 
        ? "text-[var(--color-gray11)]" 
        : depth === 1 
        ? "text-[var(--color-gray9)] opacity-80"
        : "text-[var(--color-gray9)] opacity-80";

    return (
        <li 
            ref={setNodeRef} 
            style={style} 
            key={node.name} 
            className="relative"
        >
            <span 
                style={depth > 0 && fullWidthHover ? {
                    marginLeft: `${-depth}rem`,
                    paddingLeft: `calc(${depth}rem + 0.5rem)`,
                } : undefined}
                className={`group flex items-center justify-between gap-1.5 transition-colors duration-200 rounded-md py-1 cursor-pointer ${
                    depth > 0 ? (fullWidthHover ? 'pr-1' : 'pr-1 pl-2') : 'pl-2 pr-1'
                } hover:bg-[var(--color-gray3)] active:bg-[var(--color-gray4)]`}
                {...attributes}
                {...listeners}
            >     
                <span className="flex items-center gap-0">
                    {node.nodes && node.nodes.length > 0 ? (
                        <button 
                            className="relative w-6 h-6 flex items-center justify-center p-0 transition duration-200 cursor-pointer hover:bg-[var(--color-gray5)] rounded-sm" 
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
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {Icon && (
                                <Icon className={`${iconColor} scale-95 absolute inset-0 group-hover:opacity-0 transition-opacity duration-200`} />
                            )}
                            <ChevronIcon className={`scale-100 opacity-0 group-hover:opacity-60 transition-all duration-200 ${isOpen ? 'rotate-90' : ''}`}/>
                        </button>
                    ) : (
                        Icon && <Icon className={`${iconColor} scale-95`} />
                    )}
                    <span className="text-[14px] text-[var(--color-gray12)] opacity-80 font-medium ml-1.5 select-none">
                        {node.name}
                    </span>
                </span>
                <button 
                    className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity duration-200 cursor-pointer hover:bg-[var(--color-gray5)] rounded-sm"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <EllipsisIcon className="text-[var(--color-gray12)]" />
                </button>
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
                                fullWidthHover={fullWidthHover}
                            />
                        ))}
                    </ul>
                </SortableContext>
            )}
        </li>   
    );
}

