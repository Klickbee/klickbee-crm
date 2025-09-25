'use client'

import { FilterData } from "@/feature/deals/libs/filterData"
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

type filterProps = {
    showFilter: boolean;
    setShowFilter: () => void;
    classes?: string;
    filters: FilterData;
    handleToggle: (category: keyof FilterData, id: string) => void;
    searchableCategories: (keyof FilterData)[];
    searchQueries: Record<string, string>;
    setSearchQueries: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

export default function Filter({ filters, handleToggle, setShowFilter, showFilter, classes, searchableCategories, searchQueries, setSearchQueries }: filterProps) {
    return (
        <div className="w-full h-full bg-black/50 fixed top-0 left-0 z-50" aria-hidden={!showFilter}
            onClick={(e) => {
                // Close when clicking the backdrop only
                if ((e.target as HTMLElement).id === "filter-backdrop") setShowFilter()
            }}
            id="filter-backdrop"
            style={{ visibility: showFilter ? "visible" : "hidden" }}>
            <div className={`fixed top-0 right-0 h-full bg-red bg-opacity-50 z-50 ${classes}`}>
                <div className="flex flex-col h-full overflow-hidden overflow-y-auto">
                    <div className="flex justify-between h-min items-start w-full p-3 border-b-2">
                        <h2 className="text-lg font-semibold">Filter</h2>
                        <button onClick={setShowFilter} className="cursor-pointer"><X className="size-4" /></button>
                    </div>
                    <div className="p-4">
                        <aside className="w-64 p-4">
                            {(Object.keys(filters) as (keyof FilterData)[]).map((category) => {
                                // handle search filter
                                const query = searchQueries[category] || "";
                                const items = filters[category].filter((item) =>
                                    item.label.toLowerCase().includes(query.toLowerCase())
                                );

                                return (
                                    <div key={category} className="mb-6">
                                        <h3 className="font-medium mb-2 capitalize">{category}</h3>

                                        {/* Only show search for specific categories */}
                                        {searchableCategories.includes(category) && (
                                            <input
                                                type="text"
                                                placeholder="Search"
                                                value={query}
                                                onChange={(e) =>
                                                    setSearchQueries((prev) => ({
                                                        ...prev,
                                                        [category]: e.target.value,
                                                    }))
                                                }
                                                className="w-full border rounded px-2 py-1 mb-2 text-sm"
                                            />
                                        )}

                                        {items.map((item) => (
                                            <label key={item.id} className="flex items-center gap-2 py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={item.checked}
                                                    onChange={() => handleToggle(category, item.id)}
                                                />
                                                {item.label}
                                            </label>
                                        ))}
                                    </div>
                                );
                            })}
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    )
}