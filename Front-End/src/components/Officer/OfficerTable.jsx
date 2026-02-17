import React, { useState, useEffect, useContext, useRef } from "react";
import {
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Edit,
    Trash2,
    UserPlus,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    Filter,
    Lock,
    Unlock,
    Eye,
    EyeOff,
} from "lucide-react";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext";
import AddFormModal from "./AddFormModal";

const OfficerTable = () => {
    // Context variables
    const {
        officers,
        DeleteOfficer,
        UpdateOfficer,
        totalOfficerCount,
        loading,
        AddOfficer,
        currentPage: contextCurrentPage,
        totalPages: contextTotalPages,
        rowsPerPage: contextRowsPerPage,
        handleSearch: contextHandleSearch,
        handlePageChange: contextHandlePageChange,
        setRowsPerPage: contextSetRowsPerPage,
    } = useContext(OfficerDisplayContext);

    // Local state management
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(contextRowsPerPage || 10);
    const [showFilters, setShowFilters] = useState(false);
    const [filteredOfficers, setFilteredOfficers] = useState([]);
    
    // State for password visibility per officer
    const [passwordVisibility, setPasswordVisibility] = useState({});

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Form data states
    const [newOfficerData, setNewOfficerData] = useState({
        first_name: "",
        last_name: "",
        middle_name: "",
        gender: "Male",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [editingOfficer, setEditingOfficer] = useState(null);
    const [editOfficerData, setEditOfficerData] = useState({
        first_name: "",
        last_name: "",
        middle_name: "",
        gender: "Male",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Filter states (client-side only filters)
    const [genderFilter, setGenderFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Debounce timer ref
    const debounceTimerRef = useRef(null);

    // Sync itemsPerPage with context
    useEffect(() => {
        if (contextRowsPerPage && itemsPerPage !== contextRowsPerPage) {
            setItemsPerPage(contextRowsPerPage);
        }
    }, [contextRowsPerPage]);

    // Apply client-side filtering
    useEffect(() => {
        if (!officers || !Array.isArray(officers)) {
            setFilteredOfficers([]);
            return;
        }

        let filtered = [...officers];

        // Gender filter (client-side)
        if (genderFilter) {
            filtered = filtered.filter((officer) => officer.gender === genderFilter);
        }

        // Date filter (client-side)
        if (dateFilter) {
            filtered = filtered.filter((officer) => {
                if (!officer.created_at) return false;
                const officerDate = new Date(officer.created_at);
                const filterDate = new Date(dateFilter);
                return officerDate.getMonth() === filterDate.getMonth() && officerDate.getFullYear() === filterDate.getFullYear();
            });
        }

        // Status filter (client-side)
        if (statusFilter) {
            filtered = filtered.filter((officer) => {
                if (statusFilter === "active") return officer.isActive !== false;
                if (statusFilter === "inactive") return officer.isActive === false;
                return true;
            });
        }

        setFilteredOfficers(filtered);
    }, [officers, genderFilter, dateFilter, statusFilter]);

    // Calculate showing range for server-side pagination
    const startIndex = totalOfficerCount > 0 ? (contextCurrentPage - 1) * itemsPerPage + 1 : 0;
    const endIndex = Math.min(contextCurrentPage * itemsPerPage, totalOfficerCount || 0);
    const showingTotal = totalOfficerCount || 0;

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "N/A";
        }
    };

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    // Get full name
    const getFullName = (officer) => {
        const firstName = officer.first_name || "";
        const middleName = officer.middle_name ? officer.middle_name.charAt(0) + "." : "";
        const lastName = officer.last_name || "";
        return `${firstName} ${middleName} ${lastName}`.trim();
    };

    // Get initials for avatar
    const getInitials = (officer) => {
        const first = officer.first_name ? officer.first_name.charAt(0) : "A";
        const last = officer.last_name ? officer.last_name.charAt(0) : "D";
        return `${first}${last}`;
    };

    // Toggle password visibility
    const togglePasswordVisibility = (officerId) => {
        setPasswordVisibility(prev => ({
            ...prev,
            [officerId]: !prev[officerId]
        }));
    };

    // Mask password with asterisks
    const maskPassword = (password) => {
        if (!password) return "••••••••";
        return "•".repeat(password.length);
    };

    // Handle items per page change
    const handleItemsPerPageChange = (value) => {
        const newPerPage = parseInt(value);
        setItemsPerPage(newPerPage);
        if (contextSetRowsPerPage) {
            contextSetRowsPerPage(newPerPage);
        }
        if (contextHandlePageChange) {
            contextHandlePageChange(1); // Reset to first page
        }
    };

    // Handle search with debounce (server-side)
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            if (contextHandleSearch) {
                contextHandleSearch(value);
                if (contextHandlePageChange) {
                    contextHandlePageChange(1); // Reset to first page when searching
                }
            }
        }, 300);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchTerm("");
        if (contextHandleSearch) {
            contextHandleSearch("");
            if (contextHandlePageChange) {
                contextHandlePageChange(1);
            }
        }
    };

    // Handle clear filters (client-side only)
    const handleClearFilters = () => {
        setGenderFilter("");
        setDateFilter("");
        setStatusFilter("");
        setSearchTerm("");
        if (contextHandleSearch) {
            contextHandleSearch("");
        }
        if (contextHandlePageChange) {
            contextHandlePageChange(1);
        }
    };

    // Handle delete officer
    const handleDeleteOfficer = async (id) => {
        if (window.confirm("Are you sure you want to delete this officer? This action cannot be undone.")) {
            try {
                if (DeleteOfficer) {
                    await DeleteOfficer(id);
                }
            } catch (error) {
                console.error("Error deleting officer:", error);
                alert("Failed to delete officer. Please try again.");
            }
        }
    };

    // Handle edit officer click
    const handleEditOfficer = (officer) => {
        setEditingOfficer(officer);
        setEditOfficerData({
            first_name: officer.first_name || "",
            last_name: officer.last_name || "",
            middle_name: officer.middle_name || "",
            gender: officer.gender || "Male",
            // REMOVED: contact_number
            email: officer.email || "",
            password: "", // Empty for security
            confirm_password: "", // Empty for security
        });
        setShowEditModal(true);
        setFormErrors({});
    };

    // Handle close edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingOfficer(null);
        setIsSubmitting(false);
        setFormErrors({});
    };

    // Handle input change for edit form
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditOfficerData({
            ...editOfficerData,
            [name]: value,
        });
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: "",
            });
        }
    };

    console.log("officers",officers)

    // Validate edit form (with password optional) - FIXED: REMOVED contact_number validation
    const validateEditForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Use optional chaining to prevent undefined errors
        if (!editOfficerData.first_name?.trim()) {
            errors.first_name = "First name is required";
        }
        if (!editOfficerData.last_name?.trim()) {
            errors.last_name = "Last name is required";
        }
        if (!editOfficerData.email?.trim()) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(editOfficerData.email)) {
            errors.email = "Please enter a valid email address";
        }
        
        // REMOVED: contact_number validation
        // if (!editOfficerData.contact_number?.trim()) {
        //     errors.contact_number = "Contact number is required";
        // } else if (!phoneRegex.test(editOfficerData.contact_number)) {
        //     errors.contact_number = "Please enter a valid contact number";
        // }

        // Password is optional for editing, but if provided, validate
        if (editOfficerData.password) {
            if (editOfficerData.password.length < 6) {
                errors.password = "Password must be at least 6 characters";
            }
            if (!editOfficerData.confirm_password) {
                errors.confirm_password = "Please confirm your password";
            } else if (editOfficerData.password !== editOfficerData.confirm_password) {
                errors.confirm_password = "Passwords do not match";
            }
        }

        return errors;
    };

    // Handle submit edit officer
    const handleSubmitEditOfficer = async (e) => {
        e.preventDefault();

        const errors = validateEditForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare data for API
            const officerDataToSubmit = {
                ...editOfficerData,
            };

            // Only include password if provided
            if (!officerDataToSubmit.password) {
                delete officerDataToSubmit.password;
                delete officerDataToSubmit.confirm_password;
            } else {
                delete officerDataToSubmit.confirm_password;
            }

            // Call UpdateOfficer function from context
            if (UpdateOfficer && editingOfficer) {
                const result = await UpdateOfficer(editingOfficer._id, officerDataToSubmit);

                if (result && result.success) {
                    // Close modal
                    handleCloseEditModal();
                } else {
                    // Handle API error
                    alert(result?.error || "Failed to update officer. Please try again.");
                }
            }
        } catch (error) {
            console.error("Error updating officer:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle add officer button click
    const handleAddOfficerClick = () => {
        setShowAddModal(true);
        setNewOfficerData({
            first_name: "",
            last_name: "",
            middle_name: "",
            gender: "Male",
            email: "",
            password: "",
            confirm_password: "",
        });
        setFormErrors({});
    };

    // Handle close add modal
    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setIsSubmitting(false);
        setFormErrors({});
    };

    // Handle input change for add officer form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewOfficerData({
            ...newOfficerData,
            [name]: value,
        });
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: "",
            });
        }
    };

    // Validate add form - FIXED: REMOVED contact_number validation
    const validateAddForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Use optional chaining to prevent undefined errors
        if (!newOfficerData.first_name?.trim()) {
            errors.first_name = "First name is required";
        }
        if (!newOfficerData.last_name?.trim()) {
            errors.last_name = "Last name is required";
        }
        if (!newOfficerData.email?.trim()) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(newOfficerData.email)) {
            errors.email = "Please enter a valid email address";
        }
        
        // REMOVED: contact_number validation
        // if (!newOfficerData.contact_number?.trim()) {
        //     errors.contact_number = "Contact number is required";
        // } else if (!phoneRegex.test(newOfficerData.contact_number)) {
        //     errors.contact_number = "Please enter a valid contact number";
        // }
        
        if (!newOfficerData.password) {
            errors.password = "Password is required";
        } else if (newOfficerData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }
        if (!newOfficerData.confirm_password) {
            errors.confirm_password = "Please confirm your password";
        } else if (newOfficerData.password !== newOfficerData.confirm_password) {
            errors.confirm_password = "Passwords do not match";
        }

        return errors;
    };

    // Handle submit add officer
    const handleSubmitAddOfficer = async (e) => {
        e.preventDefault();

        const errors = validateAddForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            const officerDataToSubmit = {
                ...newOfficerData,
            };
            delete officerDataToSubmit.confirm_password;

            if (AddOfficer) {
                const result = await AddOfficer(officerDataToSubmit);

                if (result && result.success) {
                    handleCloseAddModal();
                } else {
                    alert(result?.error || "Failed to add officer. Please try again.");
                }
            }
        } catch (error) {
            console.error("Error adding officer:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get gender badge color
    const getGenderColor = (gender) => {
        switch (gender) {
            case "Male":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "Female":
                return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    // Get status badge color
    const getStatusColor = (officer) => {
        if (officer.isActive === false) {
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        }
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    };

    // Get status icon
    const getStatusIcon = (officer) => {
        if (officer.isActive === false) {
            return <Lock size={12} />;
        }
        return <Unlock size={12} />;
    };

    // Get status text
    const getStatusText = (officer) => {
        if (officer.isActive === false) {
            return "Inactive";
        }
        return "Active";
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Check admin privileges
    const hasAdminPrivileges = true;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white md:text-xl">Officer Management</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage system officers and their permissions
                        {hasAdminPrivileges && <span className="ml-2 text-orange-600 dark:text-orange-400">(Admin Mode)</span>}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAddOfficerClick}
                        disabled={!hasAdminPrivileges}
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900"
                        title={!hasAdminPrivileges ? "Only admins can add new officers" : ""}
                    >
                        <UserPlus size={16} />
                        Add Officer
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Search Bar - Server-side search */}
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search officers by name, email, or phone..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            disabled={loading}
                        />
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                disabled={loading}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle - Client-side filters */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Filter size={16} />
                            Filters
                            {(genderFilter || dateFilter || statusFilter) && (
                                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-xs text-white">
                                    {[genderFilter, dateFilter, statusFilter].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Additional Filters - Client-side only */}
                {showFilters && (
                    <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Gender</label>
                            <select
                                value={genderFilter}
                                onChange={(e) => setGenderFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="">All Genders</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Created Date</label>
                            <input
                                type="month"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleClearFilters}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {/* Table Header */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                            <tr>
                                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Officer
                                </th>
                                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Contact Info
                                </th>
                                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Password
                                </th>
                                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Gender
                                </th>
                                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Status
                                </th>
                                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Created Date
                                </th>
                                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="p-6 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
                                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading officers...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOfficers.length > 0 ? (
                                filteredOfficers.map((officer) => (
                                    <tr
                                        key={officer._id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    {officer.avatar?.url ? (
                                                        <img
                                                            src={officer.avatar.url}
                                                            alt={getFullName(officer)}
                                                            className="h-full w-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                            {getInitials(officer)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{getFullName(officer)}</div>
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <Briefcase size={12} />
                                                        Officer
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                                    <Mail size={12} />
                                                    <span className="truncate">{officer.email || "N/A"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono text-gray-900 dark:text-white">
                                                    {passwordVisibility[officer._id] ? officer.password || "N/A" : maskPassword(officer.password)}
                                                </span>
                                                <button
                                                    onClick={() => togglePasswordVisibility(officer._id)}
                                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                    type="button"
                                                    aria-label={passwordVisibility[officer._id] ? "Hide password" : "Show password"}
                                                >
                                                    {passwordVisibility[officer._id] ? (
                                                        <EyeOff size={14} />
                                                    ) : (
                                                        <Eye size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getGenderColor(officer.gender)}`}
                                            >
                                                {officer.gender || "N/A"}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(officer)}`}
                                            >
                                                {getStatusIcon(officer)}
                                                {getStatusText(officer)}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-sm text-gray-900 dark:text-white">{formatDate(officer.created_at)}</div>
                                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar size={12} />
                                                {formatTime(officer.created_at)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditOfficer(officer)}
                                                    disabled={!hasAdminPrivileges}
                                                    className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                    title={!hasAdminPrivileges ? "Only admins can edit" : "Edit Officer"}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOfficer(officer._id)}
                                                    disabled={!hasAdminPrivileges}
                                                    className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                                    title={!hasAdminPrivileges ? "Only admins can delete" : "Delete Officer"}
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
                                        colSpan="7"
                                        className="p-6 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <Users
                                                className="mb-2 text-gray-400 dark:text-gray-600"
                                                size={36}
                                            />
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No officers found</p>
                                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                {searchTerm || genderFilter || dateFilter || statusFilter
                                                    ? "Try adjusting your search or filters"
                                                    : "No officer records available"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Server-side */}
                {!loading && filteredOfficers.length > 0 && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 p-4 dark:border-gray-700 sm:flex-row">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing <span className="font-medium">{startIndex}</span> to <span className="font-medium">{endIndex}</span> of{" "}
                            <span className="font-medium">{showingTotal}</span> officers
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                    disabled={loading}
                                >
                                    {[5, 10, 20, 50].map((option) => (
                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-sm text-gray-500 dark:text-gray-400">per page</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => contextHandlePageChange && contextHandlePageChange(contextCurrentPage - 1)}
                                    disabled={contextCurrentPage === 1 || loading}
                                    className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from({ length: Math.min(5, contextTotalPages || 1) }, (_, i) => {
                                    let pageNum;
                                    const totalPages = contextTotalPages || 1;

                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (contextCurrentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (contextCurrentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = contextCurrentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => contextHandlePageChange && contextHandlePageChange(pageNum)}
                                            className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
                                                contextCurrentPage === pageNum
                                                    ? "bg-orange-600 text-white"
                                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                            } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                                            disabled={loading}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => contextHandlePageChange && contextHandlePageChange(contextCurrentPage + 1)}
                                    disabled={contextCurrentPage === contextTotalPages || contextTotalPages === 0 || loading}
                                    className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Officer Modal */}
            <AddFormModal
                show={showAddModal}
                onClose={handleCloseAddModal}
                onSubmit={handleSubmitAddOfficer}
                data={newOfficerData}
                onChange={handleInputChange}
                errors={formErrors}
                isSubmitting={isSubmitting}
                mode="add"
            />

            {/* Edit Officer Modal */}
            <AddFormModal
                show={showEditModal}
                onClose={handleCloseEditModal}
                onSubmit={handleSubmitEditOfficer}
                data={editOfficerData}
                onChange={handleEditInputChange}
                errors={formErrors}
                isSubmitting={isSubmitting}
                mode="edit"
            />
        </div>
    );
};

export default OfficerTable;