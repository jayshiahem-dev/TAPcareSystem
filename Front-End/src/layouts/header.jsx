import { useTheme } from "@/hooks/use-theme";
import { useLocation } from "react-router-dom";
import { Bell, ChevronsLeft, Moon, Sun, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import profileImg from "@/assets/profile-image.jpg";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";
import { NotificationDisplayContext } from "../contexts/NotificationContext/NotificationContext";

export const Header = ({ collapsed, setCollapsed }) => {
    const { notify } = useContext(NotificationDisplayContext);
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getTitle = () => {
        const path = location.pathname;
        if (path.includes("rfid")) return "Smart RFID Console";
        if (path.includes("beneficiaries")) return "Grant Assignment";
        if (path.includes("categories")) return "System Configuration";
        return "General Overview";
    };

    const formatTime = (createdAt) => {
        if (!createdAt) return "Unknown time";
        const date = new Date(createdAt);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return date.toLocaleDateString();
    };

    const getNotificationConfig = (type) => {
        const typeStr = type?.toLowerCase() || "";
        if (typeStr.includes("success") || typeStr.includes("completed")) {
            return { icon: CheckCircle, bgColor: "bg-green-50 text-green-600 dark:bg-green-900/20" };
        } else if (typeStr.includes("warning") || typeStr.includes("alert")) {
            return { icon: AlertTriangle, bgColor: "bg-amber-50 text-amber-600 dark:bg-amber-900/20" };
        }
        return { icon: Info, bgColor: "bg-blue-50 text-blue-600 dark:bg-blue-900/20" };
    };

    return (
        <header className="relative z-50 flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-x-6">
                <button
                    className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {/* Rotate icon based on collapsed state */}
                    <ChevronsLeft className={cn("transition-transform duration-300", collapsed && "rotate-180")} />
                </button>

                <div className="flex flex-col">
                    <h2 className="animate-in fade-in slide-in-from-left-4 text-xs font-black uppercase tracking-[0.4em] text-slate-400 duration-500">
                        {getTitle()}
                    </h2>
                </div>
            </div>

            <div className="flex items-center gap-x-6">
                <div className="hidden flex-col text-right md:flex">
                    <p className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">Admin Terminal</p>
                    <div className="flex items-center justify-end gap-1.5">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-green-600">System Online</p>
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-center gap-x-3">
                    <button
                        className="btn-ghost size-10 text-slate-500"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                        <Sun size={20} className="dark:hidden" />
                        <Moon size={20} className="hidden dark:block" />
                    </button>

                    <div className="relative" ref={notificationRef}>
                        <button
                            className={cn(
                                "btn-ghost relative size-10 rounded-xl text-slate-500 transition-all",
                                showNotifications && "bg-slate-100 text-blue-600 dark:bg-slate-800",
                            )}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {notify?.length > 0 && (
                                <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-blue-600 dark:border-slate-900" />
                            )}
                        </button>

                        {showNotifications && (
                            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl duration-300 dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Alert Center</h3>
                                    {notify?.length > 0 && (
                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black text-blue-600 dark:bg-blue-900/30">
                                            {notify.length} NEW
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1 max-h-96 overflow-y-auto">
                                    {notify?.length > 0 ? (
                                        notify.map((note) => {
                                            const config = getNotificationConfig(note.types);
                                            const Icon = config.icon;
                                            return (
                                                <button key={note._id} className="flex w-full gap-x-4 rounded-xl p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", config.bgColor)}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <div className="flex flex-col gap-y-0.5 overflow-hidden">
                                                        <p className="truncate text-xs font-black uppercase text-slate-800 dark:text-slate-200">{note.types || "Notification"}</p>
                                                        <p className="line-clamp-2 text-[11px] text-slate-500">{note.message}</p>
                                                        <span className="mt-1 text-[9px] text-slate-400">{formatTime(note.createdAt)}</span>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="py-6 text-center text-sm text-slate-500">No notifications</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};