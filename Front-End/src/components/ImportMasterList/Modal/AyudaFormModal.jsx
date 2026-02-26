import React, { useState, useContext, useEffect, useRef } from "react";
import { Gift, Check, Plus, Trash2, FileText, Users, X } from "lucide-react";
import { AssistanceContext } from "../../../contexts/AssignContext/AssignContext";
import StatusModal from "../../../ReusableFolder/SuccessandField";
import { CategoryContext } from "../../../contexts/CategoryContext/categoryContext";

const AyudaFormModal = ({
    showCategoryPopup,
    setShowCategoryPopup,
    selectedCategory,
    setSelectedCategory,
    isSelectingAllPages,
    selectAll,
    selectedResidents = [],
    paginatedData = [],
    totalResidents,
    statusSelection,
    selectedMunicipality,
    selectedBarangay,
    searchTerm,
    onFetchData,
    resetSelectionStates,
    handleCategoryCancel,
    isCreatingAssistance,
    setIsCreatingAssistance,
}) => {
    const { categories } = useContext(CategoryContext);
    const { createAssistance } = useContext(AssistanceContext);
    const modalRef = useRef();

    // ===== LOCAL STATES =====
    const [scheduleDate, setScheduleDate] = useState("");
    const [assistanceName, setAssistanceName] = useState("");
    const [assistanceNameError, setAssistanceNameError] = useState("");
    const [beneficiaryLimit, setBeneficiaryLimit] = useState("");
    const [limitError, setLimitError] = useState("");
    const [distributionType, setDistributionType] = useState("Cash");
    const [cashAmount, setCashAmount] = useState("");
    const [cashAmountError, setCashAmountError] = useState("");
    const [items, setItems] = useState([{ itemName: "", quantity: 1, unit: "pc", amount: 0 }]);

    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        status: "success",
        title: "",
        message: "",
        error: null,
    });

    // Reset logic when distribution type changes
    useEffect(() => {
        if (distributionType === "Cash") {
            setItems([{ itemName: "", quantity: 1, unit: "pc", amount: 0 }]);
        } else {
            setCashAmount("");
            setCashAmountError("");
        }
    }, [distributionType]);

    const handleCloseModal = () => {
        if (isCreatingAssistance) return;
        setAssistanceName("");
        setAssistanceNameError("");
        setBeneficiaryLimit("");
        setLimitError("");
        setCashAmount("");
        setCashAmountError("");
        setScheduleDate("");
        setItems([{ itemName: "", quantity: 1, unit: "pc", amount: 0 }]);
        handleCategoryCancel();
    };

    const handleCategoryConfirm = async () => {
        if (!assistanceName.trim()) {
            setAssistanceNameError("Please enter assistance name");
            return;
        }

        if (distributionType === "Cash" && !cashAmount) {
            setCashAmountError("Please enter amount");
            return;
        }

        if (typeof setIsCreatingAssistance === "function") setIsCreatingAssistance(true);

        const selectedCategoryObj = categories?.find((cat) => cat.categoryName === selectedCategory);
        
        // Prepare Payload
        let payloadItems = distributionType === "Cash" 
            ? [{ itemName: "Cash Assistance", quantity: 1, unit: "Cash", amount: parseFloat(cashAmount) }]
            : items;

        const payload = {
            assistanceName: assistanceName.trim(),
            categoryId: selectedCategoryObj?._id,
            distributionType,
            statusSelection,
            beneficiaryLimit: beneficiaryLimit ? parseInt(beneficiaryLimit) : null,
            scheduleDate: scheduleDate ? new Date(scheduleDate) : null,
            filters: { search: searchTerm, municipality: selectedMunicipality, barangay: selectedBarangay },
            items: payloadItems,
        };

        if (!isSelectingAllPages && selectedResidents?.length > 0) {
            payload.residentIds = selectedResidents;
        }

        try {
            const result = await createAssistance(payload);
            if (result.success) {
                setStatusModal({
                    isOpen: true,
                    status: "success",
                    title: "Success",
                    message: `${assistanceName} has been assigned.`
                });
                setTimeout(() => {
                    setStatusModal(prev => ({ ...prev, isOpen: false }));
                    resetSelectionStates?.();
                    setShowCategoryPopup(false);
                    handleCloseModal();
                    onFetchData?.();
                }, 2000);
            }
        } catch (error) {
            setStatusModal({ isOpen: true, status: "failed", title: "Error", message: error.message });
        } finally {
            if (typeof setIsCreatingAssistance === "function") setIsCreatingAssistance(false);
        }
    };

    if (!showCategoryPopup) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div ref={modalRef} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-white shadow-2xl dark:bg-gray-800">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-orange-100 p-2"><Gift className="text-orange-600" size={24} /></div>
                            <h3 className="text-xl font-bold dark:text-white">Assign Ayuda</h3>
                        </div>
                        <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X /></button>
                    </div>

                    <div className="p-6">
                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Assistance Program Name *</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                <textarea
                                    value={assistanceName}
                                    onChange={(e) => {setAssistanceName(e.target.value); setAssistanceNameError("");}}
                                    rows={2}
                                    className={`w-full rounded-xl border bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:ring-2 ${assistanceNameError ? "border-red-500 ring-red-100" : "border-gray-300 focus:border-orange-500 focus:ring-orange-100"} dark:bg-gray-900`}
                                    placeholder="e.g., Senior Citizen Financial Aid"
                                    disabled={isCreatingAssistance}
                                />
                            </div>
                            {assistanceNameError && <p className="mt-1 text-xs text-red-500">{assistanceNameError}</p>}
                        </div>

                        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold">Category *</label>
                                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm dark:bg-gray-900 outline-none focus:border-orange-500">
                                    <option value="">-- Select --</option>
                                    {categories?.map((cat) => <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold">Distribution Type *</label>
                                <select 
                                    value={distributionType} 
                                    onChange={(e) => setDistributionType(e.target.value)} 
                                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm dark:bg-gray-900 outline-none focus:border-orange-500"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Goods">Goods</option>
                                    <option value="Relief">Relief</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {distributionType === "Cash" ? (
                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-semibold">Cash Amount (₱) *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-gray-500">₱</span>
                                    <input 
                                        type="number" 
                                        value={cashAmount} 
                                        onChange={(e) => {setCashAmount(e.target.value); setCashAmountError("");}} 
                                        className={`w-full rounded-xl border bg-gray-50 py-2.5 pl-8 text-sm dark:bg-gray-900 outline-none focus:ring-2 ${cashAmountError ? "border-red-500 ring-red-100" : "border-gray-300 focus:border-orange-500 focus:ring-orange-100"}`} 
                                        placeholder="0.00" 
                                        disabled={isCreatingAssistance} 
                                    />
                                </div>
                                {cashAmountError && <p className="mt-1 text-xs text-red-500">{cashAmountError}</p>}
                            </div>
                        ) : (
                            <div className="mb-5 rounded-xl border border-gray-200 p-4 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-semibold">Distribution Items</label>
                                    <button 
                                        type="button"
                                        onClick={() => setItems([...items, { itemName: "", quantity: 1, unit: "pc", amount: 0 }])} 
                                        className="flex items-center gap-1 text-xs text-orange-600 font-bold hover:text-orange-700"
                                    >
                                        <Plus size={14} /> Add Item
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <input 
                                                placeholder="Item Name (e.g. Rice)" 
                                                className="flex-1 p-2 border rounded-lg text-xs dark:bg-gray-900 outline-none focus:border-orange-500" 
                                                value={item.itemName} 
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[index].itemName = e.target.value;
                                                    setItems(newItems);
                                                }} 
                                            />
                                            <input 
                                                type="number" 
                                                placeholder="Qty"
                                                className="w-20 p-2 border rounded-lg text-xs dark:bg-gray-900 outline-none focus:border-orange-500" 
                                                value={item.quantity} 
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[index].quantity = e.target.value;
                                                    setItems(newItems);
                                                }} 
                                            />
                                            {items.length > 1 && (
                                                <button onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                    <Trash2 size={16}/>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold">Schedule Date</label>
                                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm dark:bg-gray-900 outline-none focus:border-orange-500" disabled={isCreatingAssistance} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold">Beneficiary Limit</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 text-gray-400" size={16} />
                                    <input type="number" value={beneficiaryLimit} onChange={(e) => setBeneficiaryLimit(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-10 text-sm dark:bg-gray-900 outline-none focus:border-orange-500" placeholder="No Limit" disabled={isCreatingAssistance} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-6">
                            <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800">Cancel</button>
                            <button 
                                type="button"
                                onClick={handleCategoryConfirm} 
                                disabled={isCreatingAssistance} 
                                className="flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
                            >
                                {isCreatingAssistance ? "Processing..." : <><Check size={18} /> Confirm Assignment</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <StatusModal {...statusModal} onClose={() => setStatusModal(p => ({ ...p, isOpen: false }))} />
        </>
    );
};

export default AyudaFormModal;