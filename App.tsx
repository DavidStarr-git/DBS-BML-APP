
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, Settings } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import RecordingPage from './pages/RecordingPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import { User, StimSetting, RecordingResult } from './types';
import { THEME } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSetting, setCurrentSetting] = useState<StimSetting>('Unknown');
  const [hasSeenInitialPrompt, setHasSeenInitialPrompt] = useState(false);
  const [history, setHistory] = useState<RecordingResult[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  const [streak, setStreak] = useState(0);
  const [preferredTaskId, setPreferredTaskId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const notificationInterval = useRef<number | null>(null);

  // Calculate Daily Streak
  useEffect(() => {
    if (history.length === 0) {
      setStreak(0);
      return;
    }

    const uniqueDates = Array.from(new Set<string>(
      history.map(h => new Date(h.timestamp).toDateString())
    )).map(d => new Date(d));

    uniqueDates.sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentStreak = 0;
    let checkDate = uniqueDates[0];

    if (checkDate.getTime() < yesterday.getTime()) {
      setStreak(0);
      return;
    }

    let expectedDate = new Date(checkDate);
    for (const date of uniqueDates) {
      if (date.getTime() === expectedDate.getTime()) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [history]);

  // Daily Reminder Logic
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkReminder = () => {
      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTimeStr === reminderTime) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("DBS Speech Assessment", {
            body: "It's time for your daily voice recording session!",
            icon: "/favicon.ico"
          });
        }
      }
    };

    notificationInterval.current = window.setInterval(checkReminder, 60000);
    return () => {
      if (notificationInterval.current) clearInterval(notificationInterval.current);
    };
  }, [reminderTime]);

  const handleLogin = (name: string) => {
    setUser({ name, patientId: 'UF-' + Math.floor(Math.random() * 9000 + 1000) });
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentSetting('Unknown');
    setHasSeenInitialPrompt(false);
    navigate('/');
  };

  const addRecording = (result: RecordingResult) => {
    setHistory(prev => [result, ...prev]);
    
    // Automatically trigger download to local machine
    if (result.audioBlob) {
      const url = URL.createObjectURL(result.audioBlob);
      const a = document.createElement('a');
      const now = new Date();
      const timestamp = now.toISOString().split('.')[0].replace(/[:]/g, '-');
      const taskName = result.taskTitle.replace(/\s+/g, '_');
      const setting = result.setting === 'Unknown' ? 'Unknown' : result.setting;
      
      a.href = url;
      a.download = `DBS_${taskName}_Setting_${setting}_${timestamp}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL object after a short delay to ensure download starts
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  const isRecordingPath = location.pathname.startsWith('/record');
  const hideNav = location.pathname === '/' || isRecordingPath;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50 shadow-2xl overflow-hidden relative border-x border-gray-200">
      <main className={`flex-1 overflow-y-auto no-scrollbar ${hideNav ? '' : 'pb-24'}`}>
        <Routes>
          <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                user={user} 
                currentSetting={currentSetting} 
                onSettingChange={(s) => {
                  setCurrentSetting(s);
                  setHasSeenInitialPrompt(true);
                }}
                hasSeenInitialPrompt={hasSeenInitialPrompt}
                onDismissPrompt={() => setHasSeenInitialPrompt(true)}
                lastSession={history[0]} 
                reminderTime={reminderTime}
                streak={streak}
                preferredTaskId={preferredTaskId}
              />
            } 
          />
          <Route path="/tasks" element={<TaskList preferredTaskId={preferredTaskId} onSetPreferred={setPreferredTaskId} />} />
          <Route 
            path="/record/:taskId" 
            element={
              <RecordingPage 
                currentSetting={currentSetting} 
                onSave={addRecording} 
                deviceId={selectedDeviceId}
              />
            } 
          />
          <Route path="/stats" element={<StatsPage history={history} />} />
          <Route 
            path="/settings" 
            element={
              <SettingsPage 
                currentSetting={currentSetting} 
                onSettingChange={setCurrentSetting} 
                onLogout={handleLogout}
                selectedDeviceId={selectedDeviceId}
                onDeviceChange={setSelectedDeviceId}
                reminderTime={reminderTime}
                onReminderChange={setReminderTime}
              />
            } 
          />
        </Routes>
      </main>

      {!hideNav && (
        <nav 
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-gray-100 px-10 py-6 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
          style={{ backgroundColor: THEME.bg }}
        >
          <NavItem to="/dashboard" icon={<Home size={28} />} active={location.pathname === '/dashboard'} />
          <NavItem to="/stats" icon={<BarChart2 size={28} />} active={location.pathname === '/stats'} />
          <NavItem to="/settings" icon={<Settings size={28} />} active={location.pathname === '/settings'} />
        </nav>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, active }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(to)}
      className={`p-2 transition-all duration-300 ${active ? 'text-[#0021A5]' : 'text-gray-300'}`}
    >
      {icon}
    </button>
  );
};

export default App;
