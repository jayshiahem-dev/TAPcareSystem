import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

export const ResidentContext = createContext();

export const useResident = () => useContext(ResidentContext);

export const ResidentProvider = ({ children }) => {
    const { authToken, linkId } = useContext(AuthContext);
    const [BarangayInMunicipality, setBarangayInMunicipality] = useState([]);
    const [residents, setResidents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [TotalResidents, setTotalResidents] = useState(0);
    const [TotalPages, setTotalPages] = useState(0);
    const [CurrentPage, setCurrentPage] = useState(0);
    const [barangays, setBarangays] = useState([]);
    const [specificResident, setSpecificResident] = useState([]);
    const [TotalItems, setTotalItems] = useState(0);
    const [CurrentPageResident, setCurrentPageResident] = useState([]);
    const [TotalPagesResident, setTotalPagesResident] = useState([]);
    const [householdinbarangay, sethouseholdinbarangay] = useState([]);
    const [household, sethousehold] = useState([]);
    const [ContinueResidents, setContinueResidents] = useState([]);
    const [pagination, setPagination] = useState({
        totalResidents: 0,
        totalPages: 0,
        currentPage: 1,
    });

    const [excelLoading, setExcelLoading] = useState(false);
    const [excelInsertedCount, setExcelInsertedCount] = useState(0);
    const [excelSkippedRows, setExcelSkippedRows] = useState([]);

    // Refs para sa debouncing at tracking
    const fetchTimeoutRef = useRef(null);
    const hasInitialFetchRef = useRef(false);
    const prevAuthTokenRef = useRef(null);

    const fetchResidents = async (page = 1, limit = 10, searchTerm = "", municipality = "", barangay = "") => {
        if (!authToken) return;

        try {
            setIsLoading(true);

            const params = {
                page,
                limit,
            };
            if (searchTerm?.trim()) params.search = searchTerm.trim();
            if (municipality?.trim()) params.municipality = municipality.trim();
            if (barangay?.trim()) params.barangay = barangay.trim();

            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident`, {
                params,
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Cache-Control": "no-cache",
                },
            });

            const { data, totalPages, currentPage, totalResidents } = res.data;

            // Update state
            setResidents(data || []);
            setTotalResidents(totalResidents || 0);
            setTotalPages(totalPages || 1);
            setCurrentPage(currentPage || page);
        } catch (error) {
            console.error("Error fetching residents:", error);
            const errorMsg = error.response?.data?.message || "Failed to fetch residents";
        } finally {
            setIsLoading(false);
        }
    };

    const DisplayContinueSelectResidents = async (assistanceId, page = 1, limit = 50, searchTerm = "", municipality = "", barangay = "") => {
        if (!authToken) return;

        try {
            setIsLoading(true);

            const params = {
                page,
                limit,
            };
            if (searchTerm?.trim()) params.search = searchTerm.trim();
            if (municipality?.trim()) params.municipality = municipality.trim();
            if (barangay?.trim()) params.barangay = barangay.trim();

            const res = await axios.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/DisplayContinueSelectResidents/${assistanceId}`,
                {
                    params,
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                },
            );

            const { data, totalPages, currentPage, totalResidents } = res.data;

            // Update state
            setContinueResidents(data || []);
            setTotalResidents(totalResidents || 0);
            setTotalPages(totalPages || 1);
            setCurrentPage(currentPage || page);
        } catch (error) {
            console.error("Error fetching residents:", error);
            const errorMsg = error.response?.data?.message || "Failed to fetch residents";
        } finally {
            setIsLoading(false);
        }
    };

    const fetchbyMunicipality = useCallback(
        async (paramsObj) => {
            console.log("1. Function Entered. Received:", paramsObj);

            const { municipality } = paramsObj;
            if (!municipality) return console.error("Missing municipality name!");
            if (!authToken) return console.error("No Token!");

            try {
                setIsLoading(true);
                console.log("2. Sending request to backend...");

                const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/barangay-names/${municipality}`, {
                    params: { page: 1, limit: 10 },
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                console.log("3. Backend Replied:", res.data);
                setBarangayInMunicipality(res.data);
            } catch (err) {
                console.error("4. Axios Error Details:", err.response || err.message);
            } finally {
                setIsLoading(false);
            }
        },
        [authToken],
    );

    const fetchbybarangayandhousehold = useCallback(
        async ({ search, municipality, barangay, householdId, page = 1, limit = 10 }) => {
            if (!municipality) return console.error("Missing municipality name!");
            if (!authToken) return console.error("No Token!");

            try {
                setIsLoading(true);

                const res = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/display-by-municipality/${municipality}`,
                    {
                        params: {
                            ...(search && { search }),
                            ...(barangay && { barangay }),
                            ...(householdId && { householdId }),
                            page,
                            limit,
                        },
                        withCredentials: true,
                        headers: { Authorization: `Bearer ${authToken}` },
                    },
                );

                console.log("Backend Replied:", res.data);

                sethouseholdinbarangay(res.data.data);
                setTotalItems(res.data.totalItems);
                setCurrentPageResident(res.data.currentPage);
                setTotalPagesResident(res.data.totalPages);
            } catch (err) {
                console.error("Axios Error:", err.response?.data || err.message);
            } finally {
                setIsLoading(false);
            }
        },
        [authToken],
    );

    const GetHouseholdFullDetails = useCallback(
        async (paramsObj) => {
            console.log("1. Function Entered. Received:", paramsObj);

            // I-extract ang mga kailangang values mula sa paramsObj
            const { householdId } = paramsObj;

            if (!householdId) return console.error("Missing householdId!");
            if (!authToken) return console.error("No Token!");

            try {
                setIsLoading(true);
                console.log("2. Sending request to backend...");

                const res = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/GetHouseholdFullDetails/${householdId}`,
                    {
                        withCredentials: true,
                        headers: { Authorization: `Bearer ${authToken}` },
                    },
                );

                console.log("3. Backend Replied:", res.data);

                // Depende sa structure ng state mo, siguraduhin na tamang state ang ina-update
                // Kung listahan ng tao ito, baka "setResidents" ang dapat gamitin
                sethousehold(res.data);
            } catch (err) {
                console.error("4. Axios Error Details:", err.response?.data || err.message);
            } finally {
                setIsLoading(false);
            }
        },
        [authToken], // Siguraduhin na kasama ang authToken dito
    );

    const fetchBarangays = useCallback(
        async (municipality = "") => {
            console.log("Tumatama", fetchBarangays);

            try {
                setIsLoading(true);

                const params = {};
                if (municipality?.trim()) {
                    params.municipality = municipality.trim();
                }

                const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/GetBarangaysByMunicipality`, {
                    params,
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                });

                const { data } = res.data;

                setBarangays(data || []);
            } catch (error) {
                console.error("Error fetching barangays:", error);
                setBarangays([]);
            } finally {
                setIsLoading(false);
            }
        },
        [authToken],
    );

    // Debounced fetch para sa mga rapid changes
    const debouncedFetchResidents = useCallback(
        (...args) => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }

            fetchTimeoutRef.current = setTimeout(() => {
                fetchResidents(...args);
            }, 3000); // 300ms debounce
        },
        [fetchResidents],
    );

    // Other CRUD functions (optimized versions)
    const createResident = useCallback(
        async (formData) => {
            console.log("formData", formData);
            if (!authToken) return { success: false, error: "No authentication token" };

            try {
                const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident`, formData, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                });

                if (res.data.success) {
                    setResidents((prev) => [res.data.data, ...prev]);
                    setPagination((prev) => ({
                        ...prev,
                        totalResidents: prev.totalResidents + 1,
                    }));
                    return { success: true, data: res.data.data };
                } else {
                    const errorMsg = res.data.message || "Create operation failed";
                    return { success: false, error: errorMsg };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Create failed";

                return { success: false, error: errorMsg };
            }
        },
        [authToken],
    );

    const getResidentById = useCallback(
        async (id) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            try {
                const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/${id}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (res.data.success) {
                    return { success: true, data: res.data.data };
                } else {
                    return { success: false, error: res.data.message || "Failed to fetch resident" };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Failed to fetch resident";
                return { success: false, error: errorMsg };
            }
        },
        [authToken],
    );

    const updateResident = useCallback(
        async (id, formData) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            try {
                const res = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/${id}`, formData, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                });

                if (res.data.success) {
                    setResidents((prev) => prev.map((r) => (r._id === id ? res.data.data : r)));
                    return { success: true, data: res.data.data };
                } else {
                    const errorMsg = res.data.message || "Update operation failed";
                    return { success: false, error: errorMsg };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Update failed";

                return { success: false, error: errorMsg };
            }
        },
        [authToken],
    );

    const deleteResident = useCallback(
        async (id) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            try {
                const res = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/${id}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (res.data.success) {
                    setResidents((prev) => prev.filter((r) => r._id !== id));
                    setPagination((prev) => ({
                        ...prev,
                        totalResidents: Math.max(0, prev.totalResidents - 1),
                    }));
                    return { success: true };
                } else {
                    const errorMsg = res.data.message || "Delete operation failed";
                    return { success: false, error: errorMsg };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Delete failed";

                return { success: false, error: errorMsg };
            }
        },
        [authToken],
    );

    const updateResidentRFID = useCallback(
        async (rfid, residentId) => {
            if (!authToken) return { success: false, error: "No authentication token" };

            setIsLoading(true);
            try {
                if (!rfid) {
                    return { success: false, error: "RFID is required" };
                }

                const res = await axios.patch(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/UpdateResidentRFID/${residentId}`,
                    { rfid },
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            "Content-Type": "application/json",
                        },
                    },
                );

                const responseData = res?.data;

                if (responseData?.success && responseData.data) {
                    const { rfid: newRFID, lastUpdated } = responseData.data;

                    setResidents((prev) => prev.map((r) => (r._id === residentId ? { ...r, rfid: newRFID, lastUpdated } : r)));

                    return { success: true, data: responseData.data };
                } else {
                    const errorMsg = responseData?.message || "RFID update operation failed";
                    return { success: false, error: errorMsg };
                }
            } catch (error) {
                const errorMsg = error?.response?.data?.message || error.message || "RFID update failed";
                return { success: false, error: errorMsg };
            } finally {
                setIsLoading(false);
            }
        },
        [authToken],
    );

    const uploadResidentsExcel = useCallback(
        async (file) => {
            if (!file) {
                return { success: false, error: "No file selected" };
            }

            const formData = new FormData();
            formData.append("file", file);

            setExcelLoading(true);
            setExcelInsertedCount(0);
            setExcelSkippedRows([]);

            try {
                const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/upload-excel`, formData, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                });

                if (res.data.success) {
                    setExcelInsertedCount(res.data.inserted || 0);
                    setExcelSkippedRows(res.data.skippedDetails || []);

                    // Auto-update residents list (prepend new inserted data)
                    if (res.data.data?.length) {
                        setResidents((prev) => [...res.data.data, ...prev]);
                        setPagination((prev) => ({
                            ...prev,
                            totalResidents: prev.totalResidents + res.data.inserted,
                        }));
                    }

                    return { success: true, data: res.data.data };
                } else {
                    const errorMsg = res.data.message || "Excel upload failed";
                    return { success: false, error: errorMsg };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || "Excel upload failed";
                return { success: false, error: errorMsg };
            } finally {
                setExcelLoading(false);
            }
        },
        [authToken],
    );

    const getResidentByRFID = useCallback(
        async (rfid) => {
            if (!authToken) return { success: false, error: "No authentication token" };
            if (!rfid) return { success: false, error: "RFID is required" };

            try {
                // Make request to backend
                const res = await axios.post(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Resident/DisplayResidentByRFID/${rfid}`,
                    {}, // empty body
                    {
                        withCredentials: true,
                        headers: { Authorization: `Bearer ${authToken}` },
                    },
                );

                if (res.data.status === "success") {
                    setSpecificResident(res.data.data);
                    return { success: true, data: res.data.data };
                } else {
                    return { success: false, error: res.data.message || "Resident not found" };
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Failed to fetch resident";
                return { success: false, error: errorMsg };
            }
        },
        [authToken],
    );

    // Initial fetch effect - optimized
    useEffect(() => {
        // Exit conditions
        if (!authToken) return;

        // Check if authToken actually changed
        if (prevAuthTokenRef.current === authToken && hasInitialFetchRef.current) {
            return;
        }

        // Clear any existing timeout
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        // Set debounced fetch
        fetchTimeoutRef.current = setTimeout(() => {
            console.log("Fetching residents...");
            fetchResidents(1, 10);
            hasInitialFetchRef.current = true;
            prevAuthTokenRef.current = authToken;
        }, 100);

        // Cleanup
        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [authToken, fetchResidents]);

    // Memoize context value
    const contextValue = useMemo(
        () => ({
            residents,
            isLoading,
            pagination,
            fetchResidents,
            debouncedFetchResidents,
            createResident,
            getResidentById,
            updateResident,
            deleteResident,
            updateResidentRFID,
            TotalResidents,
            TotalPages,
            CurrentPage,
            barangays,
            fetchBarangays,
            specificResident,
            getResidentByRFID,
            excelLoading,
            excelInsertedCount,
            excelSkippedRows,
            uploadResidentsExcel,
            BarangayInMunicipality,
            fetchbyMunicipality,
            householdinbarangay,
            fetchbybarangayandhousehold,
            household,
            GetHouseholdFullDetails,
            TotalItems,
            CurrentPageResident,
            TotalPagesResident,
            sethouseholdinbarangay,
            DisplayContinueSelectResidents,
            ContinueResidents,
        }),
        [
            residents,
            isLoading,
            pagination,
            fetchResidents,
            debouncedFetchResidents,
            createResident,
            getResidentById,
            updateResident,
            deleteResident,
            updateResidentRFID,
            TotalResidents,
            TotalPages,
            CurrentPage,
            barangays,
            fetchBarangays,
            specificResident,
            getResidentByRFID,
            excelLoading,
            excelInsertedCount,
            excelSkippedRows,
            uploadResidentsExcel,
            BarangayInMunicipality,
            fetchbyMunicipality,
            householdinbarangay,
            fetchbybarangayandhousehold,
            household,
            GetHouseholdFullDetails,
            TotalItems,
            CurrentPageResident,
            TotalPagesResident,
            sethouseholdinbarangay,
            DisplayContinueSelectResidents,
            ContinueResidents,
        ],
    );

    return <ResidentContext.Provider value={contextValue}>{children}</ResidentContext.Provider>;
};
