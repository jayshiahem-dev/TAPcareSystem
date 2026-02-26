import React, { useState, useContext, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Folder, ChevronLeft, ChevronRight, ListOrdered, MapPin, UserPlus } from "lucide-react";
import { AyudaContext } from "../../contexts/AyudaContext/AyudaContext";
import { ResidentContext } from "../../contexts/ResidentContext/ResidentContext";
import AddBenificiaryTable from "../AyudaAssign/AddBenificiaryTable";

const MainTable = ({ assistance }) => {
    const assistanceId = assistance.assistanceId;
    const { fetchBenificiaryAssistance, BenificiaryAssistance, loading, TotalPagesAssistance, CurrentPageAssistance, setBenificiaryAssistance } =
        useContext(AyudaContext);

    const { barangays, fetchBarangays } = useContext(ResidentContext);

    const [isFolderOpen, setIsFolderOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [municipality, setMunicipality] = useState("");
    const [barangay, setBarangay] = useState("");

    // Modal state
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const municipalityOptions = ["", "Caibiran", "Naval", "Maripipi", "Cabucgayan", "Culaba", "Biliran", "Kawayan"];

    useEffect(() => {
        if (municipality && fetchBarangays) {
            fetchBarangays(municipality);
        }
    }, [municipality, fetchBarangays]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (assistanceId) {
                fetchBenificiaryAssistance(assistanceId, searchTerm, 1, rowsPerPage, municipality, barangay);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [assistanceId, searchTerm, rowsPerPage, municipality, barangay, fetchBenificiaryAssistance]);

    useEffect(() => {
        return () => {
            if (setBenificiaryAssistance) setBenificiaryAssistance(null);
        };
    }, [setBenificiaryAssistance]);

    const handlePageChange = (newPage) => {
        const targetPage = Number(newPage);
        const total = Number(TotalPagesAssistance);
        if (targetPage >= 1 && targetPage <= total && !loading) {
            fetchBenificiaryAssistance(assistanceId, searchTerm, targetPage, rowsPerPage, municipality, barangay);
        }
    };

    const handleMunicipalityChange = (e) => {
        setMunicipality(e.target.value);
        setBarangay("");
    };

    const getBarangayOptions = () => {
        if (!municipality) return [""];
        if (barangays && Array.isArray(barangays)) {
            const barangayNames = barangays.map((b) => b.barangayName || b.name || b.barangay || b);
            return ["", ...new Set(barangayNames)].sort();
        }
        return [""];
    };

    const assistanceData = BenificiaryAssistance?.[0] || null;
    const beneficiaries = assistanceData?.beneficiaries || [];
    const showAssignButton = assistanceData && (assistanceData.totalBeneficiaries || 0) <= (assistanceData.beneficiaryLimit || 0);

    const getStatusColor = (status) => {
        return status === "Active" || status === "Released"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
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
                        <div className="mb-6 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-lg">
                                    <Folder size={24} fill="currentColor" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase text-slate-800 dark:text-white">
                                        {assistanceData?.assistanceName || "Program Details"}
                                    </h2>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600">
                                            {assistanceData?.categoryName || "N/A"}
                                        </span>
                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                                            Slot: {assistanceData?.totalBeneficiaries || 0} / {assistanceData?.beneficiaryLimit || 0}
                                        </span>
                                        <button
                                            onClick={() => setIsImportModalOpen(true)}
                                            className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase text-white transition-all hover:bg-orange-600"
                                        >
                                            <UserPlus size={14} /> Assign Beneficiary
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsFolderOpen(false)} className="text-slate-400 hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
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

                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={municipality}
                                    onChange={handleMunicipalityChange}
                                    className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {municipalityOptions.map((m) => (
                                        <option key={m} value={m}>
                                            {m === "" ? "All Municipalities" : m}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={barangay}
                                    onChange={(e) => setBarangay(e.target.value)}
                                    disabled={!municipality}
                                    className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 dark:bg-gray-700 dark:text-white"
                                >
                                    {getBarangayOptions().map((b) => (
                                        <option key={b} value={b}>
                                            {b === "" ? "All Barangays" : b}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700">
                                <span className="text-xs font-bold uppercase text-slate-500">Show:</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                    className="bg-transparent text-sm font-bold text-orange-600 outline-none"
                                >
                                    {[5, 10, 25, 50].map((val) => (
                                        <option key={val} value={val}>
                                            {val}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table */}
            <motion.div
                layout
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            >
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
                                Array.from({ length: rowsPerPage }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-gray-700"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-gray-700"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-32 rounded bg-slate-200 dark:bg-gray-700"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-gray-700"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : beneficiaries.length > 0 ? (
                                beneficiaries.map((b) => (
                                    <tr key={b._id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-gray-700/30">
                                        <td className="px-6 py-4">
                                            <div className="font-black uppercase text-slate-800 dark:text-white">
                                                {b.lastname}, {b.firstname}
                                            </div>
                                            <div className="text-[10px] font-bold uppercase text-slate-400">
                                                {b.role} • {b.gender}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-orange-600">{b.household_id}</td>
                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-gray-300">
                                            {b.barangay}, <span className="text-[10px] font-medium uppercase text-slate-400">{b.municipality}</span>
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
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Page <span className="text-orange-600">{CurrentPageAssistance}</span> of {TotalPagesAssistance || 1}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(Number(CurrentPageAssistance) - 1)}
                            disabled={Number(CurrentPageAssistance) <= 1 || loading}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border bg-slate-50 hover:bg-orange-500 hover:text-white disabled:opacity-30 dark:bg-gray-700"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => handlePageChange(Number(CurrentPageAssistance) + 1)}
                            disabled={Number(CurrentPageAssistance) >= Number(TotalPagesAssistance) || loading}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border bg-slate-50 hover:bg-orange-500 hover:text-white disabled:opacity-30 dark:bg-gray-700"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* AddBenificiaryTable Modal */}
            {isImportModalOpen && (
                <AddBenificiaryTable
                    isOpen={isImportModalOpen}
                    LatestAssistances={assistance}
                    beneficiaryLimit={assistanceData?.beneficiaryLimit}  
                    totalSelected={assistanceData?.totalBeneficiaries}
                    onClose={() => setIsImportModalOpen(false)}
                />
            )}
        </div>
    );
};

export default MainTable;