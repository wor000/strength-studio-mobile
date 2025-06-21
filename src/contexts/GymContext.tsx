
import React, { createContext, useContext, useEffect } from 'react';
import { Exercise, Routine, WorkoutSession } from '../types';
import { WorkoutProgram } from '../types/workoutPrograms';
import { useExercises } from '../hooks/useExercises';
import { useRoutines } from '../hooks/useRoutines';
import { useWorkoutSessions } from '../hooks/useWorkoutSessions';
import { useWorkoutPrograms } from '../hooks/useWorkoutPrograms';

interface GymContextType {
  exercises: Exercise[];
  routines: Routine[];
  workoutSessions: WorkoutSession[];
  programs: WorkoutProgram[];
  exercisesLoading: boolean;
  routinesLoading: boolean;
  workoutSessionsLoading: boolean;
  programsLoading: boolean;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise | undefined>;
  updateExercise: (exercise: Exercise) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  addRoutine: (routine: Omit<Routine, 'id'>) => Promise<Routine | undefined>;
  updateRoutine: (routine: Routine) => Promise<void>;
  copyRoutine: (routineId: string) => Promise<Routine | undefined>;
  deleteRoutine: (id: string) => Promise<void>;
  startWorkoutSession: (routineId: string) => Promise<WorkoutSession | undefined>;
  updateWorkoutSession: (sessionId: string, updates: Partial<WorkoutSession>) => Promise<void>;
  getTodayRoutine: () => Routine | null;
  createProgram: (program: Omit<WorkoutProgram, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  setActiveProgram: (programId: string | null) => Promise<void>;
  getActiveProgram: () => WorkoutProgram | null;
  refetchAll: () => Promise<void>;
}

const GymContext = createContext<GymContextType | null>(null);

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    exercises, 
    loading: exercisesLoading, 
    addExercise, 
    updateExercise, 
    deleteExercise 
  } = useExercises();
  
  const { 
    routines, 
    loading: routinesLoading, 
    addRoutine, 
    updateRoutine: updateRoutineHook,
    copyRoutine: copyRoutineHook,
    deleteRoutine: deleteRoutineHook, 
    getTodayRoutine: getTodayRoutineHook,
    refetch: refetchRoutines
  } = useRoutines();
  
  const { 
    workoutSessions, 
    loading: workoutSessionsLoading,
    startWorkoutSession: startSession,
    updateWorkoutSession: updateSession
  } = useWorkoutSessions();

  const {
    programs,
    loading: programsLoading,
    createProgram,
    setActiveProgram: setActiveProgramHook,
    getActiveProgram,
    refetch: refetchPrograms
  } = useWorkoutPrograms();

  // Monitora mudanças no programa ativo para atualizar rotinas
  const activeProgram = getActiveProgram();
  
  useEffect(() => {
    // Sempre que o programa ativo mudar, recarrega as rotinas
    refetchRoutines();
  }, [activeProgram?.id, refetchRoutines]);

  const updateRoutine = async (routine: Routine) => {
    await updateRoutineHook(routine);
  };

  const copyRoutine = async (routineId: string) => {
    return await copyRoutineHook(routineId);
  };

  const deleteRoutine = async (id: string) => {
    await deleteRoutineHook(id);
  };

  const startWorkoutSession = async (routineId: string) => {
    return await startSession(routineId);
  };

  const updateWorkoutSession = async (sessionId: string, updates: Partial<WorkoutSession>) => {
    await updateSession(sessionId, updates);
  };

  const setActiveProgram = async (programId: string | null) => {
    await setActiveProgramHook(programId);
    // Força uma atualização completa após mudar o programa ativo
    await refetchAll();
  };

  const refetchAll = async () => {
    await Promise.all([
      refetchRoutines(),
      refetchPrograms()
    ]);
  };

  const getTodayRoutine = () => {
    const activeProgram = getActiveProgram();
    if (!activeProgram) {
      // Fallback para o comportamento antigo se não há programa ativo
      return getTodayRoutineHook();
    }

    // Buscar rotina do programa ativo para hoje
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
    const dayMap: { [key: string]: string } = {
      'segunda-feira': 'segunda',
      'terça-feira': 'terca',
      'quarta-feira': 'quarta',
      'quinta-feira': 'quinta',
      'sexta-feira': 'sexta',
      'sábado': 'sabado',
      'domingo': 'domingo'
    };
    
    const todayKey = dayMap[today];
    
    // Buscar rotinas do programa ativo que incluem o dia de hoje
    const programRoutines = routines.filter(routine => 
      routine.program_id === activeProgram.id && routine.days.includes(todayKey)
    );

    return programRoutines.length > 0 ? programRoutines[0] : null;
  };

  return (
    <GymContext.Provider value={{
      exercises,
      routines,
      workoutSessions,
      programs,
      exercisesLoading,
      routinesLoading,
      workoutSessionsLoading,
      programsLoading,
      addExercise,
      updateExercise,
      deleteExercise,
      addRoutine,
      updateRoutine,
      copyRoutine,
      deleteRoutine,
      startWorkoutSession,
      updateWorkoutSession,
      getTodayRoutine,
      createProgram,
      setActiveProgram,
      getActiveProgram,
      refetchAll
    }}>
      {children}
    </GymContext.Provider>
  );
};
