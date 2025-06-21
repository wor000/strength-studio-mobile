
import { supabase } from '@/integrations/supabase/client';
import { Routine, RoutineExercise } from '../types';

export const routinesService = {
  async fetchRoutines(userId: string): Promise<Routine[]> {
    const { data: routinesData, error: routinesError } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (routinesError) throw routinesError;

    const routinesWithExercises = await Promise.all(
      routinesData.map(async (routine) => {
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select('*')
          .eq('routine_id', routine.id)
          .order('order_index', { ascending: true });

        if (exercisesError) throw exercisesError;

        const exercises: RoutineExercise[] = exercisesData.map(exercise => ({
          exerciseId: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight || 0,
          restTime: exercise.rest_time,
          superset_group: exercise.superset_group,
          superset_order: exercise.superset_order || 0
        }));

        return {
          id: routine.id,
          name: routine.name,
          objective: routine.objective,
          days: routine.days,
          exercises,
          notes: routine.notes || undefined,
          estimatedDuration: routine.estimated_duration,
          program_id: routine.program_id || undefined
        };
      })
    );

    return routinesWithExercises;
  },

  async createRoutine(userId: string, routine: Omit<Routine, 'id'>): Promise<Routine> {
    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert({
        user_id: userId,
        name: routine.name,
        objective: routine.objective,
        days: routine.days,
        estimated_duration: routine.estimatedDuration,
        notes: routine.notes,
        program_id: routine.program_id || null
      })
      .select()
      .single();

    if (routineError) throw routineError;

    // Insert routine exercises
    if (routine.exercises.length > 0) {
      const exercisesData = routine.exercises.map((exercise, index) => ({
        routine_id: routineData.id,
        exercise_id: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight || null,
        rest_time: exercise.restTime,
        order_index: index,
        superset_group: exercise.superset_group || null,
        superset_order: exercise.superset_order || 0
      }));

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;
    }

    return {
      id: routineData.id,
      name: routineData.name,
      objective: routineData.objective,
      days: routineData.days,
      exercises: routine.exercises,
      notes: routineData.notes || undefined,
      estimatedDuration: routineData.estimated_duration,
      program_id: routineData.program_id || undefined
    };
  },

  async updateRoutine(userId: string, routine: Routine): Promise<void> {
    const { error: routineError } = await supabase
      .from('routines')
      .update({
        name: routine.name,
        objective: routine.objective,
        days: routine.days,
        estimated_duration: routine.estimatedDuration,
        notes: routine.notes,
        program_id: routine.program_id || null
      })
      .eq('id', routine.id)
      .eq('user_id', userId);

    if (routineError) throw routineError;

    // Delete existing exercises
    const { error: deleteError } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('routine_id', routine.id);

    if (deleteError) throw deleteError;

    // Insert updated exercises
    if (routine.exercises.length > 0) {
      const exercisesData = routine.exercises.map((exercise, index) => ({
        routine_id: routine.id,
        exercise_id: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight || null,
        rest_time: exercise.restTime,
        order_index: index,
        superset_group: exercise.superset_group || null,
        superset_order: exercise.superset_order || 0
      }));

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;
    }
  },

  async deleteRoutine(userId: string, routineId: string): Promise<void> {
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', routineId)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
