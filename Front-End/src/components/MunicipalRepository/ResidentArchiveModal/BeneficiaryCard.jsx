import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    MoreVertical, 
    PlusCircle, 
    Eye, 
    Camera, 
    UserRound // Pinalitan ang User ng UserRound base sa iyong snippet
} from "lucide-react";

const BeneficiaryCard = ({ member, onAddAssistance, onViewInfo, onUpdatePhoto }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Dito kukunin ang image kung meron sa member object
    const imagePreview = member?.profileImage || null;

    useEffect(() => {
        const handler = (e) => { 
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); 
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleCameraClick = (e) => {
        e.stopPropagation(); // Iwasan ang pag-trigger ng ibang clicks
        onUpdatePhoto?.(member); // Callback function para sa upload logic
    };

    return (
        <div className="group relative rounded-xl border border-slate-200 bg-white p-4 pt-8 hover:border-orange-300 transition-all shadow-sm">
            {/* Menu Button */}
            <div className="absolute right-2 top-2 z-10" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="h-7 w-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                    <MoreVertical size={14} />
                </button>
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 z-[60] mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
                            <button onClick={() => { onAddAssistance?.(member); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-[11px] text-slate-700 hover:bg-orange-50">
                                <PlusCircle size={13} /> Add Assistance
                            </button>
                            <button onClick={() => { onViewInfo?.(member); setMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50">
                                <Eye size={13} /> View Profile
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
                {/* Avatar Container - Custom Style */}
                <div className="relative h-24 w-24 rounded-full border-4 border-white bg-[#F0F2F5] shadow-md flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                        <img 
                            src={imagePreview} 
                            alt="Profile Preview" 
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <UserRound size={50} className="text-gray-400" />
                    )}
                    
                    {/* Camera Button */}
                    <button 
                        onClick={handleCameraClick}
                        className="absolute bottom-0 right-0 z-10 rounded-full bg-gray-200 p-1.5 text-gray-700 hover:bg-gray-300 shadow-sm transition-colors border border-white"
                        title="Upload Photo"
                    >
                        <Camera size={14} />
                    </button>
                </div>

                {/* Member Info */}
                <div className="w-full">
                    <h4 className="truncate text-sm font-bold text-slate-900">
                        {member?.firstname} {member?.lastname}
                    </h4>
                    <div className="mt-1">
                        <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-medium text-orange-600 border border-orange-100">
                            {member?.relationship || "Beneficiary"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeneficiaryCard;