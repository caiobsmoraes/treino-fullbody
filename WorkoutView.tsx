import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  ChevronLeft,
  Clock,
  Dumbbell,
  Flame,
  Info,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Sparkles,
  Trophy,
  Youtube,
  Volume2,
  VolumeX,
  Vibrate,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AppProgramSettings,
  ExerciseDefinition,
  ExerciseLog,
  SetEntry,
  WorkoutSession,
  WorkoutType,
} from './types';
import { ChondromalaciaAlert } from './ChondromalaciaAlert';
import { RestTimer } from './RestTimer';
import { soundService } from './sound';
import { getPeriodizationRules, getYouTubeEmbedUrl } from './storage';

interface WorkoutViewProps {
  workoutType: WorkoutType;
  settings: AppProgramSettings;
  exercises: ExerciseDefinition[];
  allWorkouts: WorkoutSession[];
  onFinishWorkout: (session: WorkoutSession) => void;
  onCancelWorkout: () => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  workoutType,
  settings,
  exercises,
  allWorkouts,
  onFinishWorkout,
  onCancelWorkout,
}) => {
  // Periodization rules for current week
  const periodization = useMemo(
    () => getPeriodizationRules(settings.currentWeek),
    [settings.currentWeek]
  );

  // Filter exercises for this workout type and sort by order
  const workoutExercises = useMemo(() => {
    return exercises
      .filter((e) => e.workoutType === workoutType)
      .sort((a, b) => a.order - b.order);
  }, [exercises, workoutType]);

  // Session duration timer
  const [startTime] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Warmup checkboxes
  const [bikeWarmupDone, setBikeWarmupDone] = useState(false);
  const [mobilityWarmupDone, setMobilityWarmupDone] = useState(false);

  // Knee pain rating (0 to 10) for leg workouts
  const hasLegExercises = workoutExercises.some((e) => e.isLegExercise);
  const [kneePainLevel, setKneePainLevel] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState('');

  // Active Rest Timer state
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{ name: string; url?: string; searchUrl: string } | null>(null);

  // Find previous session for each exercise to populate "Última vez" and progression advice
  const exerciseHistoryMap = useMemo(() => {
    const map = new Map<string, { lastSets: SetEntry[]; allHitMaxReps: boolean; lastSummary: string }>();

    for (const ex of workoutExercises) {
      // Find the most recent session containing this exercise
      let foundSets: SetEntry[] | null = null;

      for (const w of allWorkouts) {
        if (!w.completed) continue;
        const logged = w.exercises.find((e) => e.exerciseId === ex.id);
        if (logged && logged.sets.length > 0) {
          foundSets = logged.sets.filter((s) => s.completed);
          if (foundSets.length > 0) break;
        }
      }

      if (foundSets && foundSets.length > 0) {
        const lastSummary = foundSets
          .map((s) => `${s.weightKg}kg×${s.reps}`)
          .join(', ');

        // Check if user hit the top of the rep range in ALL completed sets
        const allHitMaxReps = foundSets.every((s) => s.reps >= ex.maxReps);

        map.set(ex.id, {
          lastSets: foundSets,
          allHitMaxReps,
          lastSummary,
        });
      }
    }

    return map;
  }, [workoutExercises, allWorkouts]);

  // Initialize active workout logs state
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => {
    return workoutExercises.map((ex) => {
      const history = exerciseHistoryMap.get(ex.id);
      const targetSetsCount = periodization.calculateSetsForExercise(ex.defaultSets);

      const sets: SetEntry[] = [];
      for (let i = 1; i <= targetSetsCount; i++) {
        // Use last session's weight as default, or 0
        const prevSet = history?.lastSets?.[i - 1] || history?.lastSets?.[0];
        const defaultWeight = prevSet ? prevSet.weightKg : 0;
        const defaultReps = prevSet ? prevSet.reps : ex.minReps;

        sets.push({
          setNumber: i,
          weightKg: defaultWeight,
          reps: defaultReps,
          completed: false,
        });
      }

      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets,
      };
    });
  });

  // Track session duration
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Format MM:SS
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toggle set completed
  const handleToggleSet = (exerciseId: string, setIndex: number) => {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log;

        const updatedSets = log.sets.map((set, idx) => {
          if (idx !== setIndex) return set;
          const nextCompleted = !set.completed;

          if (nextCompleted) {
            // Sound tick
            if (settings.soundEnabled) soundService.playTick();
            // Start rest timer automatically!
            setIsRestTimerOpen(true);
          }

          return { ...set, completed: nextCompleted };
        });

        return { ...log, sets: updatedSets };
      })
    );
  };

  // Adjust weight
  const handleUpdateWeight = (exerciseId: string, setIndex: number, delta: number) => {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log;
        const updatedSets = log.sets.map((set, idx) => {
          if (idx !== setIndex) return set;
          const newWeight = Math.max(0, Math.round((set.weightKg + delta) * 2) / 2);
          return { ...set, weightKg: newWeight };
        });
        return { ...log, sets: updatedSets };
      })
    );
  };

  // Adjust reps
  const handleUpdateReps = (exerciseId: string, setIndex: number, delta: number) => {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log;
        const updatedSets = log.sets.map((set, idx) => {
          if (idx !== setIndex) return set;
          const newReps = Math.max(1, set.reps + delta);
          return { ...set, reps: newReps };
        });
        return { ...log, sets: updatedSets };
      })
    );
  };

  // Direct input
  const handleDirectInput = (
    exerciseId: string,
    setIndex: number,
    field: 'weightKg' | 'reps',
    val: number
  ) => {
    setExerciseLogs((prev) =>
      prev.map((log) => {
        if (log.exerciseId !== exerciseId) return log;
        const updatedSets = log.sets.map((set, idx) => {
          if (idx !== setIndex) return set;
          return { ...set, [field]: Math.max(0, val) };
        });
        return { ...log, sets: updatedSets };
      })
    );
  };

  // Progress summary
  const totalSetsCount = exerciseLogs.reduce((acc, l) => acc + l.sets.length, 0);
  const completedSetsCount = exerciseLogs.reduce(
    (acc, l) => acc + l.sets.filter((s) => s.completed).length,
    0
  );
  const workoutProgressPercent = totalSetsCount > 0 ? (completedSetsCount / totalSetsCount) * 100 : 0;

  // Complete workout
  const handleCompleteWorkout = () => {
    // Trigger confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const session: WorkoutSession = {
      id: `workout_${Date.now()}`,
      workoutType,
      date: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      weekNumber: settings.currentWeek,
      warmupCompleted: bikeWarmupDone && mobilityWarmupDone,
      kneePainLevel: hasLegExercises ? kneePainLevel : undefined,
      exercises: exerciseLogs,
      completed: true,
      notes: sessionNotes.trim() || undefined,
    };

    onFinishWorkout(session);
  };

  return (
    <div className="space-y-5 pb-36 animate-in fade-in">
      {/* Sticky Top Bar for sweaty session */}
      <div className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shadow-lg">
        <button
          onClick={onCancelWorkout}
          className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold px-2 py-1.5 rounded-xl hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            {formatDuration(elapsedSeconds)}
          </span>
          <button
            onClick={() => setIsRestTimerOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black px-3 py-1 rounded-xl hover:bg-emerald-500/30 active:scale-95 transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timer</span>
          </button>
        </div>
      </div>

      {/* Workout Header Info */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-xs font-black uppercase tracking-wider">
            Treino {workoutType} • Full Body
          </span>
          <span className="text-xs font-semibold text-slate-400">
            Semana {settings.currentWeek} de 12
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black text-white">
            {workoutType === 'A' && 'Treino A (Puxada & Stiff)'}
            {workoutType === 'B' && 'Treino B (Elevação Pélvica & Leg Press)'}
            {workoutType === 'C' && 'Treino C (Mesa Flexora & Banco Alto)'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Meta da sessão: até 45 min • Descanso: 60–90s • {periodization.rirText}
          </p>
        </div>

        {/* Workout Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Progresso da Sessão</span>
            <span className="text-emerald-400">
              {completedSetsCount}/{totalSetsCount} séries ({Math.round(workoutProgressPercent)}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${workoutProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mandatory Warm-up Checklist Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Aquecimento Obrigatório (7 min)
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">Antes de iniciar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Bike Check */}
          <button
            onClick={() => setBikeWarmupDone(!bikeWarmupDone)}
            className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition cursor-pointer active:scale-98 ${
              bikeWarmupDone
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                bikeWarmupDone ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 bg-slate-800'
              }`}
            >
              {bikeWarmupDone && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
            <div className="text-xs leading-tight">
              <strong className="block text-white">5 min de Bike</strong>
              <span className="text-slate-400 text-[11px]">Ritmo leve a moderado</span>
            </div>
          </button>

          {/* Mobility Check */}
          <button
            onClick={() => setMobilityWarmupDone(!mobilityWarmupDone)}
            className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition cursor-pointer active:scale-98 ${
              mobilityWarmupDone
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                mobilityWarmupDone ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 bg-slate-800'
              }`}
            >
              {mobilityWarmupDone && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
            <div className="text-xs leading-tight">
              <strong className="block text-white">2 min Mobilidade Torácica</strong>
              <span className="text-slate-400 text-[11px]">Rotações e extensão no colchonete</span>
            </div>
          </button>
        </div>
      </div>

      {/* Condromalacia Notice for workouts with leg work */}
      {hasLegExercises && <ChondromalaciaAlert />}

      {/* Exercises List */}
      <div className="space-y-6">
        {workoutExercises.map((exercise, exIndex) => {
          const log = exerciseLogs.find((l) => l.exerciseId === exercise.id);
          const history = exerciseHistoryMap.get(exercise.id);
          const isBiset = !!exercise.bisetGroup;

          return (
            <div
              key={exercise.id}
              className={`rounded-3xl border transition-all ${
                isBiset
                  ? 'bg-slate-900/90 border-sky-500/40 shadow-sky-950/20 shadow-lg'
                  : 'bg-slate-900 border-slate-800 shadow-md'
              } p-4 sm:p-5`}
            >
              {/* Exercise Card Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-400">
                      #{exercise.order}
                    </span>
                    <h3 className="text-lg font-black text-white leading-tight">
                      {exercise.name}
                    </h3>
                    {/* Bi-set badge */}
                    {isBiset && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        Bi-set ({exercise.bisetGroup}) • Alternado
                      </span>
                    )}
                    {/* Leg alert pill */}
                    {exercise.isLegExercise && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold">
                        Perna • Atenção Joelho
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-emerald-400">
                      Meta: {log?.sets.length || exercise.defaultSets}x{exercise.minReps}–{exercise.maxReps} {exercise.unit === 'seconds' ? 'seg' : 'reps'}
                    </span>
                    {exercise.notes && (
                      <span className="text-slate-400 italic">({exercise.notes})</span>
                    )}
                  </div>
                </div>

                {/* Video button */}
                <button
                  onClick={() =>
                    setActiveVideoModal({
                      name: exercise.name,
                      url: exercise.customVideoUrl,
                      searchUrl: exercise.youtubeSearchUrl,
                    })
                  }
                  className="p-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 flex items-center gap-1 text-xs font-bold transition active:scale-95 flex-shrink-0 cursor-pointer"
                  title="Ver vídeo no YouTube"
                >
                  <Youtube className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Vídeo</span>
                </button>
              </div>

              {/* Last Session History & Progression Suggestion */}
              <div className="my-3 space-y-2">
                {history ? (
                  <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-xs text-slate-300 flex items-center justify-between">
                    <span className="text-slate-400">Última sessão:</span>
                    <span className="font-mono font-bold text-white">
                      {history.lastSummary}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-800/30 px-3 py-1.5 text-[11px] text-slate-400 italic">
                    Primeira vez registrando este exercício.
                  </div>
                )}

                {/* Progression Rule Alert */}
                {history?.allHitMaxReps && (
                  <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/40 p-2.5 text-xs text-emerald-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Hora de progredir!</strong> Você bateu o topo ({exercise.maxReps} reps) em todas as séries na última vez. Sugestão: aumente +1kg a 2kg hoje.
                    </span>
                  </div>
                )}
              </div>

              {/* Sets Table / Rows (Designed with large tap targets for sweaty hands) */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 px-2">
                  <div className="col-span-2 text-center">SÉRIE</div>
                  <div className="col-span-5 text-center">CARGA (KG)</div>
                  <div className="col-span-3 text-center">REPS</div>
                  <div className="col-span-2 text-center">FEITO</div>
                </div>

                {log?.sets.map((set, setIdx) => {
                  return (
                    <div
                      key={set.setNumber}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl border transition ${
                        set.completed
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-800/50 border-slate-700/60'
                      }`}
                    >
                      {/* Set Number */}
                      <div className="col-span-2 flex justify-center">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                            set.completed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-700/60 text-slate-300'
                          }`}
                        >
                          {set.setNumber}
                        </span>
                      </div>

                      {/* Weight Control: -1, input, +1 */}
                      <div className="col-span-5 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateWeight(exercise.id, setIdx, -1)}
                          className="w-8 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 flex items-center justify-center text-sm font-bold flex-shrink-0"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={set.weightKg === 0 ? '' : set.weightKg}
                          placeholder="0"
                          onChange={(e) =>
                            handleDirectInput(
                              exercise.id,
                              setIdx,
                              'weightKg',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-14 h-10 text-center font-mono font-black text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateWeight(exercise.id, setIdx, 1)}
                          className="w-8 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 flex items-center justify-center text-sm font-bold flex-shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reps Control: -1, input, +1 */}
                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateReps(exercise.id, setIdx, -1)}
                          className="w-7 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={set.reps}
                          onChange={(e) =>
                            handleDirectInput(
                              exercise.id,
                              setIdx,
                              'reps',
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="w-10 h-10 text-center font-mono font-black text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateReps(exercise.id, setIdx, 1)}
                          className="w-7 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0"
                        >
                          +
                        </button>
                      </div>

                      {/* Giant Sweaty-Finger Completed Checkbox Button */}
                      <div className="col-span-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSet(exercise.id, setIdx)}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition active:scale-90 cursor-pointer shadow-md ${
                            set.completed
                              ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/30'
                              : 'bg-slate-700/80 hover:bg-slate-600 border border-slate-600 text-slate-400'
                          }`}
                          aria-label={`Marcar série ${set.setNumber} concluída`}
                        >
                          {set.completed ? (
                            <Check className="w-6 h-6 stroke-[3.5]" />
                          ) : (
                            <span className="text-xs font-bold">OK</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Post-Workout Knee Pain Evaluation (Mandatory if leg exercises present) */}
      {hasLegExercises && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Nível de Dor no Joelho Pós-Treino (0 a 10)
            </h3>
            <span
              className={`font-mono text-base font-black px-2.5 py-0.5 rounded-xl ${
                kneePainLevel <= 3
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
              }`}
            >
              {kneePainLevel} / 10
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Lembrete: dor até 3/10 que some em até 24h é tolerável. Acima de 3, reduza carga ou amplitude na próxima sessão.
          </p>

          {/* Large touch pills for pain rating */}
          <div className="grid grid-cols-11 gap-1 pt-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isSelected = kneePainLevel === num;
              const isSafe = num <= 3;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setKneePainLevel(num)}
                  className={`h-11 rounded-xl font-bold text-xs transition active:scale-95 cursor-pointer ${
                    isSelected
                      ? isSafe
                        ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-400'
                        : 'bg-rose-500 text-white font-black ring-2 ring-rose-400'
                      : isSafe
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {kneePainLevel > 3 && (
            <div className="rounded-2xl bg-rose-950/40 border border-rose-500/50 p-3 text-xs text-rose-200">
              <strong>Atenção:</strong> Dor registrada acima de 3/10. Na próxima sessão, evite aumentar peso nos exercícios de perna e reduza ligeiramente a amplitude.
            </div>
          )}
        </div>
      )}

      {/* Optional Session Notes */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-2">
        <label className="text-xs font-bold text-slate-300">
          Observações da sessão (opcional):
        </label>
        <textarea
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Ex: Treino rendeu muito bem, aumentei 2kg no leg press..."
          rows={2}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Huge Bottom Action Button to Finish Workout */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-4 flex gap-3 max-w-lg mx-auto">
        <button
          onClick={onCancelWorkout}
          className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition"
        >
          Descartar
        </button>

        <button
          onClick={handleCompleteWorkout}
          className="flex-2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <Trophy className="w-5 h-5 fill-current" />
          <span>FINALIZAR TREINO</span>
        </button>
      </div>

      {/* Rest Timer Modal / Floating Bar */}
      <RestTimer
        initialSeconds={settings.restTimerDurationSeconds || 75}
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={settings.vibrationEnabled}
      />

      {/* YouTube Video Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-white animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Youtube className="w-5 h-5 text-rose-500" />
                {activeVideoModal.name}
              </h3>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-4">
              {activeVideoModal.url && getYouTubeEmbedUrl(activeVideoModal.url) ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
                  <iframe
                    src={getYouTubeEmbedUrl(activeVideoModal.url)!}
                    title={activeVideoModal.name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-800/60 p-5 text-center space-y-3">
                  <p className="text-sm text-slate-300">
                    Nenhum vídeo específico foi colado ainda. Abra a busca com a melhor execução no YouTube:
                  </p>
                  <a
                    href={activeVideoModal.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white px-5 py-3 text-sm font-bold shadow-lg shadow-rose-600/30"
                  >
                    <Youtube className="w-5 h-5" />
                    Abrir Busca no YouTube
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveVideoModal(null)}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
