import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";


export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(localStorage.getItem("token") || null);
    const [role, setRole] = useState(localStorage.getItem("role") || null);
    const [email, setEmail] = useState(localStorage.getItem("email") || null);
    const [first_name, setfirst_name] = useState(localStorage.getItem("first_name") || null);
    const [last_name, setlast_name] = useState(localStorage.getItem("last_name") || null);
    const [contact_number, setcontact_number] = useState(localStorage.getItem("contact_number") || null);
    const [userId, setUserID] = useState(localStorage.getItem("userId") || null);
    const [linkId, setlinkId] = useState(localStorage.getItem("linkId") || null);
    const [Designatedzone, setDesignatedzone] = useState(localStorage.getItem("Designatedzone") || null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [authToken]);

    const login = async (inputEmail, password) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/login`,
                { email: inputEmail, password },
                { withCredentials: true },
            );

            if (res.data.status === "Success") {
                const { token, role, email: serverEmail, first_name, last_name, contact_number, userId, linkId, Designatedzone, theme } = res.data;

                localStorage.setItem("token", token);
                localStorage.setItem("role", role);
                localStorage.setItem("email", serverEmail);
                localStorage.setItem("first_name", first_name);
                localStorage.setItem("last_name", last_name);
                localStorage.setItem("contact_number", contact_number);
                localStorage.setItem("userId", userId);
                localStorage.setItem("linkId", linkId);
                localStorage.setItem("Designatedzone", Designatedzone);
                localStorage.setItem("authToken", token);
                localStorage.setItem("theme", theme);
                setAuthToken(token);
                setRole(role);
                setEmail(serverEmail);
                setfirst_name(first_name);
                setlast_name(last_name);
                setcontact_number(contact_number);
                setUserID(userId);
                setlinkId(linkId);
                setDesignatedzone(Designatedzone);
                setTheme(theme);

                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                return { success: true, role, userId };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Login failed",
            };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("first_name");
        localStorage.removeItem("last_name");
        localStorage.removeItem("contact_number");
        localStorage.removeItem("userId");
        localStorage.removeItem("linkId");
        localStorage.removeItem("Designatedzone");
        localStorage.removeItem("authToken");
        

        // Clear state
        setAuthToken(null);
        setRole(null);
        setEmail(null);
        setfirst_name(null);
        setlast_name(null);
        setcontact_number(null);
        setUserID(null);
        setlinkId(null);
        setDesignatedzone(null);

        // Remove Axios headers
        delete axios.defaults.headers.common["Authorization"];

        window.location.href = "/login"; // Redirect to login page
    };

    return (
        <AuthContext.Provider
            value={{
                authToken,
                role,
                email,
                first_name,
                last_name,
                contact_number,
                userId,
                linkId,
                Designatedzone,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use context
export const useAuth = () => useContext(AuthContext);