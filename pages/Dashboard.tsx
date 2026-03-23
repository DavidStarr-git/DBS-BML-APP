
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Flame, Mic2, ChevronRight, AlertCircle, Loader2, Activity, HelpCircle } from 'lucide-react';
import { User, StimSetting, RecordingResult } from '../types';
import { THEME, TASKS } from '../constants';

interface DashboardProps {
  user: User | null;
  currentSetting: StimSetting;
  onSettingChange: (s: StimSetting) => void;
  hasSeenInitialPrompt: boolean;
  onDismissPrompt: () => void;
  lastSession?: RecordingResult;
  reminderTime: string;
  streak: number;
  preferredTaskId: string | null;
}

import { NativeBridge } from '../src/utils/nativeBridge';

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  currentSetting, 
  onSettingChange, 
  hasSeenInitialPrompt,
  onDismissPrompt,
  streak,
  preferredTaskId
}) => {
  const navigate = useNavigate();
  const [micStatus, setMicStatus] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [isSelecting, setIsSelecting] = useState(false);

  const preferredTask = TASKS.find(t => t.id === preferredTaskId);

  useEffect(() => {
    NativeBridge.checkPermissionStatus()
      .then((status) => setMicStatus(status))
      .catch(() => setMicStatus('prompt'));
  }, []);

  const handleRequestMic = async () => {
    const granted = await NativeBridge.requestMicrophonePermission();
    setMicStatus(granted ? 'granted' : 'denied');
    return granted;
  };

  const handleStartSession = async () => {
    if (micStatus !== 'granted') {
      const granted = await handleRequestMic();
      if (!granted) return;
    }

    setIsSelecting(true);
    setTimeout(() => {
      setIsSelecting(false);
      navigate(`/record/${TASKS[0].id}`, { state: { isSession: true, taskIndex: 0 } });
    }, 1200);
  };

  const stimOptions: Exclude<StimSetting, 'Unknown'>[] = ['A', 'B', 'C'];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen relative overflow-hidden">
      {/* Decorative UF Pattern Background element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0021A5]/5 rounded-full blur-3xl"></div>

      {/* Initial Setting Selection Overlay */}
      {currentSetting === 'Unknown' && !hasSeenInitialPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0021A5]/90 backdrop-blur-lg p-6">
          <div className="bg-white w-full rounded-[3.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                 <span className="text-9xl font-black rotate-12 block">UF</span>
            </div>
            
            <div className="text-center space-y-2 relative z-10">
              <div className="w-20 h-20 bg-blue-50 text-[#0021A5] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Activity size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">Current Level</h2>
              <p className="text-gray-500 font-medium text-lg">Please select your active stimulation group to proceed.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 relative z-10">
              {stimOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onSettingChange(opt)}
                  className="w-full py-8 bg-gray-50 hover:bg-blue-50 active:scale-95 transition-all rounded-[2rem] border-2 border-transparent hover:border-blue-200 flex items-center justify-center gap-6 group"
                >
                  <span className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl font-black text-[#0021A5] group-hover:scale-110 transition-transform">
                    {opt}
                  </span>
                  <span className="text-xl font-black text-gray-700">Group {opt}</span>
                </button>
              ))}
              
              <button
                onClick={onDismissPrompt}
                className="w-full py-6 mt-2 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-colors group"
              >
                <HelpCircle size={18} className="group-hover:animate-bounce" />
                <span className="font-bold text-sm uppercase tracking-widest underline underline-offset-4 decoration-gray-200">I don't know my setting</span>
              </button>
            </div>

            <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] relative z-10">
              Norman Fixel Neurological Institute
            </p>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center mb-4 pt-4 relative z-10">
        <div>
          <h2 className="text-[#FA4616] text-[10px] font-black uppercase tracking-[0.2em] mb-1">UF Health Patient Portal</h2>
          <h1 className="text-3xl font-black text-gray-900">{user?.name || 'David Starr'}</h1>
        </div>
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-100"
          style={{ backgroundColor: THEME.secondary }}
        >
          UF
        </div>
      </header>

      {/* Stimulation Level Card */}
      <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex items-center justify-between transition-all active:scale-[0.98] relative z-10">
        <div className="flex items-center gap-6">
          <div 
            className={`transition-all duration-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg border-4 border-white/20 ${currentSetting === 'Unknown' ? 'w-16 h-16 bg-gray-400 text-3xl' : 'w-16 h-16 bg-[#0021A5] text-3xl'}`}
          >
            {currentSetting === 'Unknown' ? "?" : currentSetting}
          </div>
          <div>
            <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] leading-none mb-1">Active DBS Level</h3>
            <p className="text-xl font-black text-gray-900">
              {currentSetting === 'Unknown' ? "Not Selected" : `Group ${currentSetting}`}
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/settings')}
          className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-[#0021A5] transition-colors"
        >
          <ChevronRight size={28} strokeWidth={3} />
        </button>
      </section>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform group-active:scale-90 ${streak > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
            <Flame className={streak > 0 ? "text-[#FA4616]" : "text-gray-300"} size={32} fill={streak > 0 ? "currentColor" : "none"} />
          </div>
          <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Daily Streak</h3>
          <p className="text-2xl font-black text-gray-900">
            {streak} <span className="text-xs text-gray-400 font-bold uppercase">{streak === 1 ? 'Day' : 'Days'}</span>
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform group-active:scale-90 ${micStatus === 'granted' ? 'bg-blue-50' : micStatus === 'denied' ? 'bg-red-50' : 'bg-orange-50'}`}>
            {micStatus === 'denied' ? (
              <AlertCircle className="text-red-600" size={32} />
            ) : micStatus === 'granted' ? (
              <Mic2 className="text-[#0021A5]" size={32} />
            ) : (
              <HelpCircle className="text-orange-500" size={32} />
            )}
          </div>
          <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Microphone</h3>
          {micStatus === 'prompt' ? (
            <button 
              onClick={handleRequestMic}
              className="text-[10px] font-black text-[#0021A5] uppercase tracking-widest underline underline-offset-4"
            >
              Enable Now
            </button>
          ) : (
            <p className="text-xl font-black text-gray-900 mt-1">
              {micStatus === 'checking' ? '...' : micStatus === 'granted' ? 'Active' : 'Blocked'}
            </p>
          )}
        </div>
        {micStatus === 'denied' && (
          <div className="col-span-2 bg-red-50 p-4 rounded-2xl border border-red-100 mt-2">
            <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mb-1">Troubleshooting:</p>
            <p className="text-[10px] text-red-500 font-bold leading-tight">
              Microphone access is blocked. To fix this on a Galaxy Tablet:
              <br/>1. Tap the lock icon in the address bar.
              <br/>2. Select 'Site settings'.
              <br/>3. Tap 'Microphone' and select 'Allow'.
              <br/>4. Refresh this page.
            </p>
          </div>
        )}
      </div>

      {/* Primary Action */}
      <div className="pt-4 relative z-10 space-y-6">
        <div className="text-center px-6">
          <p className="text-gray-500 text-sm font-bold leading-relaxed">
            There are {TASKS.length} tasks to complete, which should take about 10 minutes.
          </p>
        </div>

        <button
          onClick={handleStartSession}
          disabled={isSelecting}
          className="w-full py-14 rounded-[3.5rem] flex flex-col items-center justify-center gap-4 text-white shadow-2xl shadow-blue-200 active:scale-95 transition-all group relative overflow-hidden disabled:opacity-90"
          style={{ backgroundColor: THEME.primary }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/10 group-hover:scale-110 transition-transform">
            {isSelecting ? (
              <Loader2 className="animate-spin text-white" size={36} />
            ) : (
              <Play fill="white" size={36} className="ml-1" />
            )}
          </div>
          <div className="text-center">
            <span className="text-2xl font-black uppercase tracking-[0.3em] block">
              {isSelecting ? 'Selecting...' : 'Start Session'}
            </span>
            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">UF Diagnostic Protocol</span>
          </div>
        </button>
        
        {currentSetting === 'Unknown' && (
          <div className="flex items-center justify-center gap-2 mt-6 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FA4616]"></div>
            <p className="text-[#FA4616] text-[10px] font-black uppercase tracking-widest">
              Action Required: Set active level in profile
            </p>
          </div>
        )}
      </div>

      <footer className="text-center pt-8">
        <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.4em]">
          Norman Fixel Neurological Institute • BML 2.1
        </p>
        <p className="text-[10px] font-black text-[#FA4616]/40 uppercase tracking-[0.2em] mt-2 italic">
          Go Gators!
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
