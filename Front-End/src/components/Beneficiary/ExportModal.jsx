import React, { useState } from "react";
import { 
    Download, X, FileText, FileSpreadsheet, 
    Settings2, ChevronRight, Calendar, MapPin, Tag
} from "lucide-react";

const ExportModal = ({
    isOpen,
    onClose,
    onExport,
    availableFields = [],
    groupedFields = {},
    exportFormat,
    setExportFormat,
    selectedFields,
    setSelectedFields,
    exportTitle,
    setExportTitle,
    municipalityOptions = [],
    exportMunicipality,
    setExportMunicipality,
    exportCategory,
    setExportCategory,
    categoryOptionsList = [],
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    isExporting
}) => {
    // Step 1: Format & Name | Step 2: Filters & Columns
    const [step, setStep] = useState(1);

    if (!isOpen) return null;

    const handleToggleField = (id) => {
        setSelectedFields(prev => 
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedFields(availableFields.map(f => f.id));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                
                {/* --- COMPACT TAB-STYLE STEPPER --- */}
                <div className="flex border-b bg-slate-50/50">
                    <button 
                        onClick={() => setStep(1)}
                        className={`flex-1 py-3 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all ${step === 1 ? 'bg-white text-orange-600 border-b-2 border-orange-600' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                        <span className={`h-5 w-5 rounded-full flex items-center justify-center ${step === 1 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
                        Format & Title
                    </button>
                    <button 
                        onClick={() => setStep(2)}
                        className={`flex-1 py-3 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all ${step === 2 ? 'bg-white text-orange-600 border-b-2 border-orange-600' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                        <span className={`h-5 w-5 rounded-full flex items-center justify-center ${step === 2 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                        Data & Filters
                    </button>
                    <button onClick={onClose} className="px-4 border-l hover:bg-red-50 hover:text-red-500 transition-colors text-slate-400">
                        <X size={18} />
                    </button>
                </div>

                {/* --- BODY --- */}
                <div className="p-6">
                    {step === 1 ? (
                        /* STEP 1: FORMAT SELECTION */
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-center">
                                <h3 className="text-base font-bold text-slate-800">Export Configuration</h3>
                                <p className="text-xs text-slate-500">Select your preferred file type and name.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setExportFormat("pdf")}
                                    className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${exportFormat === "pdf" ? "border-orange-500 bg-orange-50/30" : "border-slate-100 hover:border-slate-200"}`}
                                >
                                    <FileText size={32} className={exportFormat === "pdf" ? "text-orange-600" : "text-slate-300"} />
                                    <span className={`text-sm font-bold ${exportFormat === "pdf" ? "text-orange-700" : "text-slate-600"}`}>PDF Document</span>
                                    {exportFormat === "pdf" && <div className="absolute top-2 right-2 h-2 w-2 bg-orange-500 rounded-full" />}
                                </button>

                                <button 
                                    onClick={() => setExportFormat("excel")}
                                    className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${exportFormat === "excel" ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 hover:border-slate-200"}`}
                                >
                                    <FileSpreadsheet size={32} className={exportFormat === "excel" ? "text-emerald-600" : "text-slate-300"} />
                                    <span className={`text-sm font-bold ${exportFormat === "excel" ? "text-emerald-700" : "text-slate-600"}`}>Excel Spreadsheet</span>
                                    {exportFormat === "excel" && <div className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full" />}
                                </button>
                            </div>

                            <div className="max-w-xs mx-auto space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">File Name</label>
                                <input 
                                    type="text" 
                                    value={exportTitle}
                                    onChange={(e) => setExportTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                                    placeholder="e.g., Beneficiary_Report_2024"
                                />
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: FILTERS & FIELD SELECTION */
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                            
                            {/* Horizontal Filters Block */}
                            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="space-y-1">
                                    <label className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase"><Tag size={10}/> Category</label>
                                    <select 
                                        value={exportCategory.id}
                                        onChange={(e) => setExportCategory(categoryOptionsList.find(c => c.id === e.target.value))}
                                        className="w-full p-1.5 text-xs rounded border-slate-200 outline-none"
                                    >
                                        {categoryOptionsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase"><MapPin size={10}/> Location</label>
                                    <select 
                                        value={exportMunicipality}
                                        onChange={(e) => setExportMunicipality(e.target.value)}
                                        className="w-full p-1.5 text-xs rounded border-slate-200 outline-none"
                                    >
                                        {municipalityOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase"><Calendar size={10}/> Date Range</label>
                                    <div className="flex items-center gap-1">
                                        <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="w-full p-1 text-[10px] rounded border-slate-200" />
                                        <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="w-full p-1 text-[10px] rounded border-slate-200" />
                                    </div>
                                </div>
                            </div>

                            {/* Two-Column Field Selector */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-2">
                                        <Settings2 size={14} /> Selected Columns ({selectedFields.length})
                                    </h4>
                                    <div className="flex gap-3">
                                        <button onClick={handleSelectAll} className="text-[10px] font-bold text-orange-600">Select All</button>
                                        <button onClick={() => setSelectedFields([])} className="text-[10px] font-bold text-slate-400">Clear</button>
                                    </div>
                                </div>
                                
                                <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 gap-x-4">
                                    {Object.entries(groupedFields).map(([category, fields]) => (
                                        <div key={category} className="mb-3 col-span-1">
                                            <div className="text-[9px] font-black text-slate-400 uppercase mb-1 border-b border-slate-100">{category}</div>
                                            {fields.map(field => (
                                                <label key={field.id} className="flex items-center gap-2 py-1 px-1 hover:bg-slate-50 rounded cursor-pointer group">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedFields.includes(field.id)}
                                                        onChange={() => handleToggleField(field.id)}
                                                        className="h-3.5 w-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500/20"
                                                    />
                                                    <span className="text-[12px] text-slate-600 group-hover:text-slate-900 truncate">{field.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- FOOTER --- */}
                <div className="bg-slate-50 border-t px-6 py-4 flex justify-between items-center">
                    <button
                        onClick={step === 1 ? onClose : () => setStep(1)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {step === 1 ? "CANCEL" : "BACK TO FORMAT"}
                    </button>
                    
                    {step === 1 ? (
                        <button
                            onClick={() => setStep(2)}
                            className="bg-slate-900 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
                        >
                            NEXT: CONFIGURE DATA <ChevronRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={onExport}
                            disabled={isExporting || selectedFields.length === 0}
                            className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md ${isExporting || selectedFields.length === 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-orange-600 text-white hover:bg-orange-700 active:scale-95"}`}
                        >
                            {isExporting ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    PROCESSING...
                                </span>
                            ) : (
                                <>
                                    GENERATE {exportFormat.toUpperCase()}
                                    <Download size={16} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExportModal;