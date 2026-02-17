import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const OfficerDisplayContext = createContext();

export const OfficerDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, linkId } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [officers, setOfficers] = useState([]);
    const [officerProfile, setOfficerProfile] = useState([]);
    const [totalOfficerCount, setTotalOfficerCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Added missing state

    console.log("officers", officers);

    // Fetch officer data with useCallback
    const FetchOfficerData = useCallback(async () => {
        if (!authToken) return;

        try {
            const params = {
                page: currentPage,
                limit: rowsPerPage,
                search: searchQuery,
            };

            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Officer`, {
                params: params,
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Cache-Control": "no-cache",
                },
            });

            const officerData = res.data.data;
            const pagination = res.data.pagination;

            setOfficers(officerData);
            setTotalOfficerCount(pagination.totalAdmin);
            setTotalPages(pagination.totalPages);
            setCurrentPage(pagination.currentPage);
            setRowsPerPage(pagination.limit);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [authToken, currentPage, rowsPerPage, searchQuery]);


    // Delete officer with useCallback
    const DeleteOfficer = useCallback(
        async (officerID) => {
            try {
                const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Officer/${officerID}`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                if (response.data.status === "success") {
                    setOfficers((prevUsers) => prevUsers.filter((user) => user._id !== officerID));
                    setModalStatus("success");
                    setShowModal(true);
                } else {
                    setModalStatus("failed");
                    setShowModal(true);
                    return { success: false, error: "Unexpected response from server." };
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                setCustomError(error.response?.data?.message || "Failed to delete user.");
                setModalStatus("failed");
                setShowModal(true);
            }
        },
        [authToken],
    );

    // Update officer with useCallback
    const UpdateOfficer = useCallback(
        async (dataID, values) => {
            try {
                const formData = new FormData();
                formData.append("first_name", values.first_name || "");
                formData.append("last_name", values.last_name || "");
                formData.append("middle_name", values.middle_name || "");
                formData.append("email", values.email || "");
                formData.append("role", "admin");
                if (values.avatar) formData.append("avatar", values.avatar);

                const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Officer/${dataID}`, formData, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.data?.status === "success") {
                    FetchOfficerData();
                    setModalStatus("success");
                    setShowModal(true);
                    return { success: true, data: response.data.data };
                } else {
                    setModalStatus("failed");
                    setShowModal(true);
                    return { success: false, error: "Unexpected response from server." };
                }
            } catch (error) {
                const message = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong.";

                setCustomError(message);
                setModalStatus("failed");
                setShowModal(true);

                return { success: false, error: message };
            }
        },
        [authToken, FetchOfficerData],
    );

    // Add officer with useCallback
    const AddOfficer = useCallback(
        async (values) => {
            try {
                const formData = new FormData();
                formData.append("first_name", values.first_name || "");
                formData.append("last_name", values.last_name || "");
                formData.append("email", values.email || "");
                formData.append("gender", values.gender || "");
                formData.append("role", values.role || "officer");
                formData.append("password", values.password || "");

                if (values.middle_name) {
                    formData.append("middle_name", values.middle_name);
                }

                if (values.avatar) formData.append("avatar", values.avatar);

                const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`, formData, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (res.data?.status?.toLowerCase() === "success") {
                    FetchOfficerData();
                    setModalStatus("success");
                    setShowModal(true);

                    return { success: true, data: res.data.data };
                } else {
                    setModalStatus("failed");
                    setShowModal(true);
                    return { success: false, error: res.data?.message || "Unexpected response from server." };
                }
            } catch (error) {
                const message = error.response?.data?.message || error.response?.data?.error || "Something went wrong.";
                setCustomError(message);
                setModalStatus("failed");
                setShowModal(true);

                return { success: false, error: message };
            }
        },
        [authToken, FetchOfficerData],
    );

    // Handle search
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page when searching
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // Fetch all data on initial mount and when authToken changes
    useEffect(() => {
        if (!authToken) return;

        const fetchAllData = async () => {
            setLoading(true);
            try {
                await Promise.all([FetchOfficerData()]);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [authToken, FetchOfficerData]);

    // Fetch data when pagination or search changes
    useEffect(() => {
        if (authToken) {
            FetchOfficerData();
        }
    }, [currentPage, searchQuery, authToken, FetchOfficerData]);

    // Close modal handler
    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setCustomError("");
    }, []);

    return (
        <OfficerDisplayContext.Provider
            value={{
                officers,
                DeleteOfficer,
                UpdateOfficer,
                totalOfficerCount,
                officerProfile,
                FetchOfficerData,
                AddOfficer,
                loading,
                searchQuery,
                setSearchQuery: handleSearch,
                currentPage,
                totalPages,
                setCurrentPage: handlePageChange,
                rowsPerPage,
                setRowsPerPage,
                handleSearch,
                handlePageChange,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={handleCloseModal}
                status={modalStatus}
                errorMessage={customError}
            />
        </OfficerDisplayContext.Provider>
    );
};