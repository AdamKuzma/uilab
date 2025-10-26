"use client";

import { FolderIcon } from "@heroicons/react/24/solid";

export default function NestedMenu() {
    const folders = [
        {name: 'Movies', folders: [
            {name: 'Action', folders: [
                {name: 'Action 1'},
                {name: 'Action 2'},
                {name: 'Action 3'},
            ]},
            {name: 'Adventure'},
            {name: 'Comedy'},
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
    ];
    
    return (
        <div className="p-8 max-w-sm mx-auto">
            <ul>
                <li className="my-1.5">
                    <span className="flex items-center gap-1.5">
                        <FolderIcon className="size-6 text-sky-500"/> 
                        Home
                    </span>
                </li>
                <ul className="pl-6">
                    {folders.map((folder) => (
                        <li key={folder.name} className="my-1.5">
                            <span className="flex items-center gap-1.5">
                                <FolderIcon key={folder.name} className="size-6 text-sky-500"/> 
                                {folder.name}
                            </span>
                            <ul className="pl-6">
                                {folder.folders?.map(folder => (
                                    <li key={folder.name} className="my-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <FolderIcon key={folder.name} className="size-6 text-sky-500"/> 
                                            {folder.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}          
                </ul>           
            </ul>
        </div>
    );
}