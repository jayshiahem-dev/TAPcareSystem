import React, { useMemo, useContext, useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import { RFIDRegisterContext } from "../../contexts/RegisterRfidContext/RegisterRfidContext";
import { Users, MapPin, HandCoins, CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardContext } from "../../contexts/DashboardContext/SummaryDashboardContext";

// ========== CUSTOM HOOK: COUNT-UP ANIMATION ==========
const useCountUp = (targetValue, duration = 2000, delay = 200) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Kung undefined o null, set sa 0 para iwas error
    if (targetValue === undefined || targetValue === null) {
      setCount(0);
      return;
    }

    let startTime;
    let animationFrame;
    const startDelay = performance.now() + delay;

    const animate = (now) => {
      if (now < startDelay) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * targetValue);
      setCount(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(targetValue); // siguraduhing eksakto sa dulo
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [targetValue, duration, delay]);

  return count;
};

const DashboardPage = () => {
    const { assignedTotal, percentageChange, fetchRFIDs } = useContext(RFIDRegisterContext);
    const { totals, municipalityData, assistanceData, isLoading, fetchDashboard } = useContext(DashboardContext);
    const { theme } = useTheme();
    const chartColors = ["#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12"];
    
    // State for calendar navigation
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper function to map category to type
    const mapCategoryToType = (category) => {
        if (!category) return "livelihood";
        
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes("medical") || categoryLower.includes("aid")) return "medical";
        if (categoryLower.includes("burial")) return "burial";
        if (categoryLower.includes("dunong") || categoryLower.includes("education")) return "education";
        return "livelihood";
    };

    // Format category for display
    const formatCategory = (category) => {
        if (!category) return "Assistance";
        
        // Shorten long category names
        const words = category.split(" ");
        if (words.length <= 2) return category;
        return words.map(word => word[0]).join("").toUpperCase() + ".";
    };

    // Process assistance data for calendar
    const calendarDistributions = useMemo(() => {
        if (!assistanceData || assistanceData.length === 0) return [];

        const distributions = [];

        assistanceData.forEach(item => {
            if (!item.releaseDates || !Array.isArray(item.releaseDates)) return;
            
            item.releaseDates.forEach(release => {
                if (!release.date) return;
                
                const date = new Date(release.date);
                const dayNum = date.getDate();
                const month = date.getMonth();
                const year = date.getFullYear();
                
                // Only show distributions for the current month
                if (date.getMonth() === currentDate.getMonth() && 
                    date.getFullYear() === currentDate.getFullYear()) {
                    
                    distributions.push({
                        date: dayNum,
                        title: formatCategory(item.category),
                        fullTitle: item.category || "Assistance Program",
                        muni: item.municipality || "Multiple",
                        type: mapCategoryToType(item.category),
                        count: release.count || 0,
                        category: item.category
                    });
                }
            });
        });

        return distributions;
    }, [assistanceData, currentDate]);

    // Calculate days in current month
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    // Get month name
    const getMonthName = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Get day names for calendar header
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Navigation handlers
    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Calculations using actual data from context
    const stats = useMemo(() => {
        if (!municipalityData || municipalityData.length === 0) {
            return { 
                total: 0, 
                assigned: 0, 
                released: 0, 
                pending: 0, 
                muniCounts: {},
                municipalityTotal: 0
            };
        }

        // Calculate totals from municipalityData
        const municipalityTotal = municipalityData.reduce((sum, item) => sum + item.count, 0);
        
        // Note: These values should come from your context if available
        // For now using the totals from context
        const assigned = totals.assistanceAssign || 0;
        const released = totals.rfidAssigned || 0;
        const pending = municipalityTotal - assigned;

        // Create muniCounts object from municipalityData
        const muniCounts = municipalityData.reduce((acc, curr) => {
            acc[curr.municipality] = curr.count;
            return acc;
        }, {});

        return { 
            total: municipalityTotal, 
            assigned, 
            released, 
            pending, 
            muniCounts,
            municipalityTotal 
        };
    }, [municipalityData, totals]);

    // Handle isLoading state with skeleton
    if (isLoading) {
        return (
            <div className="animate-in fade-in flex min-h-screen flex-col gap-y-4 bg-gray-50 p-4 duration-700 dark:bg-gray-900 md:p-8">
                {/* Header Skeleton */}
                <div className="flex flex-col">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                </div>

                {/* Stat Cards Skeleton */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                                <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse dark:bg-gray-700"></div>
                            </div>
                            <div className="flex flex-col">
                                <div className="h-9 w-20 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                                <div className="mt-2 flex items-center gap-1">
                                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Calendar and Chart Skeleton */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                    {/* Calendar Skeleton (4 cols) */}
                    <div className="card col-span-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-4">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-2"></div>
                                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
                                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-700">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="bg-gray-50 py-3 dark:bg-gray-900/50">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mx-2"></div>
                                </div>
                            ))}
                            {[...Array(35)].map((_, i) => (
                                <div key={i} className="min-h-[95px] bg-white p-1.5 dark:bg-gray-800">
                                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-1"></div>
                                    <div className="space-y-1">
                                        <div className="h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                                        <div className="h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart Skeleton (3 cols) */}
                    <div className="card col-span-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-3">
                        <div className="mb-6 flex justify-between">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                        </div>

                        <div className="flex flex-col items-center gap-8">
                            {/* Donut Chart Skeleton */}
                            <div className="relative h-44 w-44">
                                <div className="h-full w-full rounded-full bg-gray-200 animate-pulse dark:bg-gray-700"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="h-8 w-16 bg-gray-300 rounded animate-pulse dark:bg-gray-600 mb-1"></div>
                                    <div className="h-3 w-12 bg-gray-300 rounded animate-pulse dark:bg-gray-600"></div>
                                </div>
                            </div>

                            {/* Municipality List Skeleton */}
                            <div className="grid w-full grid-cols-2 gap-2">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse dark:bg-gray-600"></div>
                                            <div className="h-4 w-16 bg-gray-300 rounded animate-pulse dark:bg-gray-600"></div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="h-5 w-10 bg-gray-300 rounded animate-pulse dark:bg-gray-600 mb-1"></div>
                                            <div className="h-3 w-8 bg-gray-300 rounded animate-pulse dark:bg-gray-600"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in flex min-h-screen flex-col gap-y-4 bg-gray-50 p-4 duration-700 dark:bg-gray-900 md:p-8">
            <div className="flex flex-col">
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Naval Admin Stats</p>
            </div>

            {/* STAT CARDS SECTION - MAY RECOUNT ANIMATION NA */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Citizens"
                    value={stats.municipalityTotal}
                    icon={<Users />}
                    color="text-orange-500"
                />
                <StatCard
                    title="Assigned"
                    value={stats.assigned}
                    icon={<HandCoins />}
                    color="text-orange-600"
                    percentageChange={totals.assistancePercentage}
                />
                <StatCard
                    title="Released (RFID)"
                    value={stats.released}
                    icon={<CheckCircle />}
                    color="text-orange-400"
                    percentageChange={totals.rfidAssignedPercentage} 
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={<Clock />}
                    color="text-orange-700"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                {/* 1. DISTRIBUTION CALENDAR (4 COLS) */}
                <div className="card col-span-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 lg:col-span-4">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Distribution Schedule</p>
                            <h2 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                                {getMonthName(currentDate)}
                            </h2>
                        </div>
                        <div className="flex gap-2 text-orange-500">
                            <button 
                                onClick={handlePrevMonth}
                                className="rounded-lg p-2 transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                onClick={handleNextMonth}
                                className="rounded-lg p-2 transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-700">
                        {days.map((day) => (
                            <div
                                key={day}
                                className="bg-gray-50 py-3 text-center text-[10px] font-black uppercase tracking-tighter text-gray-400 dark:bg-gray-900/50"
                            >
                                {day}
                            </div>
                        ))}
                        {[...Array(getDaysInMonth(currentDate))].map((_, i) => {
                            const dayNum = i + 1;
                            const dayDistributions = calendarDistributions.filter(d => d.date === dayNum);

                            return (
                                <div
                                    key={i}
                                    className="group min-h-[95px] cursor-pointer bg-white p-1.5 transition-all hover:bg-orange-50/30 dark:bg-gray-800 dark:hover:bg-orange-900/10"
                                >
                                    <span
                                        className={`text-[11px] font-black ${dayDistributions.length > 0 ? "text-orange-600" : "text-gray-400 dark:text-gray-600"}`}
                                    >
                                        {dayNum}
                                    </span>
                                    {dayDistributions.length > 0 && (
                                        <div className="mt-1 flex flex-col gap-1">
                                            {dayDistributions.slice(0, 2).map((distribution, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`rounded-md p-1 text-[7px] font-bold uppercase leading-tight ${
                                                        distribution.type === "medical"
                                                            ? "bg-red-50 text-red-600 dark:bg-red-900/20"
                                                            : distribution.type === "burial"
                                                            ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20"
                                                            : distribution.type === "education"
                                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                                                            : "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
                                                    }`}
                                                    title={distribution.fullTitle}
                                                >
                                                    <div className="truncate">{distribution.title}</div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center gap-0.5">
                                                            <MapPin size={8} className="shrink-0" />
                                                            {distribution.muni}
                                                        </span>
                                                        <span className="text-[6px]">({distribution.count})</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {dayDistributions.length > 2 && (
                                                <div className="text-[6px] font-bold text-gray-500 text-center">
                                                    +{dayDistributions.length - 2} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Legend for distribution types */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            <span className="text-[8px] font-bold uppercase text-gray-600 dark:text-gray-400">Medical</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            <span className="text-[8px] font-bold uppercase text-gray-600 dark:text-gray-400">Burial</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="text-[8px] font-bold uppercase text-gray-600 dark:text-gray-400">Education</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                            <span className="text-[8px] font-bold uppercase text-gray-600 dark:text-gray-400">Livelihood</span>
                        </div>
                    </div>
                </div>

                {/* 2. MUNICIPALITY CHART (3 COLS) */}
                <div className="card col-span-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 lg:col-span-3">
                    <div className="mb-6 flex justify-between">
                        <p className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">By Municipality</p>
                        <MapPin
                            size={20}
                            className="text-orange-500 dark:text-orange-400"
                        />
                    </div>

                    <div className="flex flex-col items-center gap-8">
                        {/* SVG DONUT CHART */}
                        <div className="relative h-44 w-44">
                            <svg
                                viewBox="0 0 36 36"
                                className="h-full w-full -rotate-90 transform"
                            >
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="transparent"
                                    stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
                                    strokeWidth="4"
                                />
                                {municipalityData && municipalityData.length > 0 && municipalityData.map((item, i) => {
                                    const percentage = (item.count / stats.municipalityTotal) * 100;
                                    const prevSum = municipalityData
                                        .slice(0, i)
                                        .reduce((sum, prevItem) => sum + prevItem.count, 0);
                                    const offset = (prevSum / stats.municipalityTotal) * 100;
                                    return (
                                        <circle
                                            key={item.municipality}
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            fill="transparent"
                                            stroke={chartColors[i % chartColors.length]}
                                            strokeWidth="4"
                                            strokeDasharray={`${percentage} 100`}
                                            strokeDashoffset={-offset}
                                            className="transition-all duration-1000"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.municipalityTotal.toLocaleString()}</span>
                                <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">Total</span>
                            </div>
                        </div>

                        {/* MUNICIPALITY LIST GRID */}
                        <div className="grid w-full grid-cols-2 gap-2">
                            {municipalityData && municipalityData.length > 0 ? (
                                municipalityData.map((item, i) => (
                                    <div
                                        key={item.municipality}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all duration-300 hover:border-orange-300 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:border-orange-600"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: chartColors[i % chartColors.length] }}
                                            />
                                            <span className="text-[11px] font-semibold uppercase text-gray-700 dark:text-gray-300">
                                                {item.municipality}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                                {item.count.toLocaleString()}
                                            </span>
                                            <span className="text-[9px] text-gray-500 dark:text-gray-400">
                                                {item.percentage || `${Math.round((item.count / stats.municipalityTotal) * 100)}%`}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No municipality data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

// ========== STAT CARD COMPONENT - MAY COUNT-UP ANIMATION ==========
const StatCard = ({ title, value, icon, color, percentageChange }) => {
    // Gamitin ang custom hook para sa recount animation
    const animatedValue = useCountUp(value, 2000, 200); // 2 seconds, 200ms delay

    // Format the percentage change with sign
    const formatPercentage = (change) => {
        if (change === undefined || change === null) return "+4.5%";
        const sign = change >= 0 ? "+" : "";
        return `${sign}${change}%`;
    };

    return (
        <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-600">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{title}</p>
                <div className={`rounded-xl bg-orange-50 p-2 dark:bg-orange-900/20 ${color} transition-transform duration-300 group-hover:scale-110`}>
                    {React.cloneElement(icon, { size: 18 })}
                </div>
            </div>
            <div className="flex flex-col">
                {/* ANIMATED VALUE */}
                <div className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                    {animatedValue.toLocaleString()}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">
                    <span>{formatPercentage(percentageChange)}</span>
                    <span className="font-medium tracking-normal text-gray-400 dark:text-gray-500">from last month</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;