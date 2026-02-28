
import React, { useEffect, useState } from 'react';
import { LogOut, Mic, Bell, Clock, ShieldCheck } from 'lucide-react';
import { StimSetting } from '../types';
import { THEME } from '../constants';

interface SettingsPageProps {
  currentSetting: StimSetting;
  onSettingChange: (s: StimSetting) => void;
  onLogout: () => void;
  selectedDeviceId: string;
  onDeviceChange: (id: string) => void;
  reminderTime: string;
  onReminderChange: (time: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  currentSetting, 
  onSettingChange, 
  onLogout,
  selectedDeviceId,
  onDeviceChange,
  reminderTime,
  onReminderChange
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const settings: StimSetting[] = ['A', 'B', 'C', 'Unknown'];

  useEffect(() => {
    async function getDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices(allDevices.filter(d => d.kind === 'audioinput'));
      } catch (e) {
        console.error("Device error", e);
      }
    }
    getDevices();
  }, []);

  return (
    <div className="p-8 space-y-10 pb-32 bg-gray-50 min-h-screen">
      <header className="pt-4 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Settings</h1>
          <p className="text-[#FA4616] font-black uppercase tracking-widest text-[10px] mt-1">UF Health Neurology • Patient Profile</p>
        </div>
        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-[#0021A5] font-black text-xs">UF</span>
        </div>
      </header>

      {/* Stimulation Level */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Clinical Protocol</h3>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#0021A5]"></div>
          <div className="grid grid-cols-3 gap-3">
            {settings.map((s) => (
              <button
                key={s}
                onClick={() => onSettingChange(s)}
                className={`py-5 rounded-2xl font-black transition-all active:scale-95 ${
                  currentSetting === s 
                  ? 'bg-[#0021A5] text-white shadow-lg shadow-blue-100'
                  : 'bg-gray-50 text-gray-400 border border-transparent hover:border-gray-200'
                } ${s === 'Unknown' ? 'col-span-3 text-sm uppercase tracking-widest mt-2 bg-white border-2 border-gray-100 py-4' : 'text-2xl'}`}
              >
                {s === 'Unknown' ? "I don't know" : s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Configuration */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Medical Hardware</h3>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-[#0021A5] rounded-xl flex items-center justify-center">
              <Mic size={20} />
            </div>
            <div>
              <span className="font-black text-gray-900 text-sm block leading-none">Audio Input</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Standardized Mic Capture</span>
            </div>
          </div>
          <select 
            value={selectedDeviceId}
            onChange={(e) => onDeviceChange(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-black text-gray-700 outline-none focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="default">Default System Mic</option>
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Device ${d.deviceId.slice(0,5)}`}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Reminder Schedule */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Assessment Schedule</h3>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-50 text-[#FA4616] rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <span className="font-black text-gray-900 text-sm block leading-none">Daily Check-in</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Patient Compliance Reminder</span>
            </div>
          </div>
          <input 
            type="time"
            value={reminderTime}
            onChange={(e) => onReminderChange(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-xl font-black text-gray-900 outline-none focus:border-orange-500"
          />
        </div>
      </section>

      {/* Safety Info */}
      <div className="bg-blue-900/5 p-6 rounded-[2.5rem] border border-blue-900/10 flex items-start gap-4">
        <ShieldCheck className="text-[#0021A5] mt-1 shrink-0" size={24} />
        <div>
          <h4 className="text-xs font-black text-[#0021A5] uppercase tracking-widest mb-1">Clinic Managed</h4>
          <p className="text-[11px] text-blue-900/70 font-medium leading-relaxed">
            All session data is encrypted and stored locally on this device. Data is not stored at the UF Health Neuromodulation Center.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onLogout}
          className="w-full bg-red-50 text-red-600 flex items-center justify-center gap-3 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs active:scale-95 transition-all"
        >
          <LogOut size={18} />
          End Session
        </button>
      </div>

      <footer className="text-center pb-8">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Go Gators!</p>
      </footer>
    </div>
  );
};

export default SettingsPage;
