import React, { useContext, useState, useCallback } from "react"; // Added useState and useCallback
import { AyudaContext } from "../../contexts/AyudaContext/AyudaContext";
import StatusModal from "../../ReusableFolder/SuccessandField";

const MainTable = ({
    data,
    searchTerm,
    setSearchTerm,
    selectedMunicipality,
    setSelectedMunicipality,
    selectedBarangay,
    setSelectedBarangay,
    filteredBarangays,
    municipalityOptions,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    theme,
    SelectedSize,
    beneficiaryLimit,
    pagination,
    isLoading,
    selectedIds,
    onToggleSelect,
    onSelectAll,
    onDeselectAll,
    LatestAssistances,
}) => {
    const { assignAyuda } = useContext(AyudaContext);

    // --- STATE PARA SA STATUS MODAL ---
    const [state, setState] = useState({
        showStatusModal: false,
        statusModalProps: {
            status: "success",
            error: null,
            title: "",
            message: "",
            onRetry: null,
        },
    });

    const updateState = useCallback((newState) => {
        setState((prev) => ({ ...prev, ...newState }));
    }, []);

    const handleStatusModalClose = () => {
        updateState({ showStatusModal: false });
    };

    const allSelected = data.length > 0 && data.every((item) => selectedIds.has(item._id));
    const someSelected = data.some((item) => selectedIds.has(item._id)) && !allSelected;

    const assistanceId = LatestAssistances?._id;
    
    // Status message helper
    const showStatusMessage = useCallback(
        (status, error = null, customProps = {}) => {
            updateState({
                showStatusModal: true,
                statusModalProps: {
                    status,
                    error,
                    title: customProps.title || (status === "success" ? "Success" : "Error"),
                    message: customProps.message || "",
                    onRetry: customProps.onRetry || null,
                    isRFIDAssignment: customProps.isRFIDAssignment || false,
                },
            });
        },
        [updateState],
    );

    // --- LOGIC PARA SA BULK SELECT (CHECK ALL) ---
    const handleSelectAllChange = async () => {
        if (!assistanceId) {
            showStatusMessage("error", "No active assistance found.", { title: "Missing ID" });
            return;
        }
        const residentIds = data.map((item) => item._id);

        try {
            if (allSelected) {
                onDeselectAll(assistanceId);
            } else {
                const newlySelectedCount = data.filter((item) => !selectedIds.has(item._id)).length;

                if (beneficiaryLimit && SelectedSize + newlySelectedCount > beneficiaryLimit) {
                    showStatusMessage("error", null, { 
                        title: "Limit Warning", 
                        message: "Selecting all will exceed the beneficiary limit." 
                    });
                    return;
                }

                await assignAyuda(assistanceId, residentIds);
                onSelectAll(assistanceId);
                showStatusMessage("success", null, { message: "Bulk selection updated successfully." });
            }
        } catch (error) {
            showStatusMessage("error", error.message);
        }
    };

    // --- LOGIC PARA SA SINGLE ROW CHECK ---
    const handleRowCheckboxChange = async (residentId) => {
        if (!assistanceId) {
            showStatusMessage("error", "No active assistance found.");
            return;
        }

        const isCurrentlySelected = selectedIds.has(residentId);

        if (!isCurrentlySelected && beneficiaryLimit && SelectedSize >= beneficiaryLimit) {
            showStatusMessage("error", null, { 
                message: `Limit reached! You can only select up to ${beneficiaryLimit} beneficiaries.` 
            });
            return;
        }

        try {
            await assignAyuda(assistanceId, [residentId]);
            onToggleSelect(residentId, assistanceId);
        } catch (error) {
            showStatusMessage("error", error.message);
        }
    };

    const getPageNumbers = () => {
        const totalPages = pagination?.totalPages || 1;
        const current = currentPage || 1;
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            }
        }
        range.forEach((i) => {
            if (l) {
                if (i - l === 2) rangeWithDots.push(l + 1);
                else if (i - l !== 1) rangeWithDots.push("...");
            }
            rangeWithDots.push(i);
            l = i;
        });
        return rangeWithDots;
    };

    return (
        <div className="relative rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {/* Header Filters */}
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">

                        <div className="min-w-[200px] flex-1">
                            <input
                                type="text"
                                placeholder="Search by name, household ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={isLoading}
                                className="w-full rounded-lg border px-3 py-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
                            />
                        </div>
                        <select
                            value={selectedMunicipality}
                            onChange={(e) => setSelectedMunicipality(e.target.value)}
                            disabled={isLoading}
                            className="rounded-lg border px-3 py-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
                        >
                            {municipalityOptions.map((mun) => (
                                <option key={mun} value={mun}>{mun}</option>
                            ))}
                        </select>
                        <select
                            value={selectedBarangay}
                            onChange={(e) => setSelectedBarangay(e.target.value)}
                            disabled={isLoading || selectedMunicipality === "All"}
                            className="rounded-lg border px-3 py-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
                        >
                            {filteredBarangays.map((bar) => (
                                <option key={bar} value={bar}>{bar}</option>
                            ))}
                        </select>
                    </div>

                    <div className="text-sm font-medium">
                        Selected: <span className="text-orange-600">{SelectedSize}</span>
                        {beneficiaryLimit && <span> / {beneficiaryLimit}</span>}
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
                            <span className="text-gray-700 dark:text-gray-300">Processing...</span>
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="w-10 px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(el) => el && (el.indeterminate = someSelected)}
                                        onChange={handleSelectAllChange}
                                        disabled={isLoading}
                                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                </th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Household ID</th>
                                <th className="px-6 py-3">Barangay</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((resident) => (
                                <tr key={resident._id} className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(resident._id)}
                                            onChange={() => handleRowCheckboxChange(resident._id)}
                                            disabled={isLoading}
                                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {`${resident.lastname}, ${resident.firstname} ${resident.middlename || ""}`}
                                    </td>
                                    <td className="px-6 py-4">{resident.household_id}</td>
                                    <td className="px-6 py-4">{resident.barangay}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(resident.status, theme)}`}>
                                            {resident.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="text-sm text-gray-700 dark:text-gray-400">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, pagination.totalResidents)} of {pagination.totalResidents}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage <= 1 || isLoading}
                                className="rounded border px-3 py-1 disabled:opacity-50 dark:border-gray-600"
                            >
                                Previous
                            </button>
                            {getPageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof page === "number" && setCurrentPage(page)}
                                    className={`rounded border px-3 py-1 ${page === currentPage ? "bg-orange-600 text-white" : "hover:bg-gray-100"}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage >= pagination.totalPages || isLoading}
                                className="rounded border px-3 py-1 disabled:opacity-50 dark:border-gray-600"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FIXED STATUS MODAL --- */}
            <StatusModal
                isOpen={state.showStatusModal}
                onClose={handleStatusModalClose}
                status={state.statusModalProps.status}
                error={state.statusModalProps.error}
                title={state.statusModalProps.title}
                message={state.statusModalProps.message}
                onRetry={state.statusModalProps.onRetry}
            />
        </div>
    );
};

const getStatusColor = (status, theme) => {
    const isDark = theme === "dark";
    switch (status) {
        case "Active": return isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700";
        case "Inactive": return isDark ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700";
        case "Deceased": return isDark ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700";
        default: return isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-700";
    }
};

export default MainTable;