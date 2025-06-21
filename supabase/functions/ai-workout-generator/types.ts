
export interface AIWorkoutData {
  name: string;
  objective: string;
  estimatedDuration: number;
  routines: AIRoutine[];
  exercises: AIExercise[];
  notes: string;
}

export interface AIRoutine {
  name: string;
  day: string;
  focus: string;
  exercises: AIExercise[];
}

export interface AIExercise {
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  weight: number;
  muscleGroup: string;
  type: 'strength' | 'cardio' | 'flexibility';
  instructions: string;
}
