'use client'

import { FilterData } from "@/feature/deals/libs/filterData"
import { X } from "lucide-react";
import Modal from "../ui/Modal";

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
        <Modal open={showFilter} onClose={setShowFilter}>
           <div className={`fixed top-0 right-0 h-full  bg-opacity-50 z-50 ${classes}`}>
                <div className="flex flex-col h-full overflow-hidden overflow-y-auto">
                    <div className="flex justify-between items-center w-full p-4 border-b border-[var(--border-gray)]">
                        <h2 className="text-lg font-semibold">Filter</h2>
                        <button onClick={setShowFilter} className="cursor-pointer">
                            <X className="size-4" />
                        </button>
                    </div>
                    <div className="">
                        <aside className="w-full ">
                            {(Object.keys(filters) as (keyof FilterData)[]).map((category) => {
                                // handle search filter
                                const query = searchQueries[category] || "";
                                const items = filters[category].filter((item) =>
                                    item.label.toLowerCase().includes(query.toLowerCase())
                                );

                                return (
                                    <div key={category} className="">
                                        <div className=" py-3 px-4 border-b border-[var(--border-gray)]">

                                            <h3 className="font-medium w-full  mb-2 capitalize ">{category}</h3>

                                            {/* Only show search for specific categories */}
                                            <div className="">

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
                                                        className="w-full border border-[var(--border-gray)] shadow-sm rounded px-2 py-1 mb-2 text-sm"

                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 border-b border-[var(--border-gray)] ">

                                            {items.map((item) => (
                                                <label key={item.id} className="flex items-center gap-2 py-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.checked}
                                                        onChange={() => handleToggle(category, item.id)}
                                                        className="
                                                                relative appearance-none w-4 h-4 rounded shadow-sm
                                                                border border-[var(--border-gray)]
                                                                bg-white
                                                                checked:bg-black checked:border-black
                                                                checked:before:content-['✔'] checked:before:absolute
                                                                checked:before:inset-0 checked:before:flex
                                                                checked:before:items-center checked:before:justify-center
                                                                checked:before:text-white checked:before:text-xs
                                                            "
                                                    />
                                                    {item.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </aside>
                    </div>
                </div>
            </div>
        </Modal>
    )
}