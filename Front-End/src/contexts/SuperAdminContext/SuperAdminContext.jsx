import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axiosInstance from "../../ReusableFolder/axioxInstance"; // Siguraduhing tama ang path at spelling
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const SuperAdminContext = createContext();

export const SuperAdminDisplayProvider = ({ children }) => {
    const { authToken, linkId } = useContext(AuthContext);

    // --- States ---
    const [superAdmins, setSuperAdmins] = useState([]);
    const [superAdminProfile, setSuperAdminProfile] = useState([]);
    const [totalSuperAdminCount, setTotalSuperAdminCount] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [customError, setCustomError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    // Pagination & Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- Handlers ---

    // 1. Fetch SuperAdmin List
    const FetchSuperAdminData = useCallback(async () => {
        if (!authToken) return;

        try {
            const params = {
                page: currentPage,
                limit: rowsPerPage,
                search: searchQuery,
            };

            // Gamit ang axiosInstance, hindi na kailangan ang full URL kung may baseURL na ito
            const res = await axiosInstance.get("/api/v1/SuperAdmin", {
                params: params,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Cache-Control": "no-cache",
                },
            });

            const { data, pagination } = res.data;

            setSuperAdmins(data);
            setTotalSuperAdminCount(pagination.totalAdmin || 0);
            setTotalPages(pagination.totalPages || 0);
            setCurrentPage(pagination.currentPage || 1);
        } catch (error) {
            console.error("Error fetching SuperAdmin data:", error);
        } finally {
            setLoading(false);
        }
    }, [authToken, currentPage, rowsPerPage, searchQuery]);

    // 2. Fetch SuperAdmin Profile
    const FetchSuperAdminProfile = useCallback(async () => {
        if (!authToken || !linkId) return;

        try {
            const response = await axiosInstance.get(`/api/v1/SuperAdmin/profile/${linkId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data?.status === "success") {
                setSuperAdminProfile(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching profile:", error.response?.status);
        }
    }, [authToken, linkId]);

    // 3. Add SuperAdmin
    const AddSuperAdmin = useCallback(async (values) => {
        try {
            const formData = new FormData();
            formData.append("first_name", values.first_name || "");
            formData.append("last_name", values.last_name || "");
            formData.append("email", values.email || "");
            formData.append("gender", values.gender || "");
            formData.append("role","superadmin");
            formData.append("password", values.password || "");

            if (values.middle_name) formData.append("middle_name", values.middle_name);
            if (values.avatar) formData.append("avatar", values.avatar);

            const res = await axiosInstance.post("/api/v1/authentication/signup", formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data?.status?.toLowerCase() === "success") {
                FetchSuperAdminData();
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: res.data.data };
            }
        } catch (error) {
            const message = error.response?.data?.message || "Something went wrong.";
            setCustomError(message);
            setModalStatus("failed");
            setShowModal(true);
            return { success: false, error: message };
        }
    }, [authToken, FetchSuperAdminData]);

    // 4. Update SuperAdmin
    const UpdateSuperAdmin = useCallback(async (dataID, values) => {
        try {
            const formData = new FormData();
            formData.append("first_name", values.first_name || "");
            formData.append("last_name", values.last_name || "");
            formData.append("middle_name", values.middle_name || "");
            formData.append("email", values.email || "");
            formData.append("role", "superadmin");
            if (values.avatar) formData.append("avatar", values.avatar);

            const response = await axiosInstance.patch(`/api/v1/SuperAdmin/${dataID}`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data?.status === "success") {
                FetchSuperAdminData();
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: response.data.data };
            }
        } catch (error) {
            setCustomError(error.response?.data?.message || "Failed to update.");
            setModalStatus("failed");
            setShowModal(true);
            return { success: false };
        }
    }, [authToken, FetchSuperAdminData]);

    // 5. Delete SuperAdmin
    const DeleteSuperAdmin = useCallback(async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/v1/SuperAdmin/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setSuperAdmins((prev) => prev.filter((user) => user._id !== id));
                setModalStatus("success");
                setShowModal(true);
            }
        } catch (error) {
            setCustomError(error.response?.data?.message || "Failed to delete.");
            setModalStatus("failed");
            setShowModal(true);
        }
    }, [authToken]);

    // --- Pagination Handlers ---
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setCustomError("");
    }, []);

    // --- Effects ---
    useEffect(() => {
        if (authToken) {
            setLoading(true);
            Promise.all([FetchSuperAdminData(), FetchSuperAdminProfile()])
                .finally(() => setLoading(false));
        }
    }, [authToken, FetchSuperAdminData, FetchSuperAdminProfile]);

    return (
        <SuperAdminContext.Provider
            value={{
                superAdmins,
                superAdminProfile,
                totalSuperAdminCount,
                loading,
                searchQuery,
                currentPage,
                totalPages,
                rowsPerPage,
                setRowsPerPage,
                setSearchQuery: handleSearch,
                setCurrentPage: handlePageChange,
                FetchSuperAdminData,
                AddSuperAdmin,
                UpdateSuperAdmin,
                DeleteSuperAdmin,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={handleCloseModal}
                status={modalStatus}
                errorMessage={customError}
            />
        </SuperAdminContext.Provider>
    );
};