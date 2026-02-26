import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@/contexts/theme-context";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import RFIDSection from "./components/RFIDSection/RFIDSection";

import MasterList from "./components/ImportMasterList/ImportMasterList";

import AyudaAssign from "./components/AyudaAssign/AyudaAssign";

import CategoryDistribution from "./components/Category/Category";
import PrioritySelection from "./components/PriotitizedSection/PrioritySelection";
import Analytics from "./components/Analytics/Analytics";
import User from "./components/UserManagement/UserManagement";
import Login from "./components/Login/Login";
import ResetPassword from "./components/Login/ResetPassword";
import PriorityTable from "./components/PriotitizedSection/PriorityTable/PriorityTable";
import BeneficiaryTable from "./components/Beneficiary/BeneficiaryTable";
import ArchiveDisplay from "./components/History/HistoryTable";
import AdminTable from "./components/Admin/AdminTable";
import OfficerTable from "./components/Officer/OfficerTable";
import RFIDTable from "./components/RFIDRegister/RFidTable";
import SuperAdminTable from "./components/SuperAdmin/SuperAdminTable";
import Settings from "./components/Setting/Setting";
import Download from "./components/DownloadModal/DownloadModal";
import MunicipalFiles from "./components/MunicipalRepository/MunicipalFiles";

function App() {
    // State to control download modal
    const [showDownload, setShowDownload] = useState(false);

    // Check first run
    useEffect(() => {
        const downloaded = localStorage.getItem("agentDownloaded");
        if (!downloaded) {
            setShowDownload(true);
        }
    }, []);

    // React Router
    const router = createBrowserRouter([
        {
            path: "/",
            element: (
                <Navigate
                    to="/login"
                    replace
                />
            ),
        },
        {
            element: <PublicRoute />,
            children: [
                { path: "login", element: <Login /> },
                { path: "reset-password/:token", element: <ResetPassword /> },
            ],
        },
        {
            element: <PrivateRoute />,
            children: [
                {
                    path: "dashboard",
                    element: <Layout />,
                    children: [
                        { index: true, element: <DashboardPage /> },
                        { path: "analytics", element: <Analytics /> },
                        { path: "new-category", element: <CategoryDistribution /> },
                        { path: "beneficiarylist", element: <BeneficiaryTable /> },
                        { path: "masterlist", element: <AyudaAssign /> },
                        //{ path: "masterlist", element: <MasterList /> },
                        { path: "super-admin", element: <SuperAdminTable /> },
                        { path: "priority-section", element: <PrioritySelection /> },
                        { path: "priority-table", element: <PriorityTable /> },
                        { path: "archived", element: <ArchiveDisplay /> },
                        { path: "municipalFiles", element: <MunicipalFiles /> },
                        { path: "admin-table", element: <AdminTable /> },
                        { path: "officer-table", element: <OfficerTable /> },
                        { path: "rfid-table", element: <RFIDTable /> },
                        { path: "rfid", element: <RFIDSection /> },
                        { path: "user", element: <User /> },
                        { path: "settings", element: <Settings /> },
                    ],
                },
            ],
        },
        {
            path: "*",
            element: (
                <Navigate
                    to="/login"
                    replace
                />
            ),
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            {/* Download modal */}
            {showDownload && (
                <Download
                    onClose={() => {
                        setShowDownload(false);
                        localStorage.setItem("agentDownloaded", "true"); // mark as downloaded
                    }}
                />
            )}
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
