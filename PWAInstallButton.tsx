import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as standalone app, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition cursor-pointer"
        title="Instalar app na tela inicial"
      >
        <Download className="w-4 h-4" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
          title="Instalar no iPhone"
        >
          <Share className="w-3.5 h-3.5 text-sky-400" />
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 animate-in fade-in slide-in-from-bottom-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Share className="w-5 h-5 text-sky-400" />
                  Instalar no iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <p>
                    No Safari, toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) na barra inferior.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <p>
                    Role o menu para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <p>
                    Confirme em <strong>Adicionar</strong>. O app abrirá em tela cheia e funcionará 100% offline na academia!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-2xl bg-sky-500 hover:bg-sky-600 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
