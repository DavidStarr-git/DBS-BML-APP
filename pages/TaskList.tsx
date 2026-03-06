
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Info, X, Star } from 'lucide-react';
import { TASKS, THEME } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface TaskListProps {
  preferredTaskId: string | null;
  onSetPreferred: (id: string | null) => void;
}

const TaskList: React.FC<TaskListProps> = ({ preferredTaskId, onSetPreferred }) => {
  const navigate = useNavigate();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <header className="pt-4 mb-4">
        <h1 className="text-3xl font-black text-gray-900">Available Tasks</h1>
        <p className="text-gray-500 font-medium">Select a module to begin</p>
      </header>

      <div className="space-y-4">
        {TASKS.map((task) => (
          <div
            key={task.id}
            className={`w-full bg-white rounded-[2.5rem] border transition-all ${
              preferredTaskId === task.id ? 'border-orange-200 shadow-md ring-1 ring-orange-100' : 'border-gray-100 shadow-sm'
            }`}
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-4xl relative">
                  {task.icon}
                  {preferredTaskId === task.id && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-1 rounded-full shadow-sm">
                      <Star size={12} fill="currentColor" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg leading-none mb-2">{task.title}</h3>
                  <p className="text-[#FA4616] text-[10px] font-black uppercase tracking-widest">{task.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSetPreferred(preferredTaskId === task.id ? null : task.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    preferredTaskId === task.id ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-400 hover:text-orange-500'
                  }`}
                  title={preferredTaskId === task.id ? "Unset as Preferred" : "Set as Preferred"}
                >
                  <Star size={20} fill={preferredTaskId === task.id ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    selectedTaskId === task.id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  {selectedTaskId === task.id ? <X size={20} /> : <Info size={20} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {selectedTaskId === task.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50 mb-4">
                    <p className="text-xs text-blue-900 font-bold leading-relaxed italic">
                      {task.significance}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/record/${task.id}`)}
                    className="w-full py-4 bg-[#0021A5] text-white font-black rounded-2xl shadow-lg shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                    Start Task
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 mt-8">
        <h4 className="text-orange-900 font-black mb-2">Clinical Note</h4>
        <p className="text-sm text-orange-700/80 font-medium">
          Make sure your volume is turned up and you are in a quiet environment for best results.
        </p>
      </div>
    </div>
  );
};

export default TaskList;
