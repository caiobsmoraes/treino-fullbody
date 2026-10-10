/**
 * Types and interfaces for Treino Full Body App
 */

export type WorkoutType = 'A' | 'B' | 'C';

export interface ExerciseDefinition {
  id: string;
  workoutType: WorkoutType;
  order: number;
  name: string;
  defaultSets: number; // Base sets (e.g. 3, or 2 for hip abduction)
  minReps: number;
  maxReps: number;
  bisetGroup?: 1 | 2; // Bi-set group identifier (e.g. 1 or 2)
  isLegExercise: boolean; // Enables chondromalacia warning
  youtubeSearchUrl: string; // youtube.com/results?search_query=...
  customVideoUrl?: string; // User-pasted YouTube link
  notes?: string;
  unit?: 'reps' | 'seconds'; // e.g., reps or seconds for prancha
}

export interface SetEntry {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  rir?: number; // Reps in reserve
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetEntry[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  workoutType: WorkoutType;
  date: string; // ISO date YYYY-MM-DDTHH:mm:ss
  durationSeconds: number;
  weekNumber: number;
  warmupCompleted: boolean;
  kneePainLevel?: number; // 0 to 10 scale for leg workouts
  exercises: ExerciseLog[];
  completed: boolean;
  notes?: string;
}

export interface BodyAssessment {
  id: string;
  date: string; // YYYY-MM-DD
  isQuickCheck: boolean; // true = quick bi-weekly check (only weight & waist)
  age?: number;
  gender?: 'male' | 'female';
  weightKg: number;
  bodyFatPercent?: number;
  fatMassKg?: number;
  leanMassKg?: number;
  // Circumferences in cm
  waistUmbigo?: number; // cintura altura do umbigo
  abdomen?: number;
  chest?: number;
  shoulders?: number;
  armRelaxed?: number;
  hips?: number;
  thigh?: number;
  notes?: string;
  // Local photos (stored as Base64 strings in IndexedDB)
  photos?: {
    front?: string;
    side?: string;
    back?: string;
  };
}

export interface AppProgramSettings {
  startDate: string; // YYYY-MM-DD
  currentWeek: number; // 1 to 12
  restTimerDurationSeconds: number; // default 75 (between 60-90s)
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  userAge: number;
  userGender: 'male' | 'female';
  targetWeightKg: number; // 75 kg
  targetBodyFatPercent: number; // 15%
}

export interface AppBackupData {
  version: number;
  exportDate: string;
  settings: AppProgramSettings;
  exercises: ExerciseDefinition[];
  workoutHistory: WorkoutSession[];
  assessments: BodyAssessment[];
}
