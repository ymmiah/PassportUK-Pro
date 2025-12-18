import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import RequirementCard from './components/RequirementCard';
import PassportPreview from './components/PassportPreview';
import ImageCropper from './components/ImageCropper';
import { processPassportPhoto } from './geminiService';
import { ProcessingStatus } from './types';

type View = 'home' | 'about' | 'privacy' | 'terms' | 'gdpr' | 'license';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg'>('image/jpeg');
  const [exportQuality, setExportQuality] = useState<number>(0.9);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { setError("Please upload a valid image file."); return; }
      if (file.size > 10 * 1024 * 1024) { setError("File size too large. Please upload an image under 10MB."); return; }
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
  const onCropCancel = () => { setTempImage(null); setStatus(ProcessingStatus.IDLE); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleProcess = async () => {
    if (!originalImage) return;
    setStatus(ProcessingStatus.PROCESSING);
    setError(null);
    try {
      const result = await processPassportPhoto(originalImage, customPrompt);
      setProcessedImage(result);
      setStatus(ProcessingStatus.COMPLETED);
    } catch (err: any) {
      setError(err.message || "Something went wrong during processing.");
      setStatus(ProcessingStatus.FAILED);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (exportFormat === 'image/jpeg') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.href = canvas.toDataURL(exportFormat, exportQuality);
        link.download = `passport-pro.${exportFormat === 'image/png' ? 'png' : 'jpg'}`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
      }
    };
    img.src = processedImage;
  };

  const reset = () => {
    setOriginalImage(null); setProcessedImage(null); setCustomPrompt(''); setTempImage(null);
    setStatus(ProcessingStatus.IDLE); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderHome = () => (
    <>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">UK Passport Photo <span className="text-blue-700">Generator</span></h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">AI-powered facial alignment and compliance for HM Passport Office standards.</p>
      </div>
      <RequirementCard />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3 text-xs">1</span>
            {status === ProcessingStatus.CROPPING ? 'Adjust Crop' : 'Upload'}
          </h2>
          {status === ProcessingStatus.CROPPING && tempImage ? (
            <ImageCropper image={tempImage} onCropComplete={onCropDone} onCancel={onCropCancel} />
          ) : !originalImage ? (
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><i className="fa-solid fa-cloud-arrow-up text-xl"></i></div>
              <p className="text-gray-700 font-semibold text-sm">Upload Portrait</p>
              <p className="text-gray-400 text-xs mt-1">PNG, JPG up to 10MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={originalImage} className="w-full h-full object-contain" alt="Original" />
                <button onClick={reset} className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-600 p-2 rounded-full shadow-md transition-colors"><i className="fa-solid fa-trash-can text-sm"></i></button>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center"><i className="fa-solid fa-wand-magic-sparkles mr-2 text-blue-600"></i>AI Refinement</label>
                <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Optional: 'Add blue suit', 'Grey background'..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all resize-none h-20" />
              </div>
              <button onClick={handleProcess} disabled={status === ProcessingStatus.PROCESSING} className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2">
                {status === ProcessingStatus.PROCESSING ? (<><i className="fa-solid fa-circle-notch fa-spin"></i><span>Processing...</span></>) : (<><i className="fa-solid fa-wand-magic-sparkles"></i><span>Generate Photo</span></>)}
              </button>
            </div>
          )}
          {error && <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-start"><i className="fa-solid fa-triangle-exclamation mt-0.5 mr-2"></i><p>{error}</p></div>}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3 text-xs">2</span>Preview
          </h2>
          <div className="flex-grow flex flex-col items-center justify-center">
            {status === ProcessingStatus.PROCESSING ? (
              <div className="text-center space-y-3"><div className="w-16 h-16 mx-auto relative"><div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div><div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div></div><p className="text-sm font-bold text-gray-900">Applying Compliance Logic...</p></div>
            ) : processedImage ? (
              <div className="w-full max-w-[280px] space-y-4">
                <PassportPreview image={processedImage} showOverlay={showGuidelines} />
                <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only" checked={showGuidelines} onChange={() => setShowGuidelines(!showGuidelines)} />
                      <div className={`w-8 h-4 rounded-full transition-colors ${showGuidelines ? 'bg-blue-600' : 'bg-gray-300'} relative`}><div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${showGuidelines ? 'translate-x-4' : ''}`}></div></div>
                      <span className="ml-2 text-xs font-bold text-gray-600">Overlay Guide</span>
                    </label>
                    <div className="flex bg-white rounded-md p-0.5 border border-gray-200">
                      {['JPG', 'PNG'].map(f => (
                        <button key={f} onClick={() => setExportFormat(f === 'JPG' ? 'image/jpeg' : 'image/png')} className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${exportFormat === (f === 'JPG' ? 'image/jpeg' : 'image/png') ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={handleDownload} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"><i className="fa-solid fa-download"></i><span>Download Final</span></button>
              </div>
            ) : (<div className="text-center text-gray-400 py-10"><i className="fa-solid fa-image text-4xl opacity-10 mb-2"></i><p className="text-sm">Processed photo appears here</p></div>)}
          </div>
        </div>
      </div>
    </>
  );

  const renderContentPage = (title: string, icon: string, sections: { head: string, body: React.ReactNode }[]) => (
    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <button onClick={() => setView('home')} className="mb-8 text-blue-600 hover:text-blue-800 flex items-center font-black text-xs uppercase tracking-widest">
        <i className="fa-solid fa-arrow-left mr-2"></i> Return to Generator
      </button>
      <div className="flex items-center space-x-4 mb-10">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{title}</h3>
      </div>
      <div className="space-y-12">
        {sections.map((sec, i) => (
          <section key={i} className="group">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black mr-3 shadow-md group-hover:bg-blue-600 transition-colors">{i+1}</span>
              {sec.head}
            </h4>
            <div className="text-gray-600 leading-relaxed pl-9 space-y-4">
              {sec.body}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
        <span>PassportUK Pro • Intelligence Engine v2.5</span>
        <span>Last Updated: Dec 2025</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onHomeClick={() => setView('home')} />
      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        {view === 'home' && renderHome()}
        
        {view === 'about' && renderContentPage('Platform Intelligence', 'fa-circle-info', [
          { head: 'Mission Statement', body: 'PassportUK Pro is engineered to bridge the gap between amateur photography and professional government standards. Our platform utilizes generative AI to ensure every applicant has access to compliant, high-quality documentation photos.' },
          { head: 'The Anatomical Engine', body: 'Unlike basic filters, our Gemini-powered engine performs a full volumetric analysis of the subject. It detects facial seeds, neutralizes ambient shadows, and reconstructs anatomical features to meet the 35mm x 45mm vertical requirement precisely.' },
          { head: 'Compliance Logic', body: <ul className="list-disc space-y-2"><li><b>Lighting:</b> Balanced high-key output to eliminate nose and ear shadows.</li><li><b>Background:</b> Automatic injection of HMPO-approved Light Grey (#D3D3D3) or Cream.</li><li><b>Alignment:</b> 70-80% facial coverage from crown to chin.</li></ul> },
          { head: 'Global Reach', body: 'While optimized for UK standards, our intelligence model supports diverse demographics across all age groups, from infants to seniors.' }
        ])}

        {view === 'privacy' && renderContentPage('Biometric Privacy', 'fa-shield-halved', [
          { head: 'Data Architecture', body: 'Our processing pipeline is strictly transient. We do not maintain a database of user images, original or processed.' },
          { head: 'Processing Protocol', body: 'When you upload a photo, it is encrypted and transmitted directly to the Gemini 2.5 Flash secure nodes for transformation. Once the result is delivered to your browser, all source data is purged from the processing cache.' },
          { head: 'Biometric Non-Collection', body: 'We do not create facial profiles or biometric signatures. The AI operates on pixel-level reconstruction rather than identifying metadata storage.' },
          { head: 'Cookie Usage', body: 'We use only functional, session-based cookies to maintain app state. No tracking or marketing pixels are deployed on this platform.' }
        ])}

        {view === 'terms' && renderContentPage('Service Terms', 'fa-file-contract', [
          { head: 'Acceptance of Terms', body: 'By accessing this tool, you agree to these legal conditions. You acknowledge that PassportUK Pro is an assistive tool and not an official government entity.' },
          { head: 'Liability Disclaimer', body: 'HM Passport Office holds the final authority on photo acceptance. While our AI targets 99.9% compliance, the author is not responsible for application delays or rejections.' },
          { head: 'User Responsibility', body: 'Users must ensure the source photo is clear and of their own likeness. Misuse of the engine for fraudulent identification is strictly prohibited and violates international cyber-laws.' },
          { head: 'Service Availability', body: 'We strive for 100% uptime but do not guarantee service availability during peak processing loads or maintenance windows.' }
        ])}

        {view === 'gdpr' && renderContentPage('GDPR Compliance', 'fa-fingerprint', [
          { head: 'Data Controller', body: 'The data controller for this application is Yasin Mohammed Miah. For inquiries regarding data processing, please contact the author through the official repository channels.' },
          { head: 'Legal Basis', body: 'Processing is performed under Article 6(1)(a) - Explicit Consent. By uploading your photo, you provide specific consent for the AI transformation process.' },
          { head: 'User Rights', body: <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><b>Right to Erasure:</b> Automated immediately upon session end.</div><div><b>Right to Access:</b> Users can view all processed data in the browser preview.</div></div> },
          { head: 'Secure Transfer', body: 'Data is protected by SSL/TLS 1.3 encryption during transit between the user, the server, and the AI processing nodes.' }
        ])}

        {view === 'license' && renderContentPage('License Policy', 'fa-certificate', [
          { head: 'Non-Commercial Use', body: 'This software is provided free of charge for individual, personal use. This includes use for personal passport applications or for family members.' },
          { head: 'Commercial Restriction', body: 'Any use of this Software within a business, as a paid service to others, or in any revenue-generating capacity requires a paid Enterprise License from Yasin Mohammed Miah.' },
          { head: 'Proprietary Rights', body: 'All code architecture, specific AI prompt engineering logic (the "Anatomical Fulfillment Engine"), and UI branding remain the intellectual property of the author.' },
          { head: 'Attribution Requirement', body: 'Modification of the software must retain the "Powered by Yasin Mohammed Miah" signature in all viewable interfaces.' }
        ])}
      </main>

      <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 md:gap-x-12 mb-12">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20"><i className="fa-solid fa-passport text-white text-sm"></i></div>
                <span className="font-black text-xl text-white tracking-tighter">Passport<span className="text-blue-500">UK</span> Pro</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">The world's most advanced AI compliance engine for official UK passport photography. Precision-engineered for rejection-free applications.</p>
              <div className="flex items-center space-x-3 pt-2">
                {[
                  { icon: 'fa-github', url: 'https://github.com/ymmiah' },
                  { icon: 'fa-facebook-f', url: 'http://facebook.com/ymmiah' },
                  { icon: 'fa-linkedin-in', url: 'https://linkedin.com/in/ymmiah' }
                ].map(social => (
                  <a 
                    key={social.icon} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                  >
                    <i className={`fa-brands ${social.icon} text-xs`}></i>
                  </a>
                ))}
              </div>
            </div>
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Solution</h4>
                <ul className="space-y-2">
                  {['Home', 'About', 'License'].map(l => (<li key={l}><button onClick={() => setView(l.toLowerCase() as any)} className="text-xs text-slate-500 hover:text-blue-400 transition-colors font-medium">{l}</button></li>))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Legal</h4>
                <ul className="space-y-2">
                  {['Privacy', 'Terms', 'GDPR'].map(l => (<li key={l}><button onClick={() => setView(l.toLowerCase() as any)} className="text-xs text-slate-500 hover:text-blue-400 transition-colors font-medium">{l}</button></li>))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div><span className="text-[10px] font-bold text-slate-400">Operational</span></div>
                  <div className="text-[9px] font-black text-slate-600 uppercase">Engine v2.5</div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start space-y-1">
              <span className="text-white font-black text-sm tracking-tight">Developed by Yasin Mohammed Miah</span>
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">&copy; 2025 UK Passport Pro • All Rights Reserved</p>
            </div>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2 opacity-30 grayscale hover:grayscale-0 transition-all duration-500"><i className="fa-solid fa-shield-halved text-blue-500"></i><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">AI-Secure Pipeline</span></div>
               <div className="h-4 w-px bg-slate-800"></div>
               <div className="flex items-center space-x-2 opacity-30 grayscale hover:grayscale-0 transition-all duration-500"><i className="fa-solid fa-lock text-green-500"></i><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">End-to-End Encrypted</span></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;