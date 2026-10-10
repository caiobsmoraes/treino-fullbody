import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Settings as SettingsIcon,
  RotateCcw,
  Volume2,
  Vibrate,
  Calendar,
  Timer,
  Check,
  AlertCircle,
  FileJson,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { AppProgramSettings } from '../types';
import { storage } from '../services/storage';

interface SettingsViewProps {
  settings: AppProgramSettings;
  onUpdateSettings: (settings: AppProgramSettings) => void;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onRefreshData,
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const json = await storage.exportFullBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `backup_treino_fullbody_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Backup exportado com sucesso! Salve este arquivo com segurança.');
    } catch (e) {
      showError('Erro ao exportar backup: ' + (e as Error).message);
    }
  };

  // Import JSON Backup
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await storage.importFullBackup(text);
      onRefreshData();
      showSuccess('Backup restaurado com sucesso! Todos os seus treinos e avaliações foram carregados.');
    } catch (e) {
      showError('Falha ao restaurar backup. Verifique se o arquivo JSON é válido.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          Preferências & Dados
        </span>
        <h1 className="text-2xl font-black text-white mt-1">Configurações</h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajuste a semana do seu programa, configure o timer de descanso e gerencie backups locais em JSON.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/50 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl bg-rose-950/60 border border-rose-500/50 p-4 text-xs font-bold text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Program & Periodization Settings */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Periodização de 12 Semanas
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Semana Atual do Ciclo:
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => {
                const isSelected = settings.currentWeek === w;
                const isDeload = w === 7;
                return (
                  <button
                    key={w}
                    onClick={() => onUpdateSettings({ ...settings, currentWeek: w })}
                    className={`py-2 rounded-xl font-bold transition text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-400'
                        : isDeload
                        ? 'bg-amber-950/50 text-amber-300 border border-amber-600/50'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {settings.currentWeek <= 2
                ? 'Semanas 1–2: Adaptação com 2 séries por exercício e RIR 3.'
                : settings.currentWeek === 7
                ? 'Semana 7: Deload com metade das séries para regeneração articular.'
                : 'Semanas 3–12: 3 séries por exercício com RIR 1–2.'}
            </p>
          </div>
        </div>
      </div>

      {/* Rest Timer Settings */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <Timer className="w-4 h-4 text-sky-400" />
          Timer de Descanso entre Séries
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Tempo Padrão de Descanso:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[60, 75, 90].map((secs) => (
                <button
                  key={secs}
                  onClick={() =>
                    onUpdateSettings({ ...settings, restTimerDurationSeconds: secs })
                  }
                  className={`py-3 rounded-2xl font-bold transition cursor-pointer ${
                    settings.restTimerDurationSeconds === secs
                      ? 'bg-sky-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {secs} segundos
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Recomendado para Full Body em até 45 min: 60s a 90s.
            </span>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  soundEnabled: !settings.soundEnabled,
                })
              }
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200"
            >
              <span className="flex items-center gap-2 font-semibold">
                <Volume2 className="w-4 h-4 text-sky-400" />
                Aviso Sonoro ao Concluir Descanso
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                  settings.soundEnabled
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {settings.soundEnabled ? 'Ativo' : 'Desativado'}
              </span>
            </button>

            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  vibrationEnabled: !settings.vibrationEnabled,
                })
              }
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200"
            >
              <span className="flex items-center gap-2 font-semibold">
                <Vibrate className="w-4 h-4 text-emerald-400" />
                Vibração no Celular ao Concluir Descanso
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                  settings.vibrationEnabled
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {settings.vibrationEnabled ? 'Ativo' : 'Desativado'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup and Data Portability (MANDATORY LOCAL STORAGE RULE) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <FileJson className="w-4 h-4 text-amber-400" />
              Backup & Segurança dos Dados
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Todos os seus dados vivem com 100% de privacidade apenas no seu dispositivo. Exporte backups regulares para não perder seus treinos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export Button */}
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>EXPORTAR BACKUP (.JSON)</span>
          </button>

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 border border-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span>RESTAURAR BACKUP (.JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Download Project Source Code for GitHub */}
          <a
            href="/treino-fullbody.zip"
            download="treino-fullbody.zip"
            className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-98 border border-sky-500/40 text-sky-300 font-bold text-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>BAIXAR CÓDIGO FONTE DO APP (.ZIP PARA O GITHUB)</span>
          </a>
        </div>
      </div>

      {/* App Info & Hosting Help */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 text-xs text-slate-400 space-y-2">
        <h3 className="font-bold text-slate-300 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-400" />
          Como rodar ou publicar de graça
        </h3>
        <p className="leading-relaxed">
          Este app foi desenvolvido como uma SPA estática + PWA sem necessidade de banco de dados em nuvem.
        </p>
        <p className="leading-relaxed">
          Você pode publicá-lo gratuitamente na <strong>Vercel</strong> ou <strong>Netlify</strong> apenas conectando seu repositório no GitHub. Ao abrir o link gerado no celular (Chrome ou Safari), basta clicar em <em>"Adicionar à Tela Inicial"</em> para ter o aplicativo nativo funcionando mesmo sem conexão com a internet.
        </p>
      </div>
    </div>
  );
};
