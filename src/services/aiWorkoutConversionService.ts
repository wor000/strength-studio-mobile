
import { createExerciseFromAI, mapDayToPortuguese, AIWorkoutData } from '@/utils/aiWorkoutConverter';
import { Exercise } from '@/types';
import { youtubeService } from './youtubeService';

interface AIGeneratedWorkout {
  id: string;
  workout_data: AIWorkoutData;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export const createAIWorkoutConversionService = (
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>,
  addRoutine: (routine: any) => Promise<any>,
  createProgram: (program: any) => Promise<any>,
  exercises: Exercise[]
) => {
  const createExercisesFromWorkout = async (
    workoutData: AIWorkoutData,
    createdExercisesMap: Map<string, Exercise>
  ) => {
    // Process exercises from general list first
    if (workoutData.exercises && workoutData.exercises.length > 0) {
      console.log('Processing', workoutData.exercises.length, 'exercises from general list');
      
      for (const exercise of workoutData.exercises) {
        await processExercise(exercise, createdExercisesMap);
      }
    }
    
    // If no exercises in general list, extract from individual routines
    if (createdExercisesMap.size === 0 && workoutData.routines) {
      console.log('No exercises in general list, extracting from routines');
      
      for (const routine of workoutData.routines) {
        for (const exercise of routine.exercises) {
          await processExercise(exercise, createdExercisesMap);
        }
      }
    }
    
    console.log('Created/found', createdExercisesMap.size, 'exercises with automatic video search');
  };

  const processExercise = async (
    exercise: any,
    createdExercisesMap: Map<string, Exercise>
  ) => {
    let existingExercise = exercises.find(e => 
      e.name.toLowerCase() === exercise.name.toLowerCase()
    );
    
    if (!existingExercise && !createdExercisesMap.has(exercise.name.toLowerCase())) {
      try {
        const exerciseData = createExerciseFromAI(exercise);
        
        // Search for YouTube video automatically
        console.log('Searching YouTube video for:', exerciseData.name);
        const videoUrl = await youtubeService.searchVideo(exerciseData.name);
        if (videoUrl) {
          exerciseData.video = videoUrl;
          console.log('Added video URL to exercise:', exerciseData.name, videoUrl);
        }
        
        console.log('Creating exercise:', exerciseData.name);
        existingExercise = await addExercise(exerciseData);
      } catch (error) {
        console.error('Error creating exercise:', error);
        return;
      }
    } else if (existingExercise) {
      console.log('Exercise already exists:', existingExercise.name);
    }
    
    if (existingExercise) {
      createdExercisesMap.set(exercise.name.toLowerCase(), existingExercise);
    }
  };

  const createWorkoutProgram = async (workoutData: AIWorkoutData) => {
    const programName = workoutData.name || `Programa IA - ${workoutData.objective || 'Treino'} - ${new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;
    
    const program = await createProgram({
      name: programName,
      objective: workoutData.objective || 'Programa criado pela IA',
      created_by: 'ai'
    });

    if (!program) {
      throw new Error('Erro ao criar programa de treino');
    }

    console.log('Program created:', program);
    return program;
  };

  const createRoutinesFromWorkout = async (
    workoutData: AIWorkoutData,
    createdExercisesMap: Map<string, Exercise>,
    programId: string
  ) => {
    const createdRoutines = [];
    
    if (workoutData.routines && workoutData.routines.length > 0) {
      console.log('Creating', workoutData.routines.length, 'routines for program');
      
      for (const routineData of workoutData.routines) {
        const routine = await createRoutineFromData(routineData, workoutData, createdExercisesMap, programId);
        if (routine) {
          createdRoutines.push(routine);
        }
      }
    } else {
      // Fallback: create single routine
      const routine = await createFallbackRoutine(workoutData, createdExercisesMap, programId);
      if (routine) {
        createdRoutines.push(routine);
      }
    }
    
    return createdRoutines;
  };

  const createRoutineFromData = async (
    routineData: any,
    workoutData: AIWorkoutData,
    createdExercisesMap: Map<string, Exercise>,
    programId: string
  ) => {
    const routineExercises = [];
    
    for (const exercise of routineData.exercises) {
      const existingExercise = createdExercisesMap.get(exercise.name.toLowerCase());
      
      if (existingExercise) {
        routineExercises.push({
          exerciseId: existingExercise.id,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight || 0,
          restTime: exercise.restTime,
          superset_group: exercise.superset_group || null,
          superset_order: exercise.superset_order || 0
        });
      }
    }
    
    if (routineExercises.length > 0) {
      const routine = {
        name: routineData.name,
        objective: `${routineData.focus} - ${workoutData.objective}`,
        days: [mapDayToPortuguese(routineData.day)],
        exercises: routineExercises,
        notes: workoutData.notes || `Treino focado em ${routineData.focus}`,
        estimatedDuration: workoutData.estimatedDuration || 45,
        program_id: programId
      };
      
      console.log('Creating routine:', routine.name, 'with', routineExercises.length, 'exercises for program:', programId);
      
      try {
        return await addRoutine(routine);
      } catch (error) {
        console.error('Error creating routine:', error);
        return null;
      }
    }
    
    return null;
  };

  const createFallbackRoutine = async (
    workoutData: AIWorkoutData,
    createdExercisesMap: Map<string, Exercise>,
    programId: string
  ) => {
    const routineExercises = [];
    
    for (const [, exercise] of createdExercisesMap) {
      const originalExercise = workoutData.exercises?.find(ex => 
        ex.name.toLowerCase() === exercise.name.toLowerCase()
      );
      
      if (originalExercise) {
        routineExercises.push({
          exerciseId: exercise.id,
          sets: originalExercise.sets,
          reps: originalExercise.reps,
          weight: originalExercise.weight || 0,
          restTime: originalExercise.restTime,
          superset_group: originalExercise.superset_group || null,
          superset_order: originalExercise.superset_order || 0
        });
      }
    }
    
    if (routineExercises.length > 0) {
      const routine = {
        name: workoutData.name || 'Treino da IA',
        objective: workoutData.objective || 'Treino personalizado',
        days: ['segunda'],
        exercises: routineExercises,
        notes: workoutData.notes || 'Treino criado pela IA',
        estimatedDuration: workoutData.estimatedDuration || 45,
        program_id: programId
      };
      
      console.log('Creating fallback routine for program:', programId);
      
      try {
        return await addRoutine(routine);
      } catch (error) {
        console.error('Error creating routine:', error);
        return null;
      }
    }
    
    return null;
  };

  return {
    async convertAIWorkoutToRoutines(aiWorkout: AIGeneratedWorkout) {
      const { workout_data } = aiWorkout;
      
      console.log('Starting routine conversion for workout:', aiWorkout.id);
      console.log('Converting AI workout to program and routines:', workout_data);
      
      // Create the workout program
      const program = await createWorkoutProgram(workout_data);
      
      // Create all unique exercises with automatic video search
      const createdExercisesMap = new Map<string, Exercise>();
      await createExercisesFromWorkout(workout_data, createdExercisesMap);
      
      // Create routines linked to the program
      const createdRoutines = await createRoutinesFromWorkout(
        workout_data,
        createdExercisesMap,
        program.id
      );
      
      console.log('Conversion completed. Created program with', createdRoutines.length, 'routines including automatic YouTube videos and superset support');
      return { program, routines: createdRoutines };
    }
  };
};
