import React, { useState, useEffect, useContext } from "react";
import { Plus, X, Save, Radio, Edit } from "lucide-react";
import { RFIDContext } from "../../contexts/RFIDContext/RfidContext";

const AddRFIDForm = ({ isOpen, onClose, onSubmit, mode = "add", initialData = null }) => {
    const { rfidData } = useContext(RFIDContext);
    
    const [formData, setFormData] = useState({
        rfidNumber: "",
        status: "Active",
        notes: "",
    });

    // Initialize at Real-time Update mula sa Context
    useEffect(() => {
        if (mode === "edit" && initialData) {
            setFormData({
                rfidNumber: initialData.rfidNumber || "",
                status: initialData.status || "Active",
                notes: initialData.notes || "",
            });
        } else if (mode === "add") {
            setFormData({
                rfidNumber: rfidData?.uid || "",
                status: "Active",
                notes: "",
            });
        }
    }, [mode, initialData, rfidData?.uid]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.rfidNumber.trim()) {
            alert("Please scan an RFID tag or enter the number manually.");
            return;
        }
        onSubmit(formData);
    };

    const formStatusOptions = ["Active", "Inactive", "Pending", "Blocked"];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
                {/* Modal Header */}
                <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            {mode === "add" ? <Plus size={20} /> : <Edit size={20} />}
                            {mode === "add" ? (rfidData?.uid ? "RFID Detected" : "Register RFID") : "Edit RFID"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {mode === "add" && rfidData?.uid
                            ? `Scanner UID: ${rfidData.uid}`
                            : mode === "add"
                              ? "Please scan your RFID tag now..."
                              : `Editing RFID ${initialData?.rfidNumber || ""}`}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-6">
                        {/* RFID Number Field */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span className="flex items-center gap-1">
                                    <Radio size={14} />
                                    RFID Number / UID *
                                </span>
                            </label>
                            <input
                                type="text"
                                name="rfidNumber"
                                value={formData.rfidNumber}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white ${
                                    rfidData?.uid && formData.rfidNumber === rfidData.uid
                                        ? "border-green-500 bg-green-50 ring-2 ring-green-500 dark:border-green-500 dark:bg-green-900/20"
                                        : "border-gray-300 bg-white focus:ring-orange-500 dark:border-gray-600"
                                }`}
                                placeholder="Waiting for scan..."
                                required
                            />
                            {rfidData?.uid && mode === "add" && (
                                <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                    ✓ Live UID captured from context
                                </p>
                            )}
                        </div>

                        {/* Status Selection */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                required
                            >
                                {formStatusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notes Area */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                placeholder="Additional details..."
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="border-t border-gray-200 p-6 dark:border-gray-700">
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 shadow-md"
                            >
                                <Save size={16} />
                                {mode === "add" ? "Save RFID" : "Update RFID"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRFIDForm;