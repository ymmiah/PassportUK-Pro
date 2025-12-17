import React from 'react';

const RequirementCard: React.FC = () => {
  const requirements = [
    { icon: 'fa-expand', text: '35x45mm Size' },
    { icon: 'fa-user-tie', text: 'Torso visible' },
    { icon: 'fa-palette', text: 'Plain BG' },
    { icon: 'fa-shirt', text: 'Pro Attire' },
    { icon: 'fa-face-meh', text: 'Neutral' },
    { icon: 'fa-eye', text: 'Eye Contact' }
  ];

  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-blue-900 text-xs font-black uppercase tracking-wider flex items-center">
          <i className="fa-solid fa-circle-check mr-2 text-blue-600"></i>
          Compliance Standards
        </h3>
        <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">HMPO SYNC</span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex flex-col items-center text-center text-[10px] text-blue-800 bg-white/70 p-2 rounded-lg border border-blue-50">
            <i className={`fa-solid ${req.icon} mb-1 text-blue-500`}></i>
            <span className="font-bold leading-tight">{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequirementCard;