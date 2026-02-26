import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Folder, ChevronLeft, ChevronRight, ListOrdered, MapPin } from "lucide-react";
import { HistoryContext } from "../../contexts/HistoryContext/HistoryContext";
import { ResidentContext } from "../../contexts/ResidentContext/ResidentContext";

const HistoryList = ({ assistanceId }) => {
    const { 
        fetchBenificiaryAssistance, 
        benificiaryAssistance, 
        loading, 
        totalPagesAssistance, 
        currentPageAssistance, 
        setBenificiaryAssistance 
    } = useContext(HistoryContext);

    const { barangays, fetchBarangays } = useContext(ResidentContext);

    const [isFolderOpen, setIsFolderOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [municipality, setMunicipality] = useState("");
    const [barangay, setBarangay] = useState("");

    const municipalityOptions = ["", "Caibiran", "Naval", "Maripipi", "Cabucgayan", "Culaba", "Biliran", "Kawayan"];

    // 1. Cleanup pag-alis sa component
    useEffect(() => {
        return () => setBenificiaryAssistance(null);
    }, [setBenificiaryAssistance]);

    // 2. Fetch Barangays kapag nagbago ang munisipyo
    useEffect(() => {
        if (municipality && fetchBarangays) {
            fetchBarangays(municipality);
        }
    }, [municipality, fetchBarangays]);

    // 3. EFFECT PARA SA FILTERS & SEARCH (Dapat laging Page 1)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (assistanceId) {
                // Tuwing may gagalawin sa filters, force back to Page 1
                fetchBenificiaryAssistance(assistanceId, searchTerm, 1, rowsPerPage, municipality, barangay);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [assistanceId, searchTerm, rowsPerPage, municipality, barangay, fetchBenificiaryAssistance]);

    // 4. MANUAL PAGINATION HANDLER (Para sa Next/Prev buttons)
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPagesAssistance && !loading) {
            fetchBenificiaryAssistance(assistanceId, searchTerm, newPage, rowsPerPage, municipality, barangay);
        }
    };

    // Data Mapping
    const mainData = benificiaryAssistance?.[0] || null;
    const beneficiaries = mainData?.beneficiaries || [];
    const programName = mainData?.assistanceName || "Program Beneficiaries";
    const categoryName = mainData?.categoryName || "History Log";
    const totalCount = mainData?.totalBeneficiaries || 0;

    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        if (["released", "received", "completed"].includes(s)) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    };

    return (
        <div className="w-full space-y-4">
            <AnimatePresence>
                {isFolderOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                    >
                        {/* Header */}
                        <div className="mb-6 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-lg">
                                    <Folder size={24} fill="currentColor" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase text-slate-800 dark:text-white">{programName}</h2>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600">{categoryName}</span>
                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">Total: {totalCount} Records</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsFolderOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Filter Controls */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {/* Municipality */}
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={municipality}
                                    onChange={(e) => { setMunicipality(e.target.value); setBarangay(""); }}
                                    className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {municipalityOptions.map((m) => (
                                        <option key={m} value={m}>{m === "" ? "All Municipalities" : m}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Barangay */}
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={barangay}
                                    onChange={(e) => setBarangay(e.target.value)}
                                    disabled={!municipality}
                                    className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">All Barangays</option>
                                    {barangays?.map((b) => (
                                        <option key={b._id} value={b.barangayName}>{b.barangayName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Rows Per Page */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700">
                                <div className="flex items-center gap-2">
                                    <ListOrdered size={18} className="text-slate-400" />
                                    <span className="text-xs font-bold uppercase text-slate-500">Show:</span>
                                </div>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                    className="bg-transparent text-sm font-bold text-orange-600 outline-none cursor-pointer"
                                >
                                    {[5, 10, 25, 50].map((val) => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table Section */}
            <motion.div layout className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-5">Resident Name</th>
                                <th className="px-6 py-5">Household ID</th>
                                <th className="px-6 py-5">Location</th>
                                <th className="px-6 py-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                            {loading ? (
                                [...Array(5)].map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-3/4 rounded bg-slate-200" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-200" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-slate-200" /></td>
                                    </tr>
                                ))
                            ) : beneficiaries.length > 0 ? (
                                beneficiaries.map((b) => (
                                    <tr key={b._id} className="group hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-black uppercase text-slate-800 dark:text-white">
                                                {b.lastname}, {b.firstname} {b.middlename}
                                            </div>
                                            <div className="text-[10px] font-bold uppercase text-slate-400">
                                                {b.role} • {b.gender}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-orange-600">{b.household_id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700 dark:text-gray-300">{b.barangay}</div>
                                            <div className="text-[10px] uppercase text-slate-400">{b.municipality}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase ${getStatusColor(b.status)}`}>
                                                {b.status || "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center font-bold uppercase text-slate-400">
                                        No records found for this page.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row">
                    <div className="text-xs font-bold uppercase text-slate-400">
                        Page <span className="text-orange-600">{currentPageAssistance}</span> of {totalPagesAssistance || 1}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPageAssistance - 1)}
                            disabled={currentPageAssistance <= 1 || loading}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-orange-500 hover:text-white disabled:opacity-30 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPagesAssistance || 1)].map((_, i) => {
                                const pageNum = i + 1;
                                // Simple logic para ipakita lang ang pages malapit sa current page
                                if (pageNum === 1 || pageNum === totalPagesAssistance || (pageNum >= currentPageAssistance - 1 && pageNum <= currentPageAssistance + 1)) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`h-9 w-9 rounded-lg text-xs font-bold transition-all ${
                                                currentPageAssistance === pageNum 
                                                ? "bg-orange-500 text-white shadow-md" 
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPageAssistance + 1)}
                            disabled={currentPageAssistance >= totalPagesAssistance || loading}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-orange-500 hover:text-white disabled:opacity-30 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HistoryList;