import React, { useState, useEffect, useContext } from "react";
import { Gift, X, Check } from "lucide-react";
import { AssistanceContext } from "../../../contexts/AssignContext/AssignContext";
import StatusModal from "../../ReusableFolder/SuccessandField";

const AssignAyudaModal = ({
    showCategoryPopup,
    setShowCategoryPopup,
    selectedResidents,
    setSelectedResidents,
    selectAll,
    setSelectAll,
    paginatedData,
    totalResidents,
    isSelectingAllPages,
    setIsSelectingAllPages,
    triggeredBySelectAllCheckbox,
    setTriggeredBySelectAllCheckbox,
    categories,
    selectedMunicipality,
    selectedBarangay,
    searchTerm,
    itemsPerPage,
    serverCurrentPage,
    onFetchData,
    theme,
}) => {
    const { createAssistance } = useContext(AssistanceContext);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isCreatingAssistance, setIsCreatingAssistance] = useState(false);
    const [statusSelection, setStatusSelection] = useState("Priority");
    
    // State para sa StatusModal
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalProps, setStatusModalProps] = useState({
        status: "success",
        error: null,
        title: "",
        message: "",
        onRetry: null,
    });

    // Reset states when modal closes
    useEffect(() => {
        if (!showCategoryPopup) {
            setSelectedCategory("");
            setIsSelectingAllPages(false);
            setTriggeredBySelectAllCheckbox(false);
            setStatusSelection("Priority");

            // Reset select all if cancelling
            if (isSelectingAllPages || triggeredBySelectAllCheckbox) {
                setSelectAll(false);
                setSelectedResidents([]);
            }
        }
    }, [showCategoryPopup, isSelectingAllPages, triggeredBySelectAllCheckbox]);

    // Municipality validation
    const validateMunicipalitySelection = () => {
        if (selectedMunicipality === "All") {
            showStatusMessage("failed", "Please select a municipality first before assigning ayuda.", {
                title: "Municipality Required"
            });
            return false;
        }
        return true;
    };

    // Function to show status messages
    const showStatusMessage = (status, error = null, customProps = {}) => {
        setStatusModalProps({
            status,
            error,
            title: customProps.title || "",
            message: customProps.message || "",
            onRetry: customProps.onRetry || null,
        });
        setShowStatusModal(true);
    };

    // Handle StatusModal close
    const handleStatusModalClose = () => {
        setShowStatusModal(false);
        // Kung success ang status, close din ang category modal
        if (statusModalProps.status === "success") {
            resetSelectionStates();
        }
    };

    // Handle category confirmation
    const handleCategoryConfirm = async () => {
        // Validate municipality selection
        if (!validateMunicipalitySelection()) {
            return;
        }

        if (!selectedCategory) {
            showStatusMessage("failed", "Please select a category first.", {
                title: "Category Required"
            });
            return;
        }

        // Find the selected category object to get its _id
        const selectedCategoryObj = categories?.find((cat) => cat.categoryName === selectedCategory);
        const categoryIId = selectedCategoryObj?._id;
        const categoryName = selectedCategoryObj?.categoryName;

        if (!categoryIId) {
            showStatusMessage("failed", "Category not found. Please try again.", {
                title: "Category Error"
            });
            return;
        }

        // Determine the selection source
        const selectionMessage = getSelectionMessage();

        console.log(`Selecting ${selectionMessage} for ${categoryName} (ID: ${categoryIId}) with status: ${statusSelection}`);

        // Prepare payload for createAssistance
        const payload = preparePayload(categoryName, categoryIId);

        // Call createAssistance from context
        try {
            setIsCreatingAssistance(true);

            const result = await createAssistance(payload);

            // ✅ PAGBABAGO: Gumamit ng if (result.success) condition
            if (result.success) {
                handleSuccess(result.message || `Successfully assigned ${categoryName} to ${selectionMessage}`);
            } else {
                handleError(result.message || "Unknown error", handleCategoryConfirm);
            }
        } catch (error) {
            console.error("Error in createAssistance:", error);
            handleError(error.message || "Failed to assign ayuda", handleCategoryConfirm);
        } finally {
            setIsCreatingAssistance(false);
        }
    };

    // Get selection message based on selection type
    const getSelectionMessage = () => {
        if (isSelectingAllPages) {
            return `ALL ${totalResidents} residents from all pages`;
        } else if (selectAll || triggeredBySelectAllCheckbox) {
            return `ALL ${paginatedData.length} residents from current page`;
        } else {
            return `${selectedResidents.length} residents from current page`;
        }
    };

    // Prepare payload for API call
    const preparePayload = (categoryName, categoryIId) => {
        const payloadMunicipality = selectedMunicipality !== "All" ? selectedMunicipality : undefined;
        const payloadBarangay = selectedBarangay !== "All" ? selectedBarangay : undefined;

        const payload = {
            categoryName: categoryName,
            categoryIId: categoryIId,
            statusSelection: statusSelection,
            filters: {
                searchTerm,
                municipality: selectedMunicipality,
                barangay: selectedBarangay,
            },
        };

        // Add municipality and barangay to payload
        if (payloadMunicipality) {
            payload.municipality = payloadMunicipality;
        }
        if (payloadBarangay) {
            payload.barangay = payloadBarangay;
        }

        // Add residents if selecting from current page only
        if (!isSelectingAllPages && selectedResidents.length > 0) {
            payload.residentIds = selectedResidents;
        }

        return payload;
    };

    // Handle successful assignment
    const handleSuccess = (message) => {
        showStatusMessage("success", null, {
            title: "Ayuda Assigned Successfully",
            message: message,
        });

        // Refresh data if needed
        if (onFetchData) {
            const refreshParams = {
                page: serverCurrentPage,
                limit: itemsPerPage,
            };

            if (searchTerm && searchTerm.trim() !== "") {
                refreshParams.search = searchTerm;
            }

            if (selectedMunicipality !== "All") {
                refreshParams.municipality = selectedMunicipality;
            }

            if (selectedBarangay !== "All") {
                refreshParams.barangay = selectedBarangay;
            }

            console.log("Refreshing data after assistance creation");
            setTimeout(() => {
                onFetchData(refreshParams);
            }, 1000);
        }
    };

    // Handle error
    const handleError = (errorMessage, retryFunction) => {
        showStatusMessage("failed", errorMessage, {
            title: "Assignment Failed",
            onRetry: retryFunction,
        });
    };

    // Reset all selection states
    const resetSelectionStates = () => {
        setShowCategoryPopup(false);
        setSelectedCategory("");
        setIsSelectingAllPages(false);
        setSelectAll(false);
        setSelectedResidents([]);
        setTriggeredBySelectAllCheckbox(false);
        setStatusSelection("Priority");
    };

    // Handle cancel
    const handleCategoryCancel = () => {
        resetSelectionStates();
    };

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && showCategoryPopup) {
                handleCategoryCancel();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [showCategoryPopup]);

    // Auto-close success modal
    useEffect(() => {
        if (showStatusModal && statusModalProps.status === "success") {
            const timer = setTimeout(() => {
                setShowStatusModal(false);
                resetSelectionStates();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showStatusModal, statusModalProps.status]);

    if (!showCategoryPopup) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="category-popup w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                                <Gift
                                    className="text-orange-600 dark:text-orange-400"
                                    size={24}
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {isSelectingAllPages ? "Select All Residents" : "Select Residents"}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Status Selection:{" "}
                                    <span
                                        className={`font-bold ${statusSelection === "All" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}
                                    >
                                        {statusSelection}
                                    </span>
                                    <br />
                                    <span className="text-xs">
                                        {isSelectingAllPages
                                            ? '(Selected via "Select All Residents" button)'
                                            : triggeredBySelectAllCheckbox || selectAll
                                              ? '(Selected via "Select All on This Page" checkbox)'
                                              : "(Manually selected)"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                            {isSelectingAllPages ? (
                                <>
                                    You are about to select <span className="font-bold">ALL {totalResidents} residents</span> from all pages.
                                </>
                            ) : selectAll || triggeredBySelectAllCheckbox ? (
                                <>
                                    You are about to select <span className="font-bold">ALL {paginatedData.length} residents</span> from the current page.
                                </>
                            ) : (
                                <>
                                    You are about to select <span className="font-bold">{selectedResidents.length} residents</span> from the current page.
                                </>
                            )}
                            <br />
                            <br />
                            Please select the category of ayuda to assign:
                        </p>

                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Select Ayuda Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={isCreatingAssistance}
                            >
                                <option value="">-- Select Category --</option>
                                {categories?.map((category) => (
                                    <option
                                        key={category._id}
                                        value={category.categoryName}
                                    >
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Selection */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Select Status</label>
                            <div className="flex gap-2">
                                {["Priority", "Validated", "All"].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setStatusSelection(status)}
                                        className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                            statusSelection === status
                                                ? "bg-orange-600 text-white"
                                                : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        }`}
                                        disabled={isCreatingAssistance}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {statusSelection === "All"
                                    ? "Will include residents with all statuses"
                                    : statusSelection === "Priority"
                                      ? "Will include Priority residents only"
                                      : `Will include ${statusSelection} residents only`}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCategoryCancel}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                disabled={isCreatingAssistance}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCategoryConfirm}
                                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                                disabled={!selectedCategory || isCreatingAssistance}
                            >
                                {isCreatingAssistance ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        {isSelectingAllPages ? "Select All" : "Confirm Selection"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* StatusModal */}
            <StatusModal
                isOpen={showStatusModal}
                onClose={handleStatusModalClose}
                status={statusModalProps.status}
                error={statusModalProps.error}
                title={statusModalProps.title}
                message={statusModalProps.message}
                onRetry={statusModalProps.onRetry}
            />
        </>
    );
};

export default AssignAyudaModal;