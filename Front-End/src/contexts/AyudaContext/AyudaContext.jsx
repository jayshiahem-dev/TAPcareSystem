import React, { createContext, useState, useCallback, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

export const AyudaContext = createContext();

export const AyudaProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken } = useContext(AuthContext);
    const backendURL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
    const [GroupProgram, setGroupProgram] = useState(null);
    const [BenificiaryAssistance, setBenificiaryAssistance] = useState(null);
    const [TotalPagesAssistance, setTotalPagesAssistance] = useState(0);
    const [CurrentPageAssistance, setCurrentPageAssistance] = useState(1);

    const assignAyuda = useCallback(
        async (assistanceId, residentIds) => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.post(
                    `${backendURL}/api/v1/Ayuda`,
                    {
                        assistanceId,
                        residentIds: Array.isArray(residentIds) ? residentIds : [residentIds],
                    },
                    {
                        withCredentials: true,
                        headers: { Authorization: `Bearer ${authToken}`, "Cache-Control": "no-cache" },
                    },
                );

                if (response.data.success) {
                    console.log("Response:", response.data);
                    return { success: true };
                }
            } catch (err) {
                const errMsg = err.response?.data?.message || "Something went wrong";
                setError(errMsg);

                return { success: false, error: errMsg };
            } finally {
                setLoading(false);
            }
        },
        [authToken, backendURL],
    );

    const fetchGroupProgram = useCallback(async () => {
        if (!authToken) return;

        try {
            setLoading(true);
            const res = await axios.get(`${backendURL}/api/v1/Ayuda/displayGroupedPrograms`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}`, "Cache-Control": "no-cache" },
            });

            const { data } = res.data;
            setGroupProgram(data || []);
        } catch (error) {
            console.error("Error fetching assistances:", error);
            const errorMsg = error.response?.data?.message || "Failed to fetch assistances";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [authToken, backendURL]);

    const fetchBenificiaryAssistance = useCallback(
        async (assistanceId, beneficiaryId = "", page = 1, limit = 10, municipality = "", barangay = "") => {
            if (!assistanceId) return;

            try {
                setLoading(true);

                // Tiyakin na ang page at limit ay Numbers
                const requestedPage = Number(page);
                const requestedLimit = Number(limit);

                const response = await axios.get(`${backendURL}/api/v1/Ayuda/displayBenificiaryAssistance/${assistanceId}`, {
                    params: {
                        search: beneficiaryId || undefined,
                        page: requestedPage,
                        limit: requestedLimit,
                        municipality: municipality || undefined,
                        barangay: barangay || undefined,
                    },
                    withCredentials: true,
                });

                const { data, totalPages, currentPages } = response.data;

                // 1. I-update ang main data array
                setBenificiaryAssistance(data || []);

                // 2. I-update ang total pages (fallback sa 1 kung walang laman)
                setTotalPagesAssistance(Number(totalPages) || 1);

                // 3. IMPORTANT: I-sync ang UI state sa requested page.
                // Ginagamit natin ang 'requestedPage' para instant ang feedback sa UI.
                setCurrentPageAssistance(requestedPage);

                // Debug log gaya ng sa History
                console.log("Ayuda Fetch Success:", {
                    pageRequested: requestedPage,
                    pageReceived: currentPages,
                    total: totalPages,
                    dataLength: data?.length || 0,
                });
            } catch (error) {
                console.error("Fetch Error in AyudaContext:", error);
                // Optional: I-reset ang data kung may error para hindi "stale" ang makita ng user
                // setBenificiaryAssistance([]);
            } finally {
                setLoading(false);
            }
        },
        [backendURL], // Siguraduhin na ang dependencies ay tama
    );

    // Add this inside AyudaProvider
    const deleteAyuda = useCallback(
        async (assistanceId, residentIds) => {
            setLoading(true);
            setError(null);

            if (!authToken) return;

            try {
                const response = await axios.delete(`${backendURL}/api/v1/Ayuda/deleteAyuda`, {
                    data: {
                        assistanceId,
                        residentIds: Array.isArray(residentIds) ? residentIds : [residentIds],
                    },
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}`, "Cache-Control": "no-cache" },
                });

                if (response.data.success) {
                    return { success: true };
                }
            } catch (err) {
                const errMsg = err.response?.data?.message || "Failed to delete Ayuda";
                return { success: false, error: errMsg };
            } finally {
                setLoading(false);
            }
        },
        [authToken, backendURL],
    );

    useEffect(() => {
        fetchGroupProgram();
    }, [fetchGroupProgram]);

    return (
        <AyudaContext.Provider
            value={{
                assignAyuda,
                loading,
                error,
                GroupProgram,
                fetchGroupProgram,
                fetchBenificiaryAssistance,
                BenificiaryAssistance,
                TotalPagesAssistance,
                CurrentPageAssistance,
                setBenificiaryAssistance,
                deleteAyuda,
            }}
        >
            {children}
        </AyudaContext.Provider>
    );
};
