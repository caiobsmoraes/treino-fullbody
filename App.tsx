import React, { useEffect, useState } from 'react';
import {
  AppProgramSettings,
  BodyAssessment,
  ExerciseDefinition,
  WorkoutSession,
  WorkoutType,
} from './types';
import {
  DEFAULT_SETTINGS,
  getNextWorkoutType,
  storage,
} from './storage';
import { Navbar, NavTab } from './Navbar';
import { DashboardView } from './DashboardView';
import { WorkoutView } from './WorkoutView';
import { ExercisesView } from './ExercisesView';
import { AssessmentsView } from './AssessmentsView';
import { SettingsView } from './SettingsView';
import { Play, Dumbbell, Flame } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Application State
  const [settings, setSettings] = useState<AppProgramSettings>(DEFAULT_SETTINGS);
  const [exercises, setExercises] = useState<ExerciseDefinition[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [assessments, setAssessments] = useState<BodyAssessment[]>([]);

  // Active workout state
  const [activeWorkoutType, setActiveWorkoutType] = useState<WorkoutType | null>(null);

  // Load all data from IndexedDB
  const loadData = async () => {
    try {
      await storage.initializeDefaults();
      const s = await storage.getSettings();
      const ex = await storage.getAllExercises();
      const w = await storage.getAllWorkouts();
      const a = await storage.getAllAssessments();

      setSettings(s);
      setExercises(ex);
      setWorkouts(w);
      setAssessments(a);
    } catch (e) {
      console.error('Erro ao carregar dados do IndexedDB:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleStartWorkout = (type: WorkoutType) => {
    setActiveWorkoutType(type);
    setCurrentTab('workout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishWorkout = async (session: WorkoutSession) => {
    await storage.saveWorkout(session);
    setActiveWorkoutType(null);
    setCurrentTab('dashboard');
    await loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelWorkout = () => {
    if (confirm('Deseja descartar o treino em andamento? As séries não serão salvas.')) {
      setActiveWorkoutType(null);
      setCurrentTab('dashboard');
    }
  };

  const handleSaveExercise = async (ex: ExerciseDefinition) => {
    await storage.saveExercise(ex);
    const updated = await storage.getAllExercises();
    setExercises(updated);
  };

  const handleSaveAssessment = async (assessment: BodyAssessment) => {
    await storage.saveAssessment(assessment);
    const updated = await storage.getAllAssessments();
    setAssessments(updated);
  };

  const handleDeleteAssessment = async (id: string) => {
    if (confirm('Deseja excluir este registro de avaliação?')) {
      await storage.deleteAssessment(id);
      const updated = await storage.getAllAssessments();
      setAssessments(updated);
    }
  };

  const handleUpdateSettings = async (newSettings: AppProgramSettings) => {
    await storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce mb-3">
          <Dumbbell className="w-6 h-6 stroke-[2.5]" />
        </div>
        <p className="text-sm font-bold text-white">Carregando Treino Full Body...</p>
        <p className="text-xs text-slate-500 mt-1">Preparando banco local IndexedDB</p>
      </div>
    );
  }

  const lastWorkout = workouts.find((w) => w.completed);
  const nextWorkoutType = getNextWorkoutType(lastWorkout?.workoutType);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
        {/* Navigation & Header */}
        <Navbar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentWeek={settings.currentWeek}
          isWorkoutActive={!!activeWorkoutType}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4">
          {/* Dashboard Tab */}
          {currentTab === 'dashboard' && (
            <DashboardView
              settings={settings}
              workouts={workouts}
              assessments={assessments}
              onStartWorkout={handleStartWorkout}
              onNavigateTab={setCurrentTab}
            />
          )}

          {/* Workout Tab */}
          {currentTab === 'workout' && (
            activeWorkoutType ? (
              <WorkoutView
                workoutType={activeWorkoutType}
                settings={settings}
                exercises={exercises}
                allWorkouts={workouts}
                onFinishWorkout={handleFinishWorkout}
                onCancelWorkout={handleCancelWorkout}
              />
            ) : (
              <div className="space-y-6 pb-28 animate-in fade-in">
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Sessão do Dia
                  </span>
                  <h1 className="text-2xl font-black text-white">Escolha seu Treino</h1>
                  <p className="text-xs text-slate-400">
                    Sessões Full Body de até 45 min, com aquecimento prévio e descanso de 60–90s.
                  </p>
                </div>

                {/* Workout Selector Cards */}
                <div className="space-y-3">
                  {(['A', 'B', 'C'] as WorkoutType[]).map((type) => {
                    const isSuggested = type === nextWorkoutType;
                    return (
                      <div
                        key={type}
                        className={`rounded-3xl border p-5 transition space-y-3 ${
                          isSuggested
                            ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-lg'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                              isSuggested
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            Treino {type}
                          </span>
                          {isSuggested && (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5" /> Recomendado para hoje
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-black text-white">
                            {type === 'A' && 'Treino A (Puxada & Stiff)'}
                            {type === 'B' && 'Treino B (Elevação Pélvica & Leg Press)'}
                            {type === 'C' && 'Treino C (Mesa Flexora & Banco Alto)'}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {type === 'A' && '7 exercícios • 2 bi-sets (Remada/Elevação e Face pull/Dead bug)'}
                            {type === 'B' && '7 exercícios • 2 bi-sets (Remada peito/Crucifixo e Abdução/Prancha)'}
                            {type === 'C' && '7 exercícios • 2 bi-sets (Elevação cabo/Remada halter e Pallof press)'}
                          </p>
                        </div>

                        <button
                          onClick={() => handleStartWorkout(type)}
                          className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 ${
                            isSuggested
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>INICIAR TREINO {type}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* Exercises Tab */}
          {currentTab === 'exercises' && (
            <ExercisesView
              exercises={exercises}
              workouts={workouts}
              onSaveExercise={handleSaveExercise}
            />
          )}

          {/* Assessments Tab */}
          {currentTab === 'assessments' && (
            <AssessmentsView
              assessments={assessments}
              settings={settings}
              onSaveAssessment={handleSaveAssessment}
              onDeleteAssessment={handleDeleteAssessment}
            />
          )}

          {/* Settings Tab */}
          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRefreshData={loadData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
