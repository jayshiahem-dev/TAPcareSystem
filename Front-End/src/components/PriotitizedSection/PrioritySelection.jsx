import React, { useState, useMemo } from 'react';
import { Search, Award, Users, MapPin, CheckSquare, UserCheck, ChevronRight, Trash2, ArrowRightLeft, Filter, ChevronLeft, ChevronRight as ChevronRightIcon, X, Banknote, ShieldCheck, Search as SearchIcon, Send } from 'lucide-react';
import { useTheme } from "@/hooks/use-theme";

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeople, setSelectedPeople] = useState([]); 
  const [filterBrgy, setFilterBrgy] = useState('All');
  const [filterMuni, setFilterMuni] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeApplicant, setActiveApplicant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Pagination states
  const [applicantPage, setApplicantPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState(1);
  const itemsPerPage = 5;

  // Use global theme
  const { theme } = useTheme();

  // Categories
  const ayudaCategories = [
    { id: 'cat1', label: 'Educational Assistance (College)', amount: 5000 },
    { id: 'cat2', label: 'Medical Assistance (Maintenance)', amount: 3000 },
    { id: 'cat3', label: 'Emergency Relief (Fire)', amount: 10000 },
    { id: 'cat4', label: 'Livelihood Support (Small Biz)', amount: 7000 },
    { id: 'cat5', label: 'Senior Citizen Cash Gift', amount: 2000 },
    { id: 'cat6', label: 'Solo Parent Subsidy', amount: 1500 },
    { id: 'cat7', label: 'Burial Assistance', amount: 5000 },
    { id: 'cat8', label: 'PWD Monthly Allowance', amount: 1000 },
    { id: 'cat9', label: 'TUPAD / Cash for Work', amount: 4500 },
    { id: 'cat10', label: 'Housing Repair Kit', amount: 12000 },
    { id: 'cat11', label: 'Farmers Subsidy (Fertilizer)', amount: 3500 },
    { id: 'cat12', label: 'Fishermen Assistance (Fuel)', amount: 2500 },
  ];

  const applicants = [
    { id: 1, name: "Maria Clara", priority: "High", location: "San Jose", municipality: "City of Manila" },
    { id: 2, name: "Juan Dela Cruz", priority: "High", location: "Maligaya", municipality: "Quezon City" },
    { id: 3, name: "Elena Ramos", priority: "Medium", location: "San Jose", municipality: "City of Manila" },
    { id: 4, name: "Ricardo Dalisay", priority: "Medium", location: "Pag-asa", municipality: "Quezon City" },
    { id: 5, name: "Luzviminda Santos", priority: "High", location: "Maligaya", municipality: "Quezon City" },
    { id: 6, name: "Antonio Luna", priority: "Low", location: "San Jose", municipality: "City of Manila" },
    { id: 7, name: "Jose Rizal", priority: "High", location: "Poblacion", municipality: "Calamba" },
    { id: 8, name: "Andres Bonifacio", priority: "High", location: "San Jose", municipality: "City of Manila" },
  ];

  // Logic to handle submission and logging
  const handleSubmitFinalList = () => {
    console.log("--- SUBMITTED LIST OF BENEFICIARIES ---");
    console.table(selectedPeople.map(p => ({
      ID: p.id,
      Name: p.name,
      Category: p.selectedCategory,
      Amount: `₱${p.amount.toLocaleString()}`,
      Location: `${p.location}, ${p.municipality}`
    })));
    
    const timestamp = new Date().toLocaleTimeString();
    console.log(`Submitted at: ${timestamp}`);
    window.dispatchEvent(new CustomEvent('notification', { detail: 'List has been logged to console.' }));
  };

  const filteredCategories = ayudaCategories.filter(cat => 
    cat.label.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const municipalities = useMemo(() => ['All', ...new Set(applicants.map(a => a.municipality))], []);
  const barangays = useMemo(() => {
    const list = filterMuni === 'All' ? applicants : applicants.filter(a => a.municipality === filterMuni);
    return ['All', ...new Set(list.map(a => a.location))];
  }, [filterMuni]);

  const filteredApplicants = applicants.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuni = filterMuni === 'All' || person.municipality === filterMuni;
    const matchesBrgy = filterBrgy === 'All' || person.location === filterBrgy;
    return matchesSearch && matchesMuni && matchesBrgy;
  });

  const totalApplicantPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const currentApplicants = filteredApplicants.slice((applicantPage - 1) * itemsPerPage, applicantPage * itemsPerPage);

  const totalSelectedPages = Math.ceil(selectedPeople.length / itemsPerPage);
  const currentSelected = selectedPeople.slice((selectedPage - 1) * itemsPerPage, selectedPage * itemsPerPage);

  const handleInitiateSelection = (person) => {
    const alreadySelected = selectedPeople.find(p => p.id === person.id);
    if (alreadySelected) {
      setSelectedPeople(selectedPeople.filter(p => p.id !== person.id));
    } else {
      setActiveApplicant(person);
      setCategorySearch('');
      setSelectedCategory(''); 
      setIsModalOpen(true);
    }
  };

  const confirmSelection = () => {
    if (!selectedCategory) return;
    const categoryDetails = ayudaCategories.find(c => c.id === selectedCategory);
    const newEntry = {
      ...activeApplicant,
      selectedCategory: categoryDetails.label,
      amount: categoryDetails.amount
    };
    setSelectedPeople([...selectedPeople, newEntry]);
    setIsModalOpen(false);
  };

  const PaginationControls = ({ current, total, onPageChange }) => (
    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors">
      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Page {current} of {total || 1}</span>
      <div className="flex gap-2">
        <button 
          onClick={() => onPageChange(Math.max(1, current - 1))} 
          disabled={current === 1} 
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onPageChange(Math.min(total, current + 1))} 
          disabled={current === total || total === 0} 
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-black uppercase text-xs tracking-widest">
                <Banknote className="w-5 h-5" /> Select Assistance Type
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 dark:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="text-center mb-4">
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{activeApplicant?.name}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight">Brgy. {activeApplicant?.location}</p>
              </div>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Hanapin ang category..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white transition-colors"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-slate-50/30 dark:bg-slate-900/30">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedCategory === cat.id 
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-white dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 bg-white dark:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={`w-4 h-4 rounded-full border-4 ${selectedCategory === cat.id ? 'border-blue-600 dark:border-blue-400' : 'border-slate-200 dark:border-slate-600'}`} />
                    <span className={`text-sm font-bold ${selectedCategory === cat.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300'}`}>
                      {cat.label}
                    </span>
                  </div>
                  <span className={`text-xs font-black ${selectedCategory === cat.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    ₱{cat.amount.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3 bg-white dark:bg-slate-800">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 py-3 text-xs text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors tracking-widest uppercase"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSelection} 
                disabled={!selectedCategory}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-100 dark:shadow-blue-900/30 transition-all tracking-widest uppercase"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-20 shadow-sm transition-colors">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] tracking-tight leading-none">
                Ayuda Selection Tool
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                Ready for Many Categories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Hanapin ang aplikante..." 
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white transition-colors"
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setApplicantPage(1); }} 
              />
            </div>
            {selectedPeople.length > 0 && (
              <button 
                onClick={handleSubmitFinalList}
                className="px-6 py-2 bg-green-600 text-white font-black rounded-lg text-sm hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-100 dark:shadow-green-900/30 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" /> Submit List ({selectedPeople.length})
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-wrap gap-4 items-end transition-colors">
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              Municipality
            </label>
            <select 
              value={filterMuni} 
              onChange={(e) => { setFilterMuni(e.target.value); setFilterBrgy('All'); setApplicantPage(1); }} 
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white transition-colors"
            >
              {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              Barangay
            </label>
            <select 
              value={filterBrgy} 
              onChange={(e) => { setFilterBrgy(e.target.value); setApplicantPage(1); }} 
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white transition-colors"
            >
              {barangays.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* APPLICANTS TABLE */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[500px] flex flex-col transition-colors">
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-3 text-center w-20">Select</th>
                      <th className="px-4 py-3">Aplikante</th>
                      <th className="px-4 py-3 text-center">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {currentApplicants.map((person) => {
                      const isSelected = selectedPeople.some(p => p.id === person.id);
                      return (
                        <tr 
                          key={person.id} 
                          className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all ${
                            isSelected ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <td className="px-4 py-5 text-center">
                            <button 
                              onClick={() => handleInitiateSelection(person)} 
                              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all ${
                                isSelected 
                                  ? 'bg-blue-600 border-blue-600' 
                                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                              }`}
                            >
                              {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                            </button>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 shrink-0 uppercase">
                                {person.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">
                                  {person.name}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight">
                                  Brgy. {person.location}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                              person.priority === 'High' 
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' 
                                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                            }`}>
                              {person.priority}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationControls current={applicantPage} total={totalApplicantPages} onPageChange={setApplicantPage} />
            </div>
          </div>

          {/* SELECTED TABLE - WALANG "Final List" LABEL */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 shadow-xl shadow-blue-50 dark:shadow-blue-900/10 overflow-hidden min-h-[500px] flex flex-col transition-colors">
              <div className="p-4 border-b border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 flex justify-between items-center">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded uppercase tracking-tighter">
                  {selectedPeople.length} Selected
                </span>
              </div>
              <div className="flex-1 overflow-x-auto">
                {selectedPeople.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <tr>
                        <th className="px-4 py-3">Details</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50 dark:divide-blue-900/20">
                      {currentSelected.map((person) => (
                        <tr key={person.id} className="animate-in slide-in-from-right-2 duration-300">
                          <td className="px-4 py-4">
                            <p className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                              {person.name}
                            </p>
                            <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-tighter mt-0.5">
                              {person.selectedCategory}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <p className="font-black text-sm text-slate-700 dark:text-white leading-none">
                              ₱{person.amount.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button 
                              onClick={() => setSelectedPeople(selectedPeople.filter(p => p.id !== person.id))} 
                              className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 px-10 text-center text-slate-300 dark:text-slate-600">
                    <ArrowRightLeft className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                      Pumili ng mga benepisyaryo pddara makita rito.
                    </p>
                  </div>
                )}
              </div>
              {selectedPeople.length > 0 && <PaginationControls current={selectedPage} total={totalSelectedPages} onPageChange={setSelectedPage} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;