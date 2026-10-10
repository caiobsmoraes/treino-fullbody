import React from 'react';
import {
  Home,
  Dumbbell,
  Youtube,
  Scale,
  Settings,
  WifiOff,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from './useOnlineStatus';

export type NavTab = 'dashboard' | 'workout' | 'exercises' | 'assessments' | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentWeek: number;
  isWorkoutActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentWeek,
  isWorkoutActive,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-850 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Dumbbell className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-sm text-white tracking-tight block leading-tight">
              FULL BODY
            </span>
            <span className="text-[10px] font-bold text-emerald-400 block leading-tight">
              Semana {currentWeek} de 12
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && (
            <span
              className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-1 rounded-lg"
              title="Modo offline: dados locais em IndexedDB"
            >
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </span>
          )}

          <PWAInstallButton />
        </div>
      </header>

      {/* Bottom Floating Navigation Bar - Thumb Friendly */}
      <nav className="fixed inset-x-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 pb-safe max-w-lg mx-auto">
        <div className="grid grid-cols-5 gap-1">
          {/* Início */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition cursor-pointer active:scale-95 ${
              currentTab === 'dashboard'
                ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1">Início</span>
          </button>

          {/* Treino */}
          <button
            onClick={() => onTabChange('workout')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition cursor-pointer active:scale-95 relative ${
              currentTab === 'workout'
                ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isWorkoutActive && (
              <span className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] mt-1">Treino</span>
          </button>

          {/* Exercícios */}
          <button
            onClick={() => onTabChange('exercises')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition cursor-pointer active:scale-95 ${
              currentTab === 'exercises'
                ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Youtube className="w-5 h-5" />
            <span className="text-[10px] mt-1">Vídeos</span>
          </button>

          {/* Avaliações */}
          <button
            onClick={() => onTabChange('assessments')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition cursor-pointer active:scale-95 ${
              currentTab === 'assessments'
                ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-5 h-5" />
            <span className="text-[10px] mt-1">Medidas</span>
          </button>

          {/* Configurações */}
          <button
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition cursor-pointer active:scale-95 ${
              currentTab === 'settings'
                ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-1">Ajustes</span>
          </button>
        </div>
      </nav>
    </>
  );
};
