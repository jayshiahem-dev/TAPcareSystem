import React, { useState } from "react";
import { X, UserPlus, Mail, Eye, EyeOff, Save } from "lucide-react";

const AddFormModal = ({ 
    show, 
    onClose, 
    onSubmit, 
    data, 
    onChange, 
    errors, 
    isSubmitting,
    mode = "add" // "add" or "edit"
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    const handleInputChange = (e) => {
        onChange(e);
    };

    const isEditMode = mode === "edit";
    const title = isEditMode ? "Edit Officer" : "Add New Officer";
    const description = isEditMode ? "Update officer account details" : "Create a new officer account";
    const submitButtonText = isEditMode ? "Save Changes" : "Add Officer";
    const submitButtonIcon = isEditMode ? <Save size={16} /> : <UserPlus size={16} />;
    const modalColor = isEditMode ? "blue" : "orange";

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 ${show ? "" : "hidden"}`}>
            <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${modalColor}-100 dark:bg-${modalColor}-900/30`}>
                            {isEditMode ? (
                                <Save className={`text-${modalColor}-600 dark:text-${modalColor}-400`} size={20} />
                            ) : (
                                <UserPlus className={`text-${modalColor}-600 dark:text-${modalColor}-400`} size={20} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
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
                                value={data.first_name || ""}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                    errors.first_name
                                        ? "border-red-300 focus:ring-red-500 dark:border-red-700"
                                        : `border-gray-300 focus:ring-${modalColor}-500 dark:border-gray-600`
                                } bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
                                disabled={isSubmitting}
                            />
                            {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={data.last_name || ""}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                    errors.last_name
                                        ? "border-red-300 focus:ring-red-500 dark:border-red-700"
                                        : `border-gray-300 focus:ring-${modalColor}-500 dark:border-gray-600`
                                } bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
                                disabled={isSubmitting}
                            />
                            {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Middle Name</label>
                        <input
                            type="text"
                            name="middle_name"
                            value={data.middle_name || ""}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="gender"
                            value={data.gender || "Male"}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
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
                                <Mail
                                    size={16}
                                    className="text-gray-400"
                                />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={data.email || ""}
                                onChange={handleInputChange}
                                placeholder="officer@example.com"
                                className={`w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 ${
                                    errors.email
                                        ? "border-red-300 focus:ring-red-500 dark:border-red-700"
                                        : `border-gray-300 focus:ring-${modalColor}-500 dark:border-gray-600`
                                } bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Password Field - Only show in add mode */}
                    {!isEditMode && (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password || ""}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                            errors.password
                                                ? "border-red-300 focus:ring-red-500 dark:border-red-700"
                                                : `border-gray-300 focus:ring-${modalColor}-500 dark:border-gray-600`
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
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirm_password"
                                        value={data.confirm_password || ""}
                                        onChange={handleInputChange}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                            errors.confirm_password
                                                ? "border-red-300 focus:ring-red-500 dark:border-red-700"
                                                : `border-gray-300 focus:ring-${modalColor}-500 dark:border-gray-600`
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
                                {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password}</p>}
                            </div>
                        </>
                    )}

                    {/* Sa edit mode, walang password fields at walang note */}
                    
                </form>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 p-6 dark:border-gray-700">
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleSubmit(e);
                            }}
                            disabled={isSubmitting}
                            className={`inline-flex items-center gap-2 rounded-lg bg-${modalColor}-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-${modalColor}-700 focus:outline-none focus:ring-2 focus:ring-${modalColor}-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    {isEditMode ? "Saving..." : "Adding..."}
                                </>
                            ) : (
                                <>
                                    {submitButtonIcon}
                                    {submitButtonText}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFormModal;