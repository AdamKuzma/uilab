"use client";

import { FolderIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
// import "./styles.css";

type Node = {
    name: string;
    nodes?: Node[];
}

const nodes: Node[] = [
    {name: 'Home', nodes: [
        {name: 'Movies', nodes: [
            {name: 'Action', nodes: [
                {name: 'Action 1', nodes: [
                    {name: 'Popular'},
                    {name: 'Favorites'},
                    {name: 'Top Rated'},
                ]},
                {name: 'Action 2'},
                {name: 'Action 3'},
            ]},
            {name: 'Adventure'},
            {name: 'Comedy', nodes: [
                {name: 'Comedy 1'},
                {name: 'Comedy 2'},
                {name: 'Comedy 3'},
            ]},
            {name: 'Drama'},
            {name: 'Fantasy'},
        ]}, 
        {name: 'Music', nodes: [
            {name: 'Rock'},
            {name: 'Pop'},
            {name: 'Jazz'},
            {name: 'Classical'},
            {name: 'Electronic'},
        ]}, 
        {name: 'Pictures'},
        {name: 'Documents'}
    ]},  
];

export default function NestedMenu() {
    return (
        <div className="shadow-[0_2px_5px_-2px_rgba(0,0,0,0.0.08)] bg-[var(--color-gray1)] border border-[var(--color-gray5)] rounded-xl px-3 py-2 max-w-sm w-[260px] h-[500px] overflow-y-auto my-0 mx-auto">
            <ul>
                {nodes.map((node) => (
                    <FilesystemItem key={node.name} node={node} />
                ))}                   
            </ul>
        </div>
    );
}

function FilesystemItem({ node }: { node: Node }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <li key={node.name} className="my-1.5">
                <span className="group flex items-center justify-between gap-1.5 cursor-pointer transition duration-200 hover:bg-[var(--color-gray3)] rounded-md pl-2 pr-0.5 py-0.5">
                    {/* <FolderIcon key={node.name} className={`size-6 text-sky-500 ${!node.nodes || node.nodes.length === 0 ? 'ml-[18px]' : ''}`}/> */}
                    <span className="text-[15px] text-[var(--color-gray12)]">{node.name}</span>
                    {node.nodes && node.nodes.length > 0 && (
                        <button className="p-1 transition duration-200 cursor-pointer hover:bg-[var(--color-gray5)] rounded-sm" onClick={() => setIsOpen(!isOpen)}>
                            <ChevronRightIcon className={`size-3.5 text-[var(--color-gray9)] opacity-0 group-hover:opacity-100 transition-opacity ${isOpen ? 'rotate-90' : ''}`}/>
                        </button>
                    )}
                </span>
            {isOpen && (
                <ul className="pl-4">
                    {node.nodes?.map(node => (
                        <FilesystemItem key={node.name} node={node} />
                    ))}
                </ul>
            )}
        </li>   
    )
}