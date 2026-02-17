import { useState, useCallback, useContext, useEffect } from "react";
import { Rss, User, X, Hand, Wifi, Package, CreditCard } from "lucide-react";
import { RFIDContext } from "../../../contexts/RFIDContext/RfidContext";
import { AssistanceContext } from "../../../contexts/AssignContext/AssignContext";
import StatusModal from "../../../ReusableFolder/SuccessandField";

const LeftSide = ({
    setCurrentUser = () => {},
    setScanStatus = () => {},
    setIsProcessing = () => {},
    currentUser = null,
    isProcessing = false,
}) => {
    const { rfidData, setRfidData } = useContext(RFIDContext);
    const { getResidentByRFID, releaseEarliestAssistance } = useContext(AssistanceContext);
    const [hasScannedNew, setHasScannedNew] = useState(false);

    console.log("releaseEarliestAssistance", releaseEarliestAssistance);
    
    // State para sa StatusModal
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        status: "success",
        title: "",
        message: "",
        error: null,
        onRetry: null
    });

    const showStatusMessage = useCallback((status, error = null, customProps = {}) => {
        setStatusModal({
            isOpen: true,
            status,
            error,
            title: customProps.title || "",
            message: customProps.message || "",
            onRetry: customProps.onRetry || null
        });
    }, []);

    const handleStatusModalClose = useCallback(() => {
        setStatusModal(prev => ({ ...prev, isOpen: false }));
    }, []);

    const handleCancel = useCallback(() => {
        setHasScannedNew(false);
        setCurrentUser(null);
        setScanStatus({ type: "idle", message: "Ready for scan" });
        if (typeof setRfidData === 'function') {
            setRfidData(null);
        }
    }, [setCurrentUser, setScanStatus, setRfidData]);

    useEffect(() => {
        const fetchResident = async () => {
            if (rfidData?.uid) {
                console.log("🟢 RFID Data Received:", rfidData);

                setIsProcessing(true);
                setScanStatus({ type: "scanning", message: "Verifying RFID..." });
                try {
                    const result = await getResidentByRFID(rfidData.uid);
                    console.log("🟢 Resident fetch result:", result);

                    if (result.success && result.data) {
                        setCurrentUser(result.data);
                        setScanStatus({ type: "success", message: "Resident Verified" });
                        setHasScannedNew(true);
                    } else {
                        setScanStatus({ type: "error", message: result.error || "Resident not found" });
                        showStatusMessage("failed", result.error || "Resident not found with this RFID", {
                            title: "Verification Failed"
                        });
                        if (typeof setRfidData === 'function') setRfidData(null);
                        console.error("🔴 Verification failed:", result.error);
                    }
                } catch (error) {
                    setScanStatus({ type: "error", message: "Connection error" });
                    showStatusMessage("failed", error.message || "Connection error while verifying RFID", {
                        title: "Connection Error",
                        onRetry: fetchResident
                    });
                    if (typeof setRfidData === 'function') setRfidData(null);
                    console.error("🔴 Connection error during RFID verification:", error);
                } finally {
                    setIsProcessing(false);
                }
            }
        };
        fetchResident();
        return () => {
            setHasScannedNew(false);
            setCurrentUser(null);
            setIsProcessing(false);
            if (typeof setRfidData === 'function') setRfidData(null);
        };
    }, [rfidData, getResidentByRFID, setCurrentUser, setScanStatus, setIsProcessing, setRfidData, showStatusMessage]);

    const handleConfirmRelease = useCallback(async () => {
        if (!currentUser) {
            showStatusMessage("failed", "No resident selected for release.", {
                title: "Release Error"
            });
            return;
        }
        
        setIsProcessing(true);
        try {
            const result = await releaseEarliestAssistance(rfidData?.uid || currentUser.rfid);
            if (result?.success) {
                setScanStatus({ type: "success", message: "Cash Released Successfully!" });
                showStatusMessage("success", null, {
                    title: "Cash Released",
                    message: `Successfully released ${formatCurrency(currentUser?.totalAmount)} to ${currentUser?.name}`
                });
                
                setTimeout(() => {
                    handleStatusModalClose();
                    setTimeout(() => {
                        handleCancel();
                    }, 500);
                }, 3000);
            } else {
                setScanStatus({ type: "error", message: result?.message || "Failed to release" });
                showStatusMessage("failed", result?.message || "Failed to release cash. Please try again.", {
                    title: "Release Failed",
                    onRetry: handleConfirmRelease
                });
            }
        } catch (error) {
            setScanStatus({ type: "error", message: "A server error occurred" });
            showStatusMessage("failed", error.message || "A server error occurred while releasing cash.", {
                title: "Server Error",
                onRetry: handleConfirmRelease
            });
        } finally {
            setIsProcessing(false);
        }
    }, [currentUser, rfidData, releaseEarliestAssistance, setIsProcessing, setScanStatus, handleCancel, showStatusMessage, handleStatusModalClose]);

    const formatCurrency = (amount) => {
        const value = amount ?? 0;
        return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <>
            <div className="space-y-6 lg:col-span-4">
                <style jsx>{`
                    @keyframes tap-action {
                        0%, 100% { transform: translateY(-40px) rotate(-5deg); opacity: 0.8; }
                        50% { transform: translateY(0px) rotate(0deg); opacity: 1; }
                    }
                    @keyframes wave-pulse {
                        0% { transform: scale(1); opacity: 0.4; }
                        100% { transform: scale(1.6); opacity: 0; }
                    }
                    .animate-tap { animation: tap-action 2s ease-in-out infinite; }
                    .animate-wave { animation: wave-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
                    
                    .rfid-card-modern {
                        position: relative;
                        overflow: hidden;
                        transition: all 0.3s ease;
                    }

                    .card-light {
                        background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);
                        border: 1px solid #ffedd5;
                        box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.1);
                    }

                    .dark .card-dark {
                        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                        border: 1px solid #334155;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
                    }
                    
                    .card-mesh {
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background-image: radial-gradient(#fb923c 0.5px, transparent 0.5px);
                        background-size: 15px 15px;
                        opacity: 0.07;
                    }

                    .embossed-text-orange {
                        text-shadow: 1px 1px 0px rgba(255,255,255,0.8);
                    }
                    .dark .embossed-text-orange {
                        text-shadow: 1px 1px 0px rgba(0,0,0,0.5);
                        color: #fb923c;
                    }

                    /* Item list styles */
                    .item-row {
                        padding: 0.5rem 0;
                        border-bottom: 1px dashed rgba(251, 146, 60, 0.2);
                    }
                    .item-row:last-child {
                        border-bottom: none;
                    }
                `}</style>

                <div className="flex h-full min-h-[550px] flex-col rounded-[2.5rem] border border-orange-50 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    {/* Header Status */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${hasScannedNew ? "bg-orange-500 shadow-[0_0_8px_#f97316]" : "animate-pulse bg-slate-200 dark:bg-slate-700"}`} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                {hasScannedNew ? "Verified Resident" : "System Ready"}
                            </span>
                        </div>
                        <Wifi size={16} className={hasScannedNew ? "text-orange-500" : "text-slate-200 dark:text-slate-700"} />
                    </div>

                    {!hasScannedNew ? (
                        /* SCANNING VIEW */
                        <div className="animate-in fade-in flex flex-1 flex-col items-center justify-center duration-700">
                            <div className="relative flex flex-col items-center justify-center">
                                <div className="animate-tap z-20 mb-4">
                                    <div className="rfid-card-modern card-light dark:card-dark h-20 w-32 rounded-2xl p-3">
                                        <div className="h-4 w-6 rounded-sm bg-orange-200/50 dark:bg-orange-500/20 shadow-inner" />
                                        <div className="mt-6 flex justify-end">
                                            <Rss size={18} className="-rotate-45 text-orange-200 dark:text-orange-900/40" />
                                        </div>
                                    </div>
                                </div>
                                <div className="relative mt-4 flex h-32 w-32 items-center justify-center">
                                    <div className="animate-wave absolute h-24 w-24 rounded-full bg-orange-100 dark:bg-orange-500/10" />
                                    <div className="relative z-10 rounded-full bg-slate-50 p-7 dark:bg-slate-800">
                                        <Hand size={54} className="text-orange-400 opacity-60 dark:text-orange-500/40" />
                                    </div>
                                </div>
                                <div className="mt-10 text-center">
                                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white">RFID Scanner</h3>
                                    <p className="mt-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">Place resident card near the sensor</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* RESIDENT INFO VIEW */
                        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                            {/* Profile Info */}
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase text-slate-800 dark:text-white tracking-tight leading-none">{currentUser?.name}</h2>
                                    <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-1.5 opacity-80">Authenticated Profile</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* --- RFID CARD WITH TOTAL AMOUNT - HIDDEN WHEN totalAmount <= 0 --- */}
                                {(currentUser?.totalAmount ?? 0) > 0 && (
                                    <div className="rfid-card-modern card-light dark:card-dark rounded-[28px] p-7 transition-all duration-500">
                                        <div className="card-mesh" />
                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between">
                                                {/* Golden Chip */}
                                                <div className="h-10 w-14 rounded-lg bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 p-2 shadow-inner">
                                                    <div className="grid h-full grid-cols-2 gap-1 opacity-20">
                                                        <div className="border-r border-black/40" />
                                                        <div className="border-l border-black/40" />
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Wifi size={20} className="rotate-90 text-orange-200 dark:text-slate-600 ml-auto" />
                                                    <p className="text-[7px] font-black uppercase tracking-tighter text-slate-300 dark:text-slate-600 mt-1">Contactless</p>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-8">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300 dark:text-slate-500">
                                                    Total Amount
                                                </p>
                                                <p className="embossed-text-orange mt-1 font-mono text-4xl font-black tracking-tight text-orange-600 dark:text-orange-500">
                                                    {formatCurrency(currentUser?.totalAmount)}
                                                </p>
                                            </div>

                                            <div className="mt-10 flex items-end justify-between border-t border-orange-50 dark:border-slate-800 pt-5">
                                                <div>
                                                    <p className="text-[8px] font-bold uppercase text-slate-300 dark:text-slate-600 mb-0.5 tracking-widest">Card Holder</p>
                                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">{currentUser?.name}</p>
                                                </div>
                                                <div className="rounded-xl bg-orange-600 px-4 py-2 text-white shadow-lg shadow-orange-200 dark:shadow-none">
                                                    <p className="text-[10px] font-black italic tracking-widest uppercase">{currentUser?.categoryName || "RESIDENT"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-orange-500/5 blur-3xl" />
                                    </div>
                                )}

                                {/* Additional Details - Status & Age */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/50 border border-transparent dark:border-slate-800">
                                        <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500">Status</p>
                                        <p className="mt-1 text-sm font-black text-slate-700 dark:text-slate-300">ELIGIBLE</p>
                                    </div>
                                    <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/50 border border-transparent dark:border-slate-800">
                                        <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500">Current Age</p>
                                        <p className="mt-1 text-sm font-black text-slate-700 dark:text-slate-300">{currentUser?.age ?? 0} Years</p>
                                    </div>
                                </div>

                                {/* --- ITEMS SECTION --- */}
                                {currentUser?.items?.length > 0 && (
                                    <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/50 border border-transparent dark:border-slate-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Package size={18} className="text-orange-500" />
                                            <p className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                                                Assistance Items ({currentUser.items.length})
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            {currentUser.items.map((item, idx) => (
                                                <div key={idx} className="item-row text-xs">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                                        {item.itemName}
                                                        <span className="ml-1 text-[10px] text-slate-500 dark:text-slate-400">
                                                            ({item.quantity} {item.unit})
                                                        </span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Section */}
                            <div className="mt-10 flex flex-col gap-4">
                                <button
                                    onClick={handleConfirmRelease}
                                    disabled={
                                        isProcessing ||
                                        ((currentUser?.totalAmount ?? 0) <= 0 &&
                                        (!currentUser?.items || currentUser.items.length === 0))
                                    }
                                    className="group w-full overflow-hidden rounded-[1.5rem] bg-orange-600 py-5 text-xs font-black tracking-widest text-white shadow-xl shadow-orange-100 dark:shadow-none transition-all hover:bg-orange-700 active:scale-95 disabled:opacity-30 disabled:grayscale"
                                >
                                    {isProcessing ? "PROCESSING..." : "CONFIRM RELEASE"}
                                </button>
                                
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center justify-center gap-2 rounded-[1.5rem] border border-orange-100 dark:border-slate-800 py-4 text-[10px] font-black uppercase tracking-widest text-orange-400 dark:text-slate-500 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    <X size={16} /> Cancel Session
                                </button>
                            </div>
                        </div>
                    )}
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

export default LeftSide;