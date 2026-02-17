import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

export const CategoryContext = createContext();

export const useCategory = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [TotalCategories, setTotalCategories] = useState(0);
    const [TotalPages, setTotalPages] = useState(0);
    const [CurrentPage, setCurrentPage] = useState(1);

    // Refs for debouncing
    const fetchTimeoutRef = useRef(null);
    const hasInitialFetchRef = useRef(false);
    const prevAuthTokenRef = useRef(null);

    // ================= FETCH CATEGORIES =================
    const fetchCategories = useCallback(async (page = 1, limit = 10, searchTerm = "") => {
        if (!authToken) return;

        try {
            setIsLoading(true);

            const params = {
                page,
                limit,
                ...(searchTerm?.trim() && { search: searchTerm.trim() }),
            };

            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category`, {
                params,
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Cache-Control": "no-cache",
                },
            });

            const { data, totalCategories, totalPages, currentPage } = res.data;

            setCategories(data || []);
            setTotalCategories(totalCategories || 0);
            setTotalPages(totalPages || 1);
            setCurrentPage(currentPage || page);
        } catch (error) {
            console.error("Error fetching categories:", error);
            const errorMsg = error.response?.data?.message || "Failed to fetch categories";
        } finally {
            setIsLoading(false);
        }
    }, [authToken]); 

    // Debounced fetch
    const debouncedFetchCategories = useCallback((page = 1, limit = 10, searchTerm = "") => {
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => {
            fetchCategories(page, limit, searchTerm);
        }, 300);
    }, [fetchCategories]); // Dapat nasa dependencies ang fetchCategories

    // ================= CREATE CATEGORY =================
    const createCategory = useCallback(async (value) => {
        if (!authToken) return { success: false, error: "No authentication token" };

        setIsLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category`, value, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.data.success) {
                setCategories((prev) => [res.data.data, ...prev]);
                setTotalCategories((prev) => prev + 1);
                return { success: true};
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
    }, [authToken]); 

    // ================= GET CATEGORY BY ID =================
    const getCategoryById = useCallback(async (id) => {
        if (!authToken) return { success: false, error: "No authentication token" };

        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category/${id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res.data.success) {
                return { success: true, data: res.data.data };
            } else {
                return { success: false, error: res.data.message || "Failed to fetch category" };
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to fetch category";
            return { success: false, error: errorMsg };
        }
    }, [authToken]);

    // ================= UPDATE CATEGORY =================
    const updateCategory = useCallback(async (id, value) => {
        if (!authToken) return { success: false, error: "No authentication token" };

        setIsLoading(true);
        try {
            const res = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category/${id}`, value, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.data.success) {
                setCategories((prev) => prev.map((c) => (c._id === id ? res.data.data : c)));
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
    }, [authToken]); 

    // ================= DELETE CATEGORY =================
    const deleteCategory = useCallback(async (id) => {
        if (!authToken) return { success: false, error: "No authentication token" };

        setIsLoading(true);
        try {
            const res = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category/${id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (res.data.success) {
                setCategories((prev) => prev.filter((c) => c._id !== id));
                setTotalCategories((prev) => Math.max(0, prev - 1));
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
    }, [authToken]);

    // ================= SET CURRENT PAGE =================
    const handleSetCurrentPage = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // ================= INITIAL FETCH =================
    useEffect(() => {
        if (!authToken) {
            // Reset states kapag walang auth token
            setCategories([]);
            setTotalCategories(0);
            setTotalPages(0);
            setCurrentPage(1);
            hasInitialFetchRef.current = false;
            return;
        }

        if (prevAuthTokenRef.current === authToken && hasInitialFetchRef.current) return;

        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);

        fetchTimeoutRef.current = setTimeout(() => {
            fetchCategories(1, 10);
            hasInitialFetchRef.current = true;
            prevAuthTokenRef.current = authToken;
        }, 100);

        return () => {
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        };
    }, [authToken, fetchCategories]);

    // ================= MEMOIZE CONTEXT =================
    const contextValue = useMemo(
        () => ({
            categories,
            loading: isLoading,
            error: null,
            createCategory,
            updateCategory,
            deleteCategory,
            fetchCategories,
            debouncedFetchCategories,
            getCategoryById,
            TotalCategories,
            TotalPages,
            CurrentPage,
            setCurrentPage: handleSetCurrentPage,
        }),
        [
            categories,
            isLoading,
            createCategory,
            updateCategory,
            deleteCategory,
            fetchCategories,
            debouncedFetchCategories,
            getCategoryById,
            TotalCategories,
            TotalPages,
            CurrentPage,
            handleSetCurrentPage,
        ]
    );

    return <CategoryContext.Provider value={contextValue}>{children}</CategoryContext.Provider>;
};