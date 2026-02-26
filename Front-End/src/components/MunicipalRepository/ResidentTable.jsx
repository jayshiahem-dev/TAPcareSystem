import React, { useState, useEffect } from "react"; // 1. Added useEffect
// 1. Import Lucide Icons
import { Search, ChevronLeft, ChevronRight, ExternalLink, Fingerprint, UserSearch } from "lucide-react";

export default function ResidentTable({
    residents,
    onOpenFolder,
    GetHouseholdFullDetails,
    fetchbybarangayandhousehold,
    TotalItems,
    CurrentPageResident,
    TotalPagesResident,
    currentMuni,
    currentBrgy,
    sethouseholdinbarangay,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // --- ADDED: RESET ON BACK/UNMOUNT ---
    useEffect(() => {
        // Ang return function sa loob ng useEffect ay tumatakbo kapag ang component ay "nawala" (unmount)
        return () => {
            if (sethouseholdinbarangay) {
                sethouseholdinbarangay(null);
            }
        };
    }, [sethouseholdinbarangay]); 
    // ------------------------------------

    const fetchData = (page, limit, search) => {
        fetchbybarangayandhousehold({
            municipality: currentMuni,
            barangay: currentBrgy,
            page: page,
            limit: limit,
            search: search,
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= TotalPagesResident) {
            fetchData(newPage, itemsPerPage, searchTerm);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchData(1, itemsPerPage, value);
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        setItemsPerPage(newLimit);
        fetchData(1, newLimit, searchTerm);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* --- CONTROLS --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={handleLimitChange}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold outline-none focus:border-orange-500"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-[10px] font-black uppercase text-slate-400">Entries</span>
                </div>

                <div className="relative w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Search resident name or ID..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-11 pr-5 text-[10px] font-bold uppercase tracking-wider shadow-sm outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                    />
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        size={16}
                    />
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl">
                <table className="w-full border-collapse text-left">
                    <thead className="border-b border-slate-100 bg-slate-50">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">File ID</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Resident Name</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">RFID Status</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {residents?.length > 0 ? (
                            residents.map((res) => (
                                <tr
                                    key={res._id}
                                    className="group transition-colors hover:bg-orange-50/40"
                                >
                                    <td className="px-8 py-5">
                                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-black tracking-tighter text-slate-500">
                                            #{res.householdId}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-black uppercase text-slate-800">
                                            {res.lastname}, {res.firstname}
                                        </div>
                                        <div className="text-[9px] font-bold uppercase text-slate-400">{res.type}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {res.rfid ? (
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase italic text-green-600">
                                                <Fingerprint size={12} /> Linked
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase italic text-slate-300">
                                                <Fingerprint size={12} /> Unlinked
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={async () => {
                                                await GetHouseholdFullDetails({
                                                    householdId: res.householdId,
                                                });
                                                onOpenFolder(res);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[9px] font-black uppercase text-white shadow-sm transition-all hover:scale-105 hover:bg-orange-600 active:scale-95"
                                        >
                                            <UserSearch
                                                size={14}
                                                strokeWidth={3}
                                            />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="py-12 text-center"
                                >
                                    <div className="flex flex-col items-center gap-2 text-slate-300">
                                        <Search
                                            size={32}
                                            strokeWidth={1}
                                        />
                                        <span className="text-[10px] font-bold uppercase">No records found</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PAGINATION --- */}
            <div className="flex items-center justify-between px-6 py-2">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                        Page {CurrentPageResident} of {TotalPagesResident}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300">Total Records: {TotalItems}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(CurrentPageResident - 1)}
                        disabled={CurrentPageResident <= 1}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-black uppercase text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30"
                    >
                        <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(CurrentPageResident + 1)}
                        disabled={CurrentPageResident >= TotalPagesResident}
                        className="flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-[10px] font-black uppercase text-white transition-all hover:bg-orange-600 disabled:opacity-30"
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}