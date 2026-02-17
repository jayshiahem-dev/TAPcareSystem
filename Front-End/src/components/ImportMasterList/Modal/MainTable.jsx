import React, { useState, useEffect, useContext } from "react";
import { Users, Home, MapPin, Search, ChevronLeft, ChevronRight, Eye, Trash2, Download, Radio, X, CheckSquare, Gift, Calendar } from "lucide-react";
import { AssistanceContext } from "../../../contexts/AssignContext/AssignContext";
import AyudaFormModal from "./AyudaFormModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

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
    setCurrentPage,
    theme,
    onViewResident,
    onDownloadTemplate,
    onDeleteResident,
    // Pagination props from parent
    pagination,
    onFetchData,
    isLoading,
    // Clear functions
    onClearSearch,
    onClearMunicipality,
    onClearBarangay,
    barangays,
    onSelectAllResidents,
    categories,
}) => {
    const pageSizeOptions = [5, 10, 20, 50, 100];
    const { createAssistance } = useContext(AssistanceContext);
    const [isCreatingAssistance, setIsCreatingAssistance] = useState(false);

    // State for delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [localSelectedBarangay, setLocalSelectedBarangay] = useState(selectedBarangay || "All");

    // State for select all functionality
    const [selectAll, setSelectAll] = useState(false);
    const [selectedResidents, setSelectedResidents] = useState([]);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isSelectingAllPages, setIsSelectingAllPages] = useState(false);
    const [triggeredBySelectAllCheckbox, setTriggeredBySelectAllCheckbox] = useState(false);
    // State for status selection
    const [statusSelection, setStatusSelection] = useState("Priority");

    // Use paginated data directly from props (server-side filtered)
    const paginatedData = data || [];

    // Use pagination from props
    const totalPages = pagination?.totalPages || 1;
    const totalResidents = pagination?.totalResidents || 0;
    const serverCurrentPage = pagination?.currentPage || 1;

    // Calculate showing range
    const startIndex = (serverCurrentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalResidents);

    console.log("data",data)

    const getStatusColor = (status) => {
        switch (status) {
            case "Validated":
                return theme === "dark" ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700";
            case "Pending":
                return theme === "dark" ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700";
            case "Missing Info":
                return theme === "dark" ? "bg-orange-900/30 text-orange-400" : "bg-orange-100 text-orange-700";
            default:
                return theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-700";
        }
    };

    // Helper function to format resident name
    const formatName = (resident) => {
        const nameParts = [
            resident.firstname && resident.firstname !== "None" ? resident.firstname : null,
            resident.middlename && resident.middlename !== "None" ? resident.middlename : null,
            resident.lastname && resident.lastname !== "None" ? resident.lastname : null,
            resident.suffix && resident.suffix !== "None" ? resident.suffix : null
        ].filter(part => part !== null && part !== "");
        
        return nameParts.join(" ");
    };

    // HELPER FUNCTION: Format birthdate with age calculation
    const formatBirthdateWithAge = (birthdate) => {
        if (!birthdate || birthdate === "None" || birthdate === "") {
            return "N/A";
        }

        try {
            // Parse the birthdate
            const birthDateObj = new Date(birthdate);
            
            // Check if date is valid
            if (isNaN(birthDateObj.getTime())) {
                return birthdate; // Return original if invalid
            }

            // Calculate age
            const today = new Date();
            let age = today.getFullYear() - birthDateObj.getFullYear();
            const monthDiff = today.getMonth() - birthDateObj.getMonth();
            
            // Adjust age if birthday hasn't occurred this year yet
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
                age--;
            }

            // Format date to readable format (e.g., "Jan 15, 1990")
            const formattedDate = birthDateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            // Return formatted date with age in parentheses
            return `${formattedDate} (${age}y/o)`;
        } catch (error) {
            console.error("Error formatting birthdate:", error);
            return birthdate; // Return original if error
        }
    };

    // HELPER FUNCTION: Get age from birthdate only
    const getAgeFromBirthdate = (birthdate) => {
        if (!birthdate || birthdate === "None" || birthdate === "") {
            return "N/A";
        }

        try {
            const birthDateObj = new Date(birthdate);
            
            if (isNaN(birthDateObj.getTime())) {
                return "N/A";
            }

            const today = new Date();
            let age = today.getFullYear() - birthDateObj.getFullYear();
            const monthDiff = today.getMonth() - birthDateObj.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
                age--;
            }

            return `${age} years old`;
        } catch (error) {
            console.error("Error calculating age:", error);
            return "N/A";
        }
    };

    // Update local search term when prop changes
    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    // Update local barangay when prop changes
    useEffect(() => {
        setLocalSelectedBarangay(selectedBarangay || "All");
    }, [selectedBarangay]);

    // Update selected residents when selectAll changes
    useEffect(() => {
        if (selectAll && paginatedData.length > 0) {
            const residentIds = paginatedData.map((item) => item._id);
            setSelectedResidents(residentIds);

            // If this was triggered by the select all checkbox, show popup after a short delay
            if (triggeredBySelectAllCheckbox) {
                setTimeout(() => {
                    setShowCategoryPopup(true);
                    setTriggeredBySelectAllCheckbox(false);
                }, 100);
            }
        } else if (!selectAll && selectedResidents.length === paginatedData.length && paginatedData.length > 0) {
            // Only clear if selectAll is false and not all are selected
            setSelectedResidents([]);
        }
    }, [selectAll, paginatedData, triggeredBySelectAllCheckbox]);

    // Handle search with debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            if (setSearchTerm) {
                setSearchTerm(localSearchTerm);
            }
        }, 2000);

        return () => {
            clearTimeout(handler);
        };
    }, [localSearchTerm, setSearchTerm]);

    // Function to validate municipality selection
    const validateMunicipalitySelection = () => {
        if (selectedMunicipality === "All") {
            alert("Please select a municipality first before using 'Select All' functionality.");
            return false;
        }
        return true;
    };

    // Function to get filtered barangays based on selected municipality
    const getFilteredBarangaysForDropdown = () => {
        // If "All" is selected for municipality, show "All" only
        if (selectedMunicipality === "All") {
            return ["All"];
        }

        // Use barangays data from props if available
        if (barangays && barangays.length > 0) {
            const options = ["All", ...barangays];
            return options;
        }

        // Fallback to filteredBarangays from context/residents data
        if (filteredBarangays && filteredBarangays.length > 0) {
            const fallback = ["All", ...filteredBarangays];
            return fallback;
        }

        // Default fallback
        return ["All"];
    };

    const handlePageChange = (page) => {
        if (onFetchData) {
            const params = {
                page,
                limit: itemsPerPage,
            };

            if (searchTerm && searchTerm.trim() !== "") {
                params.search = searchTerm;
            }

            if (selectedMunicipality !== "All") {
                params.municipality = selectedMunicipality;
            }

            if (localSelectedBarangay !== "All") {
                params.barangay = localSelectedBarangay;
            }

            onFetchData(params);
        }
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value) => {
        const newLimit = parseInt(value);
        setItemsPerPage(newLimit);

        if (onFetchData) {
            const params = {
                page: 1,
                limit: newLimit,
            };

            if (searchTerm && searchTerm.trim() !== "") {
                params.search = searchTerm;
            }

            if (selectedMunicipality !== "All") {
                params.municipality = selectedMunicipality;
            }

            if (localSelectedBarangay !== "All") {
                params.barangay = localSelectedBarangay;
            }

            onFetchData(params);
        }
        setCurrentPage(1);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setLocalSearchTerm(value);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setLocalSearchTerm("");
        if (onClearSearch) {
            onClearSearch();
        }
    };

    // Handle municipality change
    const handleMunicipalityChange = (e) => {
        const value = e.target.value;
        console.log("Municipality changed to:", value);

        if (setSelectedMunicipality) {
            setSelectedMunicipality(value);
        }

        // Reset barangay selection when municipality changes
        setLocalSelectedBarangay("All");
        if (setSelectedBarangay) {
            setSelectedBarangay("All");
        }

        // Trigger data fetch
        if (onFetchData) {
            const params = {
                page: 1,
                limit: itemsPerPage,
                municipality: value !== "All" ? value : undefined,
                barangay: undefined, // Clear barangay filter when municipality changes
            };

            if (searchTerm && searchTerm.trim() !== "") {
                params.search = searchTerm;
            }

            onFetchData(params);
        }
    };

    // Handle barangay change
    const handleBarangayChange = (e) => {
        const value = e.target.value;
        console.log("Barangay changed to:", value);

        // Update local state immediately
        setLocalSelectedBarangay(value);

        // Call parent function if provided
        if (setSelectedBarangay) {
            setSelectedBarangay(value);
        }

        // Trigger data fetch if onFetchData is provided
        if (onFetchData) {
            const params = {
                page: 1,
                limit: itemsPerPage,
                barangay: value !== "All" ? value : undefined,
                municipality: selectedMunicipality !== "All" ? selectedMunicipality : undefined,
            };

            if (searchTerm && searchTerm.trim() !== "") {
                params.search = searchTerm;
            }

            onFetchData(params);
        }
    };

    // Delete confirmation handler
    const handleDeleteClick = (resident) => {
        setDeleteConfirm({
            id: resident._id,
            name: resident.name,
        });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm && onDeleteResident) {
            onDeleteResident(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirm(null);
    };

    // Handle individual checkbox selection
    const handleIndividualCheckbox = (residentId) => {
        if (selectedResidents.includes(residentId)) {
            const newSelected = selectedResidents.filter((id) => id !== residentId);
            setSelectedResidents(newSelected);

            // Update selectAll state
            if (selectAll && newSelected.length !== paginatedData.length) {
                setSelectAll(false);
                // Kapag nag-uncheck sa manually selected, ibalik sa Priority
                setStatusSelection("Priority");
            }
        } else {
            const newSelected = [...selectedResidents, residentId];
            setSelectedResidents(newSelected);

            // Update selectAll state if all residents are now selected
            if (!selectAll && newSelected.length === paginatedData.length) {
                setSelectAll(true);
                // Kapag manual checking tapos naging select all, it's still Priority
                setStatusSelection("Priority");
            }
        }

        // Individual selection is always Priority
        setIsSelectingAllPages(false);
        setTriggeredBySelectAllCheckbox(false);
        setStatusSelection("Priority");
    };

    // Handle select all for current page
    const handleSelectAll = () => {
        // Validate municipality selection for current page select all
        if (!selectAll && selectedMunicipality === "All") {
            alert("Please select a municipality first before using 'Select All on This Page' functionality.");
            return;
        }
        
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            // Mark that this was triggered by the select all checkbox
            setTriggeredBySelectAllCheckbox(true);
            // Set isSelectingAllPages to false since this is only current page selection
            setIsSelectingAllPages(false);
            // SET STATUS TO "All" for Select All on This Page checkbox
            setStatusSelection("All");
        } else {
            // Deselect all
            setSelectedResidents([]);
            setIsSelectingAllPages(false);
            setTriggeredBySelectAllCheckbox(false);
            // Reset status when deselecting
            setStatusSelection("Priority");
        }
    };

    // Handle select all from all pages
    const handleSelectAllPages = () => {
        // Validate municipality selection
        if (!validateMunicipalitySelection()) {
            return;
        }
        
        setIsSelectingAllPages(true);
        setTriggeredBySelectAllCheckbox(false);
        // SET STATUS TO "All" for Select All Residents button
        setStatusSelection("All");
        setShowCategoryPopup(true);
    };

    // Show category popup for selected residents
    const showCategoryPopupForSelection = () => {
        // Validate municipality selection for manual selection
        if (selectedMunicipality === "All") {
            alert("Please select a municipality first before assigning ayuda.");
            return;
        }
        
        setIsSelectingAllPages(false);
        setTriggeredBySelectAllCheckbox(false);
        // Kapag manual selection, laging Priority
        setStatusSelection("Priority");
        setShowCategoryPopup(true);
    };

    // Helper function to reset selection states
    const resetSelectionStates = () => {
        setShowCategoryPopup(false);
        setSelectedCategory("");
        setIsSelectingAllPages(false);
        setSelectAll(false);
        setSelectedResidents([]);
        setTriggeredBySelectAllCheckbox(false);
        setStatusSelection("Priority");
    };

    // Close category popup
    const handleCategoryCancel = () => {
        setShowCategoryPopup(false);
        setSelectedCategory("");
        setIsSelectingAllPages(false);
        setTriggeredBySelectAllCheckbox(false);
        // RESET STATUS
        setStatusSelection("Priority");

        // Also reset select all if cancelling
        if (isSelectingAllPages || triggeredBySelectAllCheckbox) {
            setSelectAll(false);
            setSelectedResidents([]);
        }
    };

    // Close modals when clicking outside
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setDeleteConfirm(null);
                setShowCategoryPopup(false);
            }
        };

        const handleClickOutside = (e) => {
            if (showCategoryPopup && e.target.closest(".category-popup") === null) {
                handleCategoryCancel();
            }
        };

        document.addEventListener("keydown", handleEscape);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showCategoryPopup]);

    // Get barangays for dropdown
    const barangayOptions = getFilteredBarangaysForDropdown();

    return (
        <>
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                deleteConfirm={deleteConfirm}
                onCancelDelete={handleCancelDelete}
                onConfirmDelete={handleConfirmDelete}
                theme={theme}
            />

            {/* Ayuda Form Modal */}
            <AyudaFormModal
                showCategoryPopup={showCategoryPopup}
                setShowCategoryPopup={setShowCategoryPopup}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                isSelectingAllPages={isSelectingAllPages}
                selectAll={selectAll}
                triggeredBySelectAllCheckbox={triggeredBySelectAllCheckbox}
                selectedResidents={selectedResidents}
                paginatedData={paginatedData}
                totalResidents={totalResidents}
                statusSelection={statusSelection}
                categories={categories}
                selectedMunicipality={selectedMunicipality}
                selectedBarangay={selectedBarangay}
                searchTerm={searchTerm}
                serverCurrentPage={serverCurrentPage}
                itemsPerPage={itemsPerPage}
                onFetchData={onFetchData}
                onSelectAllResidents={onSelectAllResidents}
                resetSelectionStates={resetSelectionStates}
                handleCategoryCancel={handleCategoryCancel}
                isCreatingAssistance={isCreatingAssistance}
                setIsCreatingAssistance={setIsCreatingAssistance}
            />

            {/* Main Table Content */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
                {/* Table Header */}
                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                                <Users
                                    size={24}
                                    className="text-orange-600 dark:text-orange-400"
                                />
                                Resident Master List
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {totalResidents} residents listed in {selectedMunicipality !== "All" ? selectedMunicipality : "all municipalities"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Select All Actions */}
                            {selectedResidents.length > 0 && (
                                <div className="mr-2 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 dark:border-orange-800 dark:bg-orange-900/20">
                                    <CheckSquare
                                        className="text-orange-600 dark:text-orange-400"
                                        size={16}
                                    />
                                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                        {selectedResidents.length} selected
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={onDownloadTemplate}
                                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-orange-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                                disabled={isLoading || isCreatingAssistance}
                            >
                                <Download size={16} />
                                Template
                            </button>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                        {/* Search Bar */}
                        <div className="relative md:col-span-2">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search by name or RFID..."
                                value={localSearchTerm}
                                onChange={handleSearchChange}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={isLoading || isCreatingAssistance}
                            />
                            {localSearchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    disabled={isLoading || isCreatingAssistance}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Municipality Filter */}
                        <div className="flex items-center gap-2">
                            <MapPin
                                size={18}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            <select
                                value={selectedMunicipality}
                                onChange={handleMunicipalityChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={isLoading || isCreatingAssistance}
                            >
                                {municipalityOptions.map((municipality) => (
                                    <option
                                        key={municipality}
                                        value={municipality}
                                    >
                                        {municipality}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Barangay Filter */}
                        <div className="flex items-center gap-2">
                            <Home
                                size={18}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            <select
                                value={localSelectedBarangay}
                                onChange={handleBarangayChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={selectedMunicipality === "All" || isLoading || isCreatingAssistance}
                                title={selectedMunicipality === "All" ? "Please select a municipality first" : ""}
                            >
                                {barangayOptions.map((barangay) => (
                                    <option
                                        key={barangay}
                                        value={barangay}
                                    >
                                        {barangay}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedMunicipality !== "All" || localSelectedBarangay !== "All" || searchTerm) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {selectedMunicipality !== "All" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                    <MapPin size={12} />
                                    {selectedMunicipality}
                                    <button
                                        onClick={onClearMunicipality}
                                        className="ml-1 hover:text-orange-900 dark:hover:text-orange-300"
                                        disabled={isLoading || isCreatingAssistance}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
                            {localSelectedBarangay !== "All" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <Home size={12} />
                                    {localSelectedBarangay}
                                    <button
                                        onClick={() => {
                                            setLocalSelectedBarangay("All");
                                            if (setSelectedBarangay) {
                                                setSelectedBarangay("All");
                                            }
                                            if (onClearBarangay) {
                                                onClearBarangay();
                                            }
                                        }}
                                        className="ml-1 hover:text-green-900 dark:hover:text-green-300"
                                        disabled={isLoading || isCreatingAssistance}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
                            {searchTerm && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Search size={12} />
                                    Search: {searchTerm}
                                    <button
                                        onClick={handleClearSearch}
                                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-300"
                                        disabled={isLoading || isCreatingAssistance}
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
                            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading residents...</p>
                        </div>
                    ) : (
                        <>
                            {/* Select All Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700"
                                            disabled={isCreatingAssistance || selectedMunicipality === "All"}
                                            title={selectedMunicipality === "All" ? "Select a municipality first" : ""}
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Select All
                                        </span>
                                    </label>

                                    {selectedResidents.length > 0 && (
                                        <button
                                            onClick={() => {
                                                if (selectedMunicipality === "All") {
                                                    alert("Please select a municipality first before assigning ayuda.");
                                                    return;
                                                }
                                                showCategoryPopupForSelection();
                                            }}
                                            className="ml-2 flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-orange-700"
                                            disabled={isCreatingAssistance}
                                        >
                                            <Gift size={14} />
                                            Assign Ayuda ({selectedResidents.length})
                                        </button>
                                    )}
                                </div>

                                {totalPages > 1 && (
                                    <button
                                        onClick={handleSelectAllPages}
                                        className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
                                        disabled={isCreatingAssistance}
                                        title={selectedMunicipality === "All" ? "Please select a municipality first" : "Select all residents from all pages"}
                                    >
                                        <CheckSquare size={14} />
                                        Select All Residents
                                    </button>
                                )}
                            </div>

                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="w-12 p-4">{/* Empty header for checkbox column */}</th>
                                                                                <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">HouseHold Id</th>
                                        <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                        <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                BirthDate
                                            </div>
                                        </th>
                                        <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Gender</th>
                                        <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Barangay</th>
                                        <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Municipality</th>
                                        <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                                        <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">RFID</th>
                                        <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                        <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item) => (
                                            <tr
                                                key={item.id || item._id}
                                                className="border-t border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                                            >
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedResidents.includes(item._id)}
                                                        onChange={() => handleIndividualCheckbox(item._id)}
                                                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700"
                                                        disabled={isCreatingAssistance}
                                                    />
                                                </td>
                                                 <td className="p-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {item.household_id}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {formatName(item)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-400">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{formatBirthdateWithAge(item.birth_date)}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Age: {getAgeFromBirthdate(item.birth_date)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                            item.gender === "Male"
                                                                ? theme === "dark"
                                                                    ? "bg-blue-900/30 text-blue-400"
                                                                    : "bg-blue-100 text-blue-700"
                                                                : theme === "dark"
                                                                  ? "bg-pink-900/30 text-pink-400"
                                                                  : "bg-pink-100 text-pink-700"
                                                        }`}
                                                    >
                                                        {item.gender}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        <Home size={12} />
                                                        {item.barangay}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                        <MapPin size={12} />
                                                        {item.municipality}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-400">{item.contact_number}</td>
                                                <td className="p-4">
                                                    {item.rfid ? (
                                                        <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                            <Radio size={12} />
                                                            {item.rfid}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs italic text-gray-400 dark:text-gray-500">No RFID</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-bold uppercase ${getStatusColor(item.status)}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => onViewResident(item)}
                                                            className="rounded p-1.5 text-gray-500 transition-colors hover:border hover:border-gray-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                                                            title="View Full Information"
                                                            disabled={isCreatingAssistance}
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(item)}
                                                            className="rounded p-1.5 text-red-500 transition-colors hover:border hover:border-red-200 hover:bg-red-50 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-900/20"
                                                            title="Delete Resident"
                                                            disabled={isCreatingAssistance}
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
                                                colSpan="11"
                                                className="p-8 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <Users
                                                        className="mb-2 text-gray-400 dark:text-gray-600"
                                                        size={48}
                                                    />
                                                    <p className="font-medium text-gray-500 dark:text-gray-400">No residents found</p>
                                                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                                                        Try changing your search or filter criteria
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                {/* Pagination and Page Size Controls */}
                {!isLoading && (
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 p-4 dark:border-gray-700 md:flex-row">
                        <div className="flex items-center gap-4">

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                    disabled={isLoading || isCreatingAssistance}
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
                                onClick={() => handlePageChange(serverCurrentPage - 1)}
                                disabled={serverCurrentPage === 1 || isLoading || isCreatingAssistance}
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
                                                    className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
                                                        serverCurrentPage === i
                                                            ? "bg-orange-600 text-white"
                                                            : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                                                    }`}
                                                    disabled={isLoading || isCreatingAssistance}
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
                                                className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
                                                    serverCurrentPage === 1
                                                        ? "bg-orange-600 text-white"
                                                        : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                                                }`}
                                                disabled={isLoading || isCreatingAssistance}
                                            >
                                                1
                                            </button>,
                                        );

                                        if (serverCurrentPage > 3) {
                                            pages.push(
                                                <span
                                                    key="ellipsis-start"
                                                    className="px-1 text-gray-400 dark:text-gray-600"
                                                >
                                                    ...
                                                </span>,
                                            );
                                        }

                                        const start = Math.max(2, serverCurrentPage - 1);
                                        const end = Math.min(totalPages - 1, serverCurrentPage + 1);

                                        for (let i = start; i <= end; i++) {
                                            pages.push(
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(i)}
                                                    className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
                                                        serverCurrentPage === i
                                                            ? "bg-orange-600 text-white"
                                                            : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                                                    }`}
                                                    disabled={isLoading || isCreatingAssistance}
                                                >
                                                    {i}
                                                </button>,
                                            );
                                        }

                                        if (serverCurrentPage < totalPages - 2) {
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
                                                className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
                                                    serverCurrentPage === totalPages
                                                        ? "bg-orange-600 text-white"
                                                        : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                                                }`}
                                                disabled={isLoading || isCreatingAssistance}
                                            >
                                                {totalPages}
                                            </button>,
                                        );
                                    }

                                    return pages;
                                })()}
                            </div>

                            <button
                                onClick={() => handlePageChange(serverCurrentPage + 1)}
                                disabled={serverCurrentPage === totalPages || totalPages === 0 || isLoading || isCreatingAssistance}
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

export default MainTable;