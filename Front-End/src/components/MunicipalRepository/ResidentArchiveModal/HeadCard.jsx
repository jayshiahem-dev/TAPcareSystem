import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Star, ChevronDown, Eye, PlusCircle, UserPlus, Edit3, Phone, Heart, Briefcase, UserRound, MapPin } from "lucide-react";

// Helper utils (Pwede mo ring i-separate ito sa isang utils.js file)
const getAge = (birthDate) => {
    if (!birthDate) return "—";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const HeadCard = ({ member, onEdit, onAddBeneficiary, onAddAssistance, onViewProfile }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="absolute right-4 top-4 z-50" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-orange-50">
                    Manage <ChevronDown size={12} className={menuOpen ? "rotate-180" : ""} />
                </button>
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                            <button onClick={() => { onViewProfile(member); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"><Eye size={14} /> View Profile</button>
                            <button onClick={() => { onAddAssistance?.(member); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2 text-xs text-orange-600 hover:bg-orange-50"><PlusCircle size={14} /> Add Assistance</button>
                            <div className="my-1 h-px bg-slate-100" />
                            <button onClick={() => { onAddBeneficiary?.(); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"><UserPlus size={14} /> Add Member</button>
                            <button onClick={() => { onEdit?.(member); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"><Edit3 size={14} /> Edit Profile</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                <div className="flex items-center gap-4 lg:border-r lg:border-slate-100 lg:pr-6">
                    <div className="relative h-14 w-14 rounded-lg border border-orange-200 bg-slate-50 flex items-center justify-center">
                        <User size={24} className="text-orange-500" />
                        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 border-2 border-white"><Star size={8} className="text-white fill-white" /></div>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">{member?.lastname.toUpperCase()}, {member?.firstname.toUpperCase()}</h3>
                        <p className="text-[11px] text-slate-500">{getAge(member?.birth_date)} Yrs • {member?.gender}</p>
                    </div>
                </div>
                <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                    <DetailItem icon={Phone} label="Contact" value={member?.contact_number} />
                    <DetailItem icon={Heart} label="Status" value={member?.civil_status} />
                    <DetailItem icon={Briefcase} label="Job" value={member?.employment_status} />
                    <DetailItem icon={UserRound} label="Gender" value={member?.gender} />
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-slate-400">
            <Icon size={11} /> <span className="text-[9px] font-semibold uppercase">{label}</span>
        </div>
        <span className="text-xs font-semibold text-slate-700">{value || "—"}</span>
    </div>
);

export default HeadCard;