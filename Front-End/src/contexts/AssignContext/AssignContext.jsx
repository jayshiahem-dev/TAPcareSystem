import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

export const AssistanceContext = createContext();
export const useAssistance = () => useContext(AssistanceContext);

export const AssistanceProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);
    const [assistances, setAssistances] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [TotalAssistances, setTotalAssistances] = useState(0);
    const [TotalPages, setTotalPages] = useState(0);
    const [CurrentPage, setCurrentPage] = useState(1);
    const [Allassistances, setAllAssistances] = useState([]);
    const [AllTotalAssistances, setTotalAllAssistances] = useState(0);
    const [AllTotalPages, setAllTotalPages] = useState(0);
    const [AllCurrentPage, setAllCurrentPage] = useState(1);
    const [releasedHistory, setReleasedHistory] = useState([]);
    const [SpecificResidentData, setSpecificResidentData] = useState([]);

    // Pagination state
    const [pagination, setPagination] = useState({
        totalAssistances: 0,
        totalPages: 0,
        currentPage: 1,
    });

    const [Allpagination, setAllPagination] = useState({
        totalAssistances: 0,
        totalPages: 0,
        currentPage: 1,
    });

    // Refs for debouncing
    const fetchTimeoutRef = useRef(null);
    const hasInitialFetchRef = useRef(false);
    const prevAuthTokenRef = useRef(null);

    const backendURL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    const fetchAssistances = useCallback(
        async (page = 1, limit = 10, municipality = "", barangay = "", categoryId = "", status = "", search = "") => {
            if (!authToken) return;

            try {
                setIsLoading(true);

                const params = { page, limit };
                if (municipality?.trim()) params.municipality = municipality.trim();
                if (barangay?.trim()) params.barangay = barangay.trim();
                if (categoryId?.trim()) params.categoryId = categoryId.trim(); // Palitan dito
                if (status?.trim()) params.status = status.trim();
                if (search?.trim()) params.search = search.trim();

                console.log("Fetching assistances with params:", params);

                const res = await axios.get(`${backendURL}/api/v1/Assistance`, {
                    params,
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}`, "Cache-Control": "no-cache" },
                });

                const { data, total, currentPage, totalPages, limit: resLimit } = res.data;

                setAssistances(data || []);
                setTotalAssistances(total || 0);
                setCurrentPage(currentPage || 1);
                setTotalPages(totalPages || 1);
                setPagination({ totalAssistances: total, totalPages, currentPage });
            } catch (error) {
                console.error("Error fetching assistances:", error);
                const errorMsg = error.response?.data?.message || "Failed to fetch assistances";
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

    const getResidentByRFID = useCallback(
        async (rfid) => {
            if (!authToken) return;


            setIsLoading(true);
            try {
                console.log("Fetching resident for RFID:", rfid);
                const res = await axios.post(`${backendURL}/api/v1/Assistance/DisplayResidentAssistanceByRFID/${rfid}`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                if (res.data.success && res.data.data) {
                    setSpecificResidentData(res.data.data); // 🔹 Flat object ng resident + assistance
                    console.log("Resident + Assistance:", res.data.data);
                    return { success: true, data: res.data.data };
                } else {
                    setResidentData(null);
                    return { success: false };
                }
            } catch (error) {
                console.error("Error fetching resident by RFID:", error);
                setResidentData(null);
                return { success: false };
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

    const fetchAllAssistances = useCallback(
        async (page = 1, limit = 10, municipality = "", barangay = "", categoryId = "", status = "", search = "") => {
            if (!authToken) return;

            try {
                setIsLoading(true);

                const params = { page, limit };
                if (municipality?.trim()) params.municipality = municipality.trim();
                if (barangay?.trim()) params.barangay = barangay.trim();
                if (categoryId?.trim()) params.categoryId = categoryId.trim(); // Palitan dito
                if (status?.trim()) params.status = status.trim();
                if (search?.trim()) params.search = search.trim();

                console.log("Fetching assistances with params:", params);

                const res = await axios.get(`${backendURL}/api/v1/Assistance/DisplayAllAssistances`, {
                    params,
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}`, "Cache-Control": "no-cache" },
                });

                const { data, total, currentPage, totalPages, limit: resLimit } = res.data;

                setAllAssistances(data || []);
                setTotalAllAssistances(total || 0);
                setAllCurrentPage(currentPage || 1);
                setAllTotalPages(totalPages || 1);
                setAllPagination({ totalAssistances: total, totalPages, currentPage });
            } catch (error) {
                console.error("Error fetching assistances:", error);
                const errorMsg = error.response?.data?.message || "Failed to fetch assistances";
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

    // Debounced fetch
    const debouncedFetchAssistances = useCallback(
        (...args) => {
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = setTimeout(() => {
                fetchAssistances(...args);
            }, 300);
        },
        [fetchAssistances],
    );

    const createAssistance = useCallback(
        async (data) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            setIsLoading(true);
            try {
                const res = await axios.post(`${backendURL}/api/v1/Assistance`, data, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
                });

                if (res.data.success) {
                    setAssistances((prev) => [res.data.data, ...prev]);
                    return { success: true };
                } else {
                    const errorMsg = res.data.message || "Create failed";
                    return { success: false, error: errorMsg };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Create failed";
                return { success: false, error: errorMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

    const releaseEarliestAssistance = useCallback(
        async (rfid) => {
            console.log("rfid", rfid);
            if (!authToken) return { success: false, error: "No auth token" };
            if (!rfid) return { success: false, error: "RFID is required" };

            setIsLoading(true);
            try {
                const res = await axios.post(`${backendURL}/api/v1/Assistance/RfidID/${rfid}`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                if (res.data.success) {
                    const historyRecord = res.data.data;
                    setReleasedHistory((prev) => [historyRecord, ...prev]);
                    return { success: true, data: historyRecord };
                } else {
                    const errorMsg = res.data.message || "Failed to release assistance";
                    return { success: false, error: errorMsg };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Failed to release assistance";
                return { success: false, error: errorMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

    const getAssistanceById = useCallback(
        async (id) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            try {
                const res = await axios.get(`${backendURL}/api/v1/Assistance/${id}`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                if (res.data.status === "success") return { success: true, data: res.data.data };
                return { success: false, error: res.data.message || "Failed to fetch assistance" };
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Failed to fetch assistance";
                return { success: false, error: errorMsg };
            }
        },
        [authToken, backendURL],
    );

    // ================= UPDATE ASSISTANCE =================
    const updateAssistance = useCallback(
        async (id, data) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            setIsLoading(true);
            try {
                const res = await axios.patch(`${backendURL}/api/v1/Assistance/${id}`, data, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
                });

                if (res.data.success) {
                    setAssistances((prev) => prev.map((a) => (a._id === id ? res.data.data : a)));
                    return { success: true, data: res.data.data };
                } else {
                    const errorMsg = res.data.message || "Update failed";
                    return { success: false, error: errorMsg };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Update failed";
                return { success: false, error: errorMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

    const deleteAssistance = useCallback(
        async (id) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            setIsLoading(true);
            try {
                const res = await axios.delete(`${backendURL}/api/v1/Assistance/${id}`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                if (res.data.success) {
                    setAssistances((prev) => prev.filter((a) => a._id !== id));
                    return { success: true };
                } else {
                    const errorMsg = res.data.message || "Delete failed";
                    return { success: false, error: errorMsg };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Delete failed";

                return { success: false, error: errorMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

    const generateAssistanceReport = useCallback(
        async ({
            selectedFields = [],
            search = "",
            statusSelection, // Hahayaan nating manggaling sa state (Priority o All)
            municipality = "",
            barangay = "",
            categoryId = "",
            fromDate = "",
            toDate = "",
            reportTitle = "Assistance Program Report",
            includeSummary = true,
            format = "pdf",
        } = {}) => {
            if (!authToken) return { success: false, error: "No auth token" };

            setIsLoading(true);
            try {
                const body = {
                    selectedFields,
                    search,
                    municipality: municipality === "All" ? "" : municipality,
                    barangay: barangay === "All" ? "" : barangay,
                    categoryId: categoryId === "All" ? "" : categoryId,
                    fromDate,
                    toDate,
                    reportTitle,
                    includeSummary,
                    format,
                    statusSelection,
                };

                console.log("Generating report with status:", statusSelection || "None Provided");

                const res = await axios.post(`${backendURL}/api/v1/Assistance/report`, body, {
                    responseType: "blob",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                });

                const fileName = `${reportTitle}.${format === "excel" ? "xlsx" : "pdf"}`;
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                return { success: true };
            } catch (error) {
                console.error("Error generating report:", error);
                return { success: false };
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

    useEffect(() => {
        if (!authToken) return;

        if (prevAuthTokenRef.current === authToken && hasInitialFetchRef.current) return;

        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);

        fetchTimeoutRef.current = setTimeout(() => {
            fetchAssistances(1, 10);
            fetchAllAssistances(1, 10);
            hasInitialFetchRef.current = true;
            prevAuthTokenRef.current = authToken;
        }, 100);

        return () => {
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        };
    }, [authToken, fetchAssistances]);

    const contextValue = useMemo(
        () => ({
            assistances,
            isLoading,
            pagination,
            fetchAssistances,
            debouncedFetchAssistances,
            createAssistance,
            getAssistanceById,
            updateAssistance,
            deleteAssistance,
            TotalAssistances,
            TotalPages,
            CurrentPage,
            Allassistances,
            AllTotalAssistances,
            AllTotalPages,
            AllCurrentPage,
            Allpagination,
            releaseEarliestAssistance,
            fetchAllAssistances,
            SpecificResidentData,
            getResidentByRFID,
            generateAssistanceReport,
        }),

        [
            assistances,
            isLoading,
            pagination,
            fetchAssistances,
            debouncedFetchAssistances,
            createAssistance,
            getAssistanceById,
            updateAssistance,
            deleteAssistance,
            TotalAssistances,
            TotalPages,
            CurrentPage,
            Allassistances,
            AllTotalAssistances,
            AllTotalPages,
            AllCurrentPage,
            Allpagination,
            releaseEarliestAssistance,
            fetchAllAssistances,
            SpecificResidentData,
            getResidentByRFID,
            generateAssistanceReport,
        ],
    );

    return <AssistanceContext.Provider value={contextValue}>{children}</AssistanceContext.Provider>;
};
