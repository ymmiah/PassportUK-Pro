import React from 'react';

interface PassportPreviewProps {
  image: string;
  showOverlay: boolean;
}

const PassportPreview: React.FC<PassportPreviewProps> = ({ image, showOverlay }) => {
  return (
    <div className="relative group passport-ratio w-full max-w-[280px] mx-auto bg-gray-200 rounded-sm shadow-2xl overflow-hidden border-[12px] border-white ring-1 ring-slate-200">
      <img 
        src={image} 
        alt="UK Passport Preview" 
        className="w-full h-full object-cover"
      />
      
      {showOverlay && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical Guidelines for 70-80% head size (HMPO Standard) */}
          {/* Crown Line (Approx 15% from top) */}
          <div className="absolute top-[15%] w-full border-t border-blue-500/50 flex justify-center">
            <span className="bg-blue-600 text-white text-[6px] font-black px-1 py-0.5 rounded-b-sm uppercase tracking-tighter -mt-[1px]">CROWN LIMIT</span>
          </div>
          
          {/* Chin Line (Approx 75% from top) */}
          <div className="absolute top-[75%] w-full border-t border-blue-500/50 flex justify-center">
            <span className="bg-blue-600 text-white text-[6px] font-black px-1 py-0.5 rounded-t-sm uppercase tracking-tighter mt-[1px] transform -translate-y-full">CHIN LIMIT</span>
          </div>

          {/* Eye Level Line (Approx 45% from top) */}
          <div className="absolute top-[45%] w-full border-t border-dashed border-slate-400/30"></div>
          
          {/* Vertical Center */}
          <div className="absolute left-1/2 h-full border-l border-dashed border-slate-400/30"></div>
          
          {/* Facial Area Oval */}
          <div className="absolute top-[15%] left-[18%] right-[18%] bottom-[25%] border-2 border-dashed border-blue-400/20 rounded-full"></div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[7px] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] backdrop-blur-md">UK BIOMETRIC GUIDE</div>
        </div>
      )}

      {/* Accepted Badge */}
      <div className="absolute bottom-4 right-4 animate-bounce">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-2xl border-2 border-white ring-4 ring-green-100">
          <i className="fa-solid fa-check text-[12px]"></i>
        </div>
      </div>
    </div>
  );
};

export default PassportPreview;
