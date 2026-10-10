import {
  AppBackupData,
  AppProgramSettings,
  BodyAssessment,
  ExerciseDefinition,
  WorkoutSession,
  WorkoutType,
} from './types';

const DB_NAME = 'treino_fullbody_db';
const DB_VERSION = 1;

// Default initial exercises
export const DEFAULT_EXERCISES: ExerciseDefinition[] = [
  // Treino A
  {
    id: 'a_puxada_frontal',
    workoutType: 'A',
    order: 1,
    name: 'Puxada frontal',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Puxada frontal execução correta')}`,
  },
  {
    id: 'a_stiff_halteres',
    workoutType: 'A',
    order: 2,
    name: 'Stiff com halteres',
    defaultSets: 3,
    minReps: 8,
    maxReps: 10,
    isLegExercise: true,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Stiff com halteres execução correta')}`,
  },
  {
    id: 'a_supino_inclinado_halteres',
    workoutType: 'A',
    order: 3,
    name: 'Supino inclinado com halteres',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Supino inclinado com halteres execução correta')}`,
  },
  {
    id: 'a_remada_baixa',
    workoutType: 'A',
    order: 4,
    name: 'Remada baixa',
    defaultSets: 3,
    minReps: 10,
    maxReps: 12,
    bisetGroup: 1,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Remada baixa execução correta')}`,
  },
  {
    id: 'a_elevacao_lateral',
    workoutType: 'A',
    order: 5,
    name: 'Elevação lateral',
    defaultSets: 3,
    minReps: 12,
    maxReps: 15,
    bisetGroup: 1,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Elevação lateral com halteres execução correta')}`,
  },
  {
    id: 'a_face_pull',
    workoutType: 'A',
    order: 6,
    name: 'Face pull',
    defaultSets: 3,
    minReps: 15,
    maxReps: 15,
    bisetGroup: 2,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Face pull execução correta')}`,
  },
  {
    id: 'a_dead_bug',
    workoutType: 'A',
    order: 7,
    name: 'Dead bug',
    defaultSets: 3,
    minReps: 8,
    maxReps: 8,
    bisetGroup: 2,
    isLegExercise: false,
    notes: '8 repetições por lado',
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Dead bug exercício execução correta')}`,
  },

  // Treino B
  {
    id: 'b_elevacao_pelvica',
    workoutType: 'B',
    order: 1,
    name: 'Elevação pélvica (hip thrust)',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    isLegExercise: true,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Elevação pélvica hip thrust execução correta')}`,
  },
  {
    id: 'b_leg_press',
    workoutType: 'B',
    order: 2,
    name: 'Leg press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 12,
    isLegExercise: true,
    notes: 'Amplitude até ~90°, sem dor articular.',
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Leg press 45 execução correta 90 graus')}`,
  },
  {
    id: 'b_desenvolvimento_halteres',
    workoutType: 'B',
    order: 3,
    name: 'Desenvolvimento com halteres sentado',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Desenvolvimento com halteres sentado execução correta')}`,
  },
  {
    id: 'b_remada_peito_apoiado',
    workoutType: 'B',
    order: 4,
    name: 'Remada com peito apoiado no banco',
    defaultSets: 3,
    minReps: 10,
    maxReps: 12,
    bisetGroup: 1,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Remada peito apoiado no banco execução correta')}`,
  },
  {
    id: 'b_crucifixo_inverso',
    workoutType: 'B',
    order: 5,
    name: 'Crucifixo inverso',
    defaultSets: 3,
    minReps: 12,
    maxReps: 15,
    bisetGroup: 1,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Crucifixo inverso com halteres execução correta')}`,
  },
  {
    id: 'b_abducao_quadril',
    workoutType: 'B',
    order: 6,
    name: 'Abdução de quadril',
    defaultSets: 2,
    minReps: 15,
    maxReps: 15,
    bisetGroup: 2,
    isLegExercise: true,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Cadeira abdutora execução correta')}`,
  },
  {
    id: 'b_prancha',
    workoutType: 'B',
    order: 7,
    name: 'Prancha',
    defaultSets: 3,
    minReps: 30,
    maxReps: 45,
    unit: 'seconds',
    bisetGroup: 2,
    isLegExercise: false,
    notes: '3 séries de 30 a 45 segundos',
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Prancha abdominal isométrica execução correta')}`,
  },

  // Treino C
  {
    id: 'c_mesa_flexora',
    workoutType: 'C',
    order: 1,
    name: 'Mesa flexora',
    defaultSets: 3,
    minReps: 10,
    maxReps: 12,
    isLegExercise: true,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Mesa flexora execução correta')}`,
  },
  {
    id: 'c_agachamento_banco_alto',
    workoutType: 'C',
    order: 2,
    name: 'Agachamento no banco alto (sentar e levantar)',
    defaultSets: 3,
    minReps: 10,
    maxReps: 10,
    isLegExercise: true,
    notes: 'Sem agachamento profundo. Foco em controle articular.',
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Box squat agachamento na caixa banco alto')}`,
  },
  {
    id: 'c_puxada_pegada_neutra',
    workoutType: 'C',
    order: 3,
    name: 'Puxada com pegada neutra',
    defaultSets: 3,
    minReps: 8,
    maxReps: 10,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Puxada pegada neutra triângulo execução correta')}`,
  },
  {
    id: 'c_supino_reto_maquina',
    workoutType: 'C',
    order: 4,
    name: 'Supino reto na máquina',
    defaultSets: 3,
    minReps: 8,
    maxReps: 12,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Supino reto maquina execução correta')}`,
  },
  {
    id: 'c_elevacao_lateral_cabo',
    workoutType: 'C',
    order: 5,
    name: 'Elevação lateral no cabo',
    defaultSets: 3,
    minReps: 12,
    maxReps: 15,
    bisetGroup: 1,
    isLegExercise: false,
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Elevação lateral na polia cabo execução correta')}`,
  },
  {
    id: 'c_remada_unilateral_halter',
    workoutType: 'C',
    order: 6,
    name: 'Remada unilateral com halter',
    defaultSets: 3,
    minReps: 10,
    maxReps: 10,
    bisetGroup: 1,
    isLegExercise: false,
    notes: '10 repetições por lado',
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Remada unilateral com halter serrote execução correta')}`,
  },
  {
    id: 'c_pallof_press',
    workoutType: 'C',
    order: 7,
    name: 'Pallof press',
    defaultSets: 3,
    minReps: 10,
    maxReps: 10,
    bisetGroup: 2,
    isLegExercise: false,
    notes: '10 repetições por lado',
    youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Pallof press na polia execução correta')}`,
  },
];

export const DEFAULT_SETTINGS: AppProgramSettings = {
  startDate: new Date().toISOString().split('T')[0],
  currentWeek: 1,
  restTimerDurationSeconds: 75,
  vibrationEnabled: true,
  soundEnabled: true,
  userAge: 39,
  userGender: 'male',
  targetWeightKg: 75,
  targetBodyFatPercent: 15,
};

export const INITIAL_ASSESSMENT: BodyAssessment = {
  id: 'assessment_initial',
  date: new Date().toISOString().split('T')[0],
  isQuickCheck: false,
  age: 39,
  gender: 'male',
  weightKg: 80,
  bodyFatPercent: 23,
  fatMassKg: 18.4,
  leanMassKg: 61.6,
  notes: 'Avaliação Inicial do Programa Full Body 12 Semanas.',
};

/**
 * IndexedDB Wrapper with Promise API and LocalStorage fallback
 */
class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('exercises')) {
          db.createObjectStore('exercises', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('workouts')) {
          db.createObjectStore('workouts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('assessments')) {
          db.createObjectStore('assessments', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // Initialize defaults if empty
  async initializeDefaults(): Promise<void> {
    try {
      const db = await this.getDB();

      // Check settings
      const settings = await this.getSettings();
      if (!settings) {
        await this.saveSettings(DEFAULT_SETTINGS);
      }

      // Check exercises
      const exercises = await this.getAllExercises();
      if (exercises.length === 0) {
        for (const ex of DEFAULT_EXERCISES) {
          await this.saveExercise(ex);
        }
      }

      // Check assessments
      const assessments = await this.getAllAssessments();
      if (assessments.length === 0) {
        await this.saveAssessment(INITIAL_ASSESSMENT);
      }
    } catch (e) {
      console.warn('Using LocalStorage fallback for initialization', e);
      if (!localStorage.getItem('fb_settings')) {
        localStorage.setItem('fb_settings', JSON.stringify(DEFAULT_SETTINGS));
      }
      if (!localStorage.getItem('fb_exercises')) {
        localStorage.setItem('fb_exercises', JSON.stringify(DEFAULT_EXERCISES));
      }
      if (!localStorage.getItem('fb_assessments')) {
        localStorage.setItem('fb_assessments', JSON.stringify([INITIAL_ASSESSMENT]));
      }
    }
  }

  // Settings
  async getSettings(): Promise<AppProgramSettings> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const req = store.get('current');
        req.onsuccess = () => resolve(req.result || DEFAULT_SETTINGS);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const stored = localStorage.getItem('fb_settings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppProgramSettings): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');
        const req = store.put(settings, 'current');
        req.onsuccess = () => {
          localStorage.setItem('fb_settings', JSON.stringify(settings));
          resolve();
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      localStorage.setItem('fb_settings', JSON.stringify(settings));
    }
  }

  // Exercises
  async getAllExercises(): Promise<ExerciseDefinition[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('exercises', 'readonly');
        const store = tx.objectStore('exercises');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const stored = localStorage.getItem('fb_exercises');
      return stored ? JSON.parse(stored) : DEFAULT_EXERCISES;
    }
  }

  async saveExercise(exercise: ExerciseDefinition): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('exercises', 'readwrite');
        const store = tx.objectStore('exercises');
        const req = store.put(exercise);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = await this.getAllExercises();
      const idx = list.findIndex((e) => e.id === exercise.id);
      if (idx >= 0) list[idx] = exercise;
      else list.push(exercise);
      localStorage.setItem('fb_exercises', JSON.stringify(list));
    }
  }

  // Workouts
  async getAllWorkouts(): Promise<WorkoutSession[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('workouts', 'readonly');
        const store = tx.objectStore('workouts');
        const req = store.getAll();
        req.onsuccess = () => {
          const res = (req.result || []) as WorkoutSession[];
          res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          resolve(res);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const stored = localStorage.getItem('fb_workouts');
      return stored ? JSON.parse(stored) : [];
    }
  }

  async saveWorkout(workout: WorkoutSession): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('workouts', 'readwrite');
        const store = tx.objectStore('workouts');
        const req = store.put(workout);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = await this.getAllWorkouts();
      const idx = list.findIndex((w) => w.id === workout.id);
      if (idx >= 0) list[idx] = workout;
      else list.push(workout);
      localStorage.setItem('fb_workouts', JSON.stringify(list));
    }
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('workouts', 'readwrite');
        const store = tx.objectStore('workouts');
        const req = store.delete(workoutId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = await this.getAllWorkouts();
      const updated = list.filter((w) => w.id !== workoutId);
      localStorage.setItem('fb_workouts', JSON.stringify(updated));
    }
  }

  // Assessments
  async getAllAssessments(): Promise<BodyAssessment[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('assessments', 'readonly');
        const store = tx.objectStore('assessments');
        const req = store.getAll();
        req.onsuccess = () => {
          const res = (req.result || []) as BodyAssessment[];
          res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          resolve(res);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const stored = localStorage.getItem('fb_assessments');
      return stored ? JSON.parse(stored) : [INITIAL_ASSESSMENT];
    }
  }

  async saveAssessment(assessment: BodyAssessment): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('assessments', 'readwrite');
        const store = tx.objectStore('assessments');
        const req = store.put(assessment);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = await this.getAllAssessments();
      const idx = list.findIndex((a) => a.id === assessment.id);
      if (idx >= 0) list[idx] = assessment;
      else list.push(assessment);
      localStorage.setItem('fb_assessments', JSON.stringify(list));
    }
  }

  async deleteAssessment(assessmentId: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('assessments', 'readwrite');
        const store = tx.objectStore('assessments');
        const req = store.delete(assessmentId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = await this.getAllAssessments();
      const updated = list.filter((a) => a.id !== assessmentId);
      localStorage.setItem('fb_assessments', JSON.stringify(updated));
    }
  }

  // Backup and Restore
  async exportFullBackup(): Promise<string> {
    const settings = await this.getSettings();
    const exercises = await this.getAllExercises();
    const workoutHistory = await this.getAllWorkouts();
    const assessments = await this.getAllAssessments();

    const data: AppBackupData = {
      version: 1,
      exportDate: new Date().toISOString(),
      settings,
      exercises,
      workoutHistory,
      assessments,
    };

    return JSON.stringify(data, null, 2);
  }

  async importFullBackup(jsonContent: string): Promise<void> {
    const data: AppBackupData = JSON.parse(jsonContent);
    if (!data.settings || !data.exercises) {
      throw new Error('Arquivo de backup inválido.');
    }

    await this.saveSettings(data.settings);

    for (const ex of data.exercises) {
      await this.saveExercise(ex);
    }

    if (Array.isArray(data.workoutHistory)) {
      for (const w of data.workoutHistory) {
        await this.saveWorkout(w);
      }
    }

    if (Array.isArray(data.assessments)) {
      for (const a of data.assessments) {
        await this.saveAssessment(a);
      }
    }
  }
}

export const storage = new StorageService();

/**
 * Periodization Helper
 * Semanas 1-2: 2 séries, RIR 3 (3 reps de reserva)
 * Semanas 3-12: 3 séries, RIR 1-2 (1-2 reps de reserva)
 * Semana 7: Deload — metade das séries
 */
export function getPeriodizationRules(weekNumber: number) {
  const isDeload = weekNumber === 7;
  const isInitialRamp = weekNumber <= 2;

  let rirText = 'Parar com 1–2 repetições sobrando (RIR 1–2)';
  let targetSetsMultiplier = 1;

  if (isInitialRamp) {
    rirText = 'Adaptação: 2 séries por exercício, parar com 3 repetições sobrando (RIR 3)';
    targetSetsMultiplier = 2 / 3;
  } else if (isDeload) {
    rirText = 'Semana de Deload: metade das séries habituais para recuperação do SNC e articulações';
    targetSetsMultiplier = 0.5;
  }

  return {
    isDeload,
    isInitialRamp,
    rirText,
    targetSetsMultiplier,
    calculateSetsForExercise: (baseSets: number): number => {
      if (isDeload) {
        return Math.max(1, Math.floor(baseSets / 2));
      }
      if (isInitialRamp) {
        return Math.min(2, baseSets);
      }
      return baseSets;
    },
  };
}

/**
 * YouTube Helper
 * Extracts ID and returns embed URL using youtube-nocookie.com
 */
export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const trimmed = url.trim();
    // Patterns:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/shorts/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    const regExp =
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
    const match = trimmed.match(regExp);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Calculates next workout in cycle A -> B -> C
 */
export function getNextWorkoutType(lastWorkoutType?: WorkoutType): WorkoutType {
  if (!lastWorkoutType) return 'A';
  if (lastWorkoutType === 'A') return 'B';
  if (lastWorkoutType === 'B') return 'C';
  return 'A';
}
