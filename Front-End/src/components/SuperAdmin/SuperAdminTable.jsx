import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import {
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    Download,
    X,
    Edit,
    Trash2,
    UserPlus,
    Mail,
    Phone,
    Calendar,
    Shield,
    Filter,
    Lock,
    Unlock,
    Eye,
    EyeOff,
} from "lucide-react";
import { SuperAdminContext } from "../../contexts/SuperAdminContext/SuperAdminContext";
import AddSuperAdminModal from "./AddSuperAdmin"; // Renamed import to avoid naming conflict

const SuperAdminTable = () => {
    // Context variables
    const { 
        superAdmins, 
        DeleteSuperAdmin, 
        UpdateSuperAdmin, 
        totalAdminCount, 
        loading,
        AddSuperAdmin: createAdmin, // Renamed function from context
        currentPage,
        totalPages,
        rowsPerPage: contextRowsPerPage,
        handleSearch,
        handlePageChange,
        setRowsPerPage
    } = useContext(SuperAdminContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(contextRowsPerPage || 10);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);
    
    // State for password visibility per admin
    const [passwordVisibility, setPasswordVisibility] = useState({});

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);

    // Filter states
    const [genderFilter, setGenderFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const debounceTimerRef = useRef(null);

    // Sync itemsPerPage with context
    useEffect(() => {
        if (contextRowsPerPage && itemsPerPage !== contextRowsPerPage) {
            setItemsPerPage(contextRowsPerPage);
        }
    }, [contextRowsPerPage]);

    // Derived State: Filtered Admins (Memoized for performance)
    const filteredAdmins = useMemo(() => {
        if (!superAdmins || !Array.isArray(superAdmins)) return [];

        return superAdmins.filter((admin) => {
            // Gender filter
            if (genderFilter && admin.gender !== genderFilter) return false;

            // Date filter (Year/Month match)
            if (dateFilter) {
                if (!admin.created_at) return false;
                const adminDate = new Date(admin.created_at);
                const filterDate = new Date(dateFilter);
                if (adminDate.getMonth() !== filterDate.getMonth() || 
                    adminDate.getFullYear() !== filterDate.getFullYear()) return false;
            }

            // Status filter
            if (statusFilter) {
                const isActive = admin.isActive !== false;
                if (statusFilter === "active" && !isActive) return false;
                if (statusFilter === "inactive" && isActive) return false;
            }

            return true;
        });
    }, [superAdmins, genderFilter, dateFilter, statusFilter]);

    // Helper Functions
    const getFullName = (admin) => {
        const firstName = admin.first_name || "";
        const middleName = admin.middle_name ? admin.middle_name.charAt(0) + "." : "";
        const lastName = admin.last_name || "";
        return `${firstName} ${middleName} ${lastName}`.trim();
    };

    const getInitials = (admin) => {
        const first = admin.first_name ? admin.first_name.charAt(0) : "A";
        const last = admin.last_name ? admin.last_name.charAt(0) : "D";
        return `${first}${last}`.toUpperCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit"
        });
    };

    const maskPassword = (password) => "•".repeat(8);

    const togglePasswordVisibility = (adminId) => {
        setPasswordVisibility(prev => ({ ...prev, [adminId]: !prev[adminId] }));
    };

    // Event Handlers
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            handleSearch(value);
            handlePageChange(1);
        }, 400);
    };

    const handleDeleteAdmin = async (id) => {
        if (window.confirm("Are you sure you want to delete this admin?")) {
            try {
                await DeleteSuperAdmin(id);
            } catch (error) {
                alert("Failed to delete admin.");
            }
        }
    };

    const handleClearFilters = () => {
        setGenderFilter("");
        setDateFilter("");
        setStatusFilter("");
        setSearchTerm("");
        handleSearch("");
        handlePageChange(1);
    };

    return (
        <div className="space-y-4 p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Super Admin Management</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage system roles and permissions</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-all"
                >
                    <UserPlus size={18} /> Add SuperAdmin
                </button>
            </div>

            {/* Search and Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[280px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'}`}
                    >
                        <Filter size={18} /> Filters
                    </button>
                    {(genderFilter || statusFilter || dateFilter || searchTerm) && (
                        <button onClick={handleClearFilters} className="text-sm text-red-600 hover:underline">Clear All</button>
                    )}
                </div>

                {showFilters && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t pt-4 dark:border-gray-700">
                        <select 
                            value={genderFilter} 
                            onChange={(e) => setGenderFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 p-2 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 p-2 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <input 
                            type="month" 
                            value={dateFilter} 
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 p-2 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Super Admin</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Contact</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Credentials</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Status</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Joined</th>
                                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                                            <span className="text-gray-500">Fetching records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAdmins.length > 0 ? (
                                filteredAdmins.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center font-bold text-orange-700">
                                                    {admin.avatar?.url ? <img src={admin.avatar.url} className="rounded-full object-cover" /> : getInitials(admin)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{getFullName(admin)}</div>
                                                    <div className="text-xs text-gray-500 uppercase">{admin.gender}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-1"><Mail size={14}/> {admin.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 font-mono text-sm">
                                                <span>{passwordVisibility[admin._id] ? admin.password : maskPassword(admin.password)}</span>
                                                <button onClick={() => togglePasswordVisibility(admin._id)} className="text-gray-400 hover:text-orange-500">
                                                    {passwordVisibility[admin._id] ? <EyeOff size={16}/> : <Eye size={16}/>}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.isActive !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                                                {admin.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            <div>{formatDate(admin.created_at)}</div>
                                            <div className="text-xs">{formatTime(admin.created_at)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setEditingAdmin(admin); setShowEditModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                                                <button onClick={() => handleDeleteAdmin(admin._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center text-gray-500">
                                        <Users className="mx-auto mb-2 opacity-20" size={48} />
                                        No matching administrators found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t p-4 dark:border-gray-700">
                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddSuperAdminModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onAddAdmin={createAdmin}
                />
            )}

            {showEditModal && editingAdmin && (
                <AddSuperAdminModal
                    isOpen={showEditModal}
                    onClose={() => { setShowEditModal(false); setEditingAdmin(null); }}
                    onAddAdmin={UpdateSuperAdmin}
                    editingAdmin={editingAdmin}
                    mode="edit"
                />
            )}
        </div>
    );
};

export default SuperAdminTable;