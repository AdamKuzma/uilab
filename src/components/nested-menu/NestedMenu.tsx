"use client";

import { FolderIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

let folders = [
    {name: 'Home', folders: [
        {name: 'Movies', folders: [
            {name: 'Action', folders: [
                {name: 'Action 1', folders: [
                    {name: 'Popular'},
                    {name: 'Favorites'},
                    {name: 'Top Rated'},
                ]},
                {name: 'Action 2'},
                {name: 'Action 3'},
            ]},
            {name: 'Adventure'},
            {name: 'Comedy', folders: [
                {name: 'Comedy 1'},
                {name: 'Comedy 2'},
                {name: 'Comedy 3'},
            ]},
            {name: 'Drama'},
            {name: 'Fantasy'},
        ]}, 
        {name: 'Music', folders: [
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
        <div className="p-8 max-w-sm w-[300px] h-[600px] overflow-y-auto ml-0">
            <ul>
                {folders.map((folder) => (
                    <Folder key={folder.name} folder={folder} />
                ))}                   
            </ul>
        </div>
    );
}

interface FolderType {
    name: string;
    folders?: FolderType[];
}

function Folder({ folder }: { folder: FolderType }) {
    let [isOpen, setIsOpen] = useState(false);

    return (
        <li key={folder.name} className="my-1.5">
                <span className="flex items-center gap-1.5">
                    {folder.folders && folder.folders.length > 0 && (
                        <button onClick={() => setIsOpen(!isOpen)}>
                            <ChevronRightIcon className={`size-3 text-gray-600 ${isOpen ? 'rotate-90' : ''}`}/>
                        </button>
                    )}
                    <FolderIcon key={folder.name} className={`size-6 text-sky-500 ${!folder.folders || folder.folders.length === 0 ? 'ml-[18px]' : ''}`}/>
                    {folder.name}
                </span>
            {isOpen && (
                <ul className="pl-6">
                    {folder.folders?.map(folder => (
                        <Folder key={folder.name} folder={folder} />
                    ))}
                </ul>
            )}
        </li>   
    )
}