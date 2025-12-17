
import React from 'react';

interface PassportPreviewProps {
  image: string;
  showOverlay: boolean;
}

const PassportPreview: React.FC<PassportPreviewProps> = ({ image, showOverlay }) => {
  return (
    <div className="relative group passport-ratio w-full max-w-[280px] mx-auto bg-gray-200 rounded-sm shadow-2xl overflow-hidden border-[12px] border-white">
      <img 
        src={image} 
        alt="UK Passport Preview" 
        className="w-full h-full object-cover"
      />
      
      {showOverlay && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Head area circle guide */}
          <div className="absolute top-[10%] left-[15%] right-[15%] bottom-[35%] border-2 border-dashed border-blue-400/50 rounded-full"></div>
          
          {/* Top Line (Crown) */}
          <div className="absolute top-[15%] w-full border-t border-red-500/40"></div>
          {/* Bottom Line (Chin) */}
          <div className="absolute top-[75%] w-full border-t border-red-500/40"></div>
          {/* Vertical Center */}
          <div className="absolute left-1/2 h-full border-l border-dashed border-blue-400/30"></div>
          
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[7px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Alignment Guide</div>
        </div>
      )}

      <div className="absolute bottom-2 right-2">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg border-2 border-white">
          <i className="fa-solid fa-check text-[10px]"></i>
        </div>
      </div>
    </div>
  );
};

export default PassportPreview;
