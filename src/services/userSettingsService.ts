
import { supabase } from '@/integrations/supabase/client';
import { UserSettings } from '../types/workoutPrograms';

export const userSettingsService = {
  async fetchUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async setActiveProgram(userId: string, programId: string | null) {
    // Primeiro, garantir que existe uma configuração do usuário
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingSettings) {
      const { error } = await supabase
        .from('user_settings')
        .update({
          active_program_id: programId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          active_program_id: programId
        });

      if (error) throw error;
    }
  }
};
