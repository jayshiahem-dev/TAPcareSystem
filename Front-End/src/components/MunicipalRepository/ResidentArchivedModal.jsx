import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, X, Shield, Users } from "lucide-react";
import { ResidentContext } from "../../contexts/ResidentContext/ResidentContext";

// Imports
import HeadCard from "./ResidentArchiveModal/HeadCard";
import BeneficiaryCard from "./ResidentArchiveModal/BeneficiaryCard";
import ProfileInfoModal from "./ResidentArchiveModal/ProfileInfoModal";
import AddResidentModal from "../ImportMasterList/Modal/AddResidentModal";

const ResidentArchiveModal = ({ isOpen, onClose, selectedHead, household, isLoading }) => {
    const { createResident } = useContext(ResidentContext);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [activeMember, setActiveMember] = useState(null);

    // Initial state para sa bagong member
    const [formData, setFormData] = useState({
        firstname: "",
        middlename: "",
        lastname: "",
        suffix: "",
        household_id: household?.householdId || "",
        relationship: "",
        gender: "Male",
        birth_date: "",
        status: "Active",
    });

    // Update household_id kapag nagbago ang household prop
    useEffect(() => {
        if (household?.householdId) {
            setFormData((prev) => ({ ...prev, household_id: household.householdId }));
        }
    }, [household]);

    const handleViewProfile = (member) => {
        setActiveMember(member);
        setIsProfileModalOpen(true);
    };

    const handleSave = async () => {
        try {
            await createResident(formData);
            alert("Resident successfully added!");
            setIsAddModalOpen(false);
            setFormData(initialFormState);
        } catch (error) {
            console.error("Save Error:", error);
        }
    };

    if (!isOpen) return null;

    const familyMembers = [...(household?.residents || []), ...(household?.beneficiaries || [])].filter((m) => m._id !== selectedHead?._id);

    return (
        <>
            <AnimatePresence>
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl"
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b bg-white px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">
                                    <Home size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold leading-none text-slate-900">Household Profile</h2>
                                    <span className="font-mono text-[10px] text-slate-500">ID: {household?.householdId}</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 space-y-6 overflow-y-auto bg-white px-6 py-6">
                            <section>
                                <div className="mb-3 flex items-center gap-2 border-b pb-1">
                                    <Shield
                                        size={14}
                                        className="text-orange-500"
                                    />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Head of Household</h3>
                                </div>
                                {selectedHead && (
                                    <HeadCard
                                        member={selectedHead}
                                        onViewProfile={handleViewProfile}
                                        onAddBeneficiary={() => setIsAddModalOpen(true)} // RE-ADDED FUNCTION
                                    />
                                )}
                            </section>

                            <section>
                                <div className="mb-3 flex items-center gap-2 border-b pb-1">
                                    <Users
                                        size={14}
                                        className="text-orange-500"
                                    />
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Family Members ({familyMembers.length})
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                                    {familyMembers.map((m) => (
                                        <BeneficiaryCard
                                            key={m._id}
                                            member={m}
                                            onViewInfo={handleViewProfile}
                                        />
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="flex justify-end border-t bg-slate-50 px-6 py-4">
                            <button
                                onClick={onClose}
                                className="rounded-lg border bg-white px-6 py-2 text-xs font-bold text-slate-600"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>

            {/* PROFILE INFO MODAL */}
            <AnimatePresence>
                {isProfileModalOpen && (
                    <ProfileInfoModal
                        isOpen={isProfileModalOpen}
                        onClose={() => setIsProfileModalOpen(false)}
                        member={activeMember}
                    />
                )}
            </AnimatePresence>

            {/* ADD RESIDENT MODAL - ETO YUNG LALABAS PAG NAK-CLICK ANG ADD MEMBER SA DROPDOWN */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200]">
                    <AddResidentModal
                        from="repository"
                        show={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        residentData={formData}
                        setResidentData={setFormData}
                        onSubmit={handleSave}
                        municipalityOptions={["Naval", "Biliran", "Caibiran", "Culaba"]}
                        genderOptions={["Male", "Female"]}
                        civilStatusOptions={["Single", "Married", "Widowed", "Separated"]}
                        relationshipOptions={["Son", "Daughter", "Spouse", "Parent", "Sibling"]}
                        employmentStatusOptions={["Employed", "Unemployed", "Student", "Retired"]}
                        classificationOptions={["Senior Citizen", "PWD", "Solo Parent", "Indigent"]}
                    />
                </div>
            )}
        </>
    );
};

export default ResidentArchiveModal;
