import React, { useState } from "react";
// Pinalitan ang Tag ng FileText para sa mas magandang "document/form" feel
import { Gift, Check, Plus, Trash2, FileText, Users } from "lucide-react";
import StatusModal from "../../../ReusableFolder/SuccessandField";

const AyudaFormModal = () => {
    // ===== DUMMY CATEGORY DATA =====
    const dummyCategories = [
        { _id: "1", categoryName: "Financial Assistance" },
        { _id: "2", categoryName: "Food Assistance" },
        { _id: "3", categoryName: "Medical Assistance" },
        { _id: "4", categoryName: "Educational Support" },
    ];

    // ===== LOCAL STATES =====
    const [showCategoryPopup, setShowCategoryPopup] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [scheduleDate, setScheduleDate] = useState(null);

    const [assistanceName, setAssistanceName] = useState("");
    const [assistanceNameError, setAssistanceNameError] = useState("");

    const [beneficiaryLimit, setBeneficiaryLimit] = useState("");
    const [limitError, setLimitError] = useState("");

    const [distributionType, setDistributionType] = useState("Cash"); 
    const distributionTypes = ["Cash", "Goods", "Relief", "Medical", "Other"];

    const [cashAmount, setCashAmount] = useState("");
    const [cashAmountError, setCashAmountError] = useState("");

    const [items, setItems] = useState([{ itemName: "", quantity: 1, unit: "pc", amount: 0 }]);

    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        status: "success",
        title: "",
        message: "",
        error: null,
        onRetry: null
    });

    // ===== VALIDATIONS =====
    const validateAssistanceName = () => {
        if (!assistanceName.trim()) {
            setAssistanceNameError("Please enter assistance name");
            return false;
        }
        setAssistanceNameError("");
        return true;
    };

    const validateLimit = () => {
        if (!beneficiaryLimit) return true;
        if (parseInt(beneficiaryLimit) <= 0) {
            setLimitError("Limit must be greater than 0");
            return false;
        }
        setLimitError("");
        return true;
    };

    const validateCashAmount = () => {
        if (distributionType !== "Cash") return true;
        if (!cashAmount.trim()) {
            setCashAmountError("Please enter an amount");
            return false;
        }
        const amount = parseFloat(cashAmount);
        if (isNaN(amount) || amount <= 0) {
            setCashAmountError("Amount must be a valid number greater than 0");
            return false;
        }
        setCashAmountError("");
        return true;
    };

    const validateItems = () => {
        if (distributionType === "Cash") return true;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.itemName.trim()) return false;
            if (!item.quantity || item.quantity <= 0) return false;
            if (!item.unit.trim()) return false;
        }
        return true;
    };

    // ===== ITEM HANDLERS =====
    const handleAddItem = () => setItems([...items, { itemName: "", quantity: 1, unit: "pc", amount: 0 }]);
    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    // ===== SUBMIT HANDLER =====
    const handleCategoryConfirm = () => {
        if (!validateAssistanceName() || !validateLimit()) return;
        if (!selectedCategory) {
            showStatusMessage("failed", null, { title: "Category Required", message: "Please select a category." });
            return;
        }
        if (distributionType === "Cash" && !validateCashAmount()) return;
        if (distributionType !== "Cash" && !validateItems()) return;

        showStatusMessage("success", null, { title: "Success", message: `Assigned ${assistanceName} in ${selectedCategory}` });
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

    const handleCancel = () => setShowCategoryPopup(false);

    if (!showCategoryPopup) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
                <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-2xl max-h-[90vh] overflow-y-auto p-6">
                    {/* Header */}
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-orange-100 p-2">
                            <Gift className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Assign Ayuda</h3>
                        </div>
                    </div>

                    {/* Assistance Name */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Assistance Program Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <FileText className="text-gray-400" size={16} />
                            </div>
                            <textarea
                                value={assistanceName}
                                onChange={e => setAssistanceName(e.target.value)}
                                onBlur={validateAssistanceName}
                                rows={3}
                                className={`w-full rounded-lg border ${assistanceNameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'} bg-white pl-10 pr-3 py-2 text-gray-900 resize-none`}
                                placeholder="e.g., Financial Assistance for Senior Citizens"
                            />
                        </div>
                        {assistanceNameError && <p className="mt-1 text-xs text-red-600">{assistanceNameError}</p>}
                    </div>

                    {/* Category Selection */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Select Ayuda Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">-- Select Category --</option>
                            {dummyCategories.map(cat => (
                                <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Distribution Type */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Distribution Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={distributionType}
                            onChange={e => setDistributionType(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {distributionTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dynamic Fields */}
                    {distributionType === "Cash" && (
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Cash Amount (per resident) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span className="text-gray-500">₱</span>
                                </div>
                                <input
                                    type="text"
                                    value={cashAmount}
                                    onChange={e => setCashAmount(e.target.value)}
                                    onBlur={validateCashAmount}
                                    className={`w-full rounded-lg border ${cashAmountError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'} bg-white pl-10 pr-3 py-2 text-gray-900`}
                                    placeholder="0.00"
                                />
                            </div>
                            {cashAmountError && <p className="mt-1 text-sm text-red-600">{cashAmountError}</p>}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCategoryConfirm}
                            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                            disabled={!assistanceName || !selectedCategory || !distributionType || (distributionType === "Cash" && !cashAmount)}
                        >
                            <Check size={16} /> Assign Ayuda
                        </button>
                    </div>
                </div>
            </div>

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