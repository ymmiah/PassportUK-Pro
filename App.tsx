
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import RequirementCard from './components/RequirementCard';
import PassportPreview from './components/PassportPreview';
import ImageCropper from './components/ImageCropper';
import { processPassportPhoto, ProcessedResponse } from './geminiService';
import { ProcessingStatus } from './types';

type View = 'home' | 'about' | 'privacy' | 'terms' | 'gdpr' | 'license';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string>('');
  const [complianceScore, setComplianceScore] = useState<number>(0);
  const [aiMetrics, setAiMetrics] = useState<{ [key: string]: string }>({});
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg'>('image/jpeg');
  const [isComparing, setIsComparing] = useState(false);
  
  // Toolkit State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [exposure, setExposure] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [facialRepairMode, setFacialRepairMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { setError("Invalid image."); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImage(event.target?.result as string);
        setStatus(ProcessingStatus.CROPPING);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropDone = (cropped: string) => { setOriginalImage(cropped); setStatus(ProcessingStatus.UPLOADING); };
  
  const handleProcess = async (specificRepair?: string) => {
    if (!originalImage) return;
    setStatus(ProcessingStatus.PROCESSING);
    setError(null);
    try {
      const prompt = specificRepair || customPrompt;
      const result = await processPassportPhoto(processedImage || originalImage, prompt);
      setProcessedImage(result.image);
      setAiDescription(result.description);
      setComplianceScore(result.score);
      setAiMetrics(result.metrics);
      setStatus(ProcessingStatus.COMPLETED);
    } catch (err: any) {
      setError(err.message || "Transformation failed.");
      setStatus(ProcessingStatus.FAILED);
    }
  };

  const applyPreset = (preset: string) => {
    switch(preset) {
      case 'neutral': setBrightness(100); setContrast(100); setExposure(100); setSaturation(100); break;
      case 'studio': setBrightness(110); setContrast(105); setExposure(105); setSaturation(95); break;
      case 'highkey': setBrightness(115); setContrast(95); setExposure(110); setSaturation(90); break;
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) brightness(${exposure/100})`;
        if (exportFormat === 'image/jpeg') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.href = canvas.toDataURL(exportFormat, 0.9);
        link.download = `UK-Passport-Pass-${complianceScore}.${exportFormat === 'image/png' ? 'png' : 'jpg'}`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
      }
    };
    img.src = processedImage;
  };

  const reset = () => {
    setOriginalImage(null); setProcessedImage(null); setCustomPrompt(''); setTempImage(null);
    setAiDescription(''); setBrightness(100); setContrast(100); setExposure(100); setSaturation(100);
    setComplianceScore(0); setAiMetrics({}); setStatus(ProcessingStatus.IDLE); setError(null);
  };

  const renderHome = () => (
    <>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter uppercase">Passport<span className="text-blue-700">UK</span> Master v3.5</h1>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.4em]">Official HMPO Standard Reconstruction Engine</p>
      </div>
      <RequirementCard />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Step 1: Input */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
          <h2 className="text-sm font-black text-slate-900 mb-6 flex items-center uppercase tracking-widest">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mr-3 shadow-sm">01</span>
            Forensic Input
          </h2>
          
          <div className="flex-grow">
            {status === ProcessingStatus.CROPPING && tempImage ? (
              <ImageCropper image={tempImage} onCropComplete={onCropDone} onCancel={() => {setTempImage(null); setStatus(ProcessingStatus.IDLE);}} />
            ) : !originalImage ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer group h-80 flex flex-col justify-center shadow-inner">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <div className="w-20 h-20 bg-white text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all shadow-xl border border-slate-50"><i className="fa-solid fa-camera-retro text-3xl"></i></div>
                <p className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Begin Facial Audit</p>
                <p className="text-slate-400 text-[9px] mt-3 font-bold uppercase tracking-widest">Supports PNG, JPEG • Optimized for UK Standards</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xl group">
                  <img src={originalImage} className="w-full h-full object-contain" alt="Original" />
                  <div className="absolute top-4 left-4 bg-black/70 text-white text-[8px] px-3 py-1.5 rounded-full backdrop-blur-md uppercase font-black tracking-widest border border-white/10 shadow-2xl">Source Frame</div>
                  <button onClick={reset} className="absolute top-4 right-4 bg-white/95 hover:bg-red-50 text-red-600 w-10 h-10 rounded-2xl shadow-2xl transition-all flex items-center justify-center border border-slate-100"><i className="fa-solid fa-trash-can"></i></button>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center"><i className="fa-solid fa-terminal mr-2 text-blue-600"></i>Audit Directives</label>
                  <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="e.g., 'Target deep glare on forehead', 'Correct tilted posture'..." className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none transition-all resize-none h-32 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-400 shadow-inner" />
                </div>
                <button onClick={() => handleProcess()} disabled={status === ProcessingStatus.PROCESSING} className="w-full py-5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-2xl shadow-2xl shadow-blue-700/20 transition-all flex items-center justify-center space-x-4 uppercase tracking-[0.25em] text-[10px]">
                  {status === ProcessingStatus.PROCESSING ? (<><i className="fa-solid fa-atom animate-spin"></i><span>Auditing HMPO Specs...</span></>) : (<><i className="fa-solid fa-wand-magic-sparkles"></i><span>Verify & Process</span></>)}
                </button>
              </div>
            )}
          </div>
          {error && <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-[10px] flex items-start shadow-lg"><i className="fa-solid fa-triangle-exclamation mt-0.5 mr-3 text-red-500"></i><div className="font-bold"><p className="uppercase mb-1 tracking-widest text-red-600">Audit Blocked</p><p>{error}</p></div></div>}
        </div>
        
        {/* Step 2: Result & Compliance Output */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black text-slate-900 flex items-center uppercase tracking-widest">
              <span className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mr-3 shadow-sm">02</span>
              Compliance Output
            </h2>
            {processedImage && (
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border ${complianceScore >= 90 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                  {complianceScore >= 90 ? 'PASSED' : 'REJECTED'}
                </span>
                <button 
                  onMouseDown={() => setIsComparing(true)} onMouseUp={() => setIsComparing(false)} onMouseLeave={() => setIsComparing(false)}
                  className="text-[8px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-all uppercase tracking-[0.2em] active:scale-95 shadow-sm"
                >
                  <i className="fa-solid fa-code-compare mr-2"></i> Compare
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col space-y-6">
            {status === ProcessingStatus.PROCESSING ? (
              <div className="flex-grow flex flex-col items-center justify-center space-y-8 p-12">
                <div className="w-28 h-28 relative">
                  <div className="absolute inset-0 border-[8px] border-slate-50 rounded-full"></div>
                  <div className="absolute inset-0 border-[8px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center"><i className="fa-solid fa-passport text-blue-500 text-3xl animate-pulse"></i></div>
                </div>
                <div className="text-center space-y-3">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">UK Standard Alignment Pass</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Enforcing 29mm-34mm Crown-to-Chin Ratio</p>
                </div>
              </div>
            ) : processedImage ? (
              <div className="space-y-6">
                <div className="relative group">
                  <div style={isComparing ? {} : { filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) brightness(${exposure/100})` }} className="transition-all duration-700">
                    <PassportPreview image={isComparing ? originalImage || processedImage : processedImage} showOverlay={showGuidelines} />
                  </div>
                </div>
                
                {/* Compliance Meter & Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-5 rounded-3xl shadow-xl flex flex-col items-center justify-center space-y-3">
                    <div className="relative w-20 h-20">
                       <svg className="w-full h-full" viewBox="0 0 100 100">
                         <circle className="text-slate-800 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                         <circle className={`${complianceScore >= 90 ? 'text-green-500' : 'text-red-500'} stroke-current transition-all duration-1000`} strokeWidth="10" strokeDasharray={`${complianceScore * 2.51}, 251`} strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-white font-black text-xl">{complianceScore}%</span>
                       </div>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Biometric Compliance</p>
                  </div>
                  
                  <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col justify-center">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                      <i className="fa-solid fa-list-check mr-2 text-blue-600"></i> Audit Result
                    </h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {Object.entries(aiMetrics).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-500">{key}</span>
                          {/* Fix: Explicitly cast 'val' as string to resolve TypeScript 'unknown' error */}
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${(val as string).toLowerCase().includes('pass') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Surgical Toolkit */}
                <div className="bg-slate-900 p-6 rounded-[2rem] space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center">
                      <i className="fa-solid fa-sliders mr-2 text-blue-500"></i> Post-Process Refinement
                    </h4>
                    <button onClick={() => setFacialRepairMode(!facialRepairMode)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${facialRepairMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                      {facialRepairMode ? 'Exit Repair' : 'Surgical Repair'}
                    </button>
                  </div>

                  {facialRepairMode ? (
                    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 animate-fadeIn">
                       <p className="text-[9px] text-slate-300 font-bold uppercase mb-4 tracking-widest text-center">Localized Biometric Repair</p>
                       <div className="grid grid-cols-1 gap-3">
                          <button onClick={() => handleProcess("FIX REMAINING GLARE: Perform deep surgical liquidation on forehead and cheeks.")} className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[9px] uppercase tracking-widest flex items-center justify-center shadow-xl">
                            <i className="fa-solid fa-bolt-lightning mr-2"></i> Fix Deep Glare Spots
                          </button>
                          <button onClick={() => handleProcess("RE-ALIGN TO UK STANDARD: Ensure crown-to-chin is strictly 70-80% of vertical height.")} className="py-3 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-xl text-[9px] uppercase tracking-widest flex items-center justify-center">
                            <i className="fa-solid fa-expand mr-2"></i> Force UK Standard Scaling
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      {[
                        { label: 'Exposure', val: exposure, set: setExposure },
                        { label: 'Brightness', val: brightness, set: setBrightness },
                        { label: 'Contrast', val: contrast, set: setContrast },
                        { label: 'Saturation', val: saturation, set: setSaturation }
                      ].map(tool => (
                        <div key={tool.label} className="space-y-2">
                          <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            <span>{tool.label}</span>
                            <span className="text-blue-500">{tool.val}%</span>
                          </div>
                          <input type="range" min="50" max="150" value={tool.val} onChange={(e) => tool.set(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-800 pt-5">
                    <div className="flex space-x-2">
                      <button onClick={() => applyPreset('neutral')} className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-[8px] font-black uppercase text-slate-400 rounded-lg hover:text-white transition-all">Revert</button>
                      <button onClick={() => applyPreset('studio')} className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-[8px] font-black uppercase text-slate-400 rounded-lg hover:text-white transition-all">Studio</button>
                    </div>
                    <label className="flex items-center cursor-pointer group">
                      <input type="checkbox" className="sr-only" checked={showGuidelines} onChange={() => setShowGuidelines(!showGuidelines)} />
                      <div className={`w-10 h-5 rounded-full transition-colors ${showGuidelines ? 'bg-blue-600' : 'bg-slate-800'} relative shadow-inner border border-slate-700`}><div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${showGuidelines ? 'translate-x-5' : ''}`}></div></div>
                      <span className="ml-3 text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Compliance Guides</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <div className="flex-grow bg-slate-100 rounded-2xl p-1.5 flex shadow-inner">
                    {['JPG', 'PNG'].map(f => (
                      <button key={f} onClick={() => setExportFormat(f === 'JPG' ? 'image/jpeg' : 'image/png')} className={`flex-grow py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${exportFormat === (f === 'JPG' ? 'image/jpeg' : 'image/png') ? 'bg-white text-blue-700 shadow-md' : 'text-slate-400 hover:text-slate-500'}`}>{f}</button>
                    ))}
                  </div>
                  <button onClick={handleDownload} disabled={complianceScore < 90} className={`px-12 py-3.5 font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center space-x-3 uppercase tracking-[0.3em] text-[10px] border border-slate-800 ${complianceScore >= 90 ? 'bg-slate-900 hover:bg-black text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    <i className="fa-solid fa-cloud-arrow-down"></i>
                    <span>Download Final</span>
                  </button>
                </div>
                {complianceScore < 90 && (
                  <p className="text-[9px] text-center text-red-500 font-black uppercase tracking-widest">Compliance score must be > 90% for accepted download</p>
                )}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-200 py-32 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/40">
                <i className="fa-solid fa-passport text-7xl opacity-5 mb-6 animate-pulse"></i>
                <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-300">Compliance Audit Standby</p>
                <p className="text-[9px] mt-4 font-bold uppercase tracking-widest text-slate-300 opacity-60">Force HMPO alignment by uploading a portrait</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <Header onHomeClick={() => setView('home')} />
      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
        {view === 'home' && renderHome()}
      </main>

      <footer className="bg-slate-900 text-slate-400 pt-24 pb-12 mt-auto">
        <div className="max-w-5xl mx-auto px-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="flex items-center space-x-5 mb-6 md:mb-0">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl"><i className="fa-solid fa-passport text-white text-xl"></i></div>
              <span className="font-black text-2xl text-white tracking-tighter uppercase leading-none">Passport<span className="text-blue-500">UK</span> Master</span>
            </div>
            <div className="flex space-x-8">
              {['Home', 'About', 'License', 'Privacy'].map(item => (
                <button key={item} onClick={() => setView(item.toLowerCase() as any)} className="text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors">{item}</button>
              ))}
            </div>
          </div>
          <div className="pt-12 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col items-center md:items-start space-y-4">
              <span className="text-white font-black text-lg tracking-tight uppercase">Yasin Mohammed Miah</span>
              <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">&copy; 2025 PASSPORT PRO • HMPO BIOMETRIC CORE v3.5</p>
            </div>
            <div className="flex items-center space-x-12 opacity-20">
               <div className="flex items-center space-x-4"><i className="fa-solid fa-atom text-blue-500 text-2xl"></i><span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Quantum Pass</span></div>
               <div className="flex items-center space-x-4"><i className="fa-solid fa-lock text-green-500 text-2xl"></i><span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Secure Audit</span></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
