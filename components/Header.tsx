import React from 'react';

interface HeaderProps {
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  return (
    <header className="bg-white/95 backdrop-blur-3xl border-b border-slate-100 sticky top-0 z-50 transition-all">
      <div className="max-w-5xl mx-auto px-6 h-24 flex items-center justify-between">
        <div 
          className="flex items-center space-x-5 cursor-pointer group"
          onClick={onHomeClick}
        >
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-blue-700 transition-all duration-700 shadow-2xl group-hover:shadow-blue-500/20 group-hover:-rotate-12 border border-slate-800">
            <i className="fa-solid fa-passport text-white text-xl"></i>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase leading-none">
              Passport<span className="text-blue-700">UK</span> Pro
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mt-1.5 flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></span>
              Core v3.4 Stable
            </span>
          </div>
        </div>
        <nav className="hidden lg:flex space-x-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          <button onClick={onHomeClick} className="hover:text-blue-700 transition-all hover:tracking-[0.4em] text-slate-900">Portal</button>
          <a href="#" className="hover:text-blue-700 transition-all hover:tracking-[0.4em]">Directives</a>
          <a href="#" className="hover:text-blue-700 transition-all hover:tracking-[0.4em] flex items-center group/status">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 shadow-[0_0_12px_rgba(34,197,94,1)] group-hover/status:scale-125 transition-transform"></div>
            Online
          </a>
        </nav>
        <div className="flex items-center">
          <div className="hidden md:flex items-center bg-slate-900 px-6 py-2.5 rounded-2xl border border-slate-800 shadow-2xl group cursor-default">
            <i className="fa-solid fa-fingerprint text-blue-500 text-sm mr-3 group-hover:scale-125 transition-transform duration-500"></i>
            <span className="text-[10px] uppercase font-black text-white tracking-widest">Surgical Pass</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;