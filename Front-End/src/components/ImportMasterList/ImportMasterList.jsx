import React, { useState, useRef, useEffect, useContext, useCallback, useMemo, Suspense } from "react";
import { Database, Plus, UploadCloud } from "lucide-react";
import { ResidentContext } from "../../contexts/ResidentContext/ResidentContext";
import StatusModal from "../../ReusableFolder/SuccessandField";
import { CategoryContext } from "../../contexts/CategoryContext/categoryContext";

// Lazy load modals
const MainTable = React.lazy(() => import("./Modal/MainTable"));
const ResidentModal = React.lazy(() => import("./Modal/AddResidentModal"));
const UploadModal = React.lazy(() => import("./Modal/UploadModal"));
const ResidentInfoModal = React.lazy(() => import("./Modal/ResidentInfoModal"));
const RFIDModal = React.lazy(() => import("./Modal/RFIDModal"));
const CardModal = React.lazy(() => import("./Modal/CardModal"));

const ImportMasterList = () => {
    const {
        residents,
        pagination,
        isLoading,
        fetchResidents,
        createResident,
        updateResidentRFID,
        deleteResident,
        updateResident,
        TotalResidents,
        TotalPages,
        CurrentPage,
        barangays,
        fetchBarangays,
        uploadResidentsExcel,
    } = useContext(ResidentContext);

    const { categories } = useContext(CategoryContext);
    
    // Refs
    const fetchTimeoutRef = useRef(null);
    const searchDebounceTimeoutRef = useRef(null);
    const isInitialMountRef = useRef(true);
    const prevFetchParamsRef = useRef(null);
    const hasInitialDataRef = useRef(false);
    const initialFetchDoneRef = useRef(false);
    const fileInputRef = useRef(null);
    
    // Pagination refs
    const paginationRef = useRef({
        currentPage: CurrentPage || 1,
        totalPages: TotalPages || 1,
        itemsPerPage: 10,
        isChangingPage: false,
        lastPageChangeTime: 0,
        pendingPageChange: null,
        shouldResetToPage1: false
    });

    // userRef for preventing multiple operations
    const userRef = useRef({
        isProcessing: false,
        pendingOperations: new Set(),
        lastOperationTime: Date.now(),
        barangayFetchInProgress: false,
        lastBarangayFetch: null,
        barangayFetchCache: new Map(),
    });

    // State
    const [state, setState] = useState({
        uiReady: false,
        showMainContent: false,

        searchTerm: "",
        selectedMunicipality: "All",
        selectedBarangay: "All",
        itemsPerPage: 10,
        filteredBarangays: ["All"],

        // Modals
        showAddResidentModal: false,
        showUploadModal: false,
        showResidentInfoModal: false,
        rfidAssignModal: false,
        showCardModal: false,
        showStatusModal: false,

        // File & Upload
        file: null,
        isDragging: false,
        uploadStatus: "idle",
        selectedResident: null,
        rfidNumber: "",
        rfidModalType: "assign",
        cardResident: null,
        cardType: "standard",
        printOrientation: "portrait",
        theme: "light",

        // Form - UPDATED PARA SA BENEFICIARY SCHEMA (INALIS ANG TYPE FIELD)
        newResident: {
            household_id: "",
            firstname: "",
            lastname: "",
            middlename: "",
            suffix: "None",
            relationship: "", // UPDATED: from role to relationship
            gender: "Male",
            religion: "",
            civil_status: "Single",
            birth_date: "",
            birth_place: "",
            contact_number: "",
            employment_status: "",
            classifications: [],
            address: "",
            barangay: "",
            sitio: "",
            municipality: "",
            occupation: "",
            age: "",
            educational_status: "",
            educational_year: "",
            course: "",
            school: "",
            rfid: null,
            status: "Active"
        },

        statusModalProps: {
            status: "success",
            error: null,
            title: "",
            message: "",
            onRetry: null,
            isRFIDAssignment: false,
        },

        // Modal loading states
        modalLoading: {
            addResident: false,
            upload: false,
            rfid: false,
            delete: false,
        },
    });

    const updateState = useCallback((updates) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    // Update pagination ref when context changes
    useEffect(() => {
        paginationRef.current = {
            ...paginationRef.current,
            currentPage: CurrentPage || 1,
            totalPages: TotalPages || 1,
            itemsPerPage: state.itemsPerPage
        };
    }, [CurrentPage, TotalPages, state.itemsPerPage]);

    // Constants - UPDATED: Removed roleOptions, added relationshipOptions at inalis ang typeOptions
    const municipalityOptions = useMemo(() => ["All", "Naval", "Cabucgayan", "Caibiran", "Kawayan", "Almeria", "Culaba", "Maripipi", "Biliran"], []);
    const genderOptions = useMemo(() => ["Male", "Female"], []);
    const civilStatusOptions = useMemo(() => ["Single", "Married", "Widowed", "Separated"], []);
    const employmentStatusOptions = useMemo(() => ["Employed", "Self-Employed", "Unemployed", "Student", "Retired"], []);
    const relationshipOptions = useMemo(() => ["Head", "Spouse", "Child", "Parent", "Sibling", "Grandchild", "Other Relative", "Non-relative"], []);
    const statusOptions = useMemo(() => ["Active", "Inactive"], []);
    const classificationOptions = useMemo(() => ["PWD", "Solo Parent", "Student", "Senior Citizen", "Indigent", "OFW", "Unemployed"], []);

    // Status message helper
    const showStatusMessage = useCallback(
        (status, error = null, customProps = {}) => {
            updateState({
                showStatusModal: true,
                statusModalProps: {
                    status,
                    error,
                    title: customProps.title || "",
                    message: customProps.message || "",
                    onRetry: customProps.onRetry || null,
                    isRFIDAssignment: customProps.isRFIDAssignment || false,
                },
            });
        },
        [updateState],
    );

    // Theme setup
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        const isDark = savedTheme === "dark";
        updateState({ theme: savedTheme, uiReady: true });
        if (isDark) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
    }, [updateState]);

    // Initial fetch
    useEffect(() => {
        if (isInitialMountRef.current && state.uiReady) {
            isInitialMountRef.current = false;
            const fetchTimer = setTimeout(() => {
                handleFetchData({ page: paginationRef.current.currentPage, limit: state.itemsPerPage }, true);
            }, 100);
            return () => clearTimeout(fetchTimer);
        }
    }, [state.uiReady, state.itemsPerPage]);

    // Show content after initial load
    useEffect(() => {
        if (initialFetchDoneRef.current && !isLoading) {
            updateState({ showMainContent: true });
        }
    }, [isLoading, updateState]);

    // Fetch barangays when municipality changes
    useEffect(() => {
        const fetchBarangaysSafely = async () => {
            const municipality = state.selectedMunicipality;

            if (!municipality || municipality === "All" || !fetchBarangays) {
                return;
            }

            if (userRef.current.barangayFetchInProgress) {
                console.log("Barangay fetch already in progress, skipping");
                return;
            }

            const cacheKey = municipality;
            const now = Date.now();
            const timeSinceLastFetch = now - (userRef.current.lastBarangayFetch || 0);

            if (userRef.current.lastBarangayFetch === cacheKey && timeSinceLastFetch < 1000) {
                console.log(`Skipping duplicate barangay fetch for ${municipality} (fetched ${timeSinceLastFetch}ms ago)`);
                return;
            }

            if (userRef.current.barangayFetchCache.has(cacheKey)) {
                console.log(`Using cached barangays for ${municipality}`);
                const cachedBarangays = userRef.current.barangayFetchCache.get(cacheKey);

                const barangayNames = cachedBarangays.map((barangay) => {
                    return barangay.barangayName || barangay.name || barangay.barangay || barangay;
                });

                const uniqueBarangays = [...new Set(barangayNames)].sort();
                updateState({ filteredBarangays: ["All", ...uniqueBarangays] });
                return;
            }

            console.log("Fetching barangays for municipality:", municipality);

            userRef.current.barangayFetchInProgress = true;
            userRef.current.lastBarangayFetch = cacheKey;

            try {
                await fetchBarangays(municipality);

                if (barangays && Array.isArray(barangays) && barangays.length > 0) {
                    userRef.current.barangayFetchCache.set(cacheKey, [...barangays]);
                }
            } catch (error) {
                console.error("Error fetching barangays:", error);
                showStatusMessage("failed", `Failed to fetch barangays for ${municipality}: ${error.message}`, {
                    title: "Barangay Fetch Error",
                });
            } finally {
                setTimeout(() => {
                    userRef.current.barangayFetchInProgress = false;
                }, 500);
            }
        };

        fetchBarangaysSafely();
    }, [state.selectedMunicipality, fetchBarangays, barangays, updateState, showStatusMessage]);

    // Update filteredBarangays from fetched barangays
    useEffect(() => {
        const updateBarangaysDebounced = () => {
            if (barangays && Array.isArray(barangays) && barangays.length > 0) {
                console.log("Updating barangay dropdown from fetched data:", barangays);

                const barangayNames = barangays.map((barangay) => {
                    return barangay.barangayName || barangay.name || barangay.barangay || barangay;
                });

                const uniqueBarangays = [...new Set(barangayNames)].sort();

                updateState({ filteredBarangays: ["All", ...uniqueBarangays] });
            } else if (state.selectedMunicipality === "All") {
                updateState({ filteredBarangays: ["All"] });
            }
        };

        const timeoutId = setTimeout(updateBarangaysDebounced, 100);
        return () => clearTimeout(timeoutId);
    }, [barangays, state.selectedMunicipality, updateState]);

    // ============ handleFetchData FUNCTION ============
    const handleFetchData = useCallback(
        async (params = {}, isInitialFetch = false) => {
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);

            fetchTimeoutRef.current = setTimeout(async () => {
                let page = params.page;
                
                if (page === undefined && paginationRef.current.shouldResetToPage1) {
                    page = 1;
                    paginationRef.current.shouldResetToPage1 = false;
                }
                
                page = page ?? paginationRef.current.currentPage ?? 1;
                const limit = params.limit ?? paginationRef.current.itemsPerPage ?? state.itemsPerPage;
                const search = params.search?.trim() ?? state.searchTerm?.trim() ?? "";
                const municipality =
                    params.municipality && params.municipality !== "All"
                        ? params.municipality
                        : state.selectedMunicipality !== "All"
                          ? state.selectedMunicipality
                          : "";
                const barangay =
                    params.barangay && params.barangay !== "All" ? params.barangay : state.selectedBarangay !== "All" ? state.selectedBarangay : "";

                const cacheKey = { page, limit, search, municipality, barangay };
                const paramsKey = JSON.stringify(cacheKey);

                if (prevFetchParamsRef.current === paramsKey && hasInitialDataRef.current) {
                    console.log("Skipping fetch - same parameters");
                    return;
                }

                prevFetchParamsRef.current = paramsKey;

                paginationRef.current = {
                    ...paginationRef.current,
                    currentPage: page,
                    itemsPerPage: limit
                };

                try {
                    await fetchResidents(page, limit, search, municipality, barangay);

                    if (isInitialFetch) initialFetchDoneRef.current = true;
                    hasInitialDataRef.current = true;
                } catch (error) {
                    showStatusMessage("failed", error.message || "Failed to fetch residents.", {
                        title: "Fetch Error",
                        onRetry: () => handleFetchData(params, isInitialFetch),
                    });
                }
            }, 200);
        },
        [state.itemsPerPage, state.searchTerm, state.selectedMunicipality, state.selectedBarangay, fetchResidents, showStatusMessage],
    );

    // Auto-hide success modal
    useEffect(() => {
        if (state.showStatusModal && state.statusModalProps.status === "success") {
            const timer = setTimeout(() => {
                updateState({ showStatusModal: false });
                if (state.statusModalProps.isRFIDAssignment && state.rfidAssignModal) {
                    updateState({ rfidAssignModal: false, selectedResident: null, rfidNumber: "" });
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state.showStatusModal, state.statusModalProps, state.rfidAssignModal, updateState]);

    // File validation helper
    const validateAndSetFile = useCallback(
        (file) => {
            const validExtensions = ['.xlsx', '.xls', '.csv'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (file && validExtensions.includes(fileExtension)) {
                updateState({ 
                    file, 
                    uploadStatus: "idle"
                });
                
                showStatusMessage("success", null, {
                    title: "File Selected",
                    message: `${file.name} is ready for upload.`,
                });
            } else {
                showStatusMessage("failed", "Please upload Excel (.xlsx, .xls) or CSV file only.", {
                    title: "Invalid File",
                });
            }
        },
        [showStatusMessage, updateState],
    );

    // Upload handler
    const handleUpload = useCallback(async () => {
        if (userRef.current.isProcessing) {
            console.log("Another operation is in progress, skipping upload");
            return;
        }

        if (!state.file) {
            showStatusMessage("failed", "No file selected", {
                title: "Upload Error",
            });
            return;
        }

        const operationKey = `upload_${Date.now()}`;
        userRef.current.isProcessing = true;
        userRef.current.pendingOperations.add(operationKey);
        updateState({ 
            uploadStatus: "uploading",
            modalLoading: { ...state.modalLoading, upload: true }
        });

        try {
            const result = await uploadResidentsExcel(state.file);

            if (result.success) {
                updateState({ uploadStatus: "success" });

                showStatusMessage("success", null, {
                    title: "Upload Successful",
                    message: result.message || "File uploaded successfully",
                });

                setTimeout(() => {
                    updateState({
                        showUploadModal: false,
                        file: null,
                        uploadStatus: "idle",
                        modalLoading: { ...state.modalLoading, upload: false }
                    });

                    handleFetchData({ page: paginationRef.current.currentPage || 1 });
                }, 1500);
            } else {
                updateState({ 
                    uploadStatus: "error",
                    modalLoading: { ...state.modalLoading, upload: false }
                });

                showStatusMessage("error", null, {
                    title: "Upload Failed",
                    message: result.error || "Upload failed. Please try again.",
                });
            }
        } catch (err) {
            console.error("Upload error:", err);
            updateState({ 
                uploadStatus: "error",
                modalLoading: { ...state.modalLoading, upload: false }
            });

            showStatusMessage("error", null, {
                title: "Upload Failed",
                message: err.message || "Unexpected error during upload",
            });
        } finally {
            setTimeout(() => {
                userRef.current.isProcessing = false;
                userRef.current.pendingOperations.delete(operationKey);
            }, 500);
        }
    }, [state.file, state.modalLoading, uploadResidentsExcel, updateState, showStatusMessage, handleFetchData]);

    // File handlers
    const handleDragOver = useCallback(
        (e) => {
            e.preventDefault();
            updateState({ isDragging: true });
        },
        [updateState],
    );

    const handleDragLeave = useCallback(() => {
        updateState({ isDragging: false });
    }, [updateState]);

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            updateState({ isDragging: false });
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                validateAndSetFile(files[0]);
            }
        },
        [updateState, validateAndSetFile],
    );

    const handleFileChange = useCallback((e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndSetFile(files[0]);
        }
    }, [validateAndSetFile]);

    // Form validation helper - UPDATED: Inalis ang validation para sa type field
    const validateResidentForm = useCallback(() => {
        const errors = [];
        const resident = state.newResident;

        // REQUIRED FIELDS (INALIS ANG TYPE)
        if (!resident.household_id || resident.household_id.trim() === "") {
            errors.push("Household ID is required");
        }
        
        if (!resident.firstname || resident.firstname.trim() === "") {
            errors.push("First name is required");
        }
        
        if (!resident.lastname || resident.lastname.trim() === "") {
            errors.push("Last name is required");
        }
        
        if (!resident.relationship || resident.relationship.trim() === "") {
            errors.push("Relationship to Head is required");
        }
        
        if (!resident.gender || resident.gender.trim() === "") {
            errors.push("Gender is required");
        }

        if (errors.length > 0) {
            showStatusMessage("failed", errors.join(". "), {
                title: "Validation Error",
            });
            return false;
        }

        return true;
    }, [state.newResident, showStatusMessage]);

    // Handle relationship change (INALIS ANG handleTypeChange)
    const handleRelationshipChange = useCallback((value) => {
        setState(prev => ({
            ...prev,
            newResident: { ...prev.newResident, relationship: value }
        }));
    }, []);

    // Add resident handler - UPDATED: Inalis ang type field
    const handleAddResident = useCallback(async () => {
        if (userRef.current.isProcessing) {
            console.log("Another operation is in progress, skipping add resident");
            return;
        }

        const operationKey = `add_resident_${Date.now()}`;
        userRef.current.isProcessing = true;
        userRef.current.pendingOperations.add(operationKey);
        updateState({ modalLoading: { ...state.modalLoading, addResident: true } });

        // Validate form
        if (!validateResidentForm()) {
            userRef.current.isProcessing = false;
            userRef.current.pendingOperations.delete(operationKey);
            updateState({ modalLoading: { ...state.modalLoading, addResident: false } });
            return;
        }

        // Format birth_date to ISO string
        const formatBirthDate = (dateString) => {
            if (!dateString) return "";
            try {
                if (dateString.includes('T')) {
                    return dateString;
                }
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    const parts = dateString.split('-');
                    if (parts.length === 3) {
                        const year = parseInt(parts[0]);
                        const month = parseInt(parts[1]) - 1;
                        const day = parseInt(parts[2]);
                        const newDate = new Date(year, month, day);
                        if (!isNaN(newDate.getTime())) {
                            return newDate.toISOString();
                        }
                    }
                    return dateString;
                }
                return date.toISOString();
            } catch {
                return dateString;
            }
        };

        // Create resident data with all fields (INALIS ANG TYPE FIELD)
        const newResidentData = {
            household_id: state.newResident.household_id.trim(),
            firstname: state.newResident.firstname.trim(),
            lastname: state.newResident.lastname.trim(),
            middlename: state.newResident.middlename ? state.newResident.middlename.trim() : "",
            suffix: state.newResident.suffix || "None",
            relationship: state.newResident.relationship,
            gender: state.newResident.gender,
            religion: state.newResident.religion ? state.newResident.religion.trim() : "",
            age: state.newResident.age ? parseInt(state.newResident.age) : 0,
            birth_date: state.newResident.birth_date ? formatBirthDate(state.newResident.birth_date) : "",
            birth_place: state.newResident.birth_place ? state.newResident.birth_place.trim() : "",
            contact_number: state.newResident.contact_number ? state.newResident.contact_number.trim() : "",
            educational_status: state.newResident.educational_status ? state.newResident.educational_status.trim() : "",
            educational_year: state.newResident.educational_year ? state.newResident.educational_year.trim() : "",
            course: state.newResident.course ? state.newResident.course.trim() : "",
            school: state.newResident.school ? state.newResident.school.trim() : "",
            rfid: null,
            status: "Active",
            
            // Optional fields
            civil_status: state.newResident.civil_status || "Single",
            employment_status: state.newResident.employment_status || "",
            classifications: state.newResident.classifications || [],
            address: state.newResident.address ? state.newResident.address.trim() : "",
            barangay: state.newResident.barangay ? state.newResident.barangay.trim() : "",
            sitio: state.newResident.sitio ? state.newResident.sitio.trim() : "",
            municipality: state.newResident.municipality ? state.newResident.municipality.trim() : "",
            occupation: state.newResident.occupation ? state.newResident.occupation.trim() : ""
        };

        console.log("Submitting resident data:", newResidentData);

        try {
            const result = await createResident(newResidentData);
            if (result.success) {
                const fullName = `${state.newResident.firstname} ${state.newResident.middlename ? state.newResident.middlename + ' ' : ''}${state.newResident.lastname}`;
                
                showStatusMessage("success", null, {
                    title: "Resident Added",
                    message: `${fullName} has been successfully added.`,
                });
                
                // Reset form (INALIS ANG TYPE FIELD)
                updateState({
                    newResident: {
                        household_id: "",
                        firstname: "",
                        lastname: "",
                        middlename: "",
                        suffix: "None",
                        relationship: "",
                        gender: "Male",
                        religion: "",
                        civil_status: "Single",
                        birth_date: "",
                        birth_place: "",
                        contact_number: "",
                        employment_status: "",
                        classifications: [],
                        address: "",
                        barangay: "",
                        sitio: "",
                        municipality: "",
                        occupation: "",
                        age: "",
                        educational_status: "",
                        educational_year: "",
                        course: "",
                        school: "",
                        rfid: null,
                        status: "Active"
                    },
                    showAddResidentModal: false,
                });
                
                handleFetchData({ page: paginationRef.current.currentPage || 1 });
            } else {
                showStatusMessage("failed", result.message || "Failed to add resident. Please try again.", {
                    title: "Add Resident Failed",
                    onRetry: handleAddResident,
                });
            }
        } catch (error) {
            console.error("Add resident error:", error);
            showStatusMessage("failed", error.message || "An error occurred while adding resident.", {
                title: "Add Resident Error",
                onRetry: handleAddResident,
            });
        } finally {
            setTimeout(() => {
                userRef.current.isProcessing = false;
                userRef.current.pendingOperations.delete(operationKey);
                updateState({ modalLoading: { ...state.modalLoading, addResident: false } });
            }, 500);
        }
    }, [state.newResident, state.modalLoading, createResident, showStatusMessage, handleFetchData, updateState, validateResidentForm]);

    // Update resident handler
    const handleUpdateResident = useCallback(
        async (updatedResident) => {
            if (userRef.current.isProcessing) {
                console.log("Another operation is in progress, skipping update");
                return;
            }

            const operationKey = `update_${updatedResident._id}`;
            userRef.current.isProcessing = true;
            userRef.current.pendingOperations.add(operationKey);

            try {
                const result = await updateResident(updatedResident._id, updatedResident);
                if (result.success) {
                    const fullName = `${updatedResident.firstname} ${updatedResident.middlename ? updatedResident.middlename + ' ' : ''}${updatedResident.lastname}`;
                    
                    showStatusMessage("success", null, {
                        title: "Resident Updated",
                        message: `${fullName} has been successfully updated.`,
                    });
                    handleFetchData({ page: paginationRef.current.currentPage || 1 });
                } else {
                    showStatusMessage("failed", result.message || "Failed to update resident.", {
                        title: "Update Failed",
                        onRetry: () => handleUpdateResident(updatedResident),
                    });
                }
            } catch (error) {
                showStatusMessage("failed", error.message || "An error occurred while updating resident.", {
                    title: "Update Error",
                    onRetry: () => handleUpdateResident(updatedResident),
                });
            } finally {
                setTimeout(() => {
                    userRef.current.isProcessing = false;
                    userRef.current.pendingOperations.delete(operationKey);
                }, 500);
            }
        },
        [updateResident, showStatusMessage, handleFetchData],
    );

    // Delete resident handler
    const handleDeleteResident = useCallback(
        async (residentId, residentName = "Resident") => {
            if (userRef.current.isProcessing) {
                console.log("Another operation is in progress, skipping delete");
                return;
            }

            const operationKey = `delete_${residentId}`;
            if (userRef.current.pendingOperations.has(operationKey)) {
                console.log("Delete operation already pending, skipping");
                return;
            }

            userRef.current.isProcessing = true;
            userRef.current.pendingOperations.add(operationKey);
            userRef.current.lastOperationTime = Date.now();

            updateState({ modalLoading: { ...state.modalLoading, delete: true } });

            try {
                const result = await deleteResident(residentId);
                if (result.success) {
                    showStatusMessage("success", null, {
                        title: "Resident Deleted",
                        message: `${residentName} has been successfully deleted.`,
                    });
                    handleFetchData({ page: paginationRef.current.currentPage || 1 });
                } else {
                    showStatusMessage("failed", result.message || "Failed to delete resident. Please try again.", {
                        title: "Delete Failed",
                        onRetry: () => handleDeleteResident(residentId, residentName),
                    });
                }
            } catch (error) {
                showStatusMessage("failed", error.message || "An error occurred while deleting resident.", {
                    title: "Delete Error",
                    onRetry: () => handleDeleteResident(residentId, residentName),
                });
            } finally {
                setTimeout(() => {
                    userRef.current.isProcessing = false;
                    userRef.current.pendingOperations.delete(operationKey);
                    updateState({ modalLoading: { ...state.modalLoading, delete: false } });
                }, 500);
            }
        },
        [deleteResident, showStatusMessage, handleFetchData, state.modalLoading, updateState],
    );

    // Search handler with debounce
    const handleSearchChange = useCallback(
        (value) => {
            updateState({ searchTerm: value });
            
            if (searchDebounceTimeoutRef.current) {
                clearTimeout(searchDebounceTimeoutRef.current);
            }
            
            searchDebounceTimeoutRef.current = setTimeout(() => {
                if (value.trim() !== state.searchTerm.trim()) {
                    paginationRef.current.shouldResetToPage1 = true;
                }
                handleFetchData({ 
                    search: value.trim() !== "" ? value : undefined
                });
            }, 500);
        },
        [handleFetchData, updateState, state.searchTerm],
    );

    // Municipality change handler
    const handleMunicipalityChange = useCallback(
        (value) => {
            console.log("Municipality changed to:", value);

            updateState({
                selectedMunicipality: value,
                selectedBarangay: "All",
            });

            if (value === "All") {
                userRef.current.barangayFetchCache.clear();
                updateState({ filteredBarangays: ["All"] });
            }

            if (value !== "All" && fetchBarangays) {
                console.log("Fetching barangays for municipality:", value);

                if (fetchTimeoutRef.current) {
                    clearTimeout(fetchTimeoutRef.current);
                    fetchTimeoutRef.current = null;
                }

                fetchTimeoutRef.current = setTimeout(() => {
                    if (fetchBarangays) {
                        fetchBarangays(value);
                    }
                }, 300);
            }

            paginationRef.current.shouldResetToPage1 = true;
            
            handleFetchData({
                municipality: value !== "All" ? value : undefined,
                barangay: undefined,
            });
        },
        [handleFetchData, updateState, fetchBarangays],
    );

    // Barangay change handler
    const handleBarangayChange = useCallback(
        (value) => {
            updateState({ selectedBarangay: value });
            paginationRef.current.shouldResetToPage1 = true;
            handleFetchData({
                barangay: value !== "All" ? value : undefined,
            });
        },
        [handleFetchData, updateState],
    );

    // Pagination handler
    const handlePageChange = useCallback(
        (page) => {
            const now = Date.now();
            if (paginationRef.current.isChangingPage && (now - paginationRef.current.lastPageChangeTime < 300)) {
                console.log("Page change too fast, skipping");
                return;
            }

            if (page === paginationRef.current.currentPage) {
                console.log("Already on page", page);
                return;
            }

            if (page < 1 || page > paginationRef.current.totalPages) {
                console.log("Invalid page number:", page);
                return;
            }

            paginationRef.current = {
                ...paginationRef.current,
                isChangingPage: true,
                lastPageChangeTime: now,
                pendingPageChange: page,
                shouldResetToPage1: false
            };

            handleFetchData({ page });
        },
        [handleFetchData],
    );

    // Items per page change handler
    const handleItemsPerPageChange = useCallback(
        (value) => {
            const newLimit = parseInt(value);
            updateState({ itemsPerPage: newLimit });
            
            paginationRef.current = {
                ...paginationRef.current,
                itemsPerPage: newLimit,
                shouldResetToPage1: true
            };
            
            handleFetchData({ limit: newLimit });
        },
        [handleFetchData, updateState],
    );

    // Clear handlers
    const handleClearSearch = useCallback(() => {
        updateState({ searchTerm: "" });
        paginationRef.current.shouldResetToPage1 = true;
        handleFetchData({ search: undefined });
    }, [handleFetchData, updateState]);

    const handleClearMunicipality = useCallback(() => {
        updateState({ selectedMunicipality: "All", selectedBarangay: "All" });
        userRef.current.barangayFetchCache.clear();
        paginationRef.current.shouldResetToPage1 = true;
        handleFetchData({ municipality: undefined, barangay: undefined });
    }, [handleFetchData, updateState]);

    const handleClearBarangay = useCallback(() => {
        updateState({ selectedBarangay: "All" });
        paginationRef.current.shouldResetToPage1 = true;
        handleFetchData({ barangay: undefined });
    }, [handleFetchData, updateState]);

    // Reset pagination loading state after fetch completes
    useEffect(() => {
        if (!isLoading && paginationRef.current.isChangingPage) {
            setTimeout(() => {
                paginationRef.current = {
                    ...paginationRef.current,
                    isChangingPage: false,
                    pendingPageChange: null
                };
            }, 100);
        }
    }, [isLoading]);

    // View resident info handler
    const handleViewResidentInfo = useCallback(
        (resident) => {
            if (!resident) {
                console.error("No resident provided");
                showStatusMessage("failed", "No resident information available.", {
                    title: "View Error",
                });
                return;
            }
            updateState({ selectedResident: resident, showResidentInfoModal: true });
        },
        [updateState, showStatusMessage],
    );

    // Assign RFID handler
    const handleAssignRFID = useCallback(
        (resident) => {
            if (!resident) {
                console.error("No resident provided");
                showStatusMessage("failed", "No resident selected for RFID assignment.", {
                    title: "RFID Error",
                });
                return;
            }
            updateState({
                selectedResident: resident,
                rfidModalType: resident.rfid ? "info" : "assign",
                rfidNumber: resident.rfid || "",
                rfidAssignModal: true,
            });
        },
        [updateState, showStatusMessage],
    );

    // Save RFID assignment handler
    const saveRFIDAssignment = useCallback(async () => {
        if (userRef.current.isProcessing) {
            console.log("Another operation is in progress, skipping RFID assignment");
            return;
        }

        const operationKey = `rfid_assign_${state.selectedResident?._id}`;
        userRef.current.isProcessing = true;
        userRef.current.pendingOperations.add(operationKey);
        updateState({ modalLoading: { ...state.modalLoading, rfid: true } });

        if (!state.rfidNumber.trim()) {
            showStatusMessage("failed", "Please enter RFID number!", {
                title: "RFID Assignment Failed",
                isRFIDAssignment: true,
            });
            userRef.current.isProcessing = false;
            userRef.current.pendingOperations.delete(operationKey);
            updateState({ modalLoading: { ...state.modalLoading, rfid: false } });
            return;
        }

        try {
            const result = await updateResidentRFID(state.rfidNumber, state.selectedResident._id);
            if (result.success) {
                const fullName = `${state.selectedResident.firstname} ${state.selectedResident.middlename ? state.selectedResident.middlename + ' ' : ''}${state.selectedResident.lastname}`;
                
                showStatusMessage("success", null, {
                    title: "RFID Assigned Successfully",
                    message: `RFID ${state.rfidNumber} has been assigned to ${fullName}`,
                    isRFIDAssignment: true,
                });
                handleFetchData({ page: paginationRef.current.currentPage || 1 });
            } else {
                showStatusMessage("failed", result.message || "Failed to assign RFID. Please try again.", {
                    title: "RFID Assignment Failed",
                    isRFIDAssignment: true,
                    onRetry: saveRFIDAssignment,
                });
            }
        } catch (error) {
            showStatusMessage("failed", error.message || "An error occurred while assigning RFID.", {
                title: "RFID Assignment Error",
                isRFIDAssignment: true,
                onRetry: saveRFIDAssignment,
            });
        } finally {
            setTimeout(() => {
                userRef.current.isProcessing = false;
                userRef.current.pendingOperations.delete(operationKey);
                updateState({ modalLoading: { ...state.modalLoading, rfid: false } });
            }, 500);
        }
    }, [state.rfidNumber, state.selectedResident, state.modalLoading, updateResidentRFID, showStatusMessage, handleFetchData, updateState]);

    // Generate card handler
    const handleGenerateCard = useCallback(
        (resident) => {
            if (!resident) {
                showStatusMessage("failed", "No resident selected for card generation.", {
                    title: "Card Generation Error",
                });
                return;
            }
            updateState({ cardResident: resident, showCardModal: true });
        },
        [updateState, showStatusMessage],
    );

    // Print card handler
    const handlePrintCard = useCallback(() => {
        if (Date.now() - userRef.current.lastOperationTime < 1000) {
            console.log("Print operation too frequent, skipping");
            return;
        }

        userRef.current.lastOperationTime = Date.now();

        const printContent = document.getElementById("card-to-print");
        if (!printContent) {
            showStatusMessage("failed", "No card content found to print.");
            return;
        }

        try {
            const printWindow = window.open("", "_blank");
            printWindow.document.write(
                `<html><head><title>Print Resident Card</title></head><body>${printContent.innerHTML}<script>window.onload=function(){window.print();setTimeout(()=>window.close(),500);}</script></body></html>`,
            );
            printWindow.document.close();
            showStatusMessage("success", null, {
                title: "Card Printed",
                message: "Resident card has been sent to printer.",
            });
        } catch (error) {
            showStatusMessage("failed", error.message || "Failed to print card.", {
                title: "Print Error",
            });
        }
    }, [showStatusMessage]);

    // Download card handler
    const handleDownloadCard = useCallback(() => {
        if (Date.now() - userRef.current.lastOperationTime < 1000) {
            console.log("Download operation too frequent, skipping");
            return;
        }

        userRef.current.lastOperationTime = Date.now();

        try {
            showStatusMessage("success", null, {
                title: "Card Downloaded",
                message: "Resident card has been downloaded successfully.",
            });
        } catch (error) {
            showStatusMessage("failed", error.message || "Failed to download card.", {
                title: "Download Error",
            });
        }
    }, [showStatusMessage]);

    // Status color helper
    const getStatusColor = useCallback(
        (status) => {
            switch (status) {
                case "Active":
                    return state.theme === "dark" ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700";
                case "Inactive":
                    return state.theme === "dark" ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700";
                case "Deceased":
                    return state.theme === "dark" ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700";
                default:
                    return state.theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-700";
            }
        },
        [state.theme],
    );

    // Status modal close handler
    const handleStatusModalClose = useCallback(() => {
        updateState({ showStatusModal: false });
    }, [updateState]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
            if (searchDebounceTimeoutRef.current) clearTimeout(searchDebounceTimeoutRef.current);
        };
    }, []);

    // Loading states
    if (!state.uiReady) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing application...</p>
                </div>
            </div>
        );
    }

    if (!state.showMainContent) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <div className="mb-2 h-10 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-4 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="mb-6 flex items-center justify-end gap-3">
                        <div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex flex-wrap gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-10 w-48 animate-pulse rounded bg-gray-100 dark:bg-gray-700"
                                ></div>
                            ))}
                        </div>
                        <div className="mb-4 flex h-12 items-center border-b border-gray-200 dark:border-gray-700">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="ml-4 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                                ></div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex h-12 items-center"
                                >
                                    {[...Array(6)].map((_, j) => (
                                        <div
                                            key={j}
                                            className="ml-4 h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-700"
                                        ></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-8 w-8 animate-pulse rounded bg-gray-100 dark:bg-gray-700"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans transition-colors duration-300 dark:bg-gray-900 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white md:text-3xl">
                            <Database className="text-orange-600 dark:text-orange-400" />
                            Municipal MasterList Management
                        </h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Manage the municipality's resident list.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => updateState({ showAddResidentModal: true })}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                            <Plus size={18} /> Add Resident
                        </button>
                        <button
                            onClick={() => updateState({ showUploadModal: true })}
                            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600"
                        >
                            <UploadCloud size={18} /> Upload Excel
                        </button>
                    </div>
                </div>

                <Suspense
                    fallback={
                        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="h-64 animate-pulse">
                                <div className="mb-4 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="space-y-3">
                                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                </div>
                            </div>
                        </div>
                    }
                >
                    <MainTable
                        data={residents}
                        searchTerm={state.searchTerm}
                        setSearchTerm={handleSearchChange}
                        selectedMunicipality={state.selectedMunicipality}
                        setSelectedMunicipality={handleMunicipalityChange}
                        selectedBarangay={state.selectedBarangay}
                        setSelectedBarangay={handleBarangayChange}
                        filteredBarangays={state.filteredBarangays}
                        municipalityOptions={municipalityOptions}
                        itemsPerPage={state.itemsPerPage}
                        setItemsPerPage={handleItemsPerPageChange}
                        currentPage={paginationRef.current.currentPage}
                        setCurrentPage={handlePageChange}
                        theme={state.theme}
                        onViewResident={handleViewResidentInfo}
                        onAssignRFID={handleAssignRFID}
                        onDeleteResident={handleDeleteResident}
                        pagination={{
                            totalResidents: TotalResidents || 0,
                            totalPages: TotalPages || 1,
                            currentPage: paginationRef.current.currentPage,
                        }}
                        onFetchData={handleFetchData}
                        isLoading={isLoading || paginationRef.current.isChangingPage}
                        onClearSearch={handleClearSearch}
                        onClearMunicipality={handleClearMunicipality}
                        onClearBarangay={handleClearBarangay}
                        categories={categories}
                    />
                </Suspense>
            </div>

            {/* Modals */}
            <Suspense fallback={null}>
                {state.showAddResidentModal && (
                    <ResidentModal
                        mode="add"
                        show={state.showAddResidentModal}
                        onClose={() => updateState({ showAddResidentModal: false })}
                        residentData={state.newResident}
                        setResidentData={(data) => updateState({ newResident: data })}
                        onSubmit={handleAddResident}
                        municipalityOptions={municipalityOptions}
                        genderOptions={genderOptions}
                        civilStatusOptions={civilStatusOptions}
                        employmentStatusOptions={employmentStatusOptions}
                        relationshipOptions={relationshipOptions}
                        statusOptions={statusOptions}
                        classificationOptions={classificationOptions}
                        isLoading={state.modalLoading.addResident}
                        onRelationshipChange={handleRelationshipChange}
                    />
                )}

                {state.showUploadModal && (
                    <UploadModal
                        show={state.showUploadModal}
                        onClose={() => updateState({ 
                            showUploadModal: false,
                            file: null,
                            uploadStatus: "idle"
                        })}
                        file={state.file}
                        isDragging={state.isDragging}
                        uploadStatus={state.uploadStatus}
                        fileInputRef={fileInputRef}
                        handleDragOver={handleDragOver}
                        handleDragLeave={handleDragLeave}
                        handleDrop={handleDrop}
                        handleFileChange={handleFileChange}
                        resetFile={() =>
                            updateState({
                                file: null,
                                uploadStatus: "idle",
                            })
                        }
                        simulateUpload={handleUpload}
                        isLoading={state.modalLoading.upload}
                    />
                )}

                {state.showResidentInfoModal && (
                    <ResidentInfoModal
                        show={state.showResidentInfoModal}
                        onClose={() => updateState({ showResidentInfoModal: false })}
                        resident={state.selectedResident}
                        theme={state.theme}
                        onGenerateCard={handleGenerateCard}
                        onAssignRFID={handleAssignRFID}
                        getStatusColor={getStatusColor}
                        onUpdateResident={handleUpdateResident}
                        municipalityOptions={municipalityOptions}
                        genderOptions={genderOptions}
                        civilStatusOptions={civilStatusOptions}
                    />
                )}

                {state.rfidAssignModal && (
                    <RFIDModal
                        show={state.rfidAssignModal}
                        onClose={() => {
                            updateState({ 
                                rfidAssignModal: false, 
                                selectedResident: null, 
                                rfidNumber: "",
                                modalLoading: { ...state.modalLoading, rfid: false }
                            });
                        }}
                        resident={state.selectedResident}
                        modalType={state.rfidModalType}
                        rfidNumber={state.rfidNumber}
                        setRfidNumber={(value) => updateState({ rfidNumber: value })}
                        onSave={saveRFIDAssignment}
                        onChangeType={() => updateState({ rfidModalType: "assign" })}
                        isLoading={state.modalLoading.rfid}
                    />
                )}

                {state.showCardModal && (
                    <CardModal
                        show={state.showCardModal}
                        onClose={() => updateState({ showCardModal: false })}
                        resident={state.cardResident}
                        cardType={state.cardType}
                        setCardType={(value) => updateState({ cardType: value })}
                        printOrientation={state.printOrientation}
                        setPrintOrientation={(value) => updateState({ printOrientation: value })}
                        onPrint={handlePrintCard}
                        onDownload={handleDownloadCard}
                    />
                )}
            </Suspense>

            {/* Status Modal */}
            <StatusModal
                isOpen={state.showStatusModal}
                onClose={handleStatusModalClose}
                status={state.statusModalProps.status}
                error={state.statusModalProps.error}
                title={state.statusModalProps.title}
                message={state.statusModalProps.message}
                onRetry={state.statusModalProps.onRetry}
            />
        </div>
    );
};

export default ImportMasterList;