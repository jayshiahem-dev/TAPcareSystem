import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Nag-import ng Pencil icon para sa Edit
import { Plus, ShoppingBasket, ArrowLeft, FolderOpen, Pencil } from "lucide-react";
import ImportMasterList from "../ImportMasterList/ImportMasterList";
import AyudaFormModal from "../ImportMasterList/Modal/AyudaFormModal";
import { AssistanceContext } from "../../contexts/AssignContext/AssignContext";
import { AyudaContext } from "../../contexts/AyudaContext/AyudaContext";
import AssistanceBenificiary from "./AsistanceBenificiary";
import StatusModal from "../../ReusableFolder/SuccessandField";

// --- Updated Folder UI Component ---
const FolderUI = ({ color = "#f97316", date, onEdit }) => {
    const formatDate = (dateValue, options) => {
        try {
            const d = new Date(dateValue);
            return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-US", options);
        } catch (e) {
            return "N/A";
        }
    };

    return (
        <div className="relative h-32 w-40 transition-transform duration-500 group-hover:-translate-y-4">
            {/* Folder Tab/Back */}
            <div
                className="absolute inset-0 rounded-xl shadow-md"
                style={{ backgroundColor: color, opacity: 0.9, clipPath: "polygon(0% 15%, 35% 15%, 45% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
            />

            {/* Paper inside folder */}
            <div className="absolute left-4 right-4 top-4 flex h-24 transform flex-col items-center justify-center rounded-md border-t-4 border-orange-500 bg-white p-3 shadow-xl transition-all duration-700 ease-in-out group-hover:-translate-y-16 group-hover:rotate-3">
                <p className="text-[8px] font-bold uppercase leading-none text-slate-400">Scheduled On</p>
                <p className="text-[12px] font-black text-slate-800">{formatDate(date, { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>

            {/* Label in the middle */}
            <div className="absolute bottom-[15%] left-[8%] right-[8%] top-[12%] flex -rotate-2 transform items-center justify-center rounded-md border border-slate-200/50 bg-slate-100 shadow-inner">
                <span className="text-[14px] font-black uppercase tracking-widest text-slate-300">{formatDate(date, { month: "short" })}</span>
            </div>

            {/* Folder Front */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[72%] rounded-xl border-t border-white/30 shadow-lg"
                style={{ backgroundColor: color }}
            />

            {/* --- EDIT ICON BUTTON (Lalabas lang sa Hover) --- */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Pinipigilan nito ang pag-trigger ng onClick ng parent folder
                    onEdit();
                }}
                className="absolute -right-2 -top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white opacity-0 shadow-xl transition-all duration-300 hover:scale-110 group-hover:opacity-100"
            >
                <Pencil size={14} />
            </button>
        </div>
    );
};

const AyudaAssign = () => {
    // ... (keep existing context and states)
    const { LatestAssistances } = useContext(AssistanceContext);
    const createdStatus = LatestAssistances?.statusCreated;
    const { GroupProgram, deleteAyuda } = useContext(AyudaContext);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedAssistance, setSelectedAssistance] = useState({ assistanceId: "", scheduleDate: "", name: "" });
    const [folders, setFolders] = useState([]);
    const [isOverArchive, setIsOverArchive] = useState(false);
    const [isCreatingAssistance, setIsCreatingAssistance] = useState(false);
    const [statusModalProps, setStatusModalProps] = useState({
        status: "success",
        error: null,
        title: "",
        message: "",
        onRetry: null,
    });

    const archiveRef = useRef(null);
    const archiveRectRef = useRef(null);

    const showStatusMessage = useCallback((status, error = null, customProps = {}) => {
        setStatusModalProps({
            status,
            error,
            title: customProps.title || "",
            message: customProps.message || "",
            onRetry: customProps.onRetry || null,
        });
        setShowStatusModal(true);
    }, []);

    useEffect(() => {
        if (GroupProgram && Array.isArray(GroupProgram)) {
            const mappedFolders = GroupProgram.map((item) => ({
                id: item.assistanceId,
                name: item.assistanceName,
                date: item.scheduleDate || item.date_released || item.createdAt,
                category: item.categoryName,
                color: "#f97316",
            }));
            setFolders(mappedFolders);
        }
    }, [GroupProgram]);

    const handleDragStart = () => {
        if (archiveRef.current) {
            archiveRectRef.current = archiveRef.current.getBoundingClientRect();
        }
    };

    const handleDragEnd = async (event, info, folderId) => {
        const rect = archiveRectRef.current;
        setIsOverArchive(false);

        if (rect) {
            const isInside = info.point.x >= rect.left && info.point.x <= rect.right && info.point.y >= rect.top && info.point.y <= rect.bottom;

            if (isInside) {
                const draggedFolder = folders.find((f) => f.id === folderId);
                if (draggedFolder) {
                    const result = await deleteAyuda(draggedFolder.id);
                    if (result?.success) {
                        setFolders((prev) => prev.filter((f) => f.id !== folderId));
                        showStatusMessage("success", null, {
                            title: "Program Archived",
                            message: `"${draggedFolder.name}" has been successfully archived.`,
                        });
                    }
                }
            }
        }
    };

    // Placeholder function para sa edit
    const handleEditFolder = (folder) => {
        console.log("Editing folder:", folder.name);
        // Dito mo ilalagay ang logic para buksan ang edit modal
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-slate-50/50 p-4 font-sans md:p-8">
            {!createdStatus || createdStatus !== "NotAccomplish" ? (
                <div className="mx-auto max-w-7xl">
                    <AnimatePresence mode="wait">
                        {!selectedAssistance.assistanceId ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Header Section */}
                                <div className="mb-16 flex items-center justify-between rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm">
                                    <div className="flex items-center gap-6">
                                        <div className="rounded-2xl bg-orange-600 p-4 text-white shadow-lg">
                                            <Plus
                                                size={28}
                                                strokeWidth={3}
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Programs</h2>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-orange-600">
                                                Drag a folder to archive
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCategoryPopup(true)}
                                        className="rounded-full bg-orange-600 px-10 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-900 hover:shadow-xl active:scale-95"
                                    >
                                        Create Program
                                    </button>
                                </div>

                                {/* Folders Grid */}
                                <div className="grid grid-cols-1 place-items-center gap-x-8 gap-y-24 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {folders.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            drag
                                            dragSnapToOrigin
                                            onDragStart={handleDragStart}
                                            onDrag={(e, info) => {
                                                const rect = archiveRectRef.current;
                                                if (rect) {
                                                    const isInside =
                                                        info.point.x >= rect.left &&
                                                        info.point.x <= rect.right &&
                                                        info.point.y >= rect.top &&
                                                        info.point.y <= rect.bottom;
                                                    if (isInside !== isOverArchive) setIsOverArchive(isInside);
                                                }
                                            }}
                                            onDragEnd={(e, info) => handleDragEnd(e, info, item.id)}
                                            whileDrag={{ scale: 1.05, zIndex: 100 }}
                                            onClick={() =>
                                                setSelectedAssistance({
                                                    assistanceId: item.id,
                                                    scheduleDate: item.date,
                                                    name: item.name,
                                                    beneficiaryLimit: item.beneficiaryLimit,
                                                })
                                            }
                                            className="group relative flex cursor-grab flex-col items-center justify-center active:cursor-grabbing"
                                        >
                                            <FolderUI
                                                color={item.color}
                                                date={item.date}
                                                onEdit={() => handleEditFolder(item)}
                                            />
                                            <div className="pointer-events-none mt-6 text-center">
                                                <h4 className="text-[15px] font-black uppercase tracking-tight text-slate-800 transition-colors duration-200 group-hover:text-orange-600">
                                                    {item.name}
                                                </h4>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.category}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            // ... (Rest of the component remains the same)
                            <motion.div
                                key="table"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="mb-6 flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedAssistance({ assistanceId: "", scheduleDate: "", name: "" })}
                                        className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-3 font-bold text-slate-600 shadow-sm transition-all hover:text-orange-600"
                                    >
                                        <ArrowLeft size={20} /> Back to Programs
                                    </button>
                                    <div className="h-10 w-[2px] bg-slate-200" />
                                    <div className="flex items-center gap-2 text-slate-800">
                                        <FolderOpen
                                            className="text-orange-500"
                                            size={24}
                                        />
                                        <span className="text-xl font-black uppercase tracking-tight">{selectedAssistance.name}</span>
                                    </div>
                                </div>
                                <div className="rounded-[2rem] border border-slate-100 bg-white p-2 shadow-2xl">
                                    <AssistanceBenificiary
                                        assistance={selectedAssistance}
                                        scheduleDate={selectedAssistance.scheduleDate}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Archive Zone, Modal, etc (Keep existing code) */}
                    {!selectedAssistance.assistanceId && (
                        <div
                            ref={archiveRef}
                            className={`fixed bottom-10 right-10 z-50 transform transition-transform duration-300 ${isOverArchive ? "scale-110" : "scale-100"}`}
                        >
                            <div
                                className={`flex flex-col items-center gap-2 rounded-[3rem] border-4 p-8 shadow-2xl transition-colors duration-300 ${isOverArchive ? "border-orange-200 bg-orange-600 text-white" : "border-white bg-white text-slate-400"}`}
                            >
                                <ShoppingBasket
                                    size={40}
                                    className={isOverArchive ? "animate-bounce" : ""}
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {isOverArchive ? "Release to Archive" : "Archive"}
                                </span>
                            </div>
                        </div>
                    )}

                    <AyudaFormModal
                        showCategoryPopup={showCategoryPopup}
                        setShowCategoryPopup={setShowCategoryPopup}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        isCreatingAssistance={isCreatingAssistance}
                        setIsCreatingAssistance={setIsCreatingAssistance}
                        handleCategoryCancel={() => setShowCategoryPopup(false)}
                    />

                    <StatusModal
                        isOpen={showStatusModal}
                        onClose={() => setShowStatusModal(false)}
                        status={statusModalProps.status}
                        error={statusModalProps.error}
                        title={statusModalProps.title}
                        message={statusModalProps.message}
                        onRetry={statusModalProps.onRetry}
                    />
                </div>
            ) : (
                <section className="animate-in fade-in duration-700">
                    <ImportMasterList LatestAssistances={LatestAssistances} />
                </section>
            )}
        </div>
    );
};

export default AyudaAssign;
