
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Loader2, CheckCircle, Mic, Volume2 } from 'lucide-react';
import { TASKS, THEME } from '../constants';
import { StimSetting, RecordingResult } from '../types';
import { audioBufferToWav } from '../src/utils/wavEncoder';
import { NativeBridge } from '../src/utils/nativeBridge';

interface RecordingPageProps {
  currentSetting: StimSetting;
  onSave: (result: RecordingResult) => void;
  deviceId: string;
}

const RecordingPage: React.FC<RecordingPageProps> = ({ currentSetting, onSave, deviceId }) => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const task = TASKS.find(t => t.id === taskId);

  const sessionState = location.state as { isSession?: boolean; taskIndex?: number } | null;
  const isSession = sessionState?.isSession;
  const currentTaskIndex = sessionState?.taskIndex ?? 0;
  
  const [phase, setPhase] = useState<'intro' | 'countdown' | 'recording' | 'processing' | 'result'>('intro');
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(0);
  const [randomizedPrompt, setRandomizedPrompt] = useState<string>('');

  useEffect(() => {
    if (task) {
      if (task.wordPool && task.sentencePool) {
        // Shuffle and pick a subset
        const shuffledWords = [...task.wordPool].sort(() => 0.5 - Math.random());
        const shuffledSentences = [...task.sentencePool].sort(() => 0.5 - Math.random());
        
        // Pick 3 words and 2 sentences
        const selectedWords = shuffledWords.slice(0, 3);
        const selectedSentences = shuffledSentences.slice(0, 2);
        
        const prompt = `Words: ${selectedWords.join(', ')}\n\nSentences:\n1. ${selectedSentences[0]}\n2. ${selectedSentences[1]}`;
        setRandomizedPrompt(prompt);
      } else {
        setRandomizedPrompt(task.prompt);
      }
    }
  }, [task]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (phase === 'countdown') {
      const start = Date.now();
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - start) / 1000);
        const remaining = 3 - elapsed;
        
        if (remaining <= 0) {
          clearInterval(interval);
          setCountdown(0);
          startRecording();
        } else {
          setCountdown(remaining);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Auto-stop logic
  useEffect(() => {
    if (phase === 'recording' && task && timer >= task.durationSeconds) {
      stopRecording();
    }
  }, [timer, phase, task]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!task) return null;

  const startRecording = async () => {
    try {
      // 1. First, ensure native-level permissions are requested
      // This implements the logic provided for Android/App context
      const hasPermission = await NativeBridge.requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission denied at system level');
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser');
      }

      const constraints = {
        audio: deviceId === 'default' ? true : { deviceId: { exact: deviceId } }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Try to find a supported mime type
      const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/aac'];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
      
      const mediaRecorder = new MediaRecorder(stream, supportedMimeType ? { mimeType: supportedMimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: supportedMimeType || 'audio/webm' });
        
        // Stop all tracks to release the microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Convert to WAV
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(audioBuffer);
          handleSave(wavBlob);
        } catch (err) {
          console.error("WAV conversion failed, falling back to original", err);
          handleSave(audioBlob);
        }
      };

      mediaRecorder.start();
      setPhase('recording');
      setTimer(0);
      startTimeRef.current = Date.now();
      
      timerIntervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setTimer(elapsed);
      }, 50); // 20fps for smooth UI
    } catch (err) {
      console.error("Recording start error:", err);
      alert('Microphone error: ' + (err instanceof Error ? err.message : 'Please check settings and permissions.'));
      setPhase('intro');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && phase === 'recording') {
      mediaRecorderRef.current.stop();
      setPhase('processing');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleSave = (blob: Blob) => {
    const finalDuration = (Date.now() - startTimeRef.current) / 1000;
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      setting: currentSetting,
      taskTitle: task.title,
      audioBlob: blob,
      duration: Math.round(finalDuration),
      deviceId: deviceId
    });
    
    setTimeout(() => setPhase('result'), 1500);
  };

  const handleNext = () => {
    if (isSession && currentTaskIndex < TASKS.length - 1) {
      const nextIndex = currentTaskIndex + 1;
      navigate(`/record/${TASKS[nextIndex].id}`, { 
        state: { isSession: true, taskIndex: nextIndex },
        replace: true
      });
      setPhase('intro');
      setTimer(0);
      setCountdown(3);
    } else {
      navigate('/dashboard');
    }
  };

  // Progress ring calculation
  const progress = task ? Math.min((timer / task.durationSeconds) * 100, 100) : 0;
  const radius = 85; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Detect if the prompt is a long passage
  const isLongPrompt = randomizedPrompt.length > 50;

  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex flex-col bg-white p-8 relative">
        {isSession && (
          <div className="absolute top-8 right-8 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
            <span className="text-[10px] font-black text-[#0021A5] uppercase tracking-widest">
              {currentTaskIndex + 1} out of {TASKS.length} tasks complete
            </span>
          </div>
        )}
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-gray-400 self-start"><ChevronLeft size={32} /></button>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center text-4xl mb-4">
            {task.icon}
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900">{task.title}</h2>
            <p className="text-[#FA4616] font-black uppercase tracking-[0.2em] text-xs">Diagnostic Module</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 max-w-sm">
            <p className="text-gray-600 font-bold leading-relaxed">
              {task.instruction}
            </p>
          </div>

          <div className="p-6 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/30 w-full max-w-sm overflow-y-auto max-h-48">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Preview Text:</p>
            <span className={`${isLongPrompt ? 'text-lg' : 'text-3xl'} font-black text-[#0021A5] block leading-tight whitespace-pre-wrap`}>
                {randomizedPrompt}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-400 bg-gray-100/50 px-4 py-2 rounded-full">
            <Volume2 size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Recording: {task.durationSeconds}s Automatic</span>
          </div>
        </div>
        
        <button
          onClick={() => setPhase('countdown')}
          className="w-full py-6 rounded-[2.5rem] text-white font-black text-xl shadow-2xl shadow-blue-100 active:scale-95 transition-all mb-8"
          style={{ backgroundColor: THEME.primary }}
        >
          Begin Protocol
        </button>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-8 overflow-hidden relative" style={{ backgroundColor: THEME.primary }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-wrap gap-10 items-center justify-center">
            {Array.from({length: 20}).map((_, i) => <Mic key={i} size={40} />)}
        </div>
        <div className="relative z-10 text-center space-y-8">
            <h3 className="text-2xl font-black uppercase tracking-[0.4em] opacity-60 animate-pulse">Get Ready...</h3>
            <div className="w-64 h-64 rounded-full border-8 border-white/20 flex items-center justify-center">
                <span className="text-[12rem] font-black leading-none">{countdown}</span>
            </div>
            <p className="text-white/40 font-black uppercase tracking-widest">Norman Fixel Neurological Institute</p>
        </div>
      </div>
    );
  }

  if (phase === 'recording') {
    return (
      <div className="min-h-screen flex flex-col bg-white p-8 relative">
        {isSession && (
          <div className="absolute top-8 right-8 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
            <span className="text-[10px] font-black text-[#0021A5] uppercase tracking-widest">
              {currentTaskIndex + 1} out of {TASKS.length} tasks complete
            </span>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                <p className="text-red-600 font-black uppercase tracking-widest text-sm">Recording Active</p>
            </div>
            
            <div className={`mx-auto max-w-lg ${isLongPrompt ? 'bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100' : ''}`}>
                <h3 className={`${isLongPrompt ? 'text-xl' : 'text-4xl'} font-black text-[#0021A5] leading-tight px-4 transition-all duration-300 whitespace-pre-wrap`}>
                    {randomizedPrompt}
                </h3>
            </div>
            
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Stay steady and clear</p>
          </div>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Standardized SVG coordinate system with 200x200 viewBox */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#F1F5F9"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#0021A5"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                style={{ 
                  strokeDashoffset, 
                  transition: 'stroke-dashoffset 0.05s linear',
                  strokeLinecap: 'round'
                }}
              />
            </svg>
            <div className="relative z-10 text-center flex flex-col items-center justify-center">
                <span className="text-5xl font-black tabular-nums text-gray-900 leading-none">
                  {Math.max(0, Math.ceil(task.durationSeconds - timer))}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">
                  Sec Left
                </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100/50 text-center mb-8">
            <p className="text-blue-900/60 font-black uppercase tracking-[0.1em] text-[10px]">
                Recording will stop automatically
            </p>
        </div>
      </div>
    );
  }

  if (phase === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0021A5] p-12 text-white">
        <Loader2 size={80} className="animate-spin mb-8 opacity-40" />
        <h2 className="text-3xl font-black uppercase tracking-tighter">Time's Up!</h2>
        <p className="text-white/50 font-black uppercase tracking-[0.3em] text-xs mt-4 text-center">Finalizing medical secure upload</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 text-center relative">
      {isSession && (
        <div className="absolute top-8 right-8 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          <span className="text-[10px] font-black text-[#0021A5] uppercase tracking-widest">
            {currentTaskIndex + 1} out of {TASKS.length} tasks complete
          </span>
        </div>
      )}
      <div className="w-32 h-32 rounded-[3rem] flex items-center justify-center mb-10 shadow-2xl shadow-green-100 text-white bg-green-500 animate-in zoom-in-50 duration-500">
        <CheckCircle size={64} />
      </div>
      <div className="space-y-4 mb-12">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">TASK COMPLETE</h2>
        <div className="w-12 h-1.5 bg-[#FA4616] mx-auto rounded-full"></div>
        <p className="text-gray-500 font-bold text-lg leading-relaxed max-w-[300px] mx-auto">
          {isSession && currentTaskIndex < TASKS.length - 1 
            ? "Great job! Get ready for the next task in the sequence."
            : "Your voice sample has been successfully recorded and processed by the institute."}
        </p>
      </div>
      <button
        onClick={handleNext}
        className="w-full py-6 rounded-[2.5rem] text-white font-black text-xl shadow-xl active:scale-95 transition-all"
        style={{ backgroundColor: THEME.primary }}
      >
        {isSession && currentTaskIndex < TASKS.length - 1 ? "Next Task" : "Return to Dashboard"}
      </button>
      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mt-8 italic">Norman Fixel Neurological Institute</p>
    </div>
  );
};

export default RecordingPage;
