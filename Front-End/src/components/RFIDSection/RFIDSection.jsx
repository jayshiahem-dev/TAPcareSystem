import { useState, useMemo, useCallback } from "react";
import LeftSide from "./Component/LeftSideComponent";
import RightSide from "./Component/RightSideComponent";

const RFIDSection = ({ isScanning = false, handleRFIDScan = (rfid) => console.log("Scanning RFID:", rfid), onReleaseCash = null }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStatus, setScanStatus] = useState({ type: "idle", message: "Ready for scan" });

  // Filtered "beneficiaries" array for table
  const displayBeneficiaries = currentUser ? [currentUser] : [];

  // Compute released beneficiaries & total released amount
  const releasedBeneficiaries = useMemo(() => displayBeneficiaries.filter((b) => b.isReleased), [displayBeneficiaries]);
  const totalReleasedAmount = useMemo(() => releasedBeneficiaries.reduce((total, b) => total + (b.amount || 0), 0), [releasedBeneficiaries]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors duration-300 dark:bg-slate-900 md:p-6">
      {/* Main Layout Grid */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-12">
        {/* LEFT PANEL - Takes 5 columns on large screens */}
        <div className="lg:col-span-5 xl:col-span-4">
          <LeftSide
            isScanning={isScanning}
            handleRFIDScan={handleRFIDScan}
            onReleaseCash={onReleaseCash}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            scanStatus={scanStatus}
            setScanStatus={setScanStatus}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </div>

        {/* RIGHT PANEL - Takes 7 columns on large screens */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="h-full w-full">
            <RightSide
              beneficiaries={releasedBeneficiaries}
              handleRFIDScan={handleRFIDScan}
              totalReleasedAmount={totalReleasedAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFIDSection;