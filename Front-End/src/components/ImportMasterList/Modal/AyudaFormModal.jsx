import React, { useState, useContext, useEffect } from "react";
import { Gift, Check, Plus, Trash2 } from "lucide-react";
import { AssistanceContext } from "../../../contexts/AssignContext/AssignContext";
import StatusModal from "../../../ReusableFolder/SuccessandField";

const AyudaFormModal = ({
    showCategoryPopup,
    setShowCategoryPopup,
    selectedCategory,
    setSelectedCategory,
    isSelectingAllPages,
    selectAll,
    triggeredBySelectAllCheckbox,
    selectedResidents,
    paginatedData,
    totalResidents,
    statusSelection,
    categories,
    selectedMunicipality,
    selectedBarangay,
    searchTerm,
    serverCurrentPage,
    itemsPerPage,
    onFetchData,
    onSelectAllResidents,
    resetSelectionStates,
    handleCategoryCancel,
    isCreatingAssistance,
    setIsCreatingAssistance
}) => {
    const { createAssistance } = useContext(AssistanceContext);
    const [scheduleDate, setScheduleDate] = useState(null);
    
    // ===== DISTRIBUTION TYPE STATE =====
    const [distributionType, setDistributionType] = useState("Cash"); // default
    const distributionTypes = ["Cash", "Goods", "Relief", "Medical", "Other"];

    // ===== ITEMS STATE =====
    // For Cash: we'll keep a simple amount + auto-generate item
    const [cashAmount, setCashAmount] = useState("");
    const [cashAmountError, setCashAmountError] = useState("");

    // For Goods/Relief/Medical/Other: dynamic item list
    const [items, setItems] = useState([
        { itemName: "", quantity: 1, unit: "pc", amount: 0 }
    ]);

    // Reset items when distribution type changes
    useEffect(() => {
        if (distributionType === "Cash") {
            // Reset cash amount
            setCashAmount("");
            setCashAmountError("");
        } else {
            // Reset items to one empty row
            setItems([{ itemName: "", quantity: 1, unit: "pc", amount: 0 }]);
        }
    }, [distributionType]);

    // ===== STATUS MODAL =====
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        status: "success",
        title: "",
        message: "",
        error: null,
        onRetry: null
    });

    // ===== VALIDATION =====
    const validateCashAmount = () => {
        if (distributionType !== "Cash") return true;
        
        if (!cashAmount.trim()) {
            setCashAmountError("Please enter an amount");
            return false;
        }
        
        const amount = parseFloat(cashAmount);
        if (isNaN(amount)) {
            setCashAmountError("Please enter a valid number");
            return false;
        }
        
        if (amount <= 0) {
            setCashAmountError("Amount must be greater than 0");
            return false;
        }
        
        setCashAmountError("");
        return true;
    };

    const validateItems = () => {
        if (distributionType === "Cash") return true;
        
        // Check each item row
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.itemName.trim()) {
                showStatusMessage("failed", `Item #${i + 1}: Item name is required.`, {
                    title: "Validation Error"
                });
                return false;
            }
            if (!item.quantity || item.quantity <= 0) {
                showStatusMessage("failed", `Item #${i + 1}: Quantity must be greater than 0.`, {
                    title: "Validation Error"
                });
                return false;
            }
            if (!item.unit.trim()) {
                showStatusMessage("failed", `Item #${i + 1}: Unit is required.`, {
                    title: "Validation Error"
                });
                return false;
            }
            // Amount can be 0 or positive
            if (item.amount < 0) {
                showStatusMessage("failed", `Item #${i + 1}: Amount cannot be negative.`, {
                    title: "Validation Error"
                });
                return false;
            }
        }
        return true;
    };

    // ===== ITEM HANDLERS (for non-Cash) =====
    const handleAddItem = () => {
        setItems([...items, { itemName: "", quantity: 1, unit: "pc", amount: 0 }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length === 1) {
            showStatusMessage("info", "At least one item is required.", {
                title: "Cannot Remove"
            });
            return;
        }
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    // ===== SUBMIT HANDLER =====
    const handleCategoryConfirm = async () => {
        // 1. Validate Municipality
        if (selectedMunicipality === "All") {
            showStatusMessage("failed", "Please select a municipality first before proceeding.", {
                title: "Municipality Required"
            });
            return;
        }

        // 2. Validate Category
        if (!selectedCategory) {
            showStatusMessage("failed", "Please select a category first.", {
                title: "Category Required"
            });
            return;
        }

        // 3. Validate Distribution Type
        if (!distributionType) {
            showStatusMessage("failed", "Please select a distribution type.", {
                title: "Distribution Type Required"
            });
            return;
        }

        // 4. Validate amount/items based on distribution type
        if (distributionType === "Cash") {
            if (!validateCashAmount()) return;
        } else {
            if (!validateItems()) return;
        }

        const selectedCategoryObj = categories?.find(cat => cat.categoryName === selectedCategory);
        const categoryId = selectedCategoryObj?._id;
        const categoryName = selectedCategoryObj?.categoryName;

        if (!categoryId) {
            showStatusMessage("failed", "Category not found. Please try again.", {
                title: "Category Not Found"
            });
            return;
        }

        // ===== CONSTRUCT ITEMS ARRAY FOR PAYLOAD =====
        let payloadItems = [];

        if (distributionType === "Cash") {
            // Create a single item for cash
            const amount = parseFloat(cashAmount);
            payloadItems = [
                {
                    itemName: "Cash Assistance",
                    quantity: 1,
                    unit: "Cash",
                    amount: amount
                }
            ];
        } else {
            // Use the items array from state
            payloadItems = items.map(item => ({
                itemName: item.itemName,
                quantity: parseInt(item.quantity) || 1,
                unit: item.unit || "pc",
                amount: parseFloat(item.amount) || 0
            }));
        }

        // ===== BUILD PAYLOAD =====
        const payload = {
            categoryId,
            distributionType,
            statusSelection,
            scheduleDate: scheduleDate ? new Date(scheduleDate) : null,
            filters: {
                search: searchTerm,
                municipality: selectedMunicipality,
                barangay: selectedBarangay
            },
            items: payloadItems,
            remarks: "" // optional
        };

        // Add residentIds if not "All" selection
        if (!isSelectingAllPages && selectedResidents.length > 0) {
            payload.residentIds = selectedResidents;
        }

        // Optional: call parent function (if it accepts the updated payload)
        if (onSelectAllResidents) {
            onSelectAllResidents(payload);
        }

        // Compute total amount for display
        const totalAmount = payloadItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

        // Selection message
        let selectionMessage = isSelectingAllPages
            ? `ALL ${totalResidents} residents from all pages`
            : selectAll
              ? `ALL ${paginatedData.length} residents from current page`
              : `${selectedResidents.length} residents from current page`;

        // ===== CALL CONTEXT FUNCTION =====
        if (createAssistance) {
            try {
                setIsCreatingAssistance(true);
                const result = await createAssistance(payload);

                if (result.success) {
                    showStatusMessage("success", null, {
                        title: "Ayuda Assigned Successfully",
                        message: `${categoryName} has been assigned to ${selectionMessage}.\n` +
                                `Distribution: ${distributionType}\n` +
                                `Total Amount: ₱${totalAmount.toLocaleString()}`,
                    });
                    
                    setTimeout(() => {
                        handleStatusModalClose();
                        resetSelectionStates();
                        setShowCategoryPopup(false);
                        
                        if (onFetchData) {
                            const refreshParams = {
                                page: serverCurrentPage,
                                limit: itemsPerPage,
                                search: searchTerm?.trim() || "",
                                municipality: selectedMunicipality !== "All" ? selectedMunicipality : "",
                                barangay: selectedBarangay !== "All" ? selectedBarangay : "",
                            };
                            onFetchData(refreshParams);
                        }
                    }, 3000);
                } else {
                    showStatusMessage("failed", result.message || "Failed to assign ayuda. Please try again.", {
                        title: "Assignment Failed",
                        onRetry: handleCategoryConfirm
                    });
                }
            } catch (error) {
                console.error("Error in createAssistance:", error);
                showStatusMessage("failed", error.message || "Failed to assign ayuda. Please try again.", {
                    title: "Error",
                    onRetry: handleCategoryConfirm
                });
            } finally {
                setIsCreatingAssistance(false);
            }
        } else {
            // Simulation mode
            showStatusMessage("success", null, {
                title: "Ayuda Assignment Simulation",
                message: `${categoryName} would be assigned to ${selectionMessage}\n` +
                        `Distribution: ${distributionType}\n` +
                        `Items: ${JSON.stringify(payloadItems, null, 2)}`,
            });
            
            setTimeout(() => {
                handleStatusModalClose();
                resetSelectionStates();
                setShowCategoryPopup(false);
            }, 3000);
        }
    };

    const handleCancel = () => {
        if (isCreatingAssistance) {
            showStatusMessage("info", "Cannot cancel while assignment is in progress.", {
                title: "Operation in Progress"
            });
            return;
        }
        handleCategoryCancel();
    };

    const showStatusMessage = (status, error = null, customProps = {}) => {
        setStatusModal({
            isOpen: true,
            status,
            error,
            title: customProps.title || "",
            message: customProps.message || "",
            onRetry: customProps.onRetry || null
        });
    };

    const handleStatusModalClose = () => {
        setStatusModal(prev => ({ ...prev, isOpen: false }));
    };

    if (!showCategoryPopup) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
                <div className="category-popup w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        {/* Header */}
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                                <Gift className="text-orange-600 dark:text-orange-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {isSelectingAllPages ? "Assign Ayuda to All Residents" : "Assign Ayuda to Selected Residents"}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Status Selection:{" "}
                                    <span className={`font-bold ${statusSelection === "All" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                                        {statusSelection}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Selection Info */}
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300">
                                {isSelectingAllPages
                                    ? <>📋 <span className="font-bold">{totalResidents} residents</span> from <span className="font-bold">all pages</span> will be selected.</>
                                    : selectAll || triggeredBySelectAllCheckbox
                                        ? <>📋 <span className="font-bold">{paginatedData.length} residents</span> from <span className="font-bold">current page</span> will be selected.</>
                                        : <>📋 <span className="font-bold">{selectedResidents.length} residents</span> from current page will be selected.</>
                                }
                            </p>
                        </div>

                        {/* Category Selection */}
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select Ayuda Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={isCreatingAssistance}
                            >
                                <option value="">-- Select Category --</option>
                                {categories?.map(cat => (
                                    <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                                ))}
                            </select>
                        </div>

                        {/* Distribution Type */}
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Distribution Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={distributionType}
                                onChange={e => setDistributionType(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={isCreatingAssistance}
                            >
                                {distributionTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {distributionType === "Cash" 
                                    ? "Monetary assistance – specify amount below."
                                    : "Non-cash items – add items with quantity, unit, and optional amount."}
                            </p>
                        </div>

                        {/* ===== DYNAMIC FIELDS BASED ON DISTRIBUTION TYPE ===== */}
                        {distributionType === "Cash" ? (
                            /* ----- CASH: Simple Amount Input ----- */
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cash Amount (per resident) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <span className="text-gray-500 dark:text-gray-400">₱</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={cashAmount}
                                        onChange={e => setCashAmount(e.target.value)}
                                        onBlur={validateCashAmount}
                                        className={`w-full rounded-lg border ${cashAmountError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'} bg-white pl-10 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white`}
                                        placeholder="0.00"
                                        disabled={isCreatingAssistance}
                                    />
                                </div>
                                {cashAmountError && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{cashAmountError}</p>
                                )}
                            </div>
                        ) : (
                            /* ----- GOODS/RELIEF/MEDICAL/OTHER: Dynamic Items Table ----- */
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Items to Distribute <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                        disabled={isCreatingAssistance}
                                    >
                                        <Plus size={16} /> Add Item
                                    </button>
                                </div>

                                {/* Items Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-gray-700">
                                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Item Name</th>
                                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Qty</th>
                                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Unit</th>
                                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => (
                                                <tr key={index} className="border-b dark:border-gray-600">
                                                    <td className="px-2 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.itemName}
                                                            onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                                                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                            placeholder="e.g., Rice"
                                                            disabled={isCreatingAssistance}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                                                            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                            disabled={isCreatingAssistance}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.unit}
                                                            onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                                                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                            placeholder="kg, sack, pc"
                                                            disabled={isCreatingAssistance}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                                                            disabled={isCreatingAssistance || items.length === 1}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Enter item details. Quantity is per resident. Amount is optional (will be summed as total amount).
                                </p>
                            </div>
                        )}

                        {/* Schedule Date */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Schedule Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={scheduleDate || ""}
                                onChange={e => setScheduleDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                disabled={isCreatingAssistance}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                disabled={isCreatingAssistance}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCategoryConfirm}
                                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                                disabled={
                                    !selectedCategory ||
                                    !distributionType ||
                                    (distributionType === "Cash" && !cashAmount.trim()) ||
                                    (distributionType !== "Cash" && items.some(item => !item.itemName.trim())) ||
                                    isCreatingAssistance ||
                                    (distributionType === "Cash" && cashAmountError)
                                }
                            >
                                {isCreatingAssistance
                                    ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    : <><Check size={16} /> Assign Ayuda</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Modal */}
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={handleStatusModalClose}
                status={statusModal.status}
                error={statusModal.error}
                title={statusModal.title}
                message={statusModal.message}
                onRetry={statusModal.onRetry}
            />
        </>
    );
};

export default AyudaFormModal;