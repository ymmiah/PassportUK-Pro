import React from 'react';

interface HeaderProps {
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={onHomeClick}
        >
          <div className="w-8 h-8 bg-blue-900 rounded-sm flex items-center justify-center group-hover:bg-blue-700 transition-colors">
            <i className="fa-solid fa-passport text-white text-sm"></i>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">
            Passport<span className="text-blue-700">UK</span> Pro
          </span>
        </div>
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-500">
          <button onClick={onHomeClick} className="hover:text-blue-600 transition-colors font-bold">Home</button>
          <a href="#" className="hover:text-blue-600 transition-colors font-bold">Requirements</a>
          <a href="#" className="hover:text-blue-600 transition-colors font-bold">FAQ</a>
        </nav>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">Compliance Engine v2.8</span>
        </div>
      </div>
    </header>
  );
};

export default Header;