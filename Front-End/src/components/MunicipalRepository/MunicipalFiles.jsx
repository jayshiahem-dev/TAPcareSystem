import React, { useState, useContext, useEffect } from "react";
import { ResidentContext } from "../../contexts/ResidentContext/ResidentContext";
import { ChevronRight, ArrowLeft } from "lucide-react";

// Components
import MunicipalitiesView from "./MunicipalitiesView";
import ResidentTable from "./ResidentTable";
import ResidentArchiveModal from "./ResidentArchivedModal";

// Assets
import navalLogo from "../../assets/naval.jfif";
import almeriaLogo from "../../assets/almeria.jfif";
import biliranLogo from "../../assets/Biliran-Logo.jpg";
import cabucgayanLogo from "../../assets/cabucgayan.jfif";
import caibiranLogo from "../../assets/caibiran.jfif";
import culabaLogo from "../../assets/culaba.jfif";
import kawayanLogo from "../../assets/kawayan.jfif";
import maripipiLogo from "../../assets/maripipi.jfif";

import SEAL_URL from "../../assets/logo-login.png";

const MUNICIPALITIES = [
    { name: "Naval", logo: navalLogo, class: "1st Class", color: "#f97316" },
    { name: "Almeria", logo: almeriaLogo, class: "5th Class", color: "#fb923c" },
    { name: "Biliran", logo: biliranLogo, class: "5th Class", color: "#f97316" },
    { name: "Cabucgayan", logo: cabucgayanLogo, class: "5th Class", color: "#fb923c" },
    { name: "Caibiran", logo: caibiranLogo, class: "4th Class", color: "#f97316" },
    { name: "Culaba", logo: culabaLogo, class: "5th Class", color: "#fb923c" },
    { name: "Kawayan", logo: kawayanLogo, class: "4th Class", color: "#f97316" },
    { name: "Maripipi", logo: maripipiLogo, class: "5th Class", color: "#fb923c" },
];

const FolderUI = ({ logo, isSmall = false, color = "#f97316" }) => (
    <div className={`relative ${isSmall ? "h-16 w-24" : "h-32 w-44"} perspective-1000 group`}>
        <div
            className="absolute inset-0 rounded-t-2xl shadow-md transition-colors duration-300"
            style={{ clipPath: "polygon(0% 20%, 42% 20%, 50% 0%, 100% 0%, 100% 100%, 0% 100%)", backgroundColor: color }}
        />
        <div className="absolute left-3 right-3 top-2 h-full transform rounded-sm border border-slate-200 bg-slate-100 shadow-sm transition-all delay-75 duration-500 group-hover:-translate-y-6" />
        <div className="absolute left-2 right-2 top-2 flex h-full transform flex-col gap-2 rounded-sm border border-slate-200 bg-white p-3 shadow-md transition-all duration-500 group-hover:-translate-y-8">
            <div className="h-1 w-full rounded-full bg-slate-100"></div>
            <div className="h-1 w-full rounded-full bg-slate-100"></div>
            <div className="h-1 w-2/3 rounded-full bg-slate-100"></div>
        </div>
        <div
            className="group-hover:rotate-x-25 absolute bottom-0 left-0 right-0 h-[82%] origin-bottom transform rounded-sm shadow-xl transition-all duration-500 ease-out group-hover:brightness-110"
            style={{ backgroundColor: color, clipPath: "polygon(0% 0%, 100% 0%, 92% 100%, 0% 100%)" }}
        >
            {!isSmall && logo && (
                <div className="absolute left-4 top-4 flex items-center justify-center">
                    <div className="rounded-full border border-white/30 bg-white/20 p-1 shadow-inner backdrop-blur-md">
                        <img
                            src={logo}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    </div>
                </div>
            )}
            <div className="absolute bottom-4 left-0 right-8 h-[1px] bg-white/20"></div>
        </div>
    </div>
);

