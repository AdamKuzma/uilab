"use client"

import { motion } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";

interface Tab {
    name: string;
}

const TABS: Tab[] = [
    { name: "Overview" },
    { name: "Playground" },
    { name: "Animations" },
    { name: "Code" }
];

export default function SmoothTabs() {
    const [activeTab, setActiveTab] = useState<Tab | null>(null);

    return (
        <div className="flex justify-center">
            <ul className="inline-flex gap-0 px-1 py-1 relative bg-[var(--primary-foreground)] border-[var(--border)] border rounded-xl shadow-xs">
            {TABS.map((tab) => (
                <motion.li
                    layout
                    className={clsx(
                        "relative cursor-pointer px-3 py-2 text-sm outline-none transition-color font-medium",
                        activeTab === tab ? "text-[var(--secondary-foreground)]" : "text-[var(--muted-foreground)]",
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
                        className="absolute inset-0 rounded-lg bg-[var(--muted-background)] z-0"
                    />
                    ) : null}
                    <span className="relative z-10">{tab.name}</span>
                </motion.li>
                ))}
            </ul>
        </div>
    );
}

