
import { AIWorkoutData } from './types.ts';
import { determineMuscleGroup, determineExerciseType } from './exercise-utils.ts';

// Função para extrair dados do treino da resposta da IA
export function extractWorkoutData(aiResponse: string): AIWorkoutData | null {
  try {
    console.log('Extracting workout data from:', aiResponse.substring(0, 200) + '...');
    
    // Tentar encontrar JSON estruturado na resposta
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      console.log('Found JSON structure, parsing...');
      return JSON.parse(jsonMatch[1]);
    }

    // Se não encontrou JSON, extrair dados estruturados do texto
    const lines = aiResponse.split('\n');
    const workoutPlan: AIWorkoutData = {
      name: '',
      objective: '',
      estimatedDuration: 45,
      routines: [],
      exercises: [],
      notes: ''
    };

    let currentRoutine: any = null;
    let inExerciseList = false;
    let currentSupersetGroup = 0;

    for (const line of lines) {
      const cleanLine = line.trim();
      
      // Pular linhas vazias
      if (!cleanLine) continue;
      
      // Capturar nome do plano
      if (cleanLine.includes('**Nome do Treino:') || cleanLine.includes('**Plano de Treino') || cleanLine.includes('# Plano:')) {
        workoutPlan.name = cleanLine.replace(/[*#]/g, '').replace(/Nome do Treino[:\-]?/i, '').replace(/Plano de Treino[:\-]?/i, '').trim() || 'Treino Personalizado';
        console.log('Found workout name:', workoutPlan.name);
      }
      
      // Capturar objetivo
      if (cleanLine.includes('**Objetivo') || cleanLine.includes('Objetivo:')) {
        workoutPlan.objective = cleanLine.replace(/[*#]/g, '').replace(/Objetivo[:\-]?/i, '').trim() || 'Treino personalizado';
        console.log('Found objective:', workoutPlan.objective);
      }
      
      // Capturar duração
      if (cleanLine.includes('**Duração') || cleanLine.includes('Duração:')) {
        const durationMatch = cleanLine.match(/(\d+)/);
        if (durationMatch) {
          workoutPlan.estimatedDuration = parseInt(durationMatch[1]);
        }
      }
      
      // Capturar rotinas por dia (vários formatos possíveis)
      const routinePatterns = [
        /\*\*Treino\s+(\d+)(?:\s*[-–]\s*)?(.+?):\s*(.+?)\*\*/i,
        /\*\*(.+?)\s*[-–]\s*(.+?):\s*(.+?)\*\*/i,
        /(\d+)\.\s*\*\*(.+?)\s*[-–]\s*(.+?)\*\*/i
      ];
      
      for (const pattern of routinePatterns) {
        const routineMatch = cleanLine.match(pattern);
        if (routineMatch) {
          const [, identifier, day, focus] = routineMatch;
          const routineName = identifier.includes('Treino') ? identifier : `Treino ${identifier}`;
          
          currentRoutine = {
            name: routineName,
            day: day.toLowerCase().trim(),
            focus: focus.trim(),
            exercises: []
          };
          workoutPlan.routines.push(currentRoutine);
          inExerciseList = true;
          currentSupersetGroup = 0; // Reset superset group for new routine
          console.log('Found routine:', currentRoutine.name, 'for', currentRoutine.day);
          break;
        }
      }
      
      // Detectar início de lista de exercícios
      if (cleanLine.includes('**Exercícios:**') || cleanLine.includes('Exercícios:')) {
        inExerciseList = true;
        console.log('Found exercise list start');
        continue;
      }
      
      // Capturar exercícios (detectar supersets por indentação)
      const exercisePatterns = [
        // Exercício principal (1. ou 2.)
        /^(\d+)\.\s*(.+?)\s*[-–]\s*(\d+)x(\d+)(?:\s*[-–]\s*(\d+)s?)?/,
        /^(\d+)\.\s*(.+?)\s*[-–]\s*(\d+)\s*séries?\s*de\s*(\d+)(?:\s*[-–]\s*(\d+)s?)?/i,
        /^(\d+)\.\s*(.+?)\s*[-–]\s*(\d+)\s*x\s*(\d+)(?:\s*[-–]\s*(\d+)s?)?/i,
        // Exercício de superset (2.1, 2.2, etc.) - detecta indentação
        /^\s+(\d+)\.(\d+)\s*(.+?)\s*[-–]\s*(\d+)x(\d+)(?:\s*[-–]\s*(\d+)s?)?/,
        /^\s+(\d+)\.(\d+)\s*(.+?)\s*[-–]\s*(\d+)\s*séries?\s*de\s*(\d+)(?:\s*[-–]\s*(\d+)s?)?/i,
        /^\s+(\d+)\.(\d+)\s*(.+?)\s*[-–]\s*(\d+)\s*x\s*(\d+)(?:\s*[-–]\s*(\d+)s?)?/i,
        // Formato com bullet points
        /^[-•]\s*(.+?)\s*[-–]\s*(\d+)x(\d+)(?:\s*[-–]\s*(\d+)s?)?/
      ];
      
      for (let i = 0; i < exercisePatterns.length; i++) {
        const pattern = exercisePatterns[i];
        const exerciseMatch = cleanLine.match(pattern);
        
        if (exerciseMatch && (currentRoutine || inExerciseList)) {
          let name, sets, reps, rest, isSuperset = false, supersetOrder = 0;
          
          if (i <= 2) {
            // Exercício principal
            const [, exerciseNum, exerciseName, setsStr, repsStr, restStr] = exerciseMatch;
            name = exerciseName.trim();
            sets = parseInt(setsStr);
            reps = parseInt(repsStr);
            rest = restStr ? parseInt(restStr) : 60;
            currentSupersetGroup++;
          } else if (i <= 5) {
            // Exercício de superset (com indentação)
            const [, mainNum, subNum, exerciseName, setsStr, repsStr, restStr] = exerciseMatch;
            name = exerciseName.trim();
            sets = parseInt(setsStr);
            reps = parseInt(repsStr);
            rest = restStr ? parseInt(restStr) : 60;
            isSuperset = true;
            supersetOrder = parseInt(subNum);
          } else {
            // Bullet point
            const [, exerciseName, setsStr, repsStr, restStr] = exerciseMatch;
            name = exerciseName.trim();
            sets = parseInt(setsStr);
            reps = parseInt(repsStr);
            rest = restStr ? parseInt(restStr) : 60;
            currentSupersetGroup++;
          }
          
          const exercise = {
            name: name,
            sets: sets,
            reps: reps,
            restTime: rest,
            weight: 0,
            muscleGroup: determineMuscleGroup(name),
            type: determineExerciseType(name),
            instructions: `${sets} séries de ${reps} repetições. Descanso: ${rest}s.`,
            superset_group: isSuperset ? currentSupersetGroup : null,
            superset_order: isSuperset ? supersetOrder : 0
          };
          
          console.log('Found exercise:', exercise.name, isSuperset ? `(superset ${currentSupersetGroup}.${supersetOrder})` : '(individual)');
          
          if (currentRoutine) {
            currentRoutine.exercises.push(exercise);
          }
          
          // Adicionar ao array geral de exercícios se não existir
          if (!workoutPlan.exercises.find(ex => ex.name.toLowerCase() === exercise.name.toLowerCase())) {
            workoutPlan.exercises.push(exercise);
          }
          break;
        }
      }
      
      // Capturar observações
      if (cleanLine.includes('**Observações') || cleanLine.includes('Observações:')) {
        const notesMatch = cleanLine.match(/\*\*Observações[:\-]?\*\*\s*(.+)/i);
        if (notesMatch) {
          workoutPlan.notes = notesMatch[1].trim();
        }
      }
    }

    // Se não encontrou rotinas estruturadas, mas encontrou exercícios, criar uma rotina padrão
    if (workoutPlan.routines.length === 0 && workoutPlan.exercises.length > 0) {
      console.log('No structured routines found, creating default routine');
      workoutPlan.routines.push({
        name: 'Treino Completo',
        day: 'segunda',
        focus: workoutPlan.objective || 'Treino geral',
        exercises: workoutPlan.exercises
      });
    }

    // Garantir que temos dados mínimos
    if (!workoutPlan.name) workoutPlan.name = 'Treino Personalizado';
    if (!workoutPlan.objective) workoutPlan.objective = 'Treino personalizado';

    console.log('Extracted workout plan:', {
      name: workoutPlan.name,
      objective: workoutPlan.objective,
      routinesCount: workoutPlan.routines.length,
      exercisesCount: workoutPlan.exercises.length
    });

    return workoutPlan.routines.length > 0 || workoutPlan.exercises.length > 0 ? workoutPlan : null;
  } catch (error) {
    console.error('Error extracting workout data:', error);
    return null;
  }
}
