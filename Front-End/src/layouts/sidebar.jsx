import { forwardRef, useContext, useState, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { navbarLinks } from "@/constants";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";
import { AuthContext } from "../contexts/AuthContext";
import { LogOut, ChevronRight } from "lucide-react";
import logo from "../assets/logoTap.png";
import { useTheme } from "@/hooks/use-theme";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
    const { logout, role } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
    const [openMasterList, setOpenMasterList] = useState(false);
    const [openUsers, setOpenUsers] = useState(false);

    useEffect(() => {
        const isDark = theme === "dark";
        setIsDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const isMasterListRoute = ["masterlist", "priority", "history", "beneficiary"].some((path) =>
        location.pathname.toLowerCase().includes(path.toLowerCase()),
    );

    const isUsersRoute = ["admin-table", "officer-table", "undermaintenance"].some((path) =>
        location.pathname.toLowerCase().includes(path.toLowerCase()),
    );

    // Define role permissions
    const rolePermissions = useMemo(() => ({
        superadmin: [
            "/dashboard",
            "/dashboard/masterlist",
            "/dashboard/priority-table",
            "/dashboard/Beneficiarylist",
            "/dashboard/history-table",
            "/dashboard/new-category",
            "/dashboard/rfid-table",
            "/dashboard/rfid",
            "/dashboard/settings",
            "/dashboard/admin-table",
            "/dashboard/officer-table",
            "/dashboard/super-admin",
            "/dashboard/analytics",
        ],
        admin: [
            "/dashboard",
            "/dashboard/masterlist",
            "/dashboard/priority-table",
            "/dashboard/Beneficiarylist",
            "/dashboard/history-table",
            "/dashboard/new-category",
            "/dashboard/rfid",
            "/dashboard/settings",
            "/dashboard/admin-table",
            "/dashboard/officer-table",
            "/dashboard/analytics",
        ],
        staff: [
            "/dashboard",
            "/dashboard/masterlist",
            "/dashboard/priority-table",
            "/dashboard/Beneficiarylist",
            "/dashboard/history-table",
            "/dashboard/new-category",
            "/dashboard/rfid",
            "/dashboard/settings",
            "/dashboard/analytics",
        ],
    }), []);

    // Get allowed paths for current role
    const allowedPaths = useMemo(() => {
        return rolePermissions[role] || rolePermissions.staff;
    }, [role]);

    // Check if a path is allowed for current role
    const isPathAllowed = (path) => {
        return allowedPaths.includes(path);
    };

    // Check if any sub-link is allowed for toggle buttons
    const isMasterListAllowed = useMemo(() => {
        const masterListPaths = [
            "/dashboard/masterlist",
            "/dashboard/priority-table",
            "/dashboard/Beneficiarylist",
            "/dashboard/history-table",
        ];
        return masterListPaths.some(path => isPathAllowed(path));
    }, [allowedPaths]);

    const isUsersAllowed = useMemo(() => {
        const userPaths = [
            "/dashboard/admin-table",
            "/dashboard/officer-table",
            "/dashboard/undermaintenance",
        ];
        return userPaths.some(path => isPathAllowed(path));
    }, [allowedPaths]);

    const toggleMasterList = () => {
        if (isMasterListAllowed) {
            setOpenMasterList(!openMasterList);
            setOpenUsers(false);
        }
    };

    const toggleUsers = () => {
        if (isUsersAllowed) {
            setOpenUsers(!openUsers);
            setOpenMasterList(false);
        }
    };

    // Filter sub-sidebar links based on role permissions
    const getFilteredSubLinks = (links) => {
        return links.filter(link => {
            // Special case: Super Admin link ay para lang sa superadmin role
            if (link.to === "/dashboard/undermaintenance" || link.label === "Super Admin") {
                return role === "superadmin";
            }
            return isPathAllowed(link.to);
        });
    };

    // LOGIC PARA SA RE-OPEN AT RE-LOAD
    const handleSoftLoad = (e, path) => {
        if (!isPathAllowed(path)) {
            e.preventDefault();
            return;
        }

        if (location.pathname === path) {
            e.preventDefault();

            // Re-open effect: Isasara muna tapos bubuksan ulit
            const isMaster = ["masterlist", "priority", "history", "beneficiary"].some((p) => path.includes(p));
            const isUser = ["admin-table", "officer-table", "undermaintenance"].some((p) => path.includes(p));

            if (isMaster) setOpenMasterList(false);
            if (isUser) setOpenUsers(false);

            // Panandaliang delay para makita ang animation ng pagsara bago bumukas/magload
            setTimeout(() => {
                if (isMaster) setOpenMasterList(true);
                if (isUser) setOpenUsers(true);
                navigate(path, { replace: true });
            }, 100);
        } else {
            // Pag hindi active, normal na close lang ng sub-sidebars
            setOpenMasterList(false);
            setOpenUsers(false);
        }
    };

    return (
        <>
            <aside
                ref={ref}
                className={cn(
                    "fixed z-[100] flex h-full flex-col overflow-x-hidden border-r transition-all duration-300 ease-in-out",
                    "border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
                    collapsed ? "w-[70px] items-center" : "w-[260px]",
                    collapsed ? "max-md:-left-full" : "max-md:left-0",
                )}
            >
                {/* HEADER */}
                <div
                    className={cn(
                        "mb-2 flex items-center gap-3 border-b border-gray-200 p-6 dark:border-gray-700",
                        collapsed ? "justify-center px-2" : "px-8",
                    )}
                >
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-12 w-12  object-contain"
                    />
                    {!collapsed && (
                        <div>
                            <h1 className="text-[12px] font-black uppercase tracking-[0.2em]">TapCare.Ph</h1>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Management System</span>
                        </div>
                    )}
                </div>

                {/* NAVIGATION */}
                <div className="flex w-full flex-col gap-y-6 overflow-y-auto p-4">
                    {navbarLinks.map((group) => (
                        <nav
                            key={group.title}
                            className={cn("flex flex-col gap-y-2", collapsed && "items-center")}
                        >
                            {!collapsed && <p className="mb-1 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{group.title}</p>}

                            {group.links.map((link) => {
                                const isMasterList = link.label.toLowerCase().includes("master");
                                const isUsers = link.label.toLowerCase().includes("user");
                                const isActive = (isMasterList && (openMasterList || isMasterListRoute)) || (isUsers && (openUsers || isUsersRoute));

                                // Check if link should be visible based on role
                                const shouldShowLink = isMasterList ? isMasterListAllowed : 
                                                     isUsers ? isUsersAllowed : 
                                                     isPathAllowed(link.path);

                                if (!shouldShowLink) return null;

                                if (isMasterList || isUsers) {
                                    return (
                                        <button
                                            key={link.label}
                                            onClick={isMasterList ? toggleMasterList : toggleUsers}
                                            disabled={!shouldShowLink}
                                            className={cn(
                                                "group flex w-full items-center gap-x-4 rounded-xl px-4 py-3 font-semibold transition-all duration-200",
                                                !isActive && "text-gray-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:bg-gray-800",
                                                isActive && "bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-none",
                                                collapsed && "w-[45px] justify-center px-0",
                                                !shouldShowLink && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <link.icon
                                                size={20}
                                                className={cn(isActive ? "text-white" : "text-gray-500")}
                                            />
                                            {!collapsed && (
                                                <div className="flex flex-1 items-center justify-between">
                                                    <span>{link.label}</span>
                                                    <ChevronRight
                                                        size={14}
                                                        className={cn(
                                                            "transition-transform",
                                                            (isMasterList ? openMasterList : openUsers) && "rotate-90",
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </button>
                                    );
                                }

                                return (
                                    <NavLink
                                        key={link.label}
                                        to={link.path}
                                        end={link.path === "/dashboard"}
                                        onClick={(e) => handleSoftLoad(e, link.path)}
                                        className={({ isActive }) =>
                                            cn(
                                                "group flex items-center gap-x-4 rounded-xl px-4 py-3 font-semibold transition-all duration-200",
                                                isActive
                                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                                                    : "text-gray-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:bg-gray-800",
                                                collapsed && "w-[45px] justify-center px-0",
                                                !shouldShowLink && "opacity-50 cursor-not-allowed"
                                            )
                                        }
                                    >
                                        <link.icon size={20} />
                                        {!collapsed && <span>{link.label}</span>}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    ))}
                </div>

                {/* LOGOUT */}
                <div className="mt-auto border-t border-gray-200 p-4 dark:border-gray-700">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-4 py-3 font-bold text-gray-500 transition-colors hover:text-red-600"
                    >
                        <LogOut size={20} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* SUB SIDEBARS */}
            {[
                {
                    open: openMasterList && isMasterListAllowed,
                    title: "Records",
                    links: getFilteredSubLinks([
                        { to: "/dashboard/masterlist", label: "MasterList" },
                        { to: "/dashboard/priority-table", label: "Selected Beneficiaries" },
                        { to: "/dashboard/Beneficiarylist", label: "Beneficiaries" },
                        { to: "/dashboard/history-table", label: "History" },
                    ]),
                },
                {
                    open: openUsers && isUsersAllowed,
                    title: "User Management",
                    links: getFilteredSubLinks([
                        { to: "/dashboard/admin-table", label: "Admin Users" },
                        { to: "/dashboard/officer-table", label: "Staff Users" },
                        { to: "/dashboard/super-admin", label: "Super Admin" },
                    ]),
                },
            ].map((sub, idx) => (
                sub.links.length > 0 && (
                    <aside
                        key={idx}
                        className={cn(
                            "fixed top-0 z-[90] h-full w-[240px] border-r bg-white shadow-2xl transition-all duration-500 ease-in-out dark:bg-gray-900",
                            sub.open ? "translate-x-0" : "-translate-x-full",
                            collapsed ? "left-[70px]" : "left-[260px]",
                        )}
                    >
                        <div className="p-6 pt-24">
                            <p className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{sub.title}</p>
                            <div className="flex flex-col gap-y-2">
                                {sub.links.map((sLink) => (
                                    <NavLink
                                        key={sLink.to}
                                        to={sLink.to}
                                        onClick={(e) => handleSoftLoad(e, sLink.to)}
                                        className={({ isActive }) =>
                                            cn(
                                                "block rounded-lg px-4 py-3 text-sm font-medium transition-all",
                                                isActive
                                                    ? "border-l-4 border-orange-500 bg-orange-50 text-orange-600"
                                                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800",
                                            )
                                        }
                                    >
                                        {sLink.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </aside>
                )
            ))}
        </>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};