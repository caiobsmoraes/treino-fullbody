import React, { useState } from 'react';
import {
  Youtube,
  Search,
  ExternalLink,
  Save,
  TrendingUp,
  Dumbbell,
  Play,
  Edit2,
  Check,
  Calendar,
  X,
} from 'lucide-react';
import { ExerciseDefinition, WorkoutSession, WorkoutType } from '../types';
import { getYouTubeEmbedUrl } from '../services/storage';
import { ChondromalaciaAlert } from '../components/ChondromalaciaAlert';

interface ExercisesViewProps {
  exercises: ExerciseDefinition[];
  workouts: WorkoutSession[];
  onSaveExercise: (exercise: ExerciseDefinition) => void;
}

export const ExercisesView: React.FC<ExercisesViewProps> = ({
  exercises,
  workouts,
  onSaveExercise,
}) => {
  const [activeTab, setActiveTab] = useState<WorkoutType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [selectedExerciseForHistory, setSelectedExerciseForHistory] = useState<ExerciseDefinition | null>(null);

  // Filter exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesTab = activeTab === 'ALL' || ex.workoutType === activeTab;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleStartEditVideo = (ex: ExerciseDefinition) => {
    setEditingVideoId(ex.id);
    setVideoUrlInput(ex.customVideoUrl || '');
  };

  const handleSaveVideo = (ex: ExerciseDefinition) => {
    const updated: ExerciseDefinition = {
      ...ex,
      customVideoUrl: videoUrlInput.trim() || undefined,
    };
    onSaveExercise(updated);
    setEditingVideoId(null);
  };

  // Extract history for a specific exercise
  const getExerciseHistory = (exerciseId: string) => {
    const historyEntries: {
      date: string;
      workoutType: WorkoutType;
      maxWeight: number;
      setsSummary: string;
    }[] = [];

    // Chronological order for graphs
    const sortedWorkouts = [...workouts]
      .filter((w) => w.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const w of sortedWorkouts) {
      const match = w.exercises.find((e) => e.exerciseId === exerciseId);
      if (match && match.sets.length > 0) {
        const completedSets = match.sets.filter((s) => s.completed);
        if (completedSets.length > 0) {
          const maxWeight = Math.max(...completedSets.map((s) => s.weightKg));
          const setsSummary = completedSets.map((s) => `${s.weightKg}kg×${s.reps}`).join(' | ');
          historyEntries.push({
            date: w.date.split('T')[0],
            workoutType: w.workoutType,
            maxWeight,
            setsSummary,
          });
        }
      }
    }

    return historyEntries;
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-rose-400">
            Biblioteca de Movimentos
          </span>
          <h1 className="text-2xl font-black text-white mt-1">Exercícios & Vídeos</h1>
          <p className="text-xs text-slate-400 mt-1">
            Cole links do YouTube para assistir à execução correta embutida (via youtube-nocookie) ou abra a busca direta.
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar exercício pelo nome..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['ALL', 'A', 'B', 'C'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                activeTab === tab
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab === 'ALL' ? 'Todos os Treinos' : `Treino ${tab}`}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-5">
        {filteredExercises.map((exercise) => {
          const isEditing = editingVideoId === exercise.id;
          const embedUrl = getYouTubeEmbedUrl(exercise.customVideoUrl);
          const history = getExerciseHistory(exercise.id);
          const lastMaxWeight = history.length > 0 ? history[history.length - 1].maxWeight : null;

          return (
            <div
              key={exercise.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-4"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs font-black text-rose-400">
                      Treino {exercise.workoutType}
                    </span>
                    <h2 className="text-lg font-black text-white">{exercise.name}</h2>
                    {exercise.bisetGroup && (
                      <span className="rounded-full bg-sky-500/20 text-sky-400 px-2.5 py-0.5 text-[10px] font-bold">
                        Bi-set {exercise.bisetGroup}
                      </span>
                    )}
                    {exercise.isLegExercise && (
                      <span className="rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                        Perna
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    Faixa: {exercise.defaultSets} séries de {exercise.minReps} a {exercise.maxReps}{' '}
                    {exercise.unit === 'seconds' ? 'segundos' : 'repetições'}
                  </p>
                </div>

                {/* History button */}
                <button
                  onClick={() => setSelectedExerciseForHistory(exercise)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex-shrink-0 cursor-pointer"
                  title="Ver evolução de carga"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Evolução</span>
                </button>
              </div>

              {/* Chondromalacia note if leg exercise */}
              {exercise.isLegExercise && <ChondromalaciaAlert compact />}

              {/* Video Player or Search Banner */}
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 p-3 space-y-3">
                {embedUrl ? (
                  <div className="space-y-2">
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                      <iframe
                        src={embedUrl}
                        title={`Execução: ${exercise.name}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Vídeo embutido ativo (youtube-nocookie)
                      </span>
                      <button
                        onClick={() => handleStartEditVideo(exercise)}
                        className="text-slate-400 hover:text-white underline"
                      >
                        Trocar link
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Youtube className="w-4 h-4 text-rose-500" />
                        Nenhum vídeo específico salvo
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Clique abaixo para ver execuções no YouTube ou cole uma URL personalizada.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={exercise.youtubeSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex-shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buscar no YouTube
                      </a>

                      <button
                        onClick={() => handleStartEditVideo(exercise)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex-shrink-0 cursor-pointer"
                      >
                        Colar Link
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit Video URL Field */}
                {isEditing && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Cole a URL do vídeo do YouTube:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                      <button
                        onClick={() => handleSaveVideo(exercise)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition"
                      >
                        <Save className="w-3.5 h-3.5" /> Salvar
                      </button>
                      <button
                        onClick={() => setEditingVideoId(null)}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Last recorded weight indicator */}
              {lastMaxWeight !== null && (
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Carga máxima recente:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {lastMaxWeight} kg
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* History and Progression Modal */}
      {selectedExerciseForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-white max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
              <div>
                <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                  Histórico de Progressão
                </span>
                <h3 className="text-lg font-black text-white">
                  {selectedExerciseForHistory.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExerciseForHistory(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 flex-1">
              {(() => {
                const history = getExerciseHistory(selectedExerciseForHistory.id);

                if (history.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                      <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
                      <p>Nenhuma sessão concluída com este exercício ainda.</p>
                      <p className="text-slate-500">
                        As cargas salvas durante os treinos aparecerão aqui com gráficos de evolução.
                      </p>
                    </div>
                  );
                }

                const maxRecorded = Math.max(...history.map((h) => h.maxWeight));
                const minRecorded = Math.min(...history.map((h) => h.maxWeight));

                return (
                  <div className="space-y-4">
                    {/* Visual Bar Progression */}
                    <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Evolução da Carga Máxima (kg)</span>
                        <span className="font-bold text-emerald-400">
                          Recorde: {maxRecorded} kg
                        </span>
                      </div>

                      <div className="space-y-2">
                        {history.map((entry, idx) => {
                          const percent = maxRecorded > 0 ? (entry.maxWeight / maxRecorded) * 100 : 0;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[11px] font-mono text-slate-300">
                                <span>{entry.date} (Treino {entry.workoutType})</span>
                                <span className="font-bold text-white">{entry.maxWeight} kg</span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed entries list */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">Sessões Anteriores:</h4>
                      {history.slice().reverse().map((entry, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-3 text-xs space-y-1"
                        >
                          <div className="flex justify-between text-slate-300 font-bold">
                            <span>{entry.date} • Treino {entry.workoutType}</span>
                            <span className="text-emerald-400 font-mono">{entry.maxWeight} kg máx</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">
                            {entry.setsSummary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-3 border-t border-slate-800 flex-shrink-0">
              <button
                onClick={() => setSelectedExerciseForHistory(null)}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
