import React from 'react';
import {
  Calendar,
  Flame,
  Dumbbell,
  Scale,
  Ruler,
  AlertCircle,
  Play,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  AppProgramSettings,
  BodyAssessment,
  WorkoutSession,
  WorkoutType,
} from './types';
import { getNextWorkoutType, getPeriodizationRules } from './storage';

interface DashboardViewProps {
  settings: AppProgramSettings;
  workouts: WorkoutSession[];
  assessments: BodyAssessment[];
  onStartWorkout: (type: WorkoutType) => void;
  onNavigateTab: (tab: 'dashboard' | 'workout' | 'exercises' | 'assessments' | 'settings') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  workouts,
  assessments,
  onStartWorkout,
  onNavigateTab,
}) => {
  // Determine last completed workout type
  const lastWorkout = workouts.find((w) => w.completed);
  const nextWorkoutType = getNextWorkoutType(lastWorkout?.workoutType);

  // Periodization details
  const periodization = getPeriodizationRules(settings.currentWeek);

  // Workouts in current week (or last 7 days)
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const workoutsThisWeek = workouts.filter((w) => {
    const wDate = new Date(w.date);
    return w.completed && wDate >= oneWeekAgo;
  });

  // Latest assessment & quick stats
  const latestAssessment = assessments[0]; // already sorted newest first
  const latestFullAssessment = assessments.find((a) => !a.isQuickCheck) || latestAssessment;

  // Days since last full assessment
  let daysSinceAssessment = 0;
  let isAssessmentOverdue = false;
  if (latestFullAssessment) {
    const lastDate = new Date(latestFullAssessment.date);
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    daysSinceAssessment = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    isAssessmentOverdue = daysSinceAssessment >= 90;
  }

  // Weight and waist stats
  const currentWeight = latestAssessment?.weightKg ?? 80;
  const currentWaist = latestAssessment?.waistUmbigo;

  // Target progress
  const weightDistance = currentWeight - settings.targetWeightKg;
  const currentFatPercent = latestAssessment?.bodyFatPercent ?? 23;
  const fatDistance = currentFatPercent - settings.targetBodyFatPercent;

  // Workout summaries for card preview
  const workoutDescriptions: Record<WorkoutType, { title: string; focus: string; tag: string }> = {
    A: {
      title: 'Treino A — Costas, Posterior & Deltoides',
      focus: 'Puxada frontal, Stiff c/ halteres, Supino inclinado, Bi-sets de remada + elevação lateral',
      tag: 'Full Body A',
    },
    B: {
      title: 'Treino B — Pélvica, Leg Press & Ombros',
      focus: 'Elevação pélvica, Leg press 90°, Desenvolvimento, Bi-sets de remada + crucifixo inverso',
      tag: 'Full Body B',
    },
    C: {
      title: 'Treino C — Posterior, Banco Alto & Peitoral',
      focus: 'Mesa flexora, Agachamento banco alto, Puxada neutra, Supino máquina, Elevação no cabo',
      tag: 'Full Body C',
    },
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      {/* Top Program Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
              Periodização 12 Semanas
            </span>
          </div>
          <span className="rounded-full bg-slate-800/90 border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
            Full Body 3x/sem
          </span>
        </div>

        <div className="mt-1">
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Semana {settings.currentWeek}
            </h1>
            <span className="text-sm font-semibold text-slate-400">de 12</span>
          </div>

          {/* Phase Badge */}
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200">
            {periodization.isDeload ? (
              <span className="text-amber-400 font-bold">⚠️ Semana 7: Deload (metade das séries)</span>
            ) : periodization.isInitialRamp ? (
              <span className="text-sky-400">Fase de Adaptação (2 séries por exercício • RIR 3)</span>
            ) : (
              <span className="text-emerald-400">Fase de Sobrecarga (3 séries por exercício • RIR 1–2)</span>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            {periodization.rirText}
          </p>
        </div>

        {/* Weekly Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Treinos feitos na semana:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((num) => {
              const done = num <= workoutsThisWeek.length;
              return (
                <div
                  key={num}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                    done
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-800 border border-slate-700 text-slate-500'
                  }`}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : num}
                </div>
              );
            })}
            <span className="text-xs font-bold text-slate-400 ml-1">
              {workoutsThisWeek.length}/3
            </span>
          </div>
        </div>
      </div>

      {/* Hero Next Workout Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/40 p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-xs font-black uppercase tracking-wider">
            <Dumbbell className="w-3.5 h-3.5" /> Próximo Treino
          </span>
          <span className="text-xs font-semibold text-slate-400">
            Ciclo sugerido (A → B → C)
          </span>
        </div>

        <div className="mt-4">
          <h2 className="text-2xl font-black text-white">
            {workoutDescriptions[nextWorkoutType].title}
          </h2>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            {workoutDescriptions[nextWorkoutType].focus}
          </p>
        </div>

        {/* Start Workout Button - Big for sweaty hands */}
        <button
          onClick={() => onStartWorkout(nextWorkoutType)}
          className="mt-5 w-full flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 py-4 px-6 text-base font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>INICIAR TREINO {nextWorkoutType}</span>
        </button>

        {/* Quick alternative selector */}
        <div className="mt-3 flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400">Ou trocar para:</span>
          {(['A', 'B', 'C'] as WorkoutType[]).map((type) => (
            <button
              key={type}
              onClick={() => onStartWorkout(type)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                type === nextWorkoutType
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Treino {type}
            </button>
          ))}
        </div>
      </div>

      {/* Condromalacia Reminder Card */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <h4 className="font-bold text-amber-300">Regra de Saúde nos Treinos de Perna:</h4>
            <p className="text-amber-200/90 mt-0.5">
              "Dor tolerável até 3/10 e que some em 24h. Acima disso, reduza carga ou amplitude. Evite agachamento profundo, afundo, saltos e corrida."
            </p>
          </div>
        </div>
      </div>

      {/* Body Tracking & 90-Day Reminder Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base text-white">Composição Corporal</h3>
          </div>
          <button
            onClick={() => onNavigateTab('assessments')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            Ver histórico <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 90 Days Reminder Alert */}
        {isAssessmentOverdue ? (
          <div className="rounded-2xl bg-rose-950/40 border border-rose-500/50 p-3.5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-rose-300 font-bold">Avaliação Trimestral Pendente!</strong>
              <p className="text-rose-200/90 mt-0.5">
                Já se passaram {daysSinceAssessment} dias desde a última avaliação completa. Hora de atualizar circunferências e fotos!
              </p>
              <button
                onClick={() => onNavigateTab('assessments')}
                className="mt-2 inline-flex items-center gap-1 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-black text-white"
              >
                Fazer Avaliação Agora
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-800/50 border border-slate-800 px-3 py-2 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Próxima avaliação trimestral em:
            </span>
            <span className="font-bold text-sky-400">
              {Math.max(0, 90 - daysSinceAssessment)} dias
            </span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Peso Atual</span>
              <Scale className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{currentWeight}</span>
              <span className="text-xs text-slate-400">kg</span>
            </div>
            <div className="mt-1.5 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <span>Meta: 75 kg</span>
              <span className="text-sky-400">({weightDistance > 0 ? `-${weightDistance.toFixed(1)}kg` : 'Alcançada!'})</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/60 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Gordura Atual</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{currentFatPercent}</span>
              <span className="text-xs text-slate-400">%</span>
            </div>
            <div className="mt-1.5 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <span>Meta: 15%</span>
              <span className="text-amber-400">({fatDistance > 0 ? `-${fatDistance.toFixed(1)}%` : 'Alcançada!'})</span>
            </div>
          </div>
        </div>

        {/* Waist measurement if available */}
        {currentWaist && (
          <div className="flex items-center justify-between rounded-2xl bg-slate-800/50 border border-slate-800 px-4 py-2.5 text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <Ruler className="w-4 h-4 text-emerald-400" />
              Cintura (altura do umbigo):
            </span>
            <span className="font-bold text-white text-sm">{currentWaist} cm</span>
          </div>
        )}
      </div>

      {/* Warmup Quick reminder */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs text-slate-300">
        <h4 className="font-bold text-white flex items-center gap-2 mb-1.5">
          <Flame className="w-4 h-4 text-emerald-400" />
          Aquecimento obrigatório em todas as sessões:
        </h4>
        <ul className="list-disc list-inside space-y-0.5 text-slate-400">
          <li>5 min de bike ergométrica em ritmo leve/moderado</li>
          <li>2 min de mobilidade torácica (rotações e extensão)</li>
        </ul>
      </div>
    </div>
  );
};
