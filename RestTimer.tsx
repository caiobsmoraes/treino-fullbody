import React, { useEffect, useState, useRef } from 'react';
import { Timer, Plus, Minus, X, BellRing, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import { soundService } from './sound';

interface RestTimerProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isOpen,
  onClose,
  soundEnabled,
  vibrationEnabled,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const prevIsOpen = useRef(isOpen);

  // Reset when reopened or duration changes
  useEffect(() => {
    if (isOpen && (!prevIsOpen.current || secondsRemaining <= 0)) {
      setTotalSeconds(initialSeconds);
      setSecondsRemaining(initialSeconds);
      setIsRunning(true);
      setIsFinished(false);
      setIsMinimized(false);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, initialSeconds]);

  // Interval ticker
  useEffect(() => {
    if (!isOpen || !isRunning || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          setIsFinished(true);

          if (soundEnabled) {
            soundService.playTimerFinish();
          }
          if (vibrationEnabled) {
            soundService.vibrate([250, 150, 250, 150, 400]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isRunning, secondsRemaining, soundEnabled, vibrationEnabled]);

  if (!isOpen) return null;

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const addTime = (delta: number) => {
    setSecondsRemaining((prev) => Math.max(5, prev + delta));
    setTotalSeconds((prev) => Math.max(5, prev + delta));
    if (isFinished) {
      setIsFinished(false);
      setIsRunning(true);
    }
  };

  const setPreset = (secs: number) => {
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    setIsRunning(true);
    setIsFinished(false);
  };

  // Minimized floating banner
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-3 bg-slate-900 border-2 border-emerald-500 text-white px-4 py-2.5 rounded-full shadow-2xl cursor-pointer active:scale-95 transition animate-bounce-subtle"
      >
        <Timer className="w-5 h-5 text-emerald-400 animate-pulse" />
        <span className="font-mono font-black text-lg tracking-wider text-emerald-400">
          {formatTime(secondsRemaining)}
        </span>
        <ChevronUp className="w-4 h-4 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-16 sm:bottom-20 z-50 p-3 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-3xl shadow-2xl p-4 text-white overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-8">
        {/* Header & Controls */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-xl ${isFinished ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isFinished ? <BellRing className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isFinished ? 'Descanso Concluído!' : 'Tempo de Descanso'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Minimizar"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Fechar timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Time Display & Progress */}
        <div className="py-3 flex flex-col items-center">
          <div className="relative flex items-center justify-center my-1">
            <span
              className={`font-mono text-5xl font-black tracking-tight ${
                isFinished
                  ? 'text-amber-400 animate-pulse'
                  : secondsRemaining <= 10
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {formatTime(secondsRemaining)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full transition-all duration-300 ${
                isFinished ? 'bg-amber-400' : secondsRemaining <= 10 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Presets and Adjustment Buttons */}
        <div className="grid grid-cols-5 gap-2 pt-1 pb-2">
          <button
            onClick={() => addTime(-15)}
            className="flex items-center justify-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 py-2.5 text-xs font-bold text-slate-300"
          >
            <Minus className="w-3.5 h-3.5" /> 15s
          </button>

          <button
            onClick={() => setPreset(60)}
            className={`rounded-xl py-2.5 text-xs font-bold transition ${
              totalSeconds === 60 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            60s
          </button>

          <button
            onClick={() => setPreset(75)}
            className={`rounded-xl py-2.5 text-xs font-bold transition ${
              totalSeconds === 75 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            75s
          </button>

          <button
            onClick={() => setPreset(90)}
            className={`rounded-xl py-2.5 text-xs font-bold transition ${
              totalSeconds === 90 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            90s
          </button>

          <button
            onClick={() => addTime(15)}
            className="flex items-center justify-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 py-2.5 text-xs font-bold text-slate-300"
          >
            <Plus className="w-3.5 h-3.5" /> 15s
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 py-3 text-sm font-bold text-slate-200"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-400" /> Retomar
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20"
          >
            Pronto pra Série!
          </button>
        </div>
      </div>
    </div>
  );
};
