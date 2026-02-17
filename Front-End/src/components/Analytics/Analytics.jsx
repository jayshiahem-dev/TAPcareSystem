import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  Wallet,
  MapPin,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

// Orange theme colors
const ORANGE_COLORS = ["#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12"];
const DARK_ORANGE_COLORS = ["#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412"];

const Analytics = () => {
  const { theme } = useTheme();
  
  // =====================
  // SAMPLE DATA
  // =====================
  const municipalityData = [
    { name: "Municipality A", value: 400000, beneficiaries: 500 },
    { name: "Municipality B", value: 300000, beneficiaries: 350 },
    { name: "Municipality C", value: 300000, beneficiaries: 400 },
  ];

  // =====================
  // COMPUTED METRICS
  // =====================
  const totalFunds = useMemo(
    () => municipalityData.reduce((sum, d) => sum + d.value, 0),
    [municipalityData]
  );

  const totalBeneficiaries = useMemo(
    () => municipalityData.reduce((sum, d) => sum + d.beneficiaries, 0),
    [municipalityData]
  );

  const averagePerMunicipality = useMemo(
    () =>
      municipalityData.map((d) => ({
        name: d.name,
        average: Math.round(d.value / d.beneficiaries),
      })),
    [municipalityData]
  );

  // Chart colors based on theme
  const chartColors = theme === 'dark' ? DARK_ORANGE_COLORS : ORANGE_COLORS;
  
  // Tooltip styles based on theme
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    border: theme === 'dark' ? '1px solid #374151' : '1px solid #d1d5db',
    borderRadius: '8px',
    color: theme === 'dark' ? '#f3f4f6' : '#111827',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <LayoutDashboard className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Cash Assistance Analytics Dashboard
            </h1>
            <p className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em]">
              Real-time distribution insights and metrics
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {/* FILTERS */}
          <div className="flex gap-2">
            <select className="p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200">
              <option>All Municipalities</option>
              <option>Municipality A</option>
              <option>Municipality B</option>
            </select>

            <select className="p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200">
              <option>All Categories</option>
              <option>Senior Citizen</option>
              <option>PWD</option>
              <option>Solo Parent</option>
            </select>
          </div>
        </div>
      </div>

      {/* =====================
          KPI SUMMARY CARDS
      ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Wallet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Funds Distributed
            </p>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ₱{totalFunds.toLocaleString()}
          </h2>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
              +12.5%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              from last month
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Beneficiaries
            </p>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalBeneficiaries.toLocaleString()}
          </h2>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
              +8.3%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              from last month
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Municipalities Covered
            </p>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {municipalityData.length}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Across Biliran Province
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Wallet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Avg Assistance
            </p>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ₱{Math.round(totalFunds / totalBeneficiaries).toLocaleString()}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Per beneficiary
          </p>
        </div>
      </div>

      {/* =====================
          CHARTS GRID
      ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PIE: CASH DISTRIBUTION - ORANGE THEME */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Cash Distribution by Municipality
              </h3>
            </div>
            <span className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-medium">
              ₱{totalFunds.toLocaleString()}
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={municipalityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  label={(entry) => `${entry.name}: ₱${(entry.value/1000).toFixed(0)}k`}
                  labelLine={false}
                >
                  {municipalityData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                      stroke={theme === 'dark' ? '#1f2937' : '#ffffff'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const percent = ((value / totalFunds) * 100).toFixed(2);
                    return [
                      `₱${value.toLocaleString()} (${percent}%)`,
                      props.payload.name,
                    ];
                  }}
                  contentStyle={tooltipStyle}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR: BENEFICIARIES - ORANGE THEME */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Beneficiaries per Municipality
              </h3>
            </div>
            <span className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-medium">
              {totalBeneficiaries.toLocaleString()} total
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={municipalityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
                />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  formatter={(value) => [value, 'Beneficiaries']}
                  labelFormatter={(name) => `${name}`}
                />
                <Bar
                  dataKey="beneficiaries"
                  name="Beneficiaries"
                  fill={theme === 'dark' ? '#ea580c' : '#f97316'}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR: CASH AMOUNT - ORANGE THEME */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Cash Amount Comparison
              </h3>
            </div>
            <span className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-medium">
              Monthly Distribution
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={municipalityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
                />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                  tickFormatter={(value) => `₱${(value/1000)}k`}
                />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`₱${value.toLocaleString()}`, 'Cash Amount']}
                  labelFormatter={(name) => `${name}`}
                />
                <Bar
                  dataKey="value"
                  name="Cash Amount"
                  fill={theme === 'dark' ? '#f97316' : '#ea580c'}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR: AVERAGE ASSISTANCE - ORANGE THEME */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Average Assistance per Beneficiary
              </h3>
            </div>
            <span className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-medium">
              Per Capita Analysis
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={averagePerMunicipality}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
                />
                <XAxis 
                  dataKey="name" 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                  tickFormatter={(value) => `₱${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => `₱${value.toLocaleString()}`}
                  labelFormatter={(name) => `${name}`}
                />
                <Bar
                  dataKey="average"
                  name="Average Assistance"
                  fill={theme === 'dark' ? '#fb923c' : '#f97316'}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {municipalityData.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
            <Users className="h-12 w-12 text-orange-500 dark:text-orange-400" />
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            No data available for selected filters
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Try selecting different municipalities or categories
          </p>
        </div>
      )}

      {/* FOOTER NOTE */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Data updated in real-time • Last updated: Today, 10:30 AM
        </p>
      </div>
    </div>
  );
};

export default Analytics;