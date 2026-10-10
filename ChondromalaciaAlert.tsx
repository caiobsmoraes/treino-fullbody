import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, Activity } from 'lucide-react';

interface ChondromalaciaAlertProps {
  compact?: boolean;
}

export const ChondromalaciaAlert: React.FC<ChondromalaciaAlertProps> = ({ compact = false }) => {
  const [expanded, setExpanded] = useState(!compact);

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-3.5 text-amber-200 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold text-xs text-amber-400 uppercase tracking-wide">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Atenção: Condromalácia Patelar</span>
        </div>
        {compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-300"
            aria-label="Expandir aviso de joelho"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-2 text-xs leading-relaxed text-amber-100/90 space-y-1">
          <p className="font-medium text-amber-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            "Dor tolerável até 3/10 e que some em 24h. Acima disso, reduza carga ou amplitude."
          </p>
          <p className="text-amber-200/80">
            <strong>Evitar:</strong> Agachamento profundo, afundo, saltos e corrida.
          </p>
        </div>
      )}
    </div>
  );
};