export default function MunicipalFiles() {
    const [view, setView] = useState({ muni: null, brgy: null });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHead, setSelectedHead] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const {
        BarangayInMunicipality,
        fetchbyMunicipality,
        isLoading,
        fetchbybarangayandhousehold,
        householdinbarangay,
        GetHouseholdFullDetails,
        household,
        TotalItems,
        CurrentPageResident,
        TotalPagesResident,
        sethouseholdinbarangay,
    } = useContext(ResidentContext);

    console.log("householdinbarangay", householdinbarangay);

    useEffect(() => {
        const closeMenu = () => setOpenDropdownId(null);
        window.addEventListener("click", closeMenu);
        return () => window.removeEventListener("click", closeMenu);
    }, []);

    const handleMuniSelect = (m) => {
        fetchbyMunicipality({ municipality: m.name, limit: 50 });
        setView({ muni: m, brgy: null });
    };

    const handleBrgySelect = (b) => {
        fetchbybarangayandhousehold({
            municipality: view.muni.name,
            barangay: b,
            page: 1, // Reset to page 1 on new selection
            limit: 10,
        });
        setView({ ...view, brgy: b });
    };

    const handleOpenFolder = (res) => {
        setSelectedHead(res);
        GetHouseholdFullDetails({ householdId: res.householdId });
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-20 font-sans text-slate-800">
            <ResidentArchiveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedHead={selectedHead}
                household={household}
                isLoading={isLoading}
            />

            <header className="mb-16 border-b border-slate-100 bg-white py-10 text-center shadow-sm">
                <img
                    src={SEAL_URL}
                    className="mx-auto mb-3 h-20 w-20 object-contain"
                    alt="Seal"
                />
                <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                    Biliran <span className="text-orange-600">Digital Archives</span>
                </h1>
            </header>

            <main className="mx-auto max-w-6xl px-8">
                {/* STEP 1: Municipality Selection */}
                {!view.muni && (
                    <MunicipalitiesView
                        municipalities={MUNICIPALITIES}
                        onSelect={handleMuniSelect}
                        FolderUI={FolderUI}
                    />
                )}

                {/* STEP 2: Barangay Selection */}
                {view.muni && !view.brgy && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <div className="mb-8 flex items-center justify-between rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-5">
                                <button
                                    onClick={() => setView({ muni: null, brgy: null })}
                                    className="rounded-2xl bg-slate-50 p-4 text-slate-600 transition-all hover:bg-orange-600 hover:text-white"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{view.muni.name}</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-600">Select Barangay Record</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {isLoading
                                ? [...Array(6)].map((_, i) => (
                                      <div
                                          key={i}
                                          className="h-24 animate-pulse rounded-[2rem] bg-slate-100"
                                      />
                                  ))
                                : BarangayInMunicipality?.map((b) => (
                                      <div
                                          key={b}
                                          onClick={() => handleBrgySelect(b)}
                                          className="group flex cursor-pointer items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 transition-all hover:border-orange-300 hover:shadow-2xl"
                                      >
                                          <div className="shrink-0 origin-left scale-75">
                                              <FolderUI
                                                  isSmall={true}
                                                  color={view.muni.color}
                                              />
                                          </div>
                                          <div className="flex-1">
                                              <h4 className="text-sm font-black uppercase text-slate-800 group-hover:text-orange-600">{b}</h4>
                                              <p className="mt-0.5 text-[9px] font-bold uppercase text-slate-400">Open Barangay File</p>
                                          </div>
                                          <div className="rounded-full bg-slate-50 p-2 transition-all group-hover:bg-orange-600 group-hover:text-white">
                                              <ChevronRight size={16} />
                                          </div>
                                      </div>
                                  ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: Resident Table View */}
                {view.brgy && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setView({ ...view, brgy: null })}
                                    className="rounded-xl border border-slate-100 bg-white p-3 transition-all hover:bg-orange-600 hover:text-white"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black uppercase text-slate-900">
                                        {view.brgy} <span className="text-orange-600">Files</span>
                                    </h2>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">{TotalItems || 0} Residents Found</p>
                                </div>
                            </div>
                        </div>

                        {/* DIRECT PASSING OF MUNI AND BRGY NAMES */}
                        <ResidentTable
                            residents={householdinbarangay}
                            sethouseholdinbarangay={sethouseholdinbarangay}
                            openDropdownId={openDropdownId}
                            setOpenDropdownId={setOpenDropdownId}
                            onOpenFolder={handleOpenFolder}
                            GetHouseholdFullDetails={GetHouseholdFullDetails}
                            fetchbybarangayandhousehold={fetchbybarangayandhousehold}
                            TotalItems={TotalItems}
                            CurrentPageResident={CurrentPageResident}
                            TotalPagesResident={TotalPagesResident}
                            currentMuni={view.muni.name}
                            currentBrgy={view.brgy}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
