
import React from 'react';
import { THEME } from '../constants';
import { Shield } from 'lucide-react';

interface LoginPageProps {
  onLogin: (name: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const handleContinue = () => {
    onLogin('Patient');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-gray-50 relative overflow-hidden">
      {/* Subtle UF brand watermarks */}
      <div className="absolute top-10 right-10 text-[8rem] font-black text-gray-100 select-none pointer-events-none">UF</div>
      <div className="absolute bottom-10 left-10 text-[8rem] font-black text-gray-100 select-none pointer-events-none">BML</div>

      <div 
        className="w-28 h-28 rounded-[2.5rem] flex flex-col items-center justify-center mb-8 shadow-2xl shadow-blue-100 relative z-10 border-4 border-white rotate-1"
        style={{ backgroundColor: THEME.primary }}
      >
        <span className="text-white text-4xl font-black -rotate-1">BML</span>
        <span className="text-white/50 text-[10px] font-black uppercase tracking-widest -mt-1">Suite</span>
      </div>
      
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-4xl font-black text-gray-900 mb-1 uppercase tracking-tighter">DBS BML</h1>
        <div className="flex items-center justify-center gap-2">
            <span className="w-6 h-[2px] bg-[#FA4616]"></span>
            <p className="text-[#FA4616] text-[11px] font-black uppercase tracking-[0.3em]">University of Florida Health</p>
            <span className="w-6 h-[2px] bg-[#FA4616]"></span>
        </div>
      </div>

      <div className="w-full relative z-10 max-w-sm">
        <button
          onClick={handleContinue}
          className="w-full text-white font-black py-6 rounded-[2.5rem] text-xl transition-all shadow-xl shadow-blue-100 mt-4 active:scale-95 flex items-center justify-center gap-3 group"
          style={{ backgroundColor: THEME.primary }}
        >
          Continue
        </button>
      </div>
      
      <div className="mt-16 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2 text-gray-300">
            <Shield size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Medical Grade Security</span>
        </div>
        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em]">Norman Fixel Neurological Institute • Gainesville, FL</p>
        <p className="text-[10px] font-black text-[#FA4616]/60 uppercase tracking-[0.4em] mt-3">Go Gators!</p>
      </div>
    </div>
  );
};

export default LoginPage;
