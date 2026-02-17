// PriorityTable.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import {
    Users,
    Home,
    MapPin,
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2,
    Download,
    Radio,
    X,
    Gift,
    CheckCircle,
    Clock,
    AlertCircle,
    Package,
    Tag,
    FileSpreadsheet
} from "lucide-react";
import { AssistanceContext } from "../../../contexts/AssignContext/AssignContext";
import DeleteConfirmationModal from "../../ImportMasterList/Modal/DeleteConfirmationModal";
import { CategoryContext } from "../../../contexts/CategoryContext/categoryContext";
import { ResidentContext } from "../../../contexts/ResidentContext/ResidentContext";
import ExportModal from "./ExportModal";
import StatusModal from "../../../ReusableFolder/SuccessandField";

const PriorityTable = () => {
    // State management
    const [searchTerm, setSearchTerm] = useState("");
    const { categories } = useContext(CategoryContext);
    const [selectedMunicipality, setSelectedMunicipality] = useState("All");
    const [selectedBarangay, setSelectedBarangay] = useState("All");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [theme] = useState("light");
    const [selectedCategory, setSelectedCategory] = useState({ id: "All", name: "All" });
    const [categoryOptions, setCategoryOptions] = useState([]);

    // Status Modal State
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalProps, setStatusModalProps] = useState({
        status: "success",
        error: null,
        title: "",
        message: "",
        onRetry: null,
    });

    // Manual municipality options
    const [municipalityOptions] = useState(["All", "Caibiran", "Naval", "Maripipi", "Cabucgayan", "Culaba", "Biliran"]);

    // Context variables
    const { barangays, fetchBarangays } = useContext(ResidentContext);

    // Export Modal State
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState("pdf");
    const [selectedFields, setSelectedFields] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [exportTitle, setExportTitle] = useState("Assistance Program Report");
    const [isExporting, setIsExporting] = useState(false);

    // Export Category Selection
    const [exportCategory, setExportCategory] = useState({ id: "All", name: "All" });
    // NEW: Export-specific municipality and barangay filters
    const [exportMunicipality, setExportMunicipality] = useState("All");
    const [exportBarangay, setExportBarangay] = useState("All");
    const [exportReleaseStatus, setExportReleaseStatus] = useState("All");
    const [exportBarangaysList, setExportBarangaysList] = useState([]);
    const [isFetchingExportBarangays, setIsFetchingExportBarangays] = useState(false);

    // Available fields for export - UPDATED with all ResidentSchema fields
    const availableFields = [
        // Basic Information
        { id: "name", label: "Full Name", category: "Basic Information" },
        { id: "firstname", label: "First Name", category: "Basic Information" },
        { id: "middlename", label: "Middle Name", category: "Basic Information" },
        { id: "lastname", label: "Last Name", category: "Basic Information" },
        { id: "nickname", label: "Nickname", category: "Basic Information" },
        { id: "suffix", label: "Suffix", category: "Basic Information" },

        // Demographic Information
        { id: "age", label: "Age", category: "Demographic Information" },
        { id: "gender", label: "Gender", category: "Demographic Information" },
        { id: "birth_date", label: "Birth Date", category: "Demographic Information" },
        { id: "birth_place", label: "Birth Place", category: "Demographic Information" },
        { id: "religion", label: "Religion", category: "Demographic Information" },
        { id: "civil_status", label: "Civil Status", category: "Demographic Information" },

        // Household Information
        { id: "household_id", label: "Household ID", category: "Household Information" },
        { id: "role", label: "Household Role", category: "Household Information" },

        // Employment Information
        { id: "employment_status", label: "Employment Status", category: "Employment Information" },
        { id: "occupation", label: "Occupation", category: "Employment Information" },

        // Classification Information
        { id: "classifications", label: "Classifications", category: "Classification Information" },

        // Contact Information
        { id: "contact", label: "Contact Number", category: "Contact Information" },
        { id: "contact_number", label: "Contact Number (Full)", category: "Contact Information" },
        { id: "rfid", label: "RFID", category: "Contact Information" },

        // Location Information
        { id: "barangay", label: "Barangay", category: "Location Information" },
        { id: "municipality", label: "Municipality", category: "Location Information" },
        { id: "address", label: "Address", category: "Location Information" },
        { id: "sitio", label: "Sitio", category: "Location Information" },

        // Status Information
        { id: "status", label: "Resident Status", category: "Status Information" },

        // Registration Information
        { id: "dateRegistered", label: "Date Registered", category: "Registration Information" },
        { id: "lastUpdated", label: "Last Updated", category: "Registration Information" },
        { id: "created_at", label: "Created At", category: "Registration Information" },
        { id: "updated_at", label: "Updated At", category: "Registration Information" },

        // Assistance Information
        { id: "categoryName", label: "Assistance Program", category: "Assistance Information" },
        { id: "categoryDescription", label: "Program Description", category: "Assistance Information" },
        { id: "amount", label: "Amount", category: "Assistance Information" },
        { id: "assistance_status", label: "Assistance Status", category: "Assistance Information" },
        { id: "statusSelection", label: "Priority Status", category: "Assistance Information" },
        { id: "dateAssisted", label: "Date Assisted", category: "Assistance Information" },
        { id: "release_date", label: "Release Date", category: "Assistance Information" },

        // Other Information
        { id: "educationalAttainment", label: "Education", category: "Other Information" },
        { id: "income", label: "Income", category: "Other Information" },
    ];

    // Group fields by category
    const groupedFields = availableFields.reduce((groups, field) => {
        const category = field.category;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(field);
        return groups;
    }, {});

    // Additional states
    const pageSizeOptions = [5, 10, 20, 50, 100];

    // Context variables - using from your context
    const {
        TotalAssistances,
        TotalPages,
        CurrentPage,
        assistances,
        fetchAssistances,
        isLoading: contextLoading,
        generateAssistanceReport,
    } = useContext(AssistanceContext);

    const [isCreatingAssistance, setIsCreatingAssistance] = useState(false);

    // State for delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [localSelectedBarangay, setLocalSelectedBarangay] = useState(selectedBarangay || "All");

    // State for release status filter
    const [selectedReleaseStatus, setSelectedReleaseStatus] = useState("All");

    // State for local category filter display
    const [localSelectedCategory, setLocalSelectedCategory] = useState("All");

    // Refs to prevent double fetching
    const isInitialMount = useRef(true);
    const prevFilters = useRef({
        itemsPerPage,
        selectedMunicipality,
        selectedBarangay,
        selectedCategory: selectedCategory.id,
        selectedReleaseStatus,
        localSearchTerm,
    });
    const debounceTimerRef = useRef(null);

    // Helper function to show status messages
    const showStatusMessage = useCallback((status, error = null, customProps = {}) => {
        setStatusModalProps({
            status,
            error,
            title: customProps.title || "",
            message: customProps.message || "",
            onRetry: customProps.onRetry || null,
        });
        setShowStatusModal(true);
    }, []);

    // Auto-close success modal after 3 seconds
    useEffect(() => {
        if (showStatusModal && statusModalProps.status === "success") {
            const timer = setTimeout(() => setShowStatusModal(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showStatusModal, statusModalProps.status]);

    // Update category options from context
    useEffect(() => {
        if (categories && categories.length > 0) {
            console.log("Categories from context:", categories);
            // Set category options with both ID and name
            const options = categories.map((cat) => ({
                id: cat._id || cat.id,
                name: cat.categoryName || cat.name || cat,
            }));
            setCategoryOptions(options);
        }
    }, [categories]);

    // Function to get barangays for dropdown - SAME LOGIC FOR BOTH TABLE AND EXPORT
    const getBarangayOptions = useCallback((municipality, barangaysList) => {
        if (municipality === "All") {
            return ["All"];
        }

        if (barangaysList && Array.isArray(barangaysList) && barangaysList.length > 0) {
            // Extract barangay names from data
            const barangayNames = barangaysList.map((barangay) => {
                return barangay.barangayName || barangay.name || barangay.barangay || barangay;
            });

            // Remove duplicates and sort alphabetically
            const uniqueBarangays = [...new Set(barangayNames)].sort();

            return ["All", ...uniqueBarangays];
        }

        return ["All"];
    }, []);

    // Fetch barangays when municipality changes - FOR TABLE
    useEffect(() => {
        if (selectedMunicipality && selectedMunicipality !== "All" && fetchBarangays) {
            fetchBarangays(selectedMunicipality);
        }
    }, [selectedMunicipality, fetchBarangays]);

    // Fetch barangays for export when export municipality changes
    const fetchExportBarangays = useCallback(
        async (municipality) => {
            if (municipality && municipality !== "All") {
                setIsFetchingExportBarangays(true);
                try {
                    // Use the same fetchBarangays function from context
                    if (fetchBarangays) {
                        await fetchBarangays(municipality);
                    }
                } catch (error) {
                    console.error("Error fetching barangays for export:", error);
                } finally {
                    setIsFetchingExportBarangays(false);
                }
            } else {
                setExportBarangaysList([]);
            }
        },
        [fetchBarangays],
    );

    // NEW: Reset export filters when modal opens - USE SAME LOGIC AS TABLE
    useEffect(() => {
        if (exportModalOpen) {
            // Set export filters to current table filters (same logic)
            setExportMunicipality(selectedMunicipality);
            setExportBarangay(selectedBarangay);
            setExportReleaseStatus(selectedReleaseStatus);
            setExportCategory(selectedCategory);
            setFromDate("");
            setToDate("");

            // Set default selected fields
            const defaultFields = ["name", "barangay", "municipality", "categoryName", "amount", "status", "dateAssisted"];
            setSelectedFields(defaultFields);

            // If municipality is selected, fetch barangays for export
            if (selectedMunicipality !== "All") {
                fetchExportBarangays(selectedMunicipality);
            } else {
                setExportBarangaysList([]);
            }
        }
    }, [exportModalOpen, selectedMunicipality, selectedBarangay, selectedReleaseStatus, selectedCategory, fetchExportBarangays]);

    // Update export barangays list when context barangays change
    useEffect(() => {
        if (barangays && Array.isArray(barangays)) {
            // Use the same barangays data for export
            const barangayOptions = getBarangayOptions(exportMunicipality, barangays);
            setExportBarangaysList(barangayOptions);
        }
    }, [barangays, exportMunicipality, getBarangayOptions]);

    // Memoized fetch function to prevent infinite loops
    const fetchData = useCallback(
        (page = 1) => {
            const params = {
                page,
                limit: itemsPerPage,
                municipality: selectedMunicipality !== "All" ? selectedMunicipality : "",
                barangay: selectedBarangay !== "All" ? selectedBarangay : "",
                categoryId: selectedCategory.id !== "All" ? selectedCategory.id : "",
                status: selectedReleaseStatus !== "All" ? selectedReleaseStatus : "",
                search: localSearchTerm.trim() !== "" ? localSearchTerm : "",
            };

            console.log("📊 Fetching data with params:", params);

            // Call the fetchAssistances from context
            fetchAssistances(params.page, params.limit, params.municipality, params.barangay, params.categoryId, params.status, params.search);
        },
        [fetchAssistances, itemsPerPage, selectedMunicipality, selectedBarangay, selectedCategory, selectedReleaseStatus, localSearchTerm],
    );

    // Initial fetch only - isang beses lang sa mount
    useEffect(() => {
        if (isInitialMount.current) {
            fetchData(1);
            isInitialMount.current = false;

            // Initialize prevFilters with initial values
            prevFilters.current = {
                itemsPerPage,
                selectedMunicipality,
                selectedBarangay,
                selectedCategory: selectedCategory.id,
                selectedReleaseStatus,
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
            prevFilters.current.selectedCategory !== selectedCategory.id ||
            prevFilters.current.selectedReleaseStatus !== selectedReleaseStatus ||
            prevFilters.current.localSearchTerm !== localSearchTerm;

        if (filtersChanged) {
            // Clear any existing debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Set new debounce timer
            debounceTimerRef.current = setTimeout(() => {
                fetchData(1);

                // Update prevFilters
                prevFilters.current = {
                    itemsPerPage,
                    selectedMunicipality,
                    selectedBarangay,
                    selectedCategory: selectedCategory.id,
                    selectedReleaseStatus,
                    localSearchTerm,
                };
            }, 2000); // 300ms debounce
        }

        // Cleanup function
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [itemsPerPage, selectedMunicipality, selectedBarangay, selectedCategory, selectedReleaseStatus, localSearchTerm, fetchData]);

    // Function to transform assistance data to resident data for table display
    const transformAssistanceToResidentData = (assistanceData) => {
        // Group assistance by resident
        const residentsMap = {};

        assistanceData.forEach((assistance) => {
            const residentId = assistance.resident?._id;

            if (!residentsMap[residentId]) {
                residentsMap[residentId] = {
                    _id: residentId,
                    name: assistance.resident?.name || "N/A",
                    age: assistance.resident?.age || "N/A",
                    gender: assistance.resident?.gender || "N/A",
                    barangay: assistance.resident?.barangay || "N/A",
                    municipality: assistance.resident?.municipality || "N/A",
                    contact: assistance.resident?.contact || "N/A",
                    rfid: `RFID${residentId ? residentId.slice(-3).toUpperCase() : "000"}`,
                    releaseStatus: assistance.statusSelection || "Pending",
                    assistanceHistory: [],
                };
            }

            // Add assistance to resident's history
            residentsMap[residentId].assistanceHistory.push({
                _id: assistance._id,
                category: assistance.category,
                created_at: assistance.created_at,
                statusSelection: assistance.statusSelection,
            });
        });

        // Convert to array
        const residents = Object.values(residentsMap);

        return residents;
    };

    // Transform the current page data
    const transformedData = transformAssistanceToResidentData(assistances || []);

    // Calculate showing range
    const startIndex = TotalAssistances > 0 ? (CurrentPage - 1) * itemsPerPage + 1 : 0;
    const endIndex = Math.min(CurrentPage * itemsPerPage, TotalAssistances || 0);
    const showingTotal = TotalAssistances || 0;

    const getReleaseStatusColor = (status) => {
        switch (status) {
            case "Released":
                return theme === "dark" ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700";
            case "For Release":
                return theme === "dark" ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700";
            case "Pending":
                return theme === "dark" ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700";
            case "Not Eligible":
                return theme === "dark" ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700";
            default:
                return theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-700";
        }
    };

    const getReleaseStatusIcon = (status) => {
        switch (status) {
            case "Released":
                return <CheckCircle size={12} />;
            case "For Release":
                return <Gift size={12} />;
            case "Pending":
                return <Clock size={12} />;
            case "Not Eligible":
                return <AlertCircle size={12} />;
            default:
                return null;
        }
    };

    const getAssistanceHistoryCount = (resident) => {
        return resident.assistanceHistory ? resident.assistanceHistory.length : 0;
    };

    // Helper function to get assistance categories as string
    const getAssistanceCategories = (resident) => {
        if (!resident.assistanceHistory || resident.assistanceHistory.length === 0) {
            return "No assistance";
        }

        const categories = resident.assistanceHistory.map((item) => item.category?.categoryName || "Unknown");
        return categories.join(", ");
    };

    // Update local search term when prop changes
    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    // Update local barangay when prop changes
    useEffect(() => {
        setLocalSelectedBarangay(selectedBarangay || "All");
    }, [selectedBarangay]);

    // Update local category display when selectedCategory changes
    useEffect(() => {
        setLocalSelectedCategory(selectedCategory.name || "All");
    }, [selectedCategory]);

    // Get category options for dropdown
    const getCategoryOptions = () => {
        // Use categories from context if available
        if (categoryOptions && categoryOptions.length > 0) {
            const options = [{ id: "All", name: "All" }];
            categoryOptions.forEach((cat) => {
                if (cat.id && cat.name) {
                    options.push({ id: cat.id, name: cat.name });
                }
            });
            return options;
        }

        // Fallback: extract categories from assistance data
        const allCategories = [];
        transformedData.forEach((resident) => {
            if (resident.assistanceHistory) {
                resident.assistanceHistory.forEach((history) => {
                    if (history.category) {
                        allCategories.push({
                            id: history.category._id || history.category.id,
                            name: history.category.categoryName || history.category.name,
                        });
                    }
                });
            }
        });

        // Remove duplicates
        const uniqueCategories = Array.from(new Map(allCategories.map((cat) => [cat.id, cat])).values());

        return [{ id: "All", name: "All" }, ...uniqueCategories];
    };

    const handlePageChange = (page) => {
        fetchData(page);
    };

    const handleItemsPerPageChange = (value) => {
        const newLimit = parseInt(value);
        setItemsPerPage(newLimit);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setLocalSearchTerm(value);
        setSearchTerm(value);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setLocalSearchTerm("");
        setSearchTerm("");
    };

    // Handle municipality change - SAME LOGIC FOR TABLE
    const handleMunicipalityChange = (e) => {
        const value = e.target.value;
        setSelectedMunicipality(value);
        setSelectedBarangay("All");
        setLocalSelectedBarangay("All");
    };

    // Handle barangay change - SAME LOGIC FOR TABLE
    const handleBarangayChange = (e) => {
        const value = e.target.value;
        setSelectedBarangay(value);
        setLocalSelectedBarangay(value);
    };

    // Handle release status change
    const handleReleaseStatusChange = (e) => {
        const value = e.target.value;
        setSelectedReleaseStatus(value);
    };

    // Handle category change
    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;

        if (selectedValue === "All") {
            setSelectedCategory({ id: "All", name: "All" });
        } else {
            // Find the category object based on selected ID
            const foundCategory = categoryOptions.find((cat) => cat.id === selectedValue);

            if (foundCategory) {
                setSelectedCategory(foundCategory);
            }
        }
    };

    // Handle clear category
    const handleClearCategory = () => {
        setSelectedCategory({ id: "All", name: "All" });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm) {
            // Handle delete logic here
            console.log("Deleting resident:", deleteConfirm.id);
            setDeleteConfirm(null);
            // Refresh data after delete
            fetchData(CurrentPage);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirm(null);
    };

    const onDownloadTemplate = () => {
        console.log("Download template");
        // Implement download logic
    };

    const onClearSearch = () => {
        setLocalSearchTerm("");
        setSearchTerm("");
    };

    const onClearBarangay = () => {
        setSelectedBarangay("All");
        setLocalSelectedBarangay("All");
    };

    const onClearMunicipality = () => {
        setSelectedMunicipality("All");
        setSelectedBarangay("All");
        setLocalSelectedBarangay("All");
    };

    // Export Functions
    const handleExportClick = () => {
        setExportModalOpen(true);
    };

    const handleExportSubmit = async () => {
        if (selectedFields.length === 0) {
            alert("Please select at least one field to export");
            return { success: false, error: "No fields selected" };
        }

        setIsExporting(true);

        try {
            // Prepare export payload with export-specific filters
            const exportData = {
                selectedFields,
                format: exportFormat,
                municipality: exportMunicipality !== "All" ? exportMunicipality : "",
                barangay: exportBarangay !== "All" ? exportBarangay : "",
                categoryId: exportCategory.id !== "All" ? exportCategory.id : "",
                status: exportReleaseStatus !== "All" ? exportReleaseStatus : "",
                fromDate: fromDate,
                toDate: toDate,
                reportTitle: exportTitle,
                search: localSearchTerm.trim() !== "" ? localSearchTerm : "",
                statusSelection: "Priority",
            };

            console.log("📤 Export Payload:", {
                ...exportData,
                exportMunicipality: exportMunicipality,
                exportBarangay: exportBarangay,
                exportReleaseStatus: exportReleaseStatus,
                categoryName: exportCategory.name,
                totalSelectedFields: selectedFields.length,
                timestamp: new Date().toISOString(),
            });

            console.log(
                "📋 Selected Fields Details:",
                selectedFields.map((fieldId) => {
                    const field = availableFields.find((f) => f.id === fieldId);
                    return field ? field.label : fieldId;
                })
            );

            // Use the generateAssistanceReport function from context
            const result = await generateAssistanceReport(exportData);

            console.log("result", result);

            let finalResult;

            if (result instanceof Blob) {
                const url = window.URL.createObjectURL(result);
                const a = document.createElement("a");
                a.href = url;

                const extension = exportFormat === "pdf" ? "pdf" : "xlsx";
                const filename = `${exportTitle.replace(/\s+/g, "_")}_${Date.now()}.${extension}`;
                a.download = filename;

                console.log("💾 Downloading file:", filename);

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                finalResult = { success: true };
            } else if (typeof result === "string") {
                // If it's a string, assume it's a URL
                window.open(result, "_blank");
                finalResult = { success: true };
            } else if (result && typeof result === "object" && "success" in result) {
                // If the result already has a success property, use it directly
                finalResult = result;
            } else {
                // Fallback: assume success
                finalResult = { success: true };
            }

            if (finalResult.success) {
                setExportModalOpen(false);
                showStatusMessage("success", null, {
                    title: "Export Successful",
                    message: `Report has been exported successfully as ${exportFormat.toUpperCase()}.`,
                });
            } else {
                showStatusMessage("error", finalResult.error || "Export failed", {
                    title: "Export Failed",
                    onRetry: handleExportSubmit,
                });
            }

            return finalResult;
        } catch (error) {
            console.error("❌ Export error:", error);
            showStatusMessage("error", error.message, {
                title: "Export Error",
                onRetry: handleExportSubmit,
            });
            return { success: false, error: error.message };
        } finally {
            setIsExporting(false);
        }
    };

    // Get barangays for dropdown - SAME FUNCTION FOR BOTH
    const barangayOptions = getBarangayOptions(selectedMunicipality, barangays);

    // Release status options
    const releaseStatusOptions = ["All", "Released", "For Release", "Pending", "Not Eligible"];

    // Get category options for both main table and export modal
    const categoryOptionsList = getCategoryOptions();

    // Combined loading state
    const isLoading = contextLoading || isCreatingAssistance;

    return (
        <>
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                deleteConfirm={deleteConfirm}
                onCancelDelete={handleCancelDelete}
                onConfirmDelete={handleConfirmDelete}
                theme={theme}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={exportModalOpen}
                onClose={() => setExportModalOpen(false)}
                onExport={handleExportSubmit}
                availableFields={availableFields}
                groupedFields={groupedFields}
                exportFormat={exportFormat}
                setExportFormat={setExportFormat}
                selectedFields={selectedFields}
                setSelectedFields={setSelectedFields}
                exportTitle={exportTitle}
                setExportTitle={setExportTitle}
                municipalityOptions={municipalityOptions}
                exportMunicipality={exportMunicipality}
                setExportMunicipality={setExportMunicipality}
                exportBarangay={exportBarangay}
                setExportBarangay={setExportBarangay}
                exportBarangaysList={exportBarangaysList}
                isFetchingExportBarangays={isFetchingExportBarangays}
                exportReleaseStatus={exportReleaseStatus}
                setExportReleaseStatus={setExportReleaseStatus}
                exportCategory={exportCategory}
                setExportCategory={setExportCategory}
                categoryOptionsList={categoryOptionsList}
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
                showAdvancedFilters={showAdvancedFilters}
                setShowAdvancedFilters={setShowAdvancedFilters}
                isExporting={isExporting}
                fetchExportBarangays={fetchExportBarangays}
                handleExportCategoryChange={() => {}}
                handleExportMunicipalityChange={() => {}}
                handleExportBarangayChange={() => {}}
                handleExportReleaseStatusChange={() => {}}
                releaseStatusOptions={releaseStatusOptions}
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
                                Selected Beneficiaries List
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {showingTotal} residents listed in {selectedMunicipality !== "All" ? selectedMunicipality : "all municipalities"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExportClick}
                                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-green-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-gray-700"
                                disabled={isLoading}
                            >
                                <Download size={16} />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                        {/* Search Bar */}
                        <div className="relative md:col-span-2">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search by name"
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
                                disabled={isLoading}
                            >
                                {(municipalityOptions || []).map((municipality) => (
                                    <option
                                        key={municipality}
                                        value={municipality}
                                    >
                                        {municipality}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Barangay Filter - SAME LOGIC AS EXPORT */}
                        <div className="flex items-center gap-2">
                            <Home
                                size={18}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            <select
                                value={localSelectedBarangay}
                                onChange={handleBarangayChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={selectedMunicipality === "All" || isLoading || !barangays?.length}
                                title={selectedMunicipality === "All" ? "Please select a municipality first" : ""}
                            >
                                {(barangayOptions || []).map((barangay) => (
                                    <option
                                        key={barangay}
                                        value={barangay}
                                    >
                                        {barangay}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Category Filter - USING CATEGORIES FROM CONTEXT */}
                        <div className="flex items-center gap-2">
                            <Tag
                                size={18}
                                className="text-gray-500 dark:text-gray-400"
                            />
                            <select
                                value={selectedCategory.id} // Use ID for value
                                onChange={handleCategoryChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={isLoading}
                            >
                                {(categoryOptionsList || []).map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id} // Store ID in value attribute
                                    >
                                        {category.name} {/* Display name */}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedMunicipality !== "All" ||
                        localSelectedBarangay !== "All" ||
                        localSearchTerm ||
                        selectedReleaseStatus !== "All" ||
                        selectedCategory.id !== "All") && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {selectedMunicipality !== "All" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                    <MapPin size={12} />
                                    {selectedMunicipality}
                                    <button
                                        onClick={onClearMunicipality}
                                        className="ml-1 hover:text-orange-900 dark:hover:text-orange-300"
                                        disabled={isLoading}
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
                                        onClick={onClearBarangay}
                                        className="ml-1 hover:text-green-900 dark:hover:text-green-300"
                                        disabled={isLoading}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
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
                            {selectedReleaseStatus !== "All" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                    <Gift size={12} />
                                    Status: {selectedReleaseStatus}
                                    <button
                                        onClick={() => setSelectedReleaseStatus("All")}
                                        className="ml-1 hover:text-purple-900 dark:hover:text-purple-300"
                                        disabled={isLoading}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
                            {selectedCategory.id !== "All" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                                    <Tag size={12} />
                                    Category: {selectedCategory.name}
                                    <button
                                        onClick={handleClearCategory}
                                        className="ml-1 hover:text-cyan-900 dark:hover:text-cyan-300"
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
                            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading residents...</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Age</th>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Gender</th>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Barangay</th>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Municipality</th>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Assistance History</th>
                                    <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Release Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transformedData.length > 0 ? (
                                    transformedData.map((item) => (
                                        <tr
                                            key={item._id || Math.random()}
                                            className="border-t border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                                        >
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">{item.age}</td>
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
                                            <td className="p-4 text-gray-600 dark:text-gray-400">{item.contact}</td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                                        getAssistanceHistoryCount(item) > 0
                                                            ? theme === "dark"
                                                                ? "bg-amber-900/30 text-amber-400"
                                                                : "bg-amber-100 text-amber-700"
                                                            : theme === "dark"
                                                              ? "bg-gray-800 text-gray-400"
                                                              : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    <Package size={12} />
                                                    {getAssistanceHistoryCount(item)} received
                                                    {getAssistanceHistoryCount(item) > 0 && (
                                                        <span className="ml-1 text-xs">({getAssistanceCategories(item)})</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold uppercase ${getReleaseStatusColor(item.releaseStatus || "Pending")}`}
                                                >
                                                    {getReleaseStatusIcon(item.status || "Pending")}
                                                    {item.status || "Pending"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="9"
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
                                    disabled={isLoading}
                                >
                                    {(pageSizeOptions || []).map((option) => (
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
                                onClick={() => handlePageChange(CurrentPage - 1)}
                                disabled={CurrentPage === 1 || isLoading || TotalPages === 0}
                                className="rounded-lg p-2 text-gray-600 transition-colors hover:border hover:border-orange-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                            >
                                <ChevronLeft size={18} />
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
                                                    className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
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
                                                className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
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
                                                    className="px-1 text-gray-400 dark:text-gray-600"
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
                                                    className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
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
                                                    className="px-1 text-gray-400 dark:text-gray-600"
                                                >
                                                    ...
                                                </span>,
                                            );
                                        }

                                        pages.push(
                                            <button
                                                key={TotalPages}
                                                onClick={() => handlePageChange(TotalPages)}
                                                className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
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
                                className="rounded-lg p-2 text-gray-600 transition-colors hover:border hover:border-orange-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:border-orange-600 dark:hover:bg-gray-700"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Modal */}
            <StatusModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                status={statusModalProps.status}
                error={statusModalProps.error}
                title={statusModalProps.title}
                message={statusModalProps.message}
                onRetry={statusModalProps.onRetry}
            />
        </>
    );
};

export default PriorityTable;