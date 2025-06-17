"use client"

import { motion } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";

interface Tab {
    name: string;
}

const TABS: Tab[] = [
    { name: "Home" },
    { name: "About" },
    { name: "Contact" }
];

export default function SmoothTabs() {
    const [activeTab, setActiveTab] = useState<Tab | null>(null);

    return (
        <div className="">
            <ul className="flex gap-0 px-1 py-1 relative justify-center">
            {TABS.map((tab) => (
                <motion.li
                    layout
                    className={clsx(
                        "relative cursor-pointer px-3 py-1 text-sm outline-none transition-colors",
                        activeTab === tab ? "text-neutral-200" : "text-neutral-400",
                    )}
                    tabIndex={0}
                    key={tab.name}
                    onFocus={() => setActiveTab(tab)}
                    onMouseOver={() => setActiveTab(tab)}
                    onMouseLeave={() => setActiveTab(tab)}
                >
                    {activeTab === tab ? (
                    <motion.div
                        layoutId="tab-indicator"
                        className="absolute inset-0 rounded-lg bg-neutral-800 z-0"
                    />
                    ) : null}
                    <span className="relative z-10">{tab.name}</span>
                </motion.li>
                ))}
            </ul>
        </div>
    );
}