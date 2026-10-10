import React, { useState } from 'react';
import {
  Scale,
  Plus,
  TrendingDown,
  TrendingUp,
  Target,
  Camera,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  Ruler,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { AppProgramSettings, BodyAssessment } from '../types';

interface AssessmentsViewProps {
  assessments: BodyAssessment[];
  settings: AppProgramSettings;
  onSaveAssessment: (assessment: BodyAssessment) => void;
  onDeleteAssessment: (id: string) => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({
  assessments,
  settings,
  onSaveAssessment,
  onDeleteAssessment,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'FULL' | 'QUICK'>('FULL');

  // Form Fields
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<string>('80');
  const [bodyFatPercent, setBodyFatPercent] = useState<string>('23');
  const [waistUmbigo, setWaistUmbigo] = useState<string>('');
  const [abdomen, setAbdomen] = useState<string>('');
  const [chest, setChest] = useState<string>('');
  const [shoulders, setShoulders] = useState<string>('');
  const [armRelaxed, setArmRelaxed] = useState<string>('');
  const [hips, setHips] = useState<string>('');
  const [thigh, setThigh] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Local photos (Base64)
  const [photoFront, setPhotoFront] = useState<string | undefined>(undefined);
  const [photoSide, setPhotoSide] = useState<string | undefined>(undefined);
  const [photoBack, setPhotoBack] = useState<string | undefined>(undefined);

  // Active chart metric
  const [selectedChartMetric, setSelectedChartMetric] = useState<
    'weight' | 'fat' | 'leanMass' | 'waist'
  >('weight');

  // Sort assessments chronological for graphs, newest first for list
  const sortedDesc = [...assessments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const sortedAsc = [...assessments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latestAssessment = sortedDesc[0];
  const previousAssessment = sortedDesc[1];

  // Goals distance
  const currentWeight = latestAssessment?.weightKg ?? 80;
  const currentFatPercent = latestAssessment?.bodyFatPercent ?? 23;
  const weightDistanceToGoal = currentWeight - settings.targetWeightKg;
  const fatDistanceToGoal = currentFatPercent - settings.targetBodyFatPercent;

  // Days since last full assessment
  const latestFull = sortedDesc.find((a) => !a.isQuickCheck) || latestAssessment;
  let daysSinceLastFull = 0;
  if (latestFull) {
    const diff = Math.abs(new Date().getTime() - new Date(latestFull.date).getTime());
    daysSinceLastFull = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // Handle image upload to Base64
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'front' | 'side' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'front') setPhotoFront(result);
      if (target === 'side') setPhotoSide(result);
      if (target === 'back') setPhotoBack(result);
    };
    reader.readAsDataURL(file);
  };

  // Submit assessment
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightKg);
    if (!w || isNaN(w)) return;

    const isQuick = formType === 'QUICK';
    const bf = !isQuick && bodyFatPercent ? parseFloat(bodyFatPercent) : undefined;
    const fatMass = bf ? (w * bf) / 100 : undefined;
    const leanMass = bf && fatMass ? w - fatMass : undefined;

    const newAssessment: BodyAssessment = {
      id: `assessment_${Date.now()}`,
      date,
      isQuickCheck: isQuick,
      age: settings.userAge,
      gender: settings.userGender,
      weightKg: w,
      bodyFatPercent: bf,
      fatMassKg: fatMass ? Math.round(fatMass * 10) / 10 : undefined,
      leanMassKg: leanMass ? Math.round(leanMass * 10) / 10 : undefined,
      waistUmbigo: waistUmbigo ? parseFloat(waistUmbigo) : undefined,
      abdomen: !isQuick && abdomen ? parseFloat(abdomen) : undefined,
      chest: !isQuick && chest ? parseFloat(chest) : undefined,
      shoulders: !isQuick && shoulders ? parseFloat(shoulders) : undefined,
      armRelaxed: !isQuick && armRelaxed ? parseFloat(armRelaxed) : undefined,
      hips: !isQuick && hips ? parseFloat(hips) : undefined,
      thigh: !isQuick && thigh ? parseFloat(thigh) : undefined,
      notes: notes.trim() || undefined,
      photos:
        !isQuick && (photoFront || photoSide || photoBack)
          ? {
              front: photoFront,
              side: photoSide,
              back: photoBack,
            }
          : undefined,
    };

    onSaveAssessment(newAssessment);
    setIsFormOpen(false);

    // Reset optional fields
    setWaistUmbigo('');
    setAbdomen('');
    setChest('');
    setShoulders('');
    setArmRelaxed('');
    setHips('');
    setThigh('');
    setNotes('');
    setPhotoFront(undefined);
    setPhotoSide(undefined);
    setPhotoBack(undefined);
  };

  // Calculations for deltas
  const weightDelta =
    latestAssessment && previousAssessment
      ? latestAssessment.weightKg - previousAssessment.weightKg
      : null;

  const fatDelta =
    latestAssessment?.bodyFatPercent && previousAssessment?.bodyFatPercent
      ? latestAssessment.bodyFatPercent - previousAssessment.bodyFatPercent
      : null;

  const leanMassDelta =
    latestAssessment?.leanMassKg && previousAssessment?.leanMassKg
      ? latestAssessment.leanMassKg - previousAssessment.leanMassKg
      : null;

  return (
    <div className="space-y-6 pb-28 animate-in fade-in">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-sky-400">
              Acompanhamento Físico
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Indicadores Corporais</h1>
          </div>
          <button
            onClick={() => {
              setFormType('FULL');
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-95 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Avaliação</span>
          </button>
        </div>

        {/* 90-Day Periodic Alert */}
        {daysSinceLastFull >= 90 ? (
          <div className="rounded-2xl bg-rose-950/40 border border-rose-500/50 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="text-rose-300 font-bold">
                Atenção: Já se passaram {daysSinceLastFull} dias!
              </strong>
              <p className="text-rose-200/90 leading-relaxed">
                As avaliações completas devem ser feitas a cada 3 meses para calibrar as faixas de treino e conferir sua evolução de medidas.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 px-4 py-3 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              Tempo desde a última avaliação completa:
            </span>
            <span className="font-bold text-sky-400">{daysSinceLastFull} dias (meta: 90 dias)</span>
          </div>
        )}

        {/* Action button for quick bi-weekly registration */}
        <div className="pt-1">
          <button
            onClick={() => {
              setFormType('QUICK');
              setIsFormOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 text-xs font-bold text-slate-200 transition cursor-pointer"
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Registrar Medição Rápida Quinzenal (Apenas Peso & Cintura)</span>
          </button>
        </div>
      </div>

      {/* Goal Targets Dashboard */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Metas do Programa
          </h2>
          <span className="text-[11px] font-semibold text-slate-400">Objetivo 12 semanas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weight Goal: 75 kg */}
          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-400">Meta de Peso</span>
              <span className="font-mono font-black text-white text-lg">75.0 kg</span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-300">
                Atual: <strong>{currentWeight} kg</strong>
              </span>
              <span
                className={`font-bold ${
                  weightDistanceToGoal <= 0 ? 'text-emerald-400' : 'text-sky-400'
                }`}
              >
                {weightDistanceToGoal <= 0
                  ? 'Meta Atingida! 🎉'
                  : `Faltam ${weightDistanceToGoal.toFixed(1)} kg`}
              </span>
            </div>

            {/* Progress bar towards 75kg from 80kg */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, ((80 - currentWeight) / (80 - 75)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Body Fat Goal: 15% */}
          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-400">Meta de Gordura</span>
              <span className="font-mono font-black text-white text-lg">15.0%</span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-300">
                Atual: <strong>{currentFatPercent}%</strong>
              </span>
              <span
                className={`font-bold ${
                  fatDistanceToGoal <= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {fatDistanceToGoal <= 0
                  ? 'Meta Atingida! 🎉'
                  : `Faltam ${fatDistanceToGoal.toFixed(1)}%`}
              </span>
            </div>

            {/* Progress bar towards 15% from 23% */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, ((23 - currentFatPercent) / (23 - 15)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Summary Cards with Deltas */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Weight Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Peso Atual
          </span>
          <div className="font-mono font-black text-xl text-white">
            {currentWeight} <span className="text-xs text-slate-400 font-normal">kg</span>
          </div>
          {weightDelta !== null && (
            <div
              className={`text-[11px] font-bold flex items-center justify-center gap-0.5 ${
                weightDelta < 0
                  ? 'text-emerald-400'
                  : weightDelta > 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {weightDelta < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : weightDelta > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : null}
              {weightDelta > 0 ? `+${weightDelta.toFixed(1)}` : `${weightDelta.toFixed(1)}`} kg
            </div>
          )}
        </div>

        {/* Fat Mass Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Massa Gorda
          </span>
          <div className="font-mono font-black text-xl text-amber-400">
            {latestAssessment?.fatMassKg ?? (currentWeight * (currentFatPercent / 100)).toFixed(1)}{' '}
            <span className="text-xs text-slate-400 font-normal">kg</span>
          </div>
          <div className="text-[11px] font-bold text-slate-400">
            {currentFatPercent}% de gordura
          </div>
        </div>

        {/* Lean Mass Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Massa Magra
          </span>
          <div className="font-mono font-black text-xl text-emerald-400">
            {latestAssessment?.leanMassKg ??
              (currentWeight - currentWeight * (currentFatPercent / 100)).toFixed(1)}{' '}
            <span className="text-xs text-slate-400 font-normal">kg</span>
          </div>
          {leanMassDelta !== null && (
            <div
              className={`text-[11px] font-bold flex items-center justify-center gap-0.5 ${
                leanMassDelta > 0
                  ? 'text-emerald-400'
                  : leanMassDelta < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {leanMassDelta > 0 ? `+${leanMassDelta.toFixed(1)}` : `${leanMassDelta.toFixed(1)}`} kg
            </div>
          )}
        </div>
      </div>

      {/* Visual Evolution Charts (pure CSS, responsive & lightweight) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            Gráfico de Evolução
          </h3>

          {/* Metric Selector */}
          <div className="flex gap-1.5 overflow-x-auto">
            {(
              [
                { id: 'weight', label: 'Peso' },
                { id: 'fat', label: '% Gordura' },
                { id: 'leanMass', label: 'Massa Magra' },
                { id: 'waist', label: 'Cintura' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedChartMetric(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  selectedChartMetric === m.id
                    ? 'bg-sky-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Viewport */}
        {(() => {
          // Prepare data points based on metric
          const validPoints = sortedAsc
            .map((a) => {
              let val: number | undefined;
              if (selectedChartMetric === 'weight') val = a.weightKg;
              if (selectedChartMetric === 'fat') val = a.bodyFatPercent;
              if (selectedChartMetric === 'leanMass') val = a.leanMassKg;
              if (selectedChartMetric === 'waist') val = a.waistUmbigo;
              return { date: a.date, val };
            })
            .filter((p): p is { date: string; val: number } => p.val !== undefined);

          if (validPoints.length === 0) {
            return (
              <div className="py-8 text-center text-xs text-slate-500">
                Nenhum dado registrado para esta métrica ainda.
              </div>
            );
          }

          const values = validPoints.map((p) => p.val);
          const maxVal = Math.max(...values);
          const minVal = Math.min(...values);
          const range = maxVal === minVal ? 1 : maxVal - minVal;

          return (
            <div className="space-y-4 pt-2">
              <div className="h-40 w-full flex items-end gap-2 pt-6 pb-2 border-b border-slate-800">
                {validPoints.map((p, idx) => {
                  const normalizedHeight =
                    maxVal === minVal ? 60 : 20 + ((p.val - minVal) / range) * 75;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip value */}
                      <span className="text-[10px] font-mono font-bold text-slate-300 mb-1 opacity-90 group-hover:scale-110 transition">
                        {p.val}
                      </span>
                      {/* Bar */}
                      <div
                        className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-sky-600 to-sky-400 transition-all duration-300 group-hover:from-emerald-500 group-hover:to-emerald-400 shadow-sm"
                        style={{ height: `${normalizedHeight}%` }}
                      />
                      {/* Date label */}
                      <span className="text-[9px] text-slate-500 mt-2 truncate w-full text-center">
                        {p.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Primeiro registro: {validPoints[0]?.val}</span>
                <span className="text-emerald-400 font-bold">
                  Recente: {validPoints[validPoints.length - 1]?.val}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Assessments History Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white">Histórico de Registros</h3>

        {sortedDesc.map((item) => {
          return (
            <div
              key={item.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      item.isQuickCheck
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {item.isQuickCheck ? 'Medição Quinzenal' : 'Avaliação Completa'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">{item.date}</span>
                </div>

                {sortedDesc.length > 1 && (
                  <button
                    onClick={() => onDeleteAssessment(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                    title="Excluir avaliação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">Peso</span>
                  <strong className="text-white font-mono text-base">{item.weightKg} kg</strong>
                </div>

                {item.bodyFatPercent && (
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[11px] block">% Gordura</span>
                    <strong className="text-amber-400 font-mono text-base">
                      {item.bodyFatPercent}%
                    </strong>
                  </div>
                )}

                {item.leanMassKg && (
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[11px] block">Massa Magra</span>
                    <strong className="text-emerald-400 font-mono text-base">
                      {item.leanMassKg} kg
                    </strong>
                  </div>
                )}

                {item.waistUmbigo && (
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[11px] block">Cintura (umbigo)</span>
                    <strong className="text-sky-400 font-mono text-base">
                      {item.waistUmbigo} cm
                    </strong>
                  </div>
                )}
              </div>

              {/* Extra Circumferences if Full */}
              {!item.isQuickCheck && (item.abdomen || item.chest || item.shoulders || item.armRelaxed || item.hips || item.thigh) && (
                <div className="pt-2 border-t border-slate-800 text-xs">
                  <span className="font-semibold text-slate-400 block mb-1">Circunferências (cm):</span>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                    {item.abdomen && <span className="bg-slate-800 px-2 py-1 rounded-lg">Abdômen: {item.abdomen}cm</span>}
                    {item.chest && <span className="bg-slate-800 px-2 py-1 rounded-lg">Peito: {item.chest}cm</span>}
                    {item.shoulders && <span className="bg-slate-800 px-2 py-1 rounded-lg">Ombros: {item.shoulders}cm</span>}
                    {item.armRelaxed && <span className="bg-slate-800 px-2 py-1 rounded-lg">Braço: {item.armRelaxed}cm</span>}
                    {item.hips && <span className="bg-slate-800 px-2 py-1 rounded-lg">Quadril: {item.hips}cm</span>}
                    {item.thigh && <span className="bg-slate-800 px-2 py-1 rounded-lg">Coxa: {item.thigh}cm</span>}
                  </div>
                </div>
              )}

              {/* Photos preview if present */}
              {item.photos && (item.photos.front || item.photos.side || item.photos.back) && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="font-semibold text-slate-400 text-xs block mb-1.5">
                    Fotos do Acompanhamento:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {item.photos.front && (
                      <div className="aspect-3/4 rounded-xl overflow-hidden bg-black border border-slate-800">
                        <img src={item.photos.front} alt="Frente" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {item.photos.side && (
                      <div className="aspect-3/4 rounded-xl overflow-hidden bg-black border border-slate-800">
                        <img src={item.photos.side} alt="Lado" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {item.photos.back && (
                      <div className="aspect-3/4 rounded-xl overflow-hidden bg-black border border-slate-800">
                        <img src={item.photos.back} alt="Costas" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {item.notes && (
                <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-800/80">
                  "{item.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* New Assessment Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">
                {formType === 'FULL' ? 'Nova Avaliação Trimestral' : 'Medição Rápida Quinzenal'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 py-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormType('FULL')}
                  className={`py-2 rounded-xl font-bold transition ${
                    formType === 'FULL' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Completa (3 meses)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('QUICK')}
                  className={`py-2 rounded-xl font-bold transition ${
                    formType === 'QUICK' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Rápida (Peso + Cintura)
                </button>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Data do Registro:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Weight & Body Fat */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Peso (kg): *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    required
                    placeholder="80.0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-base focus:outline-none focus:border-sky-500"
                  />
                </div>

                {formType === 'FULL' && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">% de Gordura: *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bodyFatPercent}
                      onChange={(e) => setBodyFatPercent(e.target.value)}
                      placeholder="23.0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-base focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}
              </div>

              {/* Waist */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">
                  Cintura na altura do umbigo (cm):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={waistUmbigo}
                  onChange={(e) => setWaistUmbigo(e.target.value)}
                  placeholder="Ex: 88"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Extended Circumferences for FULL assessment */}
              {formType === 'FULL' && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <span className="font-bold text-slate-300 block">Outras Circunferências (cm):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-[11px] text-slate-400">Abdômen:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={abdomen}
                        onChange={(e) => setAbdomen(e.target.value)}
                        placeholder="cm"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Peito:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={chest}
                        onChange={(e) => setChest(e.target.value)}
                        placeholder="cm"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Ombros:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={shoulders}
                        onChange={(e) => setShoulders(e.target.value)}
                        placeholder="cm"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Braço Relaxado:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={armRelaxed}
                        onChange={(e) => setArmRelaxed(e.target.value)}
                        placeholder="cm"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Quadril:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={hips}
                        onChange={(e) => setHips(e.target.value)}
                        placeholder="cm"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Coxa:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={thigh}
                        onChange={(e) => setThigh(e.target.value)}
                        placeholder="cm"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Photos upload (optional, stored locally) */}
              {formType === 'FULL' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="font-bold text-slate-300 block flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-sky-400" />
                    Fotos (Opcional - salvas só no seu celular):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-800 cursor-pointer text-center">
                      <span className="text-[11px] font-bold text-slate-300">Frente</span>
                      {photoFront ? (
                        <span className="text-[10px] text-emerald-400 font-bold mt-1">Carregada ✓</span>
                      ) : (
                        <span className="text-[10px] text-slate-500 mt-1">Anexar</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, 'front')}
                      />
                    </label>

                    <label className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-800 cursor-pointer text-center">
                      <span className="text-[11px] font-bold text-slate-300">Lado</span>
                      {photoSide ? (
                        <span className="text-[10px] text-emerald-400 font-bold mt-1">Carregada ✓</span>
                      ) : (
                        <span className="text-[10px] text-slate-500 mt-1">Anexar</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, 'side')}
                      />
                    </label>

                    <label className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-800 cursor-pointer text-center">
                      <span className="text-[11px] font-bold text-slate-300">Costas</span>
                      {photoBack ? (
                        <span className="text-[10px] text-emerald-400 font-bold mt-1">Carregada ✓</span>
                      ) : (
                        <span className="text-[10px] text-slate-500 mt-1">Anexar</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, 'back')}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1 pt-1">
                <label className="font-bold text-slate-300">Observações livres:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Sentindo melhora na postura, cintura reduziu..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black shadow-lg shadow-sky-500/25 cursor-pointer"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
