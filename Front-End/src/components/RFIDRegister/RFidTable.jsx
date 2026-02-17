import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, Radio, X, CheckCircle, Clock, AlertCircle, Edit, Trash2, Plus } from "lucide-react";
import { RFIDRegisterContext } from "../../contexts/RegisterRfidContext/RegisterRfidContext";
import DeleteConfirmationModal from "../ImportMasterList/Modal/DeleteConfirmationModal";
import { RFIDContext } from "../../contexts/RFIDContext/RfidContext";
import AddRFIDForm from "./AddRFIDForm";

const RFidTable = () => {
    // State management
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [theme] = useState("light");
    const { rfidData, clearRFIDData } = useContext(RFIDContext);

    // Context
    const {
        rfids,
        isLoading,
        fetchRFIDs,
        createRFID,
        updateRFID,
        deleteRFID,
        totalRecords,
        totalPages,
        currentPage
    } = useContext(RFIDRegisterContext);

    // Additional states
    const pageSizeOptions = [5, 10, 20, 50, 100];
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [selectedRFIDStatus, setSelectedRFIDStatus] = useState("All");
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRFID, setSelectedRFID] = useState(null);

    // Refs to prevent double fetching
    const isInitialMount = useRef(true);
    const prevFilters = useRef({
        itemsPerPage,
        selectedRFIDStatus,
        localSearchTerm,
    });
    const debounceTimerRef = useRef(null);
    const lastScannedRFID = useRef("");

    // RFID Scan Handler
    useEffect(() => {
        console.log("=== RFID DATA DEBUG ===");
        console.log("RFID Context Data:", rfidData);

        if (rfidData && rfidData.rfidNumber) {
            const rfidValue = rfidData.rfidNumber.toString().trim();

            if (rfidValue && lastScannedRFID.current !== rfidValue) {
                console.log(`✅ New RFID detected: ${rfidValue}`);
                lastScannedRFID.current = rfidValue;

                if (!addModalOpen) {
                    console.log("🚀 Opening AddForm modal...");
                    setAddModalOpen(true);
                }

                setTimeout(() => {
                    if (clearRFIDData) {
                        console.log("🔄 Clearing RFID data from context");
                        clearRFIDData();
                    }
                }, 100);
            }
        }
    }, [rfidData, addModalOpen, clearRFIDData]);

    // Memoized fetch function using OBJECT format
    const fetchData = useCallback(
        (page = 1) => {
            console.log("📊 fetchData called with page:", page);

            const params = {
                page: page,
                limit: itemsPerPage,
                status: selectedRFIDStatus !== "All" ? selectedRFIDStatus : "",
                search: localSearchTerm.trim() !== "" ? localSearchTerm : "",
            };

            console.log("📊 Fetching RFID data with params:", params);
            
            // Call context fetch with OBJECT format
            fetchRFIDs(params);
        },
        [fetchRFIDs, itemsPerPage, selectedRFIDStatus, localSearchTerm],
    );

    // Initial fetch only - isang beses lang sa mount
    useEffect(() => {
        if (isInitialMount.current) {
            console.log("📊 Initial fetch on mount");
            fetchData(1);
            isInitialMount.current = false;

            // Initialize prevFilters with initial values
            prevFilters.current = {
                itemsPerPage,
                selectedRFIDStatus,
                localSearchTerm,
            };
        }
    }, [fetchData]);

    // Debounced effect for handling filter changes
    useEffect(() => {
        // Skip on initial mount
        if (isInitialMount.current) {
            return;
        }

        // Check if any filter actually changed
        const filtersChanged =
            prevFilters.current.itemsPerPage !== itemsPerPage ||
            prevFilters.current.selectedRFIDStatus !== selectedRFIDStatus ||
            prevFilters.current.localSearchTerm !== localSearchTerm;

        if (filtersChanged) {
            console.log("🔄 Filter changed, debouncing...");

            // Clear any existing debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Set new debounce timer
            debounceTimerRef.current = setTimeout(() => {
                console.log("🔁 Debounced fetch triggered - resetting to page 1");
                
                // Reset to page 1 when filters change
                fetchData(1);

                // Update prevFilters
                prevFilters.current = {
                    itemsPerPage,
                    selectedRFIDStatus,
                    localSearchTerm,
                };
            }, 300);
        }

        // Cleanup function
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [itemsPerPage, selectedRFIDStatus, localSearchTerm]);

    // Transform RFID data for display
    const transformRFIDToDisplayData = (rfidData) => {
        if (!rfidData || !Array.isArray(rfidData)) return [];

        return rfidData.map((rfid) => {
            const resident = rfid.resident || {};
            return {
                _id: rfid._id,
                name: resident.name || "N/A",
                rfidNumber: rfid.rfidNumber || "N/A",
                status: rfid.status || "Active",
                rfidStatus: rfid.status || "Active",
                createdAt: rfid.createdAt,
                dateIssued: rfid.createdAt ? new Date(rfid.createdAt).toLocaleDateString() : "N/A",
                residentId: resident._id,
                residentData: resident,
                notes: rfid.notes || "",
            };
        });
    };

    const transformedData = transformRFIDToDisplayData(rfids || []);

    // Calculate showing range
    const startIndex = totalRecords > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endIndex = Math.min(currentPage * itemsPerPage, totalRecords || 0);
    const showingTotal = totalRecords || 0;

    // Helper functions
    const getRFIDStatusColor = (status) => {
        switch (status) {
            case "Active":
                return theme === "dark" ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700";
            case "Inactive":
                return theme === "dark" ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700";
            case "Pending":
                return theme === "dark" ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700";
            case "Blocked":
                return theme === "dark" ? "bg-gray-900/30 text-gray-400" : "bg-gray-100 text-gray-700";
            default:
                return theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-700";
        }
    };

    const getRFIDStatusIcon = (status) => {
        switch (status) {
            case "Active":
                return <CheckCircle size={12} />;
            case "Inactive":
                return <AlertCircle size={12} />;
            case "Pending":
                return <Clock size={12} />;
            case "Blocked":
                return <X size={12} />;
            default:
                return null;
        }
    };

    // Handlers
    const handlePageChange = (page) => {
        console.log("📄 Page change to:", page);
        if (page >= 1 && page <= totalPages) {
            fetchData(page);
        }
    };

    const handleItemsPerPageChange = (value) => {
        const newLimit = parseInt(value);
        console.log("🔢 Items per page changed to:", newLimit);
        setItemsPerPage(newLimit);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        console.log("🔍 Search term changed to:", value);
        setLocalSearchTerm(value);
        setSearchTerm(value);
    };

    // Handle clear search
    const handleClearSearch = () => {
        console.log("🧹 Clearing search");
        setLocalSearchTerm("");
        setSearchTerm("");
    };

    // Handle RFID status change
    const handleRFIDStatusChange = (e) => {
        const value = e.target.value;
        console.log("🏷️ RFID Status changed to:", value);
        setSelectedRFIDStatus(value);
    };

    // Handle clear status filter
    const handleClearStatusFilter = () => {
        console.log("🧹 Clearing status filter");
        setSelectedRFIDStatus("All");
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm && deleteRFID) {
            deleteRFID(deleteConfirm.id)
                .then(() => {
                    // Refresh data after deletion
                    fetchData(currentPage);
                    setDeleteConfirm(null);
                })
                .catch((error) => {
                    console.error("Delete error:", error);
                    setDeleteConfirm(null);
                });
        }
    };

    const handleCancelDelete = () => setDeleteConfirm(null);

    const handleEdit = (rfidData) => {
        setSelectedRFID(rfidData);
        setEditModalOpen(true);
    };

    const handleDelete = (rfidId, residentName) => {
        setDeleteConfirm({ id: rfidId, name: residentName, type: "RFID" });
    };

    const handleAddOpen = () => setAddModalOpen(true);

    const handleAddSubmit = async (formData) => {
        try {
            if (createRFID) {
                await createRFID(formData);
                setAddModalOpen(false);
                fetchData(1);

                if (clearRFIDData) clearRFIDData();
                lastScannedRFID.current = "";
            }
        } catch (error) {
            console.error("Error creating RFID:", error);
            alert("Failed to create RFID. Please try again.");
        }
    };

    const handleEditSubmit = async (formData) => {
        try {
            if (updateRFID && selectedRFID) {
                await updateRFID(selectedRFID._id, formData);
                setEditModalOpen(false);
                setSelectedRFID(null);
                fetchData(currentPage);
            }
        } catch (error) {
            console.error("Error updating RFID:", error);
            alert("Failed to update RFID. Please try again.");
        }
    };

    const handleCloseAddModal = () => {
        setAddModalOpen(false);
        if (clearRFIDData) clearRFIDData();
        lastScannedRFID.current = "";
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedRFID(null);
    };

    const rfidStatusOptions = ["All", "Active", "Inactive", "Pending", "Blocked"];

    return (
        <>
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                deleteConfirm={deleteConfirm}
                onCancelDelete={handleCancelDelete}
                onConfirmDelete={handleConfirmDelete}
                theme={theme}
            />

            {/* Add Modal */}
            <AddRFIDForm
                isOpen={addModalOpen}
                onClose={handleCloseAddModal}
                onSubmit={handleAddSubmit}
                mode="add"
                scannedRFID={rfidData?.rfidNumber}
            />

            {/* Edit Modal */}
            <AddRFIDForm
                isOpen={editModalOpen}
                onClose={handleCloseEditModal}
                onSubmit={handleEditSubmit}
                mode="edit"
                initialData={selectedRFID}
            />

            {/* Main Table Content */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
                {/* Table Header */}
                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                                <Radio
                                    size={24}
                                    className="text-orange-600 dark:text-orange-400"
                                />
                                RFID Registered List
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {showingTotal} RFID record{showingTotal !== 1 ? 's' : ''}
                                </p>
                                {rfidData && rfidData.rfidNumber && (
                                    <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        <Radio size={10} />
                                        <span className="font-medium">RFID Scanned:</span> {rfidData.rfidNumber}
                                        <button
                                            onClick={() => {
                                                if (clearRFIDData) clearRFIDData();
                                                lastScannedRFID.current = "";
                                            }}
                                            className="ml-1 hover:text-green-900 dark:hover:text-green-300"
                                            title="Clear scanned RFID"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAddOpen}
                                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
                            >
                                <Plus size={16} />
                                Add RFID
                            </button>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search by name or RFID"
                                value={localSearchTerm}
                                onChange={handleSearchChange}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={isLoading}
                            />
                            {localSearchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    disabled={isLoading}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* RFID Status Filter */}
                        <div className="flex items-center gap-2">
                            <Radio
                                size={18}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            <select
                                value={selectedRFIDStatus}
                                onChange={handleRFIDStatusChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={isLoading}
                            >
                                {rfidStatusOptions.map((status) => (
                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(localSearchTerm || selectedRFIDStatus !== "All") && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {localSearchTerm && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Search size={12} />
                                    Search: {localSearchTerm}
                                    <button
                                        onClick={handleClearSearch}
                                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-300"
                                        disabled={isLoading}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
                            {selectedRFIDStatus !== "All" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                    <Radio size={12} />
                                    Status: {selectedRFIDStatus}
                                    <button
                                        onClick={handleClearStatusFilter}
                                        className="ml-1 hover:text-purple-900 dark:hover:text-purple-300"
                                        disabled={isLoading}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500"></div>
                            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading RFID records...</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[600px]">
                            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">RFID Number</th>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Date Issued</th>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transformedData.length > 0 ? (
                                    transformedData.map((item) => (
                                        <tr
                                            key={item._id}
                                            className="border-t border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                                        >
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                        <Radio size={12} />
                                                        {item.rfidNumber}
                                                    </span>
                                                    <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        {item.notes}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold uppercase ${getRFIDStatusColor(item.rfidStatus)}`}
                                                >
                                                    {getRFIDStatusIcon(item.rfidStatus)}
                                                    {item.rfidStatus}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">{item.dateIssued}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="rounded-lg bg-blue-100 p-2 text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                        title="Edit RFID"
                                                        disabled={isLoading}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id, item.name)}
                                                        className="rounded-lg bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                                        title="Delete RFID"
                                                        disabled={isLoading}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="p-8 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Radio
                                                    className="mb-2 text-gray-400 dark:text-gray-600"
                                                    size={48}
                                                />
                                                <p className="font-medium text-gray-500 dark:text-gray-400">No RFID records found</p>
                                                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                                                    Try changing your search or filter criteria
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {!isLoading && totalPages > 0 && (
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 p-4 dark:border-gray-700 md:flex-row">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                    disabled={isLoading}
                                >
                                    {pageSizeOptions.map((option) => (
                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-sm text-gray-500 dark:text-gray-400">entries per page</span>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || isLoading || totalPages === 0}
                                className="rounded-lg p-2 text-gray-600 transition-colors hover:border hover:border-orange-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {(() => {
                                    const pages = [];
                                    const maxVisiblePages = 5;

                                    if (totalPages <= maxVisiblePages) {
                                        for (let i = 1; i <= totalPages; i++) {
                                            pages.push(
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(i)}
                                                    className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${currentPage === i ? "bg-orange-600 text-white" : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"}`}
                                                    disabled={isLoading}
                                                >
                                                    {i}
                                                </button>,
                                            );
                                        }
                                    } else {
                                        pages.push(
                                            <button
                                                key={1}
                                                onClick={() => handlePageChange(1)}
                                                className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${currentPage === 1 ? "bg-orange-600 text-white" : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"}`}
                                                disabled={isLoading}
                                            >
                                                1
                                            </button>,
                                        );

                                        if (currentPage > 3) {
                                            pages.push(
                                                <span
                                                    key="ellipsis-start"
                                                    className="px-1 text-gray-400 dark:text-gray-600"
                                                >
                                                    ...
                                                </span>,
                                            );
                                        }

                                        const start = Math.max(2, currentPage - 1);
                                        const end = Math.min(totalPages - 1, currentPage + 1);

                                        for (let i = start; i <= end; i++) {
                                            pages.push(
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(i)}
                                                    className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${currentPage === i ? "bg-orange-600 text-white" : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"}`}
                                                    disabled={isLoading}
                                                >
                                                    {i}
                                                </button>,
                                            );
                                        }

                                        if (currentPage < totalPages - 2) {
                                            pages.push(
                                                <span
                                                    key="ellipsis-end"
                                                    className="px-1 text-gray-400 dark:text-gray-600"
                                                >
                                                    ...
                                                </span>,
                                            );
                                        }

                                        pages.push(
                                            <button
                                                key={totalPages}
                                                onClick={() => handlePageChange(totalPages)}
                                                className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${currentPage === totalPages ? "bg-orange-600 text-white" : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"}`}
                                                disabled={isLoading}
                                            >
                                                {totalPages}
                                            </button>,
                                        );
                                    }
                                    return pages;
                                })()}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                                className="rounded-lg p-2 text-gray-600 transition-colors hover:border hover:border-orange-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default RFidTable;