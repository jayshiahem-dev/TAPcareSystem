import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements - Orange Glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Animated Icon - Maintenance/Gear */}
        <div className="flex justify-center mb-8">
          <div className="animate-bounce transition-all duration-[3000ms] ease-in-out">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-20 h-20 md:w-24 md:h-24 text-orange-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-slate-800">
          Naka-<span className="text-orange-500 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">Maintenance</span> Lang Kami.
        </h1>
        
        <p className="text-slate-500 text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
          Inaayos lang namin ang ilang bagay para mas mapaganda ang iyong karanasan. 
          Babalik din kami agad, kaya abangan niyo kami!
        </p>

        {/* Minimalist Divider */}
        <div className="w-16 h-1.5 bg-orange-500/20 rounded-full mx-auto mb-12">
            <div className="w-8 h-full bg-orange-500 rounded-full mx-auto"></div>
        </div>

        {/* Back Button / Home (Optional minimalist link) */}
        <div className="flex justify-center">
            <button className="text-orange-600 font-semibold text-sm hover:underline tracking-widest uppercase transition-all">
                Subukan ulit mamaya
            </button>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-8 text-slate-400 text-[10px] tracking-[0.3em] uppercase font-bold">
        © 2024 Iyong Kompanya
      </div>
    </div>
  );
};

export default App;