import React from "react";
import { Plus, X, AlertCircle, Edit } from "lucide-react";

const ResidentModal = ({
    from,
    mode = "add", // 'add' or 'edit'
    show,
    onClose,
    residentData,
    setResidentData,
    onSubmit,
    municipalityOptions,
    genderOptions,
    civilStatusOptions,
    employmentStatusOptions = [],
    relationshipOptions = [],
    statusOptions = [],
    classificationOptions = [],
    isLoading = false,
    onRelationshipChange = null,
}) => {
    if (!show) return null;

    const isEditMode = mode === "edit";

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    const getTitle = () => {
        return isEditMode ? "Edit Resident" : "Add New Resident";
    };

    const getDescription = () => {
        return isEditMode ? "Update the resident information in the system" : "Fill in the form to add a new resident";
    };

    const getButtonText = () => {
        return isEditMode ? "Update" : "Save";
    };

    const getButtonIcon = () => {
        return isEditMode ? (
            <Edit
                size={16}
                className="mr-2 inline"
            />
        ) : (
            <Plus
                size={16}
                className="mr-2 inline"
            />
        );
    };

    // Initialize empty object if residentData is null/undefined
    const formData = residentData || {};

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl transition-colors duration-300 dark:bg-gray-800">
                <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <div>
                        <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                            {isEditMode ? (
                                <Edit
                                    size={24}
                                    className="text-amber-600 dark:text-amber-400"
                                />
                            ) : (
                                <Plus
                                    size={24}
                                    className="text-blue-600 dark:text-blue-400"
                                />
                            )}
                            {getTitle()}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{getDescription()}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X
                            size={20}
                            className="text-gray-500 dark:text-gray-400"
                        />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Left Column - Personal Information */}
                            <div className="space-y-4">
                                <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h4>

                                {/* Household ID - REQUIRED FIELD - only shown when NOT coming from a repository */}
                                {!from && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Household ID <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.household_id || ""}
                                            onChange={(e) => setResidentData({ ...formData, household_id: e.target.value })}
                                            placeholder="Enter Household ID (e.g., HH-001)"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                )}

                                {/* Relationship Field - REQUIRED */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Relationship to Head <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.relationship || ""}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setResidentData({ ...formData, relationship: newValue });
                                            if (onRelationshipChange) {
                                                onRelationshipChange(newValue);
                                            }
                                        }}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        required
                                    >
                                        <option value="">Select Relationship</option>
                                        {relationshipOptions &&
                                            relationshipOptions.map((option) => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.firstname || ""}
                                            onChange={(e) => setResidentData({ ...formData, firstname: e.target.value })}
                                            placeholder="First Name"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.lastname || ""}
                                            onChange={(e) => setResidentData({ ...formData, lastname: e.target.value })}
                                            placeholder="Last Name"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Middle Name</label>
                                        <input
                                            type="text"
                                            value={formData.middlename || ""}
                                            onChange={(e) => setResidentData({ ...formData, middlename: e.target.value })}
                                            placeholder="Middle Name"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Suffix</label>
                                        <select
                                            value={formData.suffix || "None"}
                                            onChange={(e) => setResidentData({ ...formData, suffix: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="None">None</option>
                                            <option value="Jr.">Jr.</option>
                                            <option value="Sr.">Sr.</option>
                                            <option value="II">II</option>
                                            <option value="III">III</option>
                                            <option value="IV">IV</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Gender <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.gender || ""}
                                            onChange={(e) => setResidentData({ ...formData, gender: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            required
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
                                        <input
                                            type="number"
                                            value={formData.age || ""}
                                            onChange={(e) => setResidentData({ ...formData, age: e.target.value })}
                                            placeholder="Age"
                                            min="0"
                                            max="120"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Birth Date</label>
                                        <input
                                            type="date"
                                            value={formData.birth_date ? formData.birth_date.split("T")[0] : ""}
                                            onChange={(e) => setResidentData({ ...formData, birth_date: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Birth Place</label>
                                        <input
                                            type="text"
                                            value={formData.birth_place || ""}
                                            onChange={(e) => setResidentData({ ...formData, birth_place: e.target.value })}
                                            placeholder="Birth Place"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Educational Information */}
                                <div className="space-y-2">
                                    <h5 className="text-md font-medium text-gray-900 dark:text-white">Educational Information</h5>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Educational Status</label>
                                        <input
                                            type="text"
                                            value={formData.educational_status || ""}
                                            onChange={(e) => setResidentData({ ...formData, educational_status: e.target.value })}
                                            placeholder="e.g., Graduate, College, High School"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Year Level/Graduated
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.educational_year || ""}
                                                onChange={(e) => setResidentData({ ...formData, educational_year: e.target.value })}
                                                placeholder="e.g., 2023, 2nd Year"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                                            <input
                                                type="text"
                                                value={formData.course || ""}
                                                onChange={(e) => setResidentData({ ...formData, course: e.target.value })}
                                                placeholder="Course/Degree"
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">School</label>
                                        <input
                                            type="text"
                                            value={formData.school || ""}
                                            onChange={(e) => setResidentData({ ...formData, school: e.target.value })}
                                            placeholder="School Name"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Contact & Address Information */}
                            <div className="space-y-4">
                                <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Contact & Other Information</h4>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                                    <input
                                        type="tel"
                                        value={formData.contact_number || ""}
                                        onChange={(e) => setResidentData({ ...formData, contact_number: e.target.value })}
                                        placeholder="09XXXXXXXXX"
                                        pattern="[0-9]{11}"
                                        title="Please enter a valid 11-digit phone number"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Religion</label>
                                    <input
                                        type="text"
                                        value={formData.religion || ""}
                                        onChange={(e) => setResidentData({ ...formData, religion: e.target.value })}
                                        placeholder="Religion"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                {/* Civil Status Field */}
                                {civilStatusOptions.length > 0 && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Civil Status</label>
                                        <select
                                            value={formData.civil_status || ""}
                                            onChange={(e) => setResidentData({ ...formData, civil_status: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="">Select Civil Status</option>
                                            {civilStatusOptions.map((option) => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Employment Status */}
                                {employmentStatusOptions.length > 0 && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Employment Status</label>
                                        <select
                                            value={formData.employment_status || ""}
                                            onChange={(e) => setResidentData({ ...formData, employment_status: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="">Select Employment Status</option>
                                            {employmentStatusOptions.map((option) => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Classifications - Multiple Select */}
                                {classificationOptions.length > 0 && (
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Classifications</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {classificationOptions.map((option) => (
                                                <label
                                                    key={option}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.classifications?.includes(option) || false}
                                                        onChange={(e) => {
                                                            const newClassifications = e.target.checked
                                                                ? [...(formData.classifications || []), option]
                                                                : (formData.classifications || []).filter((item) => item !== option);
                                                            setResidentData({ ...formData, classifications: newClassifications });
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Address Information */}
                                <div className="space-y-2">
                                    <h5 className="text-md font-medium text-gray-900 dark:text-white">Address Information</h5>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                        <input
                                            type="text"
                                            value={formData.address || ""}
                                            onChange={(e) => setResidentData({ ...formData, address: e.target.value })}
                                            placeholder="House No., Street Name"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>

                                    {municipalityOptions.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Municipality
                                                </label>
                                                <select
                                                    value={formData.municipality || ""}
                                                    onChange={(e) => setResidentData({ ...formData, municipality: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                >
                                                    <option value="">Select Municipality</option>
                                                    {municipalityOptions
                                                        .filter((m) => m !== "All")
                                                        .map((municipality) => (
                                                            <option
                                                                key={municipality}
                                                                value={municipality}
                                                            >
                                                                {municipality}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Barangay</label>
                                                <input
                                                    type="text"
                                                    value={formData.barangay || ""}
                                                    onChange={(e) => setResidentData({ ...formData, barangay: e.target.value })}
                                                    placeholder="Barangay Name"
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Sitio/Purok</label>
                                        <input
                                            type="text"
                                            value={formData.sitio || ""}
                                            onChange={(e) => setResidentData({ ...formData, sitio: e.target.value })}
                                            placeholder="Sitio/Purok Name"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Status Field */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                    <select
                                        value={formData.status || "Active"}
                                        onChange={(e) => setResidentData({ ...formData, status: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`rounded-lg px-6 py-2 text-sm font-bold text-white transition-colors ${
                                    isEditMode
                                        ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                                        : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                                } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        {getButtonText()}...
                                    </span>
                                ) : (
                                    <>
                                        {getButtonIcon()}
                                        {getButtonText()}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="flex items-start gap-2">
                        <AlertCircle
                            className={`${isEditMode ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"} mt-0.5 flex-shrink-0`}
                            size={16}
                        />
                        <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Important Notes</h5>
                            <ul className="mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <li>
                                    • Fields marked with <span className="text-red-500">*</span> are required
                                </li>
                                <li>• All residents in the same household must have the same Household ID</li>
                                <li>• Ensure all information is accurate before saving</li>
                                {isEditMode ? (
                                    <>
                                        <li>• Changes will be immediately reflected in the system</li>
                                    </>
                                ) : (
                                    <>
                                        <li>• Status will default to "Active"</li>
                                        <li>• You can update additional information after adding the resident</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidentModal;