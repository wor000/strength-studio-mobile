
import { AIExercise } from './types.ts';

// Função para determinar grupo muscular
export function determineMuscleGroup(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  
  if (name.includes('flexão') || name.includes('supino') || name.includes('peito')) {
    return 'Peito';
  }
  if (name.includes('agachamento') || name.includes('leg press') || name.includes('quadríceps') || name.includes('perna')) {
    return 'Pernas';
  }
  if (name.includes('bíceps') || name.includes('rosca')) {
    return 'Bíceps';
  }
  if (name.includes('tríceps') || name.includes('mergulho')) {
    return 'Tríceps';
  }
  if (name.includes('abdomen') || name.includes('prancha') || name.includes('abdominal')) {
    return 'Abdômen';
  }
  if (name.includes('costas') || name.includes('remada') || name.includes('pull')) {
    return 'Costas';
  }
  if (name.includes('ombro') || name.includes('elevação')) {
    return 'Ombros';
  }
  if (name.includes('panturrilha')) {
    return 'Panturrilha';
  }
  if (name.includes('burpee') || name.includes('cardio') || name.includes('corrida')) {
    return 'Cardio';
  }
  
  return 'Geral';
}

// Função para determinar tipo de exercício
export function determineExerciseType(exerciseName: string): 'strength' | 'cardio' | 'flexibility' {
  const name = exerciseName.toLowerCase();
  
  if (name.includes('burpee') || name.includes('jumping') || name.includes('mountain climber') || 
      name.includes('cardio') || name.includes('corrida') || name.includes('salto')) {
    return 'cardio';
  }
  
  if (name.includes('alongamento') || name.includes('yoga') || name.includes('flexibilidade')) {
    return 'flexibility';
  }
  
  return 'strength';
}
