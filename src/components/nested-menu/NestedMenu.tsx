"use client";

import React, { useState } from "react";
import NotesIcon from "./assets/notes.svg";
import BookmarksIcon from "./assets/bookmarks.svg";
import IdeasIcon from "./assets/ideas.svg";
import InboxIcon from "./assets/inbox.svg";
import JournalIcon from "./assets/journal.svg";
import ChevronIcon from "./assets/chevron-right.svg";
import EllipsisIcon from "./assets/dots-horizontal.svg";
import "./styles.css";

import { Avatar } from "@/components/fallback-avatar/FallbackAvatar";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent, pointerWithin, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type DropPosition = 'above' | 'below' | 'into' | null;

type Node = {
    name: string;
    icon?: React.ComponentType<{ className?: string }>;
    nodes?: Node[]; // recursive reference
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

export default function NestedMenu({ 
    showHeader = true, 
    height = "420px",
    width = "260px",
    fullWidthHover = true,
    defaultExpandedItems = [],
    hiddenItems = [],
    enableDragThreshold = true,
    enableNormalization = true,
    alwaysShowChevron = false,
    enableHoverThresholdAfterDrag = true
}: { 
    showHeader?: boolean; 
    height?: string;
    width?: string;
    fullWidthHover?: boolean;
    defaultExpandedItems?: string[];
    hiddenItems?: string[];
    enableDragThreshold?: boolean;
    enableNormalization?: boolean;
    alwaysShowChevron?: boolean;
    enableHoverThresholdAfterDrag?: boolean;
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
    const [activeNode, setActiveNode] = useState<Node | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(defaultExpandedItems));
    const [overId, setOverId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition>(null);
    const pointerYRef = React.useRef<number>(0);
    const middleZoneStartTimeRef = React.useRef<number | null>(null);
    const rafRef = React.useRef<number | null>(null);
    const lastOverRectRef = React.useRef<{ top: number; height: number; } | null>(null);
    const overIdChangeTimeRef = React.useRef<number>(0);
    
    // Track normalized drop location to prevent flashing between adjacent items
    const [normalizedDropTarget, setNormalizedDropTarget] = React.useState<{ id: string; position: DropPosition } | null>(null);
    
    // Track hover threshold after drag ends
    const [hoverDisabledAfterDrag, setHoverDisabledAfterDrag] = React.useState(false);
    const dropPositionRef = React.useRef<{ x: number; y: number } | null>(null);
    
    // Keep cursor as pointer during drag
    React.useEffect(() => {
        if (activeNode) {
            const originalCursor = document.body.style.cursor;
            document.body.style.cursor = 'pointer';
            return () => {
                document.body.style.cursor = originalCursor;
            };
        }
    }, [activeNode]);
    
    // Track mouse movement after drag to enable hover threshold
    React.useEffect(() => {
        if (!enableHoverThresholdAfterDrag || !hoverDisabledAfterDrag || !dropPositionRef.current) return;
        
        const handleMouseMove = (e: MouseEvent) => {
            const dropPos = dropPositionRef.current;
            if (!dropPos) return;
            
            const distance = Math.sqrt(
                Math.pow(e.clientX - dropPos.x, 2) + 
                Math.pow(e.clientY - dropPos.y, 2)
            );
            
            if (distance >= 4) {
                setHoverDisabledAfterDrag(false);
                dropPositionRef.current = null;
            }
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [hoverDisabledAfterDrag, enableHoverThresholdAfterDrag]);
    
    // Configure sensors with optional distance threshold
    const mouseSensor = useSensor(MouseSensor, enableDragThreshold ? {
        activationConstraint: {
            distance: 4,
        },
    } : {});
    
    const touchSensor = useSensor(TouchSensor, enableDragThreshold ? {
        activationConstraint: {
            distance: 4,
        },
    } : {});
    
    const sensors = useSensors(mouseSensor, touchSensor);
    
    // Helper to find the parent array and index of a node
    const findNodeContext = React.useCallback((items: Node[], targetId: string, parent: Node[] = items): { parent: Node[]; index: number } | null => {
        for (let i = 0; i < parent.length; i++) {
            if (parent[i].name === targetId) {
                return { parent, index: i };
            }
            if (parent[i].nodes) {
                const found = findNodeContext(items, targetId, parent[i].nodes);
                if (found) return found;
            }
        }
        return null;
    }, []);
    
    // Helper function to find a node by id
    const findNodeById = React.useCallback((items: Node[], id: string): Node | null => {
        for (const item of items) {
            if (item.name === id) return item;
            if (item.nodes) {
                const found = findNodeById(item.nodes, id);
                if (found) return found;
            }
        }
        return null;
    }, []);

    // Helper function to check if target is a descendant of parent
    const isDescendantOf = React.useCallback((items: Node[], parentId: string, targetId: string): boolean => {
        const parent = findNodeById(items, parentId);
        if (!parent || !parent.nodes) return false;
        
        // Check direct children
        if (parent.nodes.some(node => node.name === targetId)) return true;
        
        // Check recursively in descendants
        for (const child of parent.nodes) {
            if (isDescendantOf(items, child.name, targetId)) return true;
        }
        
        return false;
    }, [findNodeById]);
    
    // Normalize drop location: "below item2" and "above item3" are the same if they're siblings
    const getNormalizedDropLocation = React.useCallback((id: string, position: DropPosition): { id: string; position: DropPosition } => {
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
    }, [items, findNodeContext]);
    
    // Track pointer position during drag
    const pointerXRef = React.useRef<number>(0);
    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            pointerYRef.current = e.clientY;
            pointerXRef.current = e.clientX;
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    
    // Continuously check position during drag
    React.useEffect(() => {
        if (!activeNode) return;
        
        const checkPosition = () => {
            if (lastOverRectRef.current && overId) {
                const rect = lastOverRectRef.current;
                const y = pointerYRef.current - rect.top;
                const height = rect.height;
                
                // Check if trying to drop parent into its descendant
                const isInvalidTarget = activeNode && (activeNode.name === overId || isDescendantOf(items, activeNode.name, overId));
                
                // If hovering over an invalid target, don't show any indicators
                if (isInvalidTarget) {
                    setNormalizedDropTarget(null);
                    setDropPosition(null);
                } else {
                    // Determine zone
                    const topThreshold = height * 0.33;
                    const bottomThreshold = height * 0.67;
                    
                    const isMiddleZone = y >= topThreshold && y <= bottomThreshold;
                    
                    let newPosition: DropPosition = null;
                    
                    if (isMiddleZone) {
                        newPosition = 'into';
                    } else {
                        // In top or bottom zone - show line indicators
                        if (y < topThreshold) {
                            newPosition = 'above';
                        } else {
                            newPosition = 'below';
                        }
                    }
                    
                    // Conditionally normalize the drop location
                    const normalized = enableNormalization 
                        ? getNormalizedDropLocation(overId, newPosition)
                        : { id: overId, position: newPosition };
                    
                    // Update state if normalized location changed
                    setNormalizedDropTarget(prev => {
                        if (!prev || prev.id !== normalized.id || prev.position !== normalized.position) {
                            return normalized;
                        }
                        return prev;
                    });
                    
                    // Always keep dropPosition in sync for drag end
                    if (dropPosition !== newPosition) {
                        setDropPosition(newPosition);
                    }
                }
            }
            
            rafRef.current = requestAnimationFrame(checkPosition);
        };
        
        rafRef.current = requestAnimationFrame(checkPosition);
        
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [activeNode, overId, dropPosition, items, enableNormalization, getNormalizedDropLocation, isDescendantOf]);

    // Helper function to remove a node from anywhere in the tree
    const removeNode = (items: Node[], nodeId: string): { items: Node[], removed: Node | null } => {
        let removedNode: Node | null = null;
        
        const newItems = items.filter(item => {
            if (item.name === nodeId) {
                removedNode = item;
                return false;
            }
            return true;
        }).map(item => {
            if (item.nodes) {
                const result = removeNode(item.nodes, nodeId);
                if (result.removed) {
                    removedNode = result.removed;
                    return { ...item, nodes: result.items };
                }
            }
            return item;
        });
        
        return { items: newItems, removed: removedNode };
    };

    // Helper function to insert a node at a specific position
    const insertNode = (
        items: Node[], 
        nodeToInsert: Node, 
        targetId: string, 
        position: DropPosition
    ): Node[] => {
        if (position === 'into') {
            // Insert as child of target
            return items.map(item => {
                if (item.name === targetId) {
                    return {
                        ...item,
                        nodes: [...(item.nodes || []), nodeToInsert]
                    };
                }
                if (item.nodes) {
                    return {
                        ...item,
                        nodes: insertNode(item.nodes, nodeToInsert, targetId, position)
                    };
                }
                return item;
            });
        } else {
            // Insert above or below target at the same level
            const targetIndex = items.findIndex(item => item.name === targetId);
            
            if (targetIndex !== -1) {
                const newItems = [...items];
                const insertIndex = position === 'above' ? targetIndex : targetIndex + 1;
                newItems.splice(insertIndex, 0, nodeToInsert);
                return newItems;
            }
            
            // Target not at this level, search deeper
            return items.map(item => {
                if (item.nodes) {
                    return {
                        ...item,
                        nodes: insertNode(item.nodes, nodeToInsert, targetId, position)
                    };
                }
                return item;
            });
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const node = findNodeById(items, active.id as string);
        setActiveNode(node);
        middleZoneStartTimeRef.current = null;
        setNormalizedDropTarget(null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over, active } = event;
        
        if (!over || !active || over.id === active.id) {
            lastOverRectRef.current = null;
            setOverId(null);
            setDropPosition(null);
            return;
        }
        
        // Track when we change items
        if (over.id !== overId) {
            overIdChangeTimeRef.current = Date.now();
        }
        
        // Store rect for polling (just the props we need)
        if (over.rect) {
            lastOverRectRef.current = {
                top: over.rect.top,
                height: over.rect.height
            };
        }
        
        setOverId(over.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        // Capture cursor position at drop for hover threshold
        if (enableHoverThresholdAfterDrag) {
            dropPositionRef.current = {
                x: pointerXRef.current,
                y: pointerYRef.current
            };
            setHoverDisabledAfterDrag(true);
        }
        
        // Clear middle zone tracking
        middleZoneStartTimeRef.current = null;
        setNormalizedDropTarget(null);
        
        if (over && active.id !== over.id) {
            // Prevent dropping into itself or its descendants
            if (active.id === over.id || isDescendantOf(items, active.id as string, over.id as string)) {
                console.log('❌ Invalid drop: Cannot drop parent into or near its descendants');
                setActiveNode(null);
                setOverId(null);
                setDropPosition(null);
                setHoverDisabledAfterDrag(false);
                dropPositionRef.current = null;
                return; // Abort the drop
            }
            
            const finalDropPosition = dropPosition || 'above'; // Default to 'above' if not set
            
            setItems((currentItems) => {
                // Remove the node from its current position
                const { items: itemsAfterRemoval, removed } = removeNode(currentItems, active.id as string);
                
                if (!removed) return currentItems;
                
                // Insert at the new position
                return insertNode(itemsAfterRemoval, removed, over.id as string, finalDropPosition);
            });
            
            // If dropping into an item, auto-expand it
            if (finalDropPosition === 'into') {
                setExpandedItems(prev => {
                    const newSet = new Set(prev);
                    newSet.add(over.id as string);
                    return newSet;
                });
            }
        }
        
        setActiveNode(null);
        setOverId(null);
        setDropPosition(null);
    };

    const isFill = width === 'fill';
    const isAuto = width === 'auto';
    const widthStyle = isFill ? { height, width: '100%' } : { height, width };
    
    return (
        <div className={`bg-[var(--color-gray1)] border border-[var(--color-gray6)] overflow-x-hidden overscroll-y-contain rounded-xl py-2 overflow-y-auto ${isFill ? 'w-full' : 'my-0 mx-auto'} ${isAuto || isFill ? '' : 'max-w-sm'} shadow-[0_2px_5px_-2px_rgba(0,0,0,0.0.08)]`} style={widthStyle} onWheel={(e) => e.stopPropagation()}>
            {showHeader && (
                <div className="px-4.5 pt-2 pb-4 mb-3 border-b border-[var(--color-gray6)] flex items-center gap-2.5">
                    <Avatar.Fallback size={22}>D</Avatar.Fallback>
                    <div className="flex flex-col items-start gap-0">
                        <p className="text-[var(--color-gray12)] text-sm font-medium mb-[-2px]">Adam Kuzma</p>
                        {/* <span className="text-[var(--color-gray11)] text-sm">Personal Space</span> */}
                    </div>
                </div>
            )}
            <DndContext 
                sensors={sensors}
                collisionDetection={pointerWithin} 
                onDragStart={handleDragStart} 
                onDragOver={handleDragOver}
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
                                normalizedDropTarget={normalizedDropTarget}
                                isAnyDragging={!!activeNode}
                                fullWidthHover={fullWidthHover}
                                alwaysShowChevron={alwaysShowChevron}
                                hoverDisabledAfterDrag={enableHoverThresholdAfterDrag ? hoverDisabledAfterDrag : false}
                            />
                        ))}                   
                    </ul>
                </SortableContext>
                <DragOverlay style={{ cursor: 'pointer' }}>
                    {activeNode ? (
                        <div className="opacity-50 cursor-pointer">
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
    setExpandedItems,
    normalizedDropTarget,
    isAnyDragging,
    fullWidthHover = true,
    alwaysShowChevron = false,
    hoverDisabledAfterDrag = false,
}: { 
    node: Node; 
    depth?: number;
    expandedItems: Set<string>;
    setExpandedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
    normalizedDropTarget?: { id: string; position: DropPosition } | null;
    isAnyDragging?: boolean;
    fullWidthHover?: boolean;
    alwaysShowChevron?: boolean;
    hoverDisabledAfterDrag?: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
        id: node.name,
        data: {
            type: 'item',
            node: node
        }
    });
    
    const style = {
        transform: isAnyDragging ? undefined : CSS.Transform.toString(transform),
        transition: isAnyDragging ? undefined : transition,
        opacity: isDragging ? 1 : 1,
    };
    
    // Check if this item should show drop indicators based on normalized target
    const isOver = normalizedDropTarget?.id === node.name;
    const dropPosition = isOver ? normalizedDropTarget?.position : null;
    
    const isOpen = expandedItems.has(node.name);
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
            {isOver && dropPosition === 'above' && (
                <div className="absolute -top-[1px] left-0 right-0 h-[2px] bg-blue-400 rounded-full z-10 animate-in fade-in duration-150" />
            )}
            {isOver && dropPosition === 'below' && (
                <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-blue-400 rounded-full z-10 animate-in fade-in duration-150" />
            )}
            <span 
                style={depth > 0 && fullWidthHover ? {
                    marginLeft: `${-depth}rem`,
                    paddingLeft: `calc(${depth}rem + 0.5rem)`,
                } : undefined}
                className={`${hoverDisabledAfterDrag ? '' : 'group'} flex items-center justify-between gap-1.5 transition-colors duration-200 rounded-md py-1 cursor-pointer ${
                    depth > 0 ? (fullWidthHover ? 'pr-1' : 'pr-1 pl-2') : 'pl-2 pr-1'
                } ${
                    isOver && dropPosition === 'into' 
                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                        : isDragging 
                        ? '' 
                        : hoverDisabledAfterDrag 
                        ? 'active:bg-[var(--color-gray4)]'
                        : 'hover:bg-[var(--color-gray3)] active:bg-[var(--color-gray4)]'
                }`}
                {...attributes}
                {...listeners}
            >     
                <span 
                    className="flex items-center min-w-0 flex-1"
                >
                    {node.nodes && node.nodes.length > 0 ? (
                        alwaysShowChevron ? (
                            // Always show chevron mode: chevron + icon side by side
                            <>
                                <button 
                                    className="w-6 h-6 flex items-center justify-center flex-shrink-0 p-0 transition duration-200 cursor-pointer hover:bg-[var(--color-gray5)] rounded-sm" 
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
                                    <ChevronIcon className={`scale-90 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}/>
                                </button>
                                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    {Icon && <Icon className={`${iconColor} scale-95`} />}
                                </div>
                            </>
                        ) : (
                            // Original mode: icon that becomes chevron on hover
                            <button 
                                className="relative w-6 h-6 flex items-center justify-center flex-shrink-0 p-0 transition duration-200 cursor-pointer hover:bg-[var(--color-gray5)] rounded-sm" 
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
                        )
                    ) : (
                        <>
                            {alwaysShowChevron && <div className="w-6 h-6 flex-shrink-0" />}
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                {Icon && <Icon className={`${iconColor} scale-95`} />}
                            </div>
                        </>
                    )}
                    <span className="text-[14px] text-[var(--color-gray12)] opacity-80 font-medium ml-1.5 select-none truncate min-w-0">
                        {node.name}
                    </span>
                </span>
                <button 
                    className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity duration-200 cursor-pointer hover:bg-[var(--color-gray5)] rounded-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Add your context menu logic here
                    }}
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
                                normalizedDropTarget={normalizedDropTarget}
                                isAnyDragging={isAnyDragging}
                                fullWidthHover={fullWidthHover}
                                hoverDisabledAfterDrag={hoverDisabledAfterDrag}
                                alwaysShowChevron={alwaysShowChevron}
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
            <div 
                style={depth > 0 ? {
                    marginLeft: `${-depth}rem`,
                    paddingLeft: `calc(${depth}rem + 0.5rem)`,
                } : undefined}
                className={`bg-[var(--color-gray4)] rounded-md flex items-center justify-between gap-1.5 py-1 ${
                    depth > 0 ? 'pr-1' : 'pl-2 pr-1'
                }`}
            >
                <span className="flex items-center gap-0">
                    {node.nodes && node.nodes.length > 0 ? (
                        <div className="w-6 h-6 flex items-center justify-center">
                            <ChevronIcon className={`scale-100 opacity-60 ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                    ) : (
                        Icon && <Icon className={`${iconColor} scale-95`} />
                    )}
                    <span className="text-[14px] text-[var(--color-gray12)] font-medium ml-1.5 select-none">
                        {node.name}
                    </span>
                </span>
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