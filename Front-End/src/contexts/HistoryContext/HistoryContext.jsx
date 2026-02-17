import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

export const HistoryContext = createContext();
export const useHistory = () => useContext(HistoryContext);

export const HistoryProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);
    const [assistances, setAssistances] = useState([]);
    const [assistancesToday, setAssistancesToday] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination state
    const [pagination, setPagination] = useState({
        totalAssistances: 0,
        totalPages: 0,
        currentPage: 1,
    });

    const hasInitialFetchRef = useRef(false);
    const backendURL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    // ================= FETCH HISTORY (DISPLAY ONLY) =================
    const fetchHistory = useCallback(
        async (page = 1, limit = 10, municipality = "", barangay = "", categoryId = "", status = "", search = "") => {
            if (!authToken) return;

            try {
                setIsLoading(true);

                const params = {
                    page,
                    limit,
                    ...(municipality?.trim() && { municipality: municipality.trim() }),
                    ...(barangay?.trim() && { barangay: barangay.trim() }),
                    ...(categoryId?.trim() && { categoryId: categoryId.trim() }),
                    ...(status?.trim() && { status: status.trim() }),
                    ...(search?.trim() && { search: search.trim() }),
                };

                const res = await axios.get(`${backendURL}/api/v1/History`, {
                    params,
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                });

                const { data, total, currentPage, totalPages } = res.data;

                setAssistances(data || []);
                setPagination({
                    totalAssistances: total || 0,
                    totalPages: totalPages || 1,
                    currentPage: currentPage || 1,
                });
            } catch (error) {
                console.error("Error fetching history:", error);
                const errorMsg = error.response?.data?.message || "Failed to fetch history";
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

    const fetchHistoryToday = useCallback(
        async (page = 1, limit = 10, municipality = "", barangay = "", categoryId = "", status = "", search = "") => {
            if (!authToken) return;

            try {
                setIsLoading(true);

                const params = {
                    page,
                    limit,
                    ...(municipality?.trim() && { municipality: municipality.trim() }),
                    ...(barangay?.trim() && { barangay: barangay.trim() }),
                    ...(categoryId?.trim() && { categoryId: categoryId.trim() }),
                    ...(status?.trim() && { status: status.trim() }),
                    ...(search?.trim() && { search: search.trim() }),
                };

                const res = await axios.get(`${backendURL}/api/v1/History/currentDay`, {
                    params,
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                });

                const { data, total, currentPage, totalPages } = res.data;

                setAssistancesToday(data || []);
                setPagination({
                    totalAssistances: total || 0,
                    totalPages: totalPages || 1,
                    currentPage: currentPage || 1,
                });
            } catch (error) {
                console.error("Error fetching history:", error);
                const errorMsg = error.response?.data?.message || "Failed to fetch history";
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

    // ================= INITIAL FETCH =================
    useEffect(() => {
        if (authToken && !hasInitialFetchRef.current) {
            fetchHistory(1, 10);
            fetchHistoryToday(1, 10);
            hasInitialFetchRef.current = true;
        }
    }, [authToken, fetchHistory]);

    // ================= MEMOIZE CONTEXT =================
    const contextValue = useMemo(
        () => ({
            assistances,
            isLoading,
            pagination,
            fetchHistory,
            assistancesToday,
            fetchHistoryToday,
            setAssistancesToday,
        }),
        [assistances, isLoading, pagination, fetchHistory, assistancesToday, fetchHistoryToday, setAssistancesToday],
    );

    return <HistoryContext.Provider value={contextValue}>{children}</HistoryContext.Provider>;
};
