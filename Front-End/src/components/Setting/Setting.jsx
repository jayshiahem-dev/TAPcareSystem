import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Moon, 
  Sun, 
  Save, 
  LogOut,
  Camera,
  CheckCircle2,
  AlertCircle,
  UserCircle,
  ShieldCheck,
  Settings2,
  Info
} from 'lucide-react';

const Setting = () => {
  // State para sa Theme at Navigation
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);
  
  // State para sa User Info
  const [profile, setProfile] = useState({
    fullName: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    role: 'System Administrator',
    company: 'Tech Solutions PH'
  });

  // State para sa System Configuration (Staff Limit only)
  const [maxStaff, setMaxStaff] = useState(10);

  // State para sa Password
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Helper para sa feedback message
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    showToast('Matagumpay na na-update ang iyong profile!');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast('Hindi magtugma ang password!', 'error');
      return;
    }
    showToast('Na-update na ang iyong password.');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleLimitUpdate = () => {
    if (maxStaff < 1) {
      showToast('Ang limit ay dapat hindi bababa sa 1.', 'error');
      return;
    }
    showToast(`System limit ay matagumpay na na-update sa ${maxStaff}!`);
  };

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* Feedback Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border transition-all animate-bounce ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-orange-50 border-orange-200 text-orange-700'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-medium text-sm">{toast.msg}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-slate-100 pb-6 dark:border-slate-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight italic">Account Settings</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">I-manage ang iyong personal na impormasyon at mga limitasyon ng system.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-orange-400 hover:bg-slate-800' : 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100'}`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition font-semibold text-sm shadow-md">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Tabs */}
          <aside className="lg:col-span-3 space-y-2">
            {[
              { id: 'profile', icon: <User size={20}/>, label: 'Personal Info' },
              { id: 'security', icon: <Lock size={20}/>, label: 'Security & Auth' },
              { id: 'system', icon: <Settings2 size={20}/>, label: 'System Configuration' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                  activeTab === tab.id 
                    ? 'bg-orange-500 text-white shadow-lg border-b-4 border-orange-700' 
                    : 'text-slate-500 hover:bg-orange-50 dark:hover:bg-slate-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </aside>

          {/* Content Main Area */}
          <main className="lg:col-span-9">
            
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <section className={`rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 text-orange-600">
                    <UserCircle size={24} />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Details</h3>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                      <div className="relative group">
                        <div className="w-28 h-28 rounded-full bg-orange-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-md dark:border-slate-800 dark:bg-slate-800">
                           <User size={48} className="text-orange-400" />
                        </div>
                        <button className="absolute bottom-1 right-1 p-2 bg-orange-500 text-white rounded-full shadow-lg hover:scale-110 transition border border-orange-600">
                          <Camera size={16} />
                        </button>
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="text-2xl font-bold">{profile.fullName}</h4>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-tighter">{profile.role}</p>
                        <p className="text-slate-400 text-xs italic">{profile.company}</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold opacity-80">Full Name</label>
                        <input 
                          type="text" 
                          value={profile.fullName}
                          onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                          className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition font-medium ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold opacity-80">Email Address</label>
                        <input 
                          type="email" 
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition font-medium ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end mt-4">
                        <button type="submit" className="flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-md border-b-4 border-orange-700">
                          <Save size={18} /> Save Profile
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <section className={`rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 text-orange-600">
                    <ShieldCheck size={24} />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h3>
                  </div>
                  <form onSubmit={handlePasswordUpdate} className="p-8">
                    <div className="max-w-md space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold opacity-80">Kasalukuyang Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                      <div className="h-px bg-slate-100 dark:bg-slate-800" />
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold opacity-80">Bagong Password</label>
                        <input 
                          type="password" 
                          placeholder="Ipasok ang bagong password"
                          className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold opacity-80">Kumpirmahin ang Password</label>
                        <input 
                          type="password" 
                          placeholder="Ulitin ang bagong password"
                          className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                      <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-xl font-black uppercase tracking-wider hover:bg-orange-600 transition shadow-md border-b-4 border-orange-700">
                        Update Password
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <section className={`rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 text-orange-600">
                    <Settings2 size={24} />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">System Configuration</h3>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-8 rounded-3xl border border-dashed border-orange-200 dark:border-orange-800/50">
                      <div className="max-w-xl mx-auto text-center space-y-6">
                        <div className="inline-flex p-4 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 mb-2">
                           <Settings2 size={32} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-2xl tracking-tight italic">Maximum Staff Limit</h4>
                          <p className="text-slate-500 mt-2">
                            I-set ang kabuuang bilang ng staff accounts na pinapayagang mag-register o ma-access ang system. 
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-center gap-4 pt-4">
                          <div className="relative group w-full max-w-xs">
                             <input 
                              type="number" 
                              value={maxStaff}
                              onChange={(e) => setMaxStaff(parseInt(e.target.value) || 0)}
                              className={`w-full p-5 rounded-2xl border-2 text-center font-black text-3xl focus:ring-4 focus:ring-orange-500/20 outline-none transition-all ${
                                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-orange-200'
                              }`}
                            />
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                              Limit Value
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleLimitUpdate}
                            className="flex items-center gap-3 bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-600 transition shadow-md border-b-4 border-orange-700"
                          >
                            <Save size={20} /> I-update System Limit
                          </button>
                        </div>

                        <div className="flex items-start gap-3 text-left p-4 bg-white dark:bg-slate-800 rounded-xl text-slate-600 border border-slate-100 dark:border-slate-700 shadow-sm">
                          <Info size={20} className="shrink-0 mt-0.5 text-orange-500" />
                          <p className="text-xs font-medium">
                            Paalala: Ang pagbabago sa limitasyong ito ay mag-aapply agad sa lahat ng registration modules ng system.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Setting;