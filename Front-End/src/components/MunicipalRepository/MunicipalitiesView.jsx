import React from "react";
import { MapPin } from "lucide-react";

const MUNICIPALITIES = [
    { name: "Naval", logo: "navalLogo", class: "1st Class", color: "#f97316" }, // Note: Siguraduhing i-pass ang tamang logo imports dito
    { name: "Almeria", logo: "almeriaLogo", class: "5th Class", color: "#fb923c" },
    { name: "Biliran", logo: "biliranLogo", class: "5th Class", color: "#f97316" },
    { name: "Cabucgayan", logo: "cabucgayanLogo", class: "5th Class", color: "#fb923c" },
    { name: "Caibiran", logo: "caibiranLogo", class: "4th Class", color: "#f97316" },
    { name: "Culaba", logo: "culabaLogo", class: "5th Class", color: "#fb923c" },
    { name: "Kawayan", logo: "kawayanLogo", class: "4th Class", color: "#f97316" },
    { name: "Maripipi", logo: "maripipiLogo", class: "5th Class", color: "#fb923c" },
];

export default function MunicipalitiesView({ municipalities, onSelect, FolderUI }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-16 gap-x-10 animate-in fade-in slide-in-from-bottom-4">
            {municipalities.map((m) => (
                <div 
                    key={m.name} 
                    onClick={() => onSelect(m)} 
                    className="group flex flex-col items-center cursor-pointer"
                >
                    <FolderUI logo={m.logo} color={m.color} />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter mt-4 group-hover:text-orange-600 transition-colors">
                        {m.name}
                    </h3>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                        <MapPin size={10}/> {m.class}
                    </span>
                </div>
            ))}
        </div>
    );
}