import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

export const DashboardContext = createContext();
export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  const backendURL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

  // ================= STATES =================
  const [totals, setTotals] = useState({
    residents: 0,
    beneficiaries: 0,
    totalPeople: 0,
    assistanceAssign: 0,
    lastMonthAssign: 0,
    assistancePercentage: "0",
    rfidAssigned: 0,
    rfidAssignedPercentage: "0",
  });

  const [municipalityData, setMunicipalityData] = useState([]);
  const [assistanceData, setAssistanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ================= REFS =================
  const fetchTimeoutRef = useRef(null);
  const hasInitialFetchRef = useRef(false);
  const prevAuthTokenRef = useRef(null);

  // ================= FETCH DASHBOARD =================
  const fetchDashboardSummary = useCallback(
    async ({ fromDate = "", toDate = "", status = "" } = {}) => {
      if (!authToken) return;

      setIsLoading(true);
      try {
        const params = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        if (status) params.status = status;

        const res = await axios.get(
          `${backendURL}/api/v1/Analytics/DashboardSummary`,
          {
            params,
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Cache-Control": "no-cache",
            },
          },
        );

        if (res.data.success) {
          setTotals(res.data.totals);
          setMunicipalityData(res.data.municipalityData || []);
          setAssistanceData(res.data.assistanceData || []);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        
      } finally {
        setIsLoading(false);
      }
    },
    [authToken, backendURL],
  );

  // ================= DEBOUNCED FETCH =================
  const debouncedFetchDashboard = useCallback(
    (filters) => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(() => {
        fetchDashboardSummary(filters);
      }, 300);
    },
    [fetchDashboardSummary],
  );

  // ================= INITIAL LOAD =================
  useEffect(() => {
    if (!authToken) return;

    if (
      prevAuthTokenRef.current === authToken &&
      hasInitialFetchRef.current
    )
      return;

    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);

    fetchTimeoutRef.current = setTimeout(() => {
      fetchDashboardSummary();
      hasInitialFetchRef.current = true;
      prevAuthTokenRef.current = authToken;
    }, 100);

    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [authToken, fetchDashboardSummary]);

  // ================= CONTEXT VALUE =================
  const contextValue = useMemo(
    () => ({
      totals,
      municipalityData,
      assistanceData,
      isLoading,
      fetchDashboardSummary,
      debouncedFetchDashboard,
    }),
    [
      totals,
      municipalityData,
      assistanceData,
      isLoading,
      fetchDashboardSummary,
      debouncedFetchDashboard,
    ],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};
