import React, { useContext, useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2, Download, ChevronLeft, ChevronRight, X, AlertCircle, Sun, Moon } from "lucide-react";
import { CategoryContext } from "../../contexts/CategoryContext/categoryContext";
import StatusModal from "../../ReusableFolder/SuccessandField"; // <-- Import StatusModal

// Custom hook para sa theme management - NASA LABAS ng component
const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme) return savedTheme;

            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            return systemPrefersDark ? "dark" : "light";
        }
        return "light";
    });

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);

        if (typeof window !== "undefined") {
            document.documentElement.classList.toggle("dark", newTheme === "dark");
        }
    };

    // Initialize on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            document.documentElement.classList.toggle("dark", theme === "dark");
        }
    }, [theme]);

    return { theme, toggleTheme };
};

const Category = () => {
    const {
        createCategory,
        updateCategory,
        deleteCategory,
        categories,
        loading,
        error,
        TotalCategories,
        TotalPages,
        CurrentPage,
        fetchCategories,
        setCurrentPage,
    } = useContext(CategoryContext);

    // Status Modal State
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalProps, setStatusModalProps] = useState({
        status: "success",
        error: null,
        title: "",
        message: "",
        onRetry: null,
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        category: "",
        description: "",
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formError, setFormError] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Theme management
    const { theme, toggleTheme } = useTheme();

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

    // Debounce effect para sa search
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 2000); // 500ms debounce delay

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    // Effect para mag-fetch ng categories kapag nagbago ang debouncedSearchTerm
    useEffect(() => {
        if (fetchCategories) {
            // Set searching state
            if (debouncedSearchTerm && !isSearching) {
                setIsSearching(true);
            }

            fetchCategories(CurrentPage, 10, debouncedSearchTerm).finally(() => {
                setIsSearching(false);
            });
        }
    }, [CurrentPage, debouncedSearchTerm, fetchCategories]);

    // Effect para mag-fetch ng categories kapag nagbago ang CurrentPage
    useEffect(() => {
        if (fetchCategories && !searchTerm) {
            fetchCategories(CurrentPage, 10, "");
        }
    }, [CurrentPage, fetchCategories, searchTerm]);

    // Modified handleAddItem to use context createCategory function
    const handleAddItem = async () => {
        setFormError("");

        // Validation - inalis ang amount validation
        if (!newItem.category || !newItem.category.trim()) {
            setFormError("Category name is required");
            return;
        }

        try {
            const payload = {
                category: newItem.category.trim(),
                description: newItem.description ? newItem.description.trim() : "",
            };

            console.log("📤 Sending payload:", payload);
            const result = await createCategory(payload);
            console.log("result:", result);

            if (result && result.success) {
                setNewItem({ category: "", description: "" });
                setIsModalOpen(false);
                // Refresh ang data
                if (fetchCategories) {
                    await fetchCategories(CurrentPage, 10, debouncedSearchTerm);
                }
                // Show success message
                showStatusMessage("success", null, {
                    title: "Category Added",
                    message: `"${payload.category}" has been successfully added.`,
                });
            } else {
                setFormError(result?.error || "Failed to create category");
            }
        } catch (err) {
            console.error("❌ Error in handleAddItem:", err);
            setFormError("Failed to create category");
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= TotalPages && setCurrentPage) {
            setCurrentPage(page);
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        // I-reset sa page 1 kapag nag-search
        if (setCurrentPage) {
            setCurrentPage(1);
        }
    };

    const handleEditClick = (item) => {
        if (!item) return;

        setEditingItem(item);
        setNewItem({
            category: item.category || item.categoryName || "",
            description: item.description || "",
        });
        setIsModalOpen(true);
        setFormError("");
    };

    const handleSaveEdit = async () => {
        // Reset form error
        setFormError("");

        // Validation - inalis ang amount validation
        if (!newItem.category || !newItem.category.trim()) {
            setFormError("Category name is required");
            return;
        }

        if (!editingItem || !editingItem._id) {
            setFormError("No item selected for editing");
            return;
        }

        const payload = {
            category: newItem.category.trim(),
            description: newItem.description ? newItem.description.trim() : "",
        };

        try {
            const result = await updateCategory(editingItem._id, payload);
            if (result && result.success) {
                setEditingItem(null);
                setNewItem({ category: "", description: "" });
                setIsModalOpen(false);
                // Refresh ang data
                if (fetchCategories) {
                    await fetchCategories(CurrentPage, 10, debouncedSearchTerm);
                }
                // Show success message
                showStatusMessage("success", null, {
                    title: "Category Updated",
                    message: `"${payload.category}" has been successfully updated.`,
                });
            } else {
                // Show error message kung hindi success
                showStatusMessage("error", result?.error || "Failed to update category", {
                    title: "Update Failed",
                    onRetry: handleSaveEdit, // Optional: allow retry
                });
                // Pwede ring i-set ang form error kung gusto mo
                setFormError(result?.error || "Failed to update category");
            }
        } catch (err) {
            console.error("Update category failed:", err);
            setFormError("Failed to update category");
            showStatusMessage("error", err.message, {
                title: "Update Error",
                onRetry: handleSaveEdit,
            });
        }
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            if (deleteCategory && itemToDelete) {
                const result = await deleteCategory(itemToDelete);
                if (result && result.success) {
                    // Refresh ang data
                    if (fetchCategories) {
                        await fetchCategories(CurrentPage, 10, debouncedSearchTerm);
                    }
                    // Show success message
                    showStatusMessage("success", null, {
                        title: "Category Deleted",
                        message: `Category has been successfully deleted.`,
                    });
                } else {
                    // Optional: show error if delete fails
                    showStatusMessage("error", result?.error || "Failed to delete category", {
                        title: "Delete Failed",
                    });
                }
            }
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        } catch (err) {
            console.error("Delete failed:", err);
            showStatusMessage("error", err.message, {
                title: "Delete Error",
            });
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    const exportToCSV = () => {
        if (!categories || categories.length === 0) return;

        const headers = ["ID", "Category", "Description"];
        const csvContent = [
            headers.join(","),
            ...categories.map((item) =>
                [item._id || item.id || "", `"${item.category || item.categoryName || ""}"`, `"${item.description || ""}"`].join(","),
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "assistance_programs.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-sans transition-colors duration-300 dark:from-slate-900 dark:to-gray-900 md:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header with Theme Toggle */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Assistance Programs</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">Manage and track available financial assistance programs</p>
                    </div>
                    {/* Add Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="rounded-lg bg-slate-200 p-2 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                    >
                        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>

                {/* Control Panel */}
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-400 dark:text-slate-500"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Search programs..."
                                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-slate-900 outline-none transition-colors duration-300 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                disabled={loading || isSearching}
                            />
                            {(isSearching || (loading && searchTerm)) && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-slate-500 dark:border-t-slate-300"></div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                disabled={!categories || categories.length === 0}
                            >
                                <Download size={18} /> Export
                            </button>
                            <button
                                onClick={() => {
                                    setEditingItem(null);
                                    setNewItem({ category: "", description: "" });
                                    setIsModalOpen(true);
                                    setFormError("");
                                }}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-blue-700"
                                disabled={loading || isSearching}
                            >
                                <Plus size={18} /> Add Program
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {(loading || isSearching) && (
                    <div className="mb-6 text-center text-slate-600 dark:text-slate-400">
                        {isSearching ? "Searching..." : "Loading categories..."}
                    </div>
                )}

                {/* Error State */}
                {error && <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">Error: {error}</div>}

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Category</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Description</th>
                                    <th className="p-4 text-center font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories && categories.length > 0 ? (
                                    categories.map((item) => (
                                        <tr
                                            key={item._id || item.id || Math.random()}
                                            className="border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                                        >
                                            <td className="p-4 font-semibold text-slate-800 dark:text-white">
                                                {item.category || item.categoryName || "N/A"}
                                            </td>
                                            <td className="max-w-xs p-4 text-slate-600 dark:text-slate-300">
                                                <div className="line-clamp-2">{item.description || "No description"}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(item)}
                                                        className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                        aria-label="Edit"
                                                        disabled={loading || isSearching}
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(item._id || item.id)}
                                                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
                                                        aria-label="Delete"
                                                        disabled={loading || isSearching}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="p-8 text-center text-slate-500 dark:text-slate-400"
                                        >
                                            {loading || isSearching
                                                ? "Loading..."
                                                : searchTerm
                                                  ? "No programs found. Try a different search term."
                                                  : "No programs found. Add your first program!"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - only show if there's data */}
                    {categories && categories.length > 0 && (
                        <div className="flex flex-col justify-between border-t border-slate-200 p-4 dark:border-slate-700 md:flex-row md:items-center">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Showing {((CurrentPage || 1) - 1) * 10 + 1} to {Math.min((CurrentPage || 1) * 10, TotalCategories || 0)} of{" "}
                                {TotalCategories || 0} entries
                            </div>
                            <div className="mt-4 flex items-center gap-2 md:mt-0">
                                <button
                                    onClick={() => handlePageChange((CurrentPage || 1) - 1)}
                                    disabled={CurrentPage === 1 || loading || isSearching}
                                    className="rounded-lg border border-slate-300 p-2 text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="px-3 text-sm text-slate-600 dark:text-slate-400">
                                    Page {CurrentPage || 1} of {TotalPages || 1}
                                </span>
                                <button
                                    onClick={() => handlePageChange((CurrentPage || 1) + 1)}
                                    disabled={CurrentPage === TotalPages || loading || isSearching}
                                    className="rounded-lg border border-slate-300 p-2 text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-colors duration-300 dark:bg-black/70">
                        <div className="w-full max-w-md rounded-2xl bg-white transition-colors duration-300 dark:bg-slate-800">
                            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editingItem ? "Edit Program" : "Add New Program"}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                    aria-label="Close modal"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-4 p-6">
                                {/* Form Error */}
                                {formError && (
                                    <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        {formError}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Category Name *</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        placeholder="Enter category name"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                                    <textarea
                                        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none transition-colors focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                        rows="3"
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        placeholder="Enter description (optional)"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingItem ? handleSaveEdit : handleAddItem}
                                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : editingItem ? "Save Changes" : "Add Program"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-colors duration-300 dark:bg-black/70">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 transition-colors duration-300 dark:bg-slate-800">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <AlertCircle
                                        className="text-red-600 dark:text-red-400"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Delete</h3>
                            </div>
                            <p className="mb-6 text-slate-600 dark:text-slate-400">
                                Are you sure you want to delete this program? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
                                >
                                    Delete Program
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
            </div>
        </div>
    );
};

export default Category;
