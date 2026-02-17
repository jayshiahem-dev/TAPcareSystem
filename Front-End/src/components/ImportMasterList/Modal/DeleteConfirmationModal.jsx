import React from "react";
import { Trash2 } from "lucide-react";

const DeleteConfirmationModal = ({ deleteConfirm, onCancelDelete, onConfirmDelete, theme = "light" }) => {
    if (!deleteConfirm) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                <div className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                            <Trash2
                                className="text-red-600 dark:text-red-400"
                                size={24}
                            />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Resident</h3>
                    </div>

                    <p className="mb-6 text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{deleteConfirm.name}</span>?
                        This action cannot be undone.
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onCancelDelete}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirmDelete}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
