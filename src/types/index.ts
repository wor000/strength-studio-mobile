
export interface Exercise {
  id: string;
  name: string;
  type: string;
  muscleGroup: string;
  instructions?: string;
  image?: string;
  video?: string;
}

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime: number;
  superset_group?: number | null;
  superset_order?: number;
}

export interface Routine {
  id: string;
  name: string;
  objective: string;
  days: string[];
  exercises: RoutineExercise[];
  notes?: string;
  estimatedDuration: number;
  program_id?: string;
}

export interface EditableExerciseData {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  date: string;
  startTime: string;
  endTime?: string;
  completedExercises: string[];
  notes?: string;
  exerciseData?: Record<string, EditableExerciseData>;
}

export interface ExerciseSet {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: ExerciseSet[];
  restTime: number;
  completed: boolean;
}
