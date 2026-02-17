import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

export const RFIDRegisterContext = createContext();
export const useRFIDRegister = () => useContext(RFIDRegisterContext);

export const RFIDRegisterProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);

    const [rfids, setRfids] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const hasInitialFetchRef = useRef(false);
    const prevAuthTokenRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [assignedTotal, setassignedTotal] = useState(0);
    const [percentageChange, setpercentageChange] = useState(0);

    const BASE_URL = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Rfid`;
    const fetchRFIDs = useCallback(
        async ({ page = currentPage, limit = 10, search = "", status = "" }) => {
            if (!authToken) return;

            try {
                setIsLoading(true);

                const res = await axios.get(BASE_URL, {
                    params: {
                        page,
                        limit,
                        search,
                        status,
                    },
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                });

                if (res.data.success) {
                    setRfids(res.data.data || []);
                    setCurrentPage(res.data.currentPage);
                    setTotalPages(res.data.totalPages);
                    setassignedTotal(res.data.assignedTotal);
                    setpercentageChange(res.data.percentageChange);
                    setLimit(res.data.limit);
                    setTotalRecords(res.data.totalRecords);
                }
            } catch (error) {

            } finally {
                setIsLoading(false);
            }
        },
        [authToken],
    );
    const createRFID = useCallback(
        async (formData) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            try {
                const res = await axios.post(BASE_URL, formData, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                });

                if (res.data.success) {
                    setRfids((prev) => [res.data.data, ...prev]);
                    return { success: true, data: res.data.data };
                }

                return { success: false, error: res.data.message };
            } catch (error) {
                const errorMsg = error.response?.data?.message || "RFID registration failed";
                return { success: false, error: errorMsg };
            }
        },
        [authToken],
    );

    const getRFIDById = useCallback(
        async (id) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            try {
                const res = await axios.get(`${BASE_URL}/${id}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (res.data.success) {
                    return { success: true, data: res.data.data };
                }

                return { success: false, error: res.data.message };
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Failed to fetch RFID";
                return { success: false, error: errorMsg };
            }
        },
        [authToken],
    );

    const updateRFID = useCallback(
        async (id, formData) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            try {
                const res = await axios.patch(`${BASE_URL}/${id}`, formData, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                });

                if (res.data.success) {
                    setRfids((prev) => prev.map((r) => (r._id === id ? res.data.data : r)));

                    return { success: true, data: res.data.data };
                }

                return { success: false, error: res.data.message };
            } catch (error) {
                const errorMsg = error.response?.data?.message || "RFID update failed";
                return { success: false, error: errorMsg };
            }
        },
        [authToken],
    );

    const deleteRFID = useCallback(
        async (id) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            try {
                const res = await axios.delete(`${BASE_URL}/${id}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (res.data.success) {
                    setRfids((prev) => prev.filter((r) => r._id !== id));
                    return { success: true };
                }

                return { success: false, error: res.data.message };
            } catch (error) {
                const errorMsg = error.response?.data?.message || "RFID delete failed";
                return { success: false, error: errorMsg };
            }
        },
        [authToken],
    );

    useEffect(() => {
        if (!authToken) return;

        if (prevAuthTokenRef.current === authToken && hasInitialFetchRef.current) {
            return;
        }

        fetchRFIDs();
        hasInitialFetchRef.current = true;
        prevAuthTokenRef.current = authToken;
    }, [authToken, fetchRFIDs]);

    const contextValue = useMemo(
        () => ({
            rfids,
            isLoading,
            fetchRFIDs,
            createRFID,
            getRFIDById,
            updateRFID,
            deleteRFID,
            totalPages,
            currentPage,
            totalRecords,
            assignedTotal,
            percentageChange,
        }),
        [rfids, isLoading, fetchRFIDs, createRFID, getRFIDById, updateRFID, deleteRFID, totalRecords, assignedTotal, percentageChange],
    );

    return <RFIDRegisterContext.Provider value={contextValue}>{children}</RFIDRegisterContext.Provider>;
};
