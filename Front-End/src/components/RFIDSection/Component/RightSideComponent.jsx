import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Users, Home, MapPin, Search, ChevronLeft, ChevronRight, Download, X, CheckCircle, Clock, AlertCircle, Package, Tag } from "lucide-react";
import { useHistory } from "../../../contexts/HistoryContext/HistoryContext";
import { CategoryContext } from "../../../contexts/CategoryContext/categoryContext";
import { ResidentContext } from "../../../contexts/ResidentContext/ResidentContext";

const RightSideComponent = () => {
    // State management
    const [searchTerm, setSearchTerm] = useState("");
    const { categories } = useContext(CategoryContext);
    const [selectedMunicipality, setSelectedMunicipality] = useState("");
    const [selectedBarangay, setSelectedBarangay] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [theme] = useState("light");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categoryOptions, setCategoryOptions] = useState([]);

    // Manual municipality options
    const [municipalityOptions] = useState(["", "Caibiran", "Naval", "Maripipi", "Cabucgayan", "Culaba", "Biliran"]);

    // Context variables
    const { barangays, fetchBarangays } = useContext(ResidentContext);

    // Use HistoryContext
    const { assistancesToday, isLoading, paginationToday, fetchHistoryToday } = useHistory();

    console.log("assistancesToday", assistancesToday);

    // Extract pagination data from HistoryContext
    const {
        totalAssistances: TotalAssistances,
        totalPages: TotalPages,
        currentPage: CurrentPage,
    } = paginationToday || { totalAssistances: 0, totalPages: 0, currentPage: 1 };

    // State for local search term
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [localSelectedBarangay, setLocalSelectedBarangay] = useState(selectedBarangay || "");

    // Refs to prevent double fetching
    const isInitialMount = useRef(true);
    const prevFilters = useRef({
        itemsPerPage,
        selectedMunicipality,
        selectedBarangay,
        selectedCategory,
        localSearchTerm,
    });
    const debounceTimerRef = useRef(null);

    // Update category options from context
    useEffect(() => {
        if (categories && categories.length > 0) {
            console.log("Categories from context:", categories);
            // Set category options
            const options = categories.map((cat) => ({
                id: cat._id || cat.id,
                name: cat.categoryName || cat.name || cat,
            }));
            setCategoryOptions(options);
        }
    }, [categories]);

    // Function to get barangays for dropdown - DIRECT from context
    const getBarangayOptions = useCallback(() => {
        if (!selectedMunicipality) {
            return [""];
        }

        if (barangays && Array.isArray(barangays) && barangays.length > 0) {
            console.log("Barangays data available:", barangays);

            // Extract barangay names from context data
            const barangayNames = barangays.map((barangay) => {
                return barangay.barangayName || barangay.name || barangay.barangay || barangay;
            });

            // Remove duplicates and sort alphabetically
            const uniqueBarangays = [...new Set(barangayNames)].sort();

            return ["", ...uniqueBarangays];
        }

        console.log("No barangays data available or empty array");
        return [""];
    }, [selectedMunicipality, barangays]);

    // Fetch barangays when municipality changes
    useEffect(() => {
        if (selectedMunicipality && fetchBarangays) {
            console.log("Fetching barangays for municipality:", selectedMunicipality);
            fetchBarangays(selectedMunicipality);
        }
    }, [selectedMunicipality, fetchBarangays]);

    // Memoized fetch function to prevent infinite loops
    const fetchData = useCallback(
        (page = 1) => {
            console.log("fetchHistoryToday called with page:", page);

            const params = {
                page,
                limit: itemsPerPage,
                municipality: selectedMunicipality || "",
                barangay: selectedBarangay || "",
                categoryId: selectedCategory || "",
                search: localSearchTerm.trim() || "",
            };

            console.log("Fetching with params:", params);

            // Call fetchHistoryToday from HistoryContext
            fetchHistoryToday(params.page, params.limit, params.municipality, params.barangay, params.categoryId, params.search);
        },
        [fetchHistoryToday, itemsPerPage, selectedMunicipality, selectedBarangay, selectedCategory, localSearchTerm],
    );

    // Initial fetch only - isang beses lang sa mount
    useEffect(() => {
        if (isInitialMount.current) {
            console.log("Initial fetch on mount - TODAY'S HISTORY");
            fetchData(1);
            isInitialMount.current = false;

            // Initialize prevFilters with initial values
            prevFilters.current = {
                itemsPerPage,
                selectedMunicipality,
                selectedBarangay,
                selectedCategory,
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
            prevFilters.current.selectedMunicipality !== selectedMunicipality ||
            prevFilters.current.selectedBarangay !== selectedBarangay ||
            prevFilters.current.selectedCategory !== selectedCategory ||
            prevFilters.current.localSearchTerm !== localSearchTerm;

        if (filtersChanged) {
            console.log("Filter changed, debouncing...");

            // Clear any existing debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Set new debounce timer
            debounceTimerRef.current = setTimeout(() => {
                console.log("Debounced fetch triggered");
                fetchData(1);

                // Update prevFilters
                prevFilters.current = {
                    itemsPerPage,
                    selectedMunicipality,
                    selectedBarangay,
                    selectedCategory,
                    localSearchTerm,
                };
            }, 300); // 300ms debounce
        }

        // Cleanup function
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [itemsPerPage, selectedMunicipality, selectedBarangay, selectedCategory, localSearchTerm, fetchData]);

    // Calculate showing range
    const startIndex = TotalAssistances > 0 ? (CurrentPage - 1) * itemsPerPage + 1 : 0;
    const endIndex = Math.min(CurrentPage * itemsPerPage, TotalAssistances || 0);
    const showingTotal = TotalAssistances || 0;

    const getReleaseStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "released":
                return theme === "dark" ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700";
            case "for release":
                return theme === "dark" ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700";
            case "pending":
                return theme === "dark" ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700";
            case "not eligible":
                return theme === "dark" ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700";
            default:
                return theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-700";
        }
    };

    const getReleaseStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "released":
                return <CheckCircle size={12} />;
            case "for release":
                return <Package size={12} />;
            case "pending":
                return <Clock size={12} />;
            case "not eligible":
                return <AlertCircle size={12} />;
            default:
                return <Clock size={12} />;
        }
    };

    // Update local search term when prop changes
    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    // Update local barangay when prop changes
    useEffect(() => {
        setLocalSelectedBarangay(selectedBarangay || "");
    }, [selectedBarangay]);

    // Get category options for dropdown
    const getCategoryOptions = () => {
        // Use categories from context if available
        if (categoryOptions && categoryOptions.length > 0) {
            const options = [{ id: "", name: "All Categories" }];
            categoryOptions.forEach((cat) => {
                if (cat.id && cat.name) {
                    options.push({ id: cat.id, name: cat.name });
                }
            });
            return options;
        }

        // Fallback: extract unique categories from assistance data
        const allCategories = [];
        assistancesToday?.forEach((assistance) => {
            if (assistance.categoryId && assistance.categoryName) {
                allCategories.push({
                    id: assistance.categoryId,
                    name: assistance.categoryName,
                });
            }
        });

        // Remove duplicates
        const uniqueCategories = Array.from(new Map(allCategories.map((cat) => [cat.id, cat])).values());

        return [{ id: "", name: "All Categories" }, ...uniqueCategories];
    };

    const handlePageChange = (page) => {
        console.log("Page change to:", page);
        fetchData(page);
    };

    const handleItemsPerPageChange = (value) => {
        const newLimit = parseInt(value);
        console.log("Items per page changed to:", newLimit);
        setItemsPerPage(newLimit);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        console.log("Search term changed to:", value);
        setLocalSearchTerm(value);
        setSearchTerm(value);
    };

    // Handle clear search
    const handleClearSearch = () => {
        console.log("Clearing search");
        setLocalSearchTerm("");
        setSearchTerm("");
    };

    // Handle municipality change
    const handleMunicipalityChange = (e) => {
        const value = e.target.value;
        console.log("Municipality changed to:", value);
        setSelectedMunicipality(value);
        setSelectedBarangay("");
        setLocalSelectedBarangay("");
    };

    // Handle barangay change - DIRECT from context
    const handleBarangayChange = (e) => {
        const value = e.target.value;
        console.log("Barangay changed to:", value);
        setSelectedBarangay(value);
        setLocalSelectedBarangay(value);
    };

    // Handle category change
    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;
        console.log("Category changed to:", selectedValue);
        setSelectedCategory(selectedValue);
    };

    // Handle clear category
    const handleClearCategory = () => {
        console.log("Clearing category");
        setSelectedCategory("");
    };

    // Event handlers
    const onDownloadTemplate = () => {
        console.log("Download template");
        // Implement download logic
    };

    const onClearMunicipality = () => {
        setSelectedMunicipality("");
    };

    const onClearBarangay = () => {
        setSelectedBarangay("");
        setLocalSelectedBarangay("");
    };

    // Get barangays for dropdown - DIRECT from context
    const barangayOptions = getBarangayOptions();

    // Get category options
    const categoryOptionsList = getCategoryOptions();

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return "N/A";
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    return (
        <>
            {/* Main Table Content - MAS PINIPIS NA LAYOUT */}
            <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
                {/* Table Header - MAS PINIPIS */}
                <div className="border-b border-gray-200 p-4 dark:border-gray-700 md:p-6">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white md:text-xl">
                                <Users
                                    size={20}
                                    className="text-orange-600 dark:text-orange-400"
                                />
                                Today's History
                            </h2>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 md:text-sm">
                                Showing {showingTotal} assistances in {selectedMunicipality ? selectedMunicipality : "all municipalities"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onDownloadTemplate}
                                className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-700 transition-colors hover:border-orange-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-orange-600 dark:hover:bg-gray-700 md:px-3 md:py-2 md:text-sm"
                                disabled={isLoading}
                            >
                                <Download size={14} />
                                <span className="hidden md:inline">Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filter - MAS COMPACT */}
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                        {/* Search Bar */}
                        <div className="relative md:col-span-2">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={localSearchTerm}
                                onChange={handleSearchChange}
                                className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white md:py-2"
                                disabled={isLoading}
                            />
                            {localSearchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    disabled={isLoading}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Municipality Filter */}
                        <div className="flex items-center gap-1">
                            <MapPin
                                size={16}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            <select
                                value={selectedMunicipality}
                                onChange={handleMunicipalityChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white md:px-3 md:py-2"
                                disabled={isLoading}
                            >
                                {municipalityOptions.map((municipality) => (
                                    <option
                                        key={municipality}
                                        value={municipality}
                                    >
                                        {municipality === "" ? "All Mun." : municipality}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Barangay Filter */}
                        <div className="flex items-center gap-1">
                            <Home
                                size={16}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            <select
                                value={localSelectedBarangay}
                                onChange={handleBarangayChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white md:px-3 md:py-2"
                                disabled={!selectedMunicipality || isLoading || !barangays?.length}
                                title={!selectedMunicipality ? "Select municipality first" : ""}
                            >
                                {barangayOptions.map((barangay) => (
                                    <option
                                        key={barangay}
                                        value={barangay}
                                    >
                                        {barangay === "" ? "All Brgy." : barangay}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Category Filter - SEPARATE ROW */}
                    <div className="mt-3">
                        <div className="flex items-center gap-2">
                            <Tag
                                size={16}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            <select
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white md:py-2"
                                disabled={isLoading}
                            >
                                {categoryOptionsList.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display - MAS PINIPIS */}
                    {(selectedMunicipality || localSelectedBarangay || localSearchTerm || selectedCategory) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {selectedMunicipality && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                    <MapPin size={10} />
                                    {selectedMunicipality}
                                    <button
                                        onClick={onClearMunicipality}
                                        className="ml-1 hover:text-orange-900 dark:hover:text-orange-300"
                                        disabled={isLoading}
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            )}
                            {localSelectedBarangay && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    <Home size={10} />
                                    {localSelectedBarangay}
                                    <button
                                        onClick={onClearBarangay}
                                        className="ml-1 hover:text-green-900 dark:hover:text-green-300"
                                        disabled={isLoading}
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            )}
                            {localSearchTerm && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Search size={10} />
                                    {localSearchTerm}
                                    <button
                                        onClick={handleClearSearch}
                                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-300"
                                        disabled={isLoading}
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            )}
                            {selectedCategory && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                                    <Tag size={10} />
                                    {categoryOptionsList.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                                    <button
                                        onClick={handleClearCategory}
                                        className="ml-1 hover:text-cyan-900 dark:hover:text-cyan-300"
                                        disabled={isLoading}
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Table Content - MAS PINIPIS */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-6 text-center">
                            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500"></div>
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading records...</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                                <tr>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Resident</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Location</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Item</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assistancesToday && assistancesToday.length > 0 ? (
                                    assistancesToday.map((assistance) => (
                                        <tr
                                            key={assistance._id}
                                            className="border-t border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                                        >
                                            <td className="p-3 text-gray-600 dark:text-gray-400">
                                                <div className="text-xs font-medium md:text-sm">
                                                    {formatDate(assistance.distributionDate || assistance.scheduleDate)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                                    {assistance.scheduleDate && assistance.distributionDate !== assistance.scheduleDate
                                                        ? `Sched: ${formatDate(assistance.scheduleDate)}`
                                                        : ""}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {assistance.residentName || "N/A"}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        <Home size={10} />
                                                        {assistance.barangay || "N/A"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                        <MapPin size={10} />
                                                        {assistance.municipality || "N/A"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        theme === "dark" ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700"
                                                    }`}
                                                >
                                                    <Package size={10} />
                                                    <span className="max-w-[80px] truncate">{assistance.categoryName || "Unknown"}</span>
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {formatCurrency(assistance.assistanceAmount || 0)}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {assistance.items && assistance.items.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        {assistance.items.map((item, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs text-gray-700 dark:text-gray-300"
                                                            >
                                                                {item.itemName} ({item.quantity} {item.unit})
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">No items</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold uppercase ${getReleaseStatusColor(assistance.distributionStatus)}`}
                                                >
                                                    {getReleaseStatusIcon(assistance.distributionStatus)}
                                                    {assistance.distributionStatus?.charAt(0).toUpperCase() +
                                                        assistance.distributionStatus?.slice(1) || "Pending"}
                                                </span>
                                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Priority: {assistance.statusSelection || "Pending"}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="p-6 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Users
                                                    className="mb-2 text-gray-400 dark:text-gray-600"
                                                    size={36}
                                                />
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No records found</p>
                                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
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

                {/* Pagination and Page Size Controls - MAS PINIPIS */}
                {!isLoading && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 p-3 dark:border-gray-700 md:flex-row">
                        <div className="flex items-center gap-3">
                    

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">Show:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                    className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 md:px-2 md:py-1 md:text-sm"
                                    disabled={isLoading}
                                >
                                    {[5, 10, 20, 50, 100].map((option) => (
                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <span className="hidden text-xs text-gray-500 dark:text-gray-400 md:inline md:text-sm">entries</span>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(CurrentPage - 1)}
                                disabled={CurrentPage === 1 || isLoading || TotalPages === 0}
                                className="rounded-lg p-1.5 text-gray-600 transition-colors hover:border hover:border-orange-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700 md:p-2"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {(() => {
                                    const pages = [];
                                    const maxVisiblePages = 5;

                                    if (TotalPages <= maxVisiblePages) {
                                        for (let i = 1; i <= TotalPages; i++) {
                                            pages.push(
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(i)}
                                                    className={`min-w-[1.5rem] rounded-lg px-1 py-0.5 text-xs font-medium transition-colors md:min-w-[2rem] md:px-2 md:py-1 md:text-sm ${
                                                        CurrentPage === i
                                                            ? "bg-orange-600 text-white"
                                                            : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                                                    }`}
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
                                                className={`min-w-[1.5rem] rounded-lg px-1 py-0.5 text-xs font-medium transition-colors md:min-w-[2rem] md:px-2 md:py-1 md:text-sm ${
                                                    CurrentPage === 1
                                                        ? "bg-orange-600 text-white"
                                                        : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                                                }`}
                                                disabled={isLoading}
                                            >
                                                1
                                            </button>,
                                        );

                                        if (CurrentPage > 3) {
                                            pages.push(
                                                <span
                                                    key="ellipsis-start"
                                                    className="px-0.5 text-gray-400 dark:text-gray-600 md:px-1"
                                                >
                                                    ...
                                                </span>,
                                            );
                                        }

                                        const start = Math.max(2, CurrentPage - 1);
                                        const end = Math.min(TotalPages - 1, CurrentPage + 1);

                                        for (let i = start; i <= end; i++) {
                                            pages.push(
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(i)}
                                                    className={`min-w-[1.5rem] rounded-lg px-1 py-0.5 text-xs font-medium transition-colors md:min-w-[2rem] md:px-2 md:py-1 md:text-sm ${
                                                        CurrentPage === i
                                                            ? "bg-orange-600 text-white"
                                                            : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                                                    }`}
                                                    disabled={isLoading}
                                                >
                                                    {i}
                                                </button>,
                                            );
                                        }

                                        if (CurrentPage < TotalPages - 2) {
                                            pages.push(
                                                <span
                                                    key="ellipsis-end"
                                                    className="px-0.5 text-gray-400 dark:text-gray-600 md:px-1"
                                                >
                                                    ...
                                                </span>,
                                            );
                                        }

                                        pages.push(
                                            <button
                                                key={TotalPages}
                                                onClick={() => handlePageChange(TotalPages)}
                                                className={`min-w-[1.5rem] rounded-lg px-1 py-0.5 text-xs font-medium transition-colors md:min-w-[2rem] md:px-2 md:py-1 md:text-sm ${
                                                    CurrentPage === TotalPages
                                                        ? "bg-orange-600 text-white"
                                                        : "text-gray-600 hover:border hover:border-orange-300 hover:bg-gray-100 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                                                }`}
                                                disabled={isLoading}
                                            >
                                                {TotalPages}
                                            </button>,
                                        );
                                    }

                                    return pages;
                                })()}
                            </div>

                            <button
                                onClick={() => handlePageChange(CurrentPage + 1)}
                                disabled={CurrentPage === TotalPages || TotalPages === 0 || isLoading}
                                className="rounded-lg p-1.5 text-gray-600 transition-colors hover:border hover:border-orange-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700 md:p-2"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default RightSideComponent;
