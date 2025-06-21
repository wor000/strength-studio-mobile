
import { supabase } from '@/integrations/supabase/client';
import { WorkoutProgram } from '../types/workoutPrograms';

export const workoutProgramsService = {
  async fetchPrograms(userId: string): Promise<WorkoutProgram[]> {
    const { data: programsData, error: programsError } = await supabase
      .from('workout_programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (programsError) throw programsError;

    // Buscar rotinas para cada programa
    const programsWithRoutines = await Promise.all(
      programsData.map(async (program) => {
        const { data: routinesData, error: routinesError } = await supabase
          .from('routines')
          .select(`
            id,
            name,
            days,
            routine_exercises(id)
          `)
          .eq('program_id', program.id);

        if (routinesError) throw routinesError;

        const routines = routinesData.map(routine => ({
          id: routine.id,
          name: routine.name,
          days: routine.days,
          exercises_count: routine.routine_exercises?.length || 0
        }));

        return {
          id: program.id,
          name: program.name,
          objective: program.objective,
          created_by: program.created_by as 'ai' | 'manual',
          created_at: program.created_at,
          updated_at: program.updated_at,
          routines
        } as WorkoutProgram;
      })
    );

    return programsWithRoutines;
  },

  async createProgram(userId: string, program: Omit<WorkoutProgram, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('workout_programs')
      .insert({
        user_id: userId,
        name: program.name,
        objective: program.objective,
        created_by: program.created_by
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProgram(userId: string, id: string, updates: Partial<WorkoutProgram>) {
    const { error } = await supabase
      .from('workout_programs')
      .update({
        name: updates.name,
        objective: updates.objective,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async deleteProgram(userId: string, id: string) {
    const { error } = await supabase
      .from('workout_programs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
