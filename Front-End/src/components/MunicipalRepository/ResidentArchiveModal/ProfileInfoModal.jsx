import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, UserRound, Calendar, MapPinned, Heart, Info, Briefcase, Phone, MapPin, Camera } from "lucide-react";

const ProfileInfoModal = ({ isOpen, onClose, member }) => {
    const fileInputRef = useRef(null);
    // State para sa preview ng napiling image
    const [imagePreview, setImagePreview] = useState(null);

    if (!isOpen || !member) return null;

    const fullName = `${member.firstname} ${member.middlename} ${member.lastname} ${member.suffix !== 'None' ? member.suffix : ''}`;

    const handleCameraClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Gumawa ng preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            
            console.log("Selected file:", file.name);
            // Dito mo ilalagay ang upload logic sa backend
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="w-full max-w-3xl overflow-hidden rounded-xl bg-[#F0F2F5] shadow-2xl max-h-[90vh] flex flex-col"
            >
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                />

                {/* --- HEADER SECTION --- */}
                <div className="relative bg-white shadow-sm flex-shrink-0">
                    <div className="h-32 w-full bg-orange-500 sm:h-40">
                        <button onClick={onClose} className="absolute right-3 top-3 z-50 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="mx-auto px-6 pb-3">
                        <div className="relative flex flex-col items-center sm:flex-row sm:items-end sm:gap-4">
                            
                            {/* Avatar Container */}
                            <div className="relative -mt-12 h-28 w-28 rounded-full border-4 border-white bg-[#F0F2F5] shadow-md flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    // Kung may na-select na image, ito ang lilitaw
                                    <img 
                                        src={imagePreview} 
                                        alt="Profile Preview" 
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    // Default Icon kung wala pang image
                                    <UserRound size={70} className="text-gray-400 mt-4" />
                                )}
                                
                                {/* Camera Button */}
                                <button 
                                    onClick={handleCameraClick}
                                    className="absolute bottom-1 right-1 z-10 rounded-full bg-gray-200 p-1.5 text-gray-700 hover:bg-gray-300 shadow-sm transition-colors border border-white"
                                    title="Upload Photo"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>

                            <div className="mb-1 mt-2 flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{fullName}</h1>
                                <p className="text-sm text-gray-500 font-medium">Resident Profile</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="overflow-y-auto p-3 sm:p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                        
                        <div className="md:col-span-2 space-y-3">
                            <div className="rounded-lg bg-white p-3 shadow-sm border border-gray-200">
                                <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">Intro</h2>
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2.5 text-gray-700">
                                        <Briefcase className="text-gray-400" size={16} />
                                        <span className="text-xs">Works as <span className="font-semibold">{member.occupation || "N/A"}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-gray-700">
                                        <MapPin className="text-gray-400" size={16} />
                                        <span className="text-xs">Lives in <span className="font-semibold">{member.barangay}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-gray-700">
                                        <Heart className="text-gray-400" size={16} />
                                        <span className="text-xs">Status: <span className="font-semibold">{member.civil_status}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-3 space-y-3">
                            <div className="rounded-lg bg-white p-3 shadow-sm border border-gray-200">
                                <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Information Details</h2>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Birth Date</p>
                                        <p className="mt-1 text-xs font-semibold text-gray-800">
                                            {new Date(member.birth_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Gender</p>
                                        <p className="mt-1 text-xs font-semibold text-gray-800">{member.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Contact</p>
                                        <p className="mt-1 text-xs font-semibold text-blue-600">{member.contact_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Religion</p>
                                        <p className="mt-1 text-xs font-semibold text-gray-800">{member.religion}</p>
                                    </div>
                                </div>
                                <div className="mt-3 border-t pt-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Full Address</p>
                                    <p className="text-xs text-gray-700 leading-snug font-medium">
                                        {member.sitio}, {member.barangay}, {member.municipality}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="bg-white px-4 py-2 border-t border-gray-200 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="rounded-md bg-gray-100 px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-all">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileInfoModal;