
import React, { useState } from 'react';
import { X, Info, Clock, Layers, Activity, Calendar, MoreHorizontal } from 'lucide-react';
import { RecordingResult, AssessmentTask } from '../types';
import { THEME, TASKS } from '../constants';

interface StatsPageProps {
  history: RecordingResult[];
}

const StatsPage: React.FC<StatsPageProps> = ({ history }) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'tasks'>('sessions');
  const [selectedTask, setSelectedTask] = useState<AssessmentTask | null>(null);

  const groupedHistory = history.reduce((acc: any, item) => {
    const date = new Date(item.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col p-8 bg-gray-50 relative">
      <header className="mb-8 pt-4">
        <h1 className="text-3xl font-black text-gray-900 text-center uppercase tracking-tighter">Clinical Log</h1>
      </header>

      <div className="bg-gray-200/50 p-1.5 rounded-2xl flex mb-8">
        <button 
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'sessions' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
        >
          Sessions
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'tasks' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
        >
          Tasks
        </button>
      </div>

      <div className="space-y-10 pb-20">
        {activeTab === 'sessions' ? (
          Object.keys(groupedHistory).length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <Activity className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No entries recorded</p>
            </div>
          ) : (
            Object.entries(groupedHistory).map(([date, items]: [string, any]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <Calendar size={12} className="text-gray-400" />
                  <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{date}</h2>
                </div>
                {items.map((item: RecordingResult) => (
                  <div key={item.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-white transition-all active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner">
                          {item.setting === 'Unknown' ? '?' : item.setting}
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-xl leading-none mb-2">{item.taskTitle}</h3>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                              Completed at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <MoreHorizontal size={20} className="text-gray-300" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Duration</span>
                        </div>
                        <span className="text-sm font-black text-gray-700">{item.duration} Seconds</span>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Layers size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Stim Level</span>
                        </div>
                        <span className="text-sm font-black text-gray-700">Group {item.setting === 'Unknown' ? '?' : item.setting}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )
        ) : (
          <div className="space-y-4">
            {TASKS.map((task) => (
              <div key={task.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-white flex items-center justify-between group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-5">
                  <span className="text-4xl">{task.icon}</span>
                  <div>
                    <h3 className="font-black text-gray-900 leading-none mb-1">{task.title}</h3>
                    <p className="text-[#FA4616] text-[10px] font-black uppercase tracking-widest">{task.type}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTask(task)}
                  className="p-4 bg-gray-50 rounded-2xl text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Info size={24} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Justification Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            <button 
              onClick={() => setSelectedTask(null)}
              className="absolute top-8 right-8 p-2 bg-gray-100 rounded-full text-gray-500"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-5 mb-8">
              <span className="text-6xl">{selectedTask.icon}</span>
              <div>
                <h2 className="text-2xl font-black text-gray-900">{selectedTask.title}</h2>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Diagnostic Protocol</p>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity size={12} /> Neurologist Justification
                </h4>
                <p className="text-gray-600 font-medium leading-relaxed text-sm">
                  {selectedTask.significance}
                </p>
              </section>
            </div>
            
            <button 
              onClick={() => setSelectedTask(null)}
              className="w-full mt-10 py-6 bg-[#0021A5] text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl active:scale-95 transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
