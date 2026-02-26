import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

export const HistoryContext = createContext();
export const useHistory = () => useContext(HistoryContext);

export const HistoryProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);

    // --- State Declarations ---
    const [assistances, setAssistances] = useState([]);
    const [assistancesToday, setAssistancesToday] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null); // Idinagdag para sa catch blocks

    // Pagination para sa History Today
    const [pagination, setPagination] = useState({
        totalAssistances: 0,
        totalPages: 0,
        currentPage: 1,
    });

    // States para sa Beneficiary Assistance (HistoryList / Specific Folder)
    const [benificiaryAssistance, setBenificiaryAssistance] = useState([]); // Listahan ng beneficiaries
    const [loading, setLoading] = useState(false); // Para sa specific beneficiary fetch
    const [totalPagesAssistance, setTotalPagesAssistance] = useState(1);
    const [currentPageAssistance, setCurrentPageAssistance] = useState(1);

    const hasInitialFetchRef = useRef(false);
    const backendURL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    // --- Fetch History (All) ---
    const fetchHistory = useCallback(async () => {
        if (!authToken) return;

        try {
            setIsLoading(true); // Inayos mula sa literal na 'true'
            const res = await axios.get(`${backendURL}/api/v1/History`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}`, "Cache-Control": "no-cache" },
            });

            const { data } = res.data;
            setAssistances(data || []);
            setError(null);
        } catch (error) {
            console.error("Error fetching assistances:", error);
            const errorMsg = error.response?.data?.message || "Failed to fetch assistances";
            setError(errorMsg);
        } finally {
            setIsLoading(false); // Inayos mula sa literal na 'false'
        }
    }, [authToken, backendURL]);

    // --- Fetch History Today (Current Day with Pagination) ---
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
                setError(errorMsg);
            } finally {
                setIsLoading(false);
            }
        },
        [authToken, backendURL],
    );

const fetchBenificiaryAssistance = useCallback(
    async (assistanceId, beneficiaryId = "", page = 1, limit = 10, municipality = "", barangay = "") => {
        if (!assistanceId || !authToken) return;

        try {
            setLoading(true);

            const response = await axios.get(`${backendURL}/api/v1/History/displayBenificiaryAssistance/${assistanceId}`, {
                params: {
                    search: beneficiaryId || undefined,
                    page: Number(page),
                    limit: Number(limit),
                    municipality: municipality || undefined,
                    barangay: barangay || undefined,
                },
                headers: { Authorization: `Bearer ${authToken}` },
                withCredentials: true,
            });

            // I-destructure natin ang response
            const { data, totalPages, currentPages } = response.data;

            setBenificiaryAssistance(data || []);
            setTotalPagesAssistance(totalPages || 1);
            
            // FIX: Gamitin ang 'page' na hiningi mo (parameter) 
            // imbes na 'currentPages' lang mula sa API kung ito ay nagloloko.
            // Pero kung tama ang backend mo, 'currentPages' is fine.
            setCurrentPageAssistance(Number(page)); 

        } catch (error) {
            console.error("Fetch Beneficiary Error:", error);
        } finally {
            setLoading(false);
        }
    },
    [authToken, backendURL] // Siguraduhin na wala ditong state na nagbabago palagi
);

    // ================= INITIAL FETCH =================
    useEffect(() => {
        if (authToken && !hasInitialFetchRef.current) {
            fetchHistory();
            fetchHistoryToday(1, 10);
            hasInitialFetchRef.current = true;
        }
    }, [authToken, fetchHistory, fetchHistoryToday]);

    // ================= MEMOIZE CONTEXT =================
    const contextValue = useMemo(
        () => ({
            assistances,
            isLoading,
            error,
            pagination,
            fetchHistory,
            assistancesToday,
            fetchHistoryToday,
            setAssistancesToday,
            // Beneficiary States & Functions
            benificiaryAssistance,
            loading,
            totalPagesAssistance,
            currentPageAssistance,
            fetchBenificiaryAssistance,
            setBenificiaryAssistance,
        }),
        [
            assistances,
            isLoading,
            error,
            pagination,
            fetchHistory,
            assistancesToday,
            fetchHistoryToday,
            benificiaryAssistance,
            loading,
            totalPagesAssistance,
            currentPageAssistance,
            fetchBenificiaryAssistance,
            setBenificiaryAssistance,
        ],
    );

    return <HistoryContext.Provider value={contextValue}>{children}</HistoryContext.Provider>;
};
