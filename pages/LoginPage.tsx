
import React, { useState } from 'react';
import { THEME } from '../constants';
import { AlertCircle, Shield } from 'lucide-react';

interface LoginPageProps {
  onLogin: (name: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username === 'admin' && password === 'admin') {
      onLogin(username);
    } else {
      setError('Incorrect username or password');
    }
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

      <form onSubmit={handleSubmit} className="w-full space-y-5 relative z-10 max-w-sm">
        {error && (
          <div className="bg-red-50 border border-red-100 p-5 rounded-[2rem] flex items-center gap-4 text-red-600 font-black text-xs uppercase tracking-tight">
            <AlertCircle size={20} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-white border-2 border-transparent focus:border-[#0021A5] outline-none rounded-[2rem] py-5 px-8 text-lg font-bold transition-all shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white border-2 border-transparent focus:border-[#0021A5] outline-none rounded-[2rem] py-5 px-8 text-lg font-bold transition-all shadow-sm"
          />
        </div>
        
        <button
          type="submit"
          className="w-full text-white font-black py-6 rounded-[2.5rem] text-xl transition-all shadow-xl shadow-blue-100 mt-4 active:scale-95 flex items-center justify-center gap-3 group"
          style={{ backgroundColor: THEME.primary }}
        >
          Secure Sign In
        </button>
      </form>
      
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
