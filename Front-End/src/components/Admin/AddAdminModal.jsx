import React, { useState, useEffect } from "react";
import {
    UserPlus,
    Edit,
    X,
    Mail,
    Save,
    Eye,
    EyeOff,
} from "lucide-react";

const AddAdminModal = ({ 
    isOpen, 
    onClose, 
    onAddAdmin, 
    editingAdmin = null,
    mode = "add" 
}) => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        middle_name: "",
        gender: "Male",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Initialize form data when editing
    useEffect(() => {
        if (editingAdmin && mode === "edit") {
            setFormData({
                first_name: editingAdmin.first_name || "",
                last_name: editingAdmin.last_name || "",
                middle_name: editingAdmin.middle_name || "",
                gender: editingAdmin.gender || "Male",
                email: editingAdmin.email || "",
                password: "", // Empty for security
                confirm_password: "", // Empty for security
            });
        } else if (!editingAdmin && mode === "add") {
            // Reset form for add mode
            setFormData({
                first_name: "",
                last_name: "",
                middle_name: "",
                gender: "Male",
                email: "",
                password: "",
                confirm_password: "",
            });
        }
    }, [editingAdmin, mode]);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: "",
            });
        }
    };

    // Validate form based on mode
    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.first_name.trim()) {
            errors.first_name = "First name is required";
        }
        if (!formData.last_name.trim()) {
            errors.last_name = "Last name is required";
        }
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }
        
        if (mode === "add") {
            // Password is required for add mode
            if (!formData.password) {
                errors.password = "Password is required";
            } else if (formData.password.length < 6) {
                errors.password = "Password must be at least 6 characters";
            }
            if (!formData.confirm_password) {
                errors.confirm_password = "Please confirm your password";
            } else if (formData.password !== formData.confirm_password) {
                errors.confirm_password = "Passwords do not match";
            }
        }
        // For edit mode, no password validation needed since we don't show password fields

        return errors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare data for API
            const adminDataToSubmit = { ...formData };
            
            // Remove confirm_password from data
            delete adminDataToSubmit.confirm_password;
            
            // If in edit mode, remove password field completely
            if (mode === "edit") {
                delete adminDataToSubmit.password;
                delete adminDataToSubmit.confirm_password;
            }

            let result;
            if (mode === "add") {
                result = await onAddAdmin(adminDataToSubmit);
            } else if (mode === "edit" && editingAdmin) {
                result = await onAddAdmin(editingAdmin._id, adminDataToSubmit);
            }
            
            if (result && result.success) {
                onClose();
            } else {
                alert(result?.error || `Failed to ${mode === 'add' ? 'add' : 'update'} admin. Please try again.`);
            }
        } catch (error) {
            console.error(`Error ${mode === 'add' ? 'adding' : 'updating'} admin:`, error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            mode === "add" ? "bg-orange-100 dark:bg-orange-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                        }`}>
                            {mode === "add" ? (
                                <UserPlus className="text-orange-600 dark:text-orange-400" size={20} />
                            ) : (
                                <Edit className="text-blue-600 dark:text-blue-400" size={20} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {mode === "add" ? "Add New Admin" : "Edit Admin"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {mode === "add" ? "Create a new administrator account" : "Update administrator account details"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                        disabled={isSubmitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                    formErrors.first_name
                                        ? "border-red-300 focus:ring-red-500 dark:border-red-700"
                                        : mode === "add"
                                        ? "border-gray-300 focus:ring-orange-500 dark:border-gray-600"
                                        : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                                } bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
                                disabled={isSubmitting}
                            />
                            {formErrors.first_name && (
                                <p className="mt-1 text-xs text-red-500">{formErrors.first_name}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                    formErrors.last_name
                                        ? "border-red-300 focus:ring-red-500 dark:border-red-700"
                                        : mode === "add"
                                        ? "border-gray-300 focus:ring-orange-500 dark:border-gray-600"
                                        : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                                } bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
                                disabled={isSubmitting}
                            />
                            {formErrors.last_name && (
                                <p className="mt-1 text-xs text-red-500">{formErrors.last_name}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Middle Name</label>
                        <input
                            type="text"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleInputChange}
                            className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                                mode === "add"
                                    ? "focus:ring-orange-500"
                                    : "focus:ring-blue-500"
                            } dark:border-gray-600 dark:bg-gray-900 dark:text-white`}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                                mode === "add"
                                    ? "focus:ring-orange-500"
                                    : "focus:ring-blue-500"
                            } dark:border-gray-600 dark:bg-gray-900 dark:text-white`}
                            disabled={isSubmitting}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Mail size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="admin@example.com"
                                className={`w-full rounded-lg border pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                    formErrors.email
                                        ? "border-red-300 focus:ring-red-500 dark:border-red-700"
                                        : mode === "add"
                                        ? "border-gray-300 focus:ring-orange-500 dark:border-gray-600"
                                        : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                                } bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
                                disabled={isSubmitting}
                            />
                        </div>
                        {formErrors.email && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                        )}
                    </div>

                    {/* Password fields - Only show in Add mode */}
                    {mode === "add" && (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                            formErrors.password
                                                ? "border-red-300 focus:ring-red-500 dark:border-red-700"
                                                : "border-gray-300 focus:ring-orange-500 dark:border-gray-600"
                                        } bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {formErrors.password && (
                                    <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                            formErrors.confirm_password
                                                ? "border-red-300 focus:ring-red-500 dark:border-red-700"
                                                : "border-gray-300 focus:ring-orange-500 dark:border-gray-600"
                                        } bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                        disabled={isSubmitting}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {formErrors.confirm_password && (
                                    <p className="mt-1 text-xs text-red-500">{formErrors.confirm_password}</p>
                                )}
                            </div>
                        </>
                    )}

                    {mode === "edit" && (
                        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                            <p>Note: Password cannot be changed from this form. Please use the password reset feature if needed.</p>
                        </div>
                    )}
                </form>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 p-6 dark:border-gray-700">
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                mode === "add" 
                                    ? "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500" 
                                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    {mode === "add" ? "Adding..." : "Saving..."}
                                </>
                            ) : (
                                <>
                                    {mode === "add" ? <UserPlus size={16} /> : <Save size={16} />}
                                    {mode === "add" ? "Add Admin" : "Save Changes"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddAdminModal;