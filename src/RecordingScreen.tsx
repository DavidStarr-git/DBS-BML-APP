
import React, { useState, useEffect } from 'react';
import { Mic, Square, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { NativeBridge } from './utils/nativeBridge';
import { Capacitor } from '@capacitor/core';

const RecordingScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingData, setRecordingData] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready to record');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPerms = async () => {
      if (Capacitor.isNativePlatform()) {
        const granted = await NativeBridge.requestMicrophonePermission();
        if (!granted) {
          setError('Microphone permission denied');
        }
      }
    };
    checkPerms();
  }, []);

  const handleStart = async () => {
    setError(null);
    setStatus('Recording...');
    const success = await NativeBridge.startRecording('assessment');
    if (success) {
      setIsRecording(true);
    } else {
      setError('Failed to start recording');
      setStatus('Error');
    }
  };

  const handleStop = async () => {
    setStatus('Stopping...');
    const data = await NativeBridge.stopRecording();
    setIsRecording(false);
    if (data) {
      setRecordingData(data);
      setStatus('Recording complete');
    } else {
      setError('Failed to stop recording or no data received');
      setStatus('Error');
    }
  };

  const handleExport = async () => {
    if (!recordingData) return;
    setStatus('Exporting...');
    const success = await NativeBridge.exportToDownloads(recordingData, 'DBS_Assessment');
    if (success) {
      setStatus('Exported to Documents/Downloads');
    } else {
      setError('Failed to export recording');
      setStatus('Error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md flex flex-col items-center space-y-8">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-widest">
          Native Recording
        </h1>

        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-50 animate-pulse' : 'bg-blue-50'}`}>
          {isRecording ? (
            <div className="w-12 h-12 bg-red-600 rounded-lg"></div>
          ) : (
            <Mic size={48} className="text-[#0021A5]" />
          )}
        </div>

        <div className="text-center space-y-2">
          <p className={`font-black uppercase tracking-widest text-sm ${error ? 'text-red-600' : 'text-[#0021A5]'}`}>
            {status}
          </p>
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-xs">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col w-full space-y-4">
          {!isRecording ? (
            <button
              onClick={handleStart}
              className="w-full py-4 bg-[#0021A5] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Mic size={20} />
              Start Recording
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Square size={20} />
              Stop Recording
            </button>
          )}

          {recordingData && !isRecording && (
            <button
              onClick={handleExport}
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Download size={20} />
              Export to Downloads
            </button>
          )}
        </div>

        {recordingData && !isRecording && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={16} />
            <span className="text-xs font-bold">Recording ready for export</span>
          </div>
        )}
      </div>
      
      <p className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic">
        Norman Fixel Neurological Institute
      </p>
    </div>
  );
};

export default RecordingScreen;
