import React from "react";

export default function Download({ onClose }) {
  const downloadAgent = () => {
    const link = document.createElement("a");
    // Using your VITE environment variable for the backend URL
    link.href = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/DownloadAgent`;
    link.download = "RFID-Bridge.exe";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header Section - Professional Deep Blue */}
        <div className="bg-[#1e40af] p-6 text-white relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full -mr-8 -mt-8"></div>
          <h2 className="text-xl font-bold flex items-center gap-2">
RFID Bridge Setup Guide
          </h2>
          <p className="text-blue-100 text-xs mt-1 opacity-80">Follow these steps to enable your scanner</p>
        </div>

        <div className="p-8">
          <div className="space-y-6 text-gray-700">
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-none w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm shadow-orange-200">1</div>
              <div>
                <p className="font-bold text-slate-800 text-sm italic">Download & Relocate</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Download the file and move it to your <strong>Desktop</strong> or a dedicated folder for easy access.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-none w-8 h-8 rounded-lg bg-[#1e40af] text-white flex items-center justify-center font-bold shadow-sm">2</div>
              <div>
                <p className="font-bold text-slate-800 text-sm italic">Launch the Agent</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Double-click <strong>RFID-Bridge.exe</strong>. Keep this program running in the background while using the website.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-none w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm shadow-orange-200">3</div>
              <div>
                <p className="font-bold text-slate-800 text-sm italic">Start Scanning</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Once the console window shows <span className="text-green-600 font-mono font-bold">"Connected"</span>, your RFID scanner is ready for use.
                </p>
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-dashed border-slate-200 relative">
             <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-white px-2 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Deployment Ready</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={downloadAgent}
              className="w-full rounded-xl bg-orange-500 px-6 py-4 text-white font-black uppercase tracking-wider hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95 flex items-center justify-center gap-2"
            >
              Download Agent
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-slate-400 hover:text-[#1e40af] font-semibold transition-colors uppercase tracking-tight"
            >
              Return to Dashboard
            </button>
          </div>

          {/* Security Instruction Box */}
          <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3 items-start">
            <span className="text-orange-500 text-lg">⚠️</span>
            <p className="text-[10px] text-orange-800 leading-tight">
              <strong>SECURITY NOTE:</strong> If Windows prompts "Windows protected your PC", click <u>More info</u> and then <u>Run anyway</u>. This is standard for custom hardware bridges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}