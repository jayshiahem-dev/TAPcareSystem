import React, { useContext, useEffect, useState } from "react";
import { Radio, CheckCircle2, AlertCircle, X } from "lucide-react";
import { RFIDContext } from "../../../contexts/RFIDContext/RfidContext";

const RFIDModal = ({
  show,
  onClose,
  resident,
  modalType,
  rfidNumber,
  setRfidNumber,
  onSave,
  onChangeType,
  residentsList = [], 
}) => {
  const { rfidData, clearRFID } = useContext(RFIDContext); // <- get clearRFID function
  const [localRfidNumber, setLocalRfidNumber] = useState("");

  // Sync local state with prop
  useEffect(() => {
    setLocalRfidNumber(rfidNumber);
  }, [rfidNumber]);

  // Clear data when modal closes
  useEffect(() => {
    if (!show) {
      setLocalRfidNumber("");
      setRfidNumber(""); // Clear parent state
      clearRFID(); // Clear context state
    }
  }, [show, setRfidNumber, clearRFID]);

  // Handle input change locally
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalRfidNumber(value);
    setRfidNumber(value); // Update parent state
  };

  // Auto-fill RFID input whenever a new UID is scanned
  useEffect(() => {
    if (!rfidData?.uid) return;

    const newUID = rfidData.uid;

    // Avoid duplicates: check if any other resident already has this UID
    const isDuplicate = residentsList.some(
      (r) => r.rfid === newUID && r._id !== resident._id
    );

    if (!isDuplicate) {
      setLocalRfidNumber(newUID);
      setRfidNumber(newUID);
    }
  }, [rfidData, residentsList, resident, setRfidNumber]);

  // Handle close with cleanup
  const handleClose = () => {
    setLocalRfidNumber("");
    setRfidNumber("");
    clearRFID(); // clear context when modal closes
    onClose();
  };

  // Handle change type with cleanup
  const handleChangeType = () => {
    setLocalRfidNumber("");
    setRfidNumber("");
    clearRFID(); // clear context when changing type
    onChangeType();
  };

  if (!show || !resident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl transition-colors duration-300 dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <Radio size={24} className="text-purple-600 dark:text-purple-400" />
              {modalType === "assign" ? "Assign RFID" : "RFID Information"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {modalType === "assign"
                ? `Assign RFID to ${resident.name}`
                : `${resident.name} already has an RFID`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {modalType === "assign" ? (
            <>
              {/* Resident Info */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/30">
                <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Resident Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{resident.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Age:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{resident.age}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Barangay:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{resident.barangay}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Municipality:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{resident.municipality}</p>
                  </div>
                </div>
              </div>

              {/* RFID Input */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  RFID Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localRfidNumber}
                  onChange={handleInputChange}
                  placeholder="Enter RFID number (e.g., F90944B8)"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Ensure RFID number is correct before saving.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
                >
                  <Radio size={16} className="mr-2 inline" />
                  Assign RFID
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Already assigned */}
              <div className="mb-6 text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Radio size={32} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">{resident.rfid}</h4>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Assigned to <span className="font-semibold text-gray-900 dark:text-white">{resident.name}</span>
                </p>

                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600 dark:text-green-400" size={20} />
                    <div>
                      <h5 className="text-sm font-semibold text-green-800 dark:text-green-300">Valid RFID</h5>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        This RFID is active and assigned to the resident.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={handleChangeType}
                  className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600"
                >
                  Change RFID
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-800/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400" size={16} />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {modalType === "assign"
                ? "RFID is used for automated identification and tracking of residents."
                : "RFID is used for quick and secure resident identification."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFIDModal;
