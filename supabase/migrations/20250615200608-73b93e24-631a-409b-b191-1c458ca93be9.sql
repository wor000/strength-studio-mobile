
-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('strength', 'cardio', 'flexibility')),
  instructions TEXT,
  image TEXT,
  video TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routines table
CREATE TABLE public.routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  days TEXT[] NOT NULL,
  estimated_duration INTEGER NOT NULL DEFAULT 45,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routine_exercises table (junction table for routine exercises)
CREATE TABLE public.routine_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight DECIMAL,
  rest_time INTEGER NOT NULL DEFAULT 60,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_sessions table
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  completed_exercises TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises
CREATE POLICY "Users can view their own exercises" 
  ON public.exercises 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercises" 
  ON public.exercises 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises" 
  ON public.exercises 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises" 
  ON public.exercises 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for routines
CREATE POLICY "Users can view their own routines" 
  ON public.routines 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routines" 
  ON public.routines 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routines" 
  ON public.routines 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routines" 
  ON public.routines 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for routine_exercises
CREATE POLICY "Users can view routine exercises for their routines" 
  ON public.routine_exercises 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.routines 
    WHERE routines.id = routine_exercises.routine_id 
    AND routines.user_id = auth.uid()
  ));

CREATE POLICY "Users can create routine exercises for their routines" 
  ON public.routine_exercises 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.routines 
    WHERE routines.id = routine_exercises.routine_id 
    AND routines.user_id = auth.uid()
  ));

CREATE POLICY "Users can update routine exercises for their routines" 
  ON public.routine_exercises 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.routines 
    WHERE routines.id = routine_exercises.routine_id 
    AND routines.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete routine exercises for their routines" 
  ON public.routine_exercises 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.routines 
    WHERE routines.id = routine_exercises.routine_id 
    AND routines.user_id = auth.uid()
  ));

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions" 
  ON public.workout_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout sessions" 
  ON public.workout_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions" 
  ON public.workout_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sessions" 
  ON public.workout_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_exercises_user_id ON public.exercises(user_id);
CREATE INDEX idx_exercises_muscle_group ON public.exercises(muscle_group);
CREATE INDEX idx_routines_user_id ON public.routines(user_id);
CREATE INDEX idx_routine_exercises_routine_id ON public.routine_exercises(routine_id);
CREATE INDEX idx_routine_exercises_exercise_id ON public.routine_exercises(exercise_id);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_date ON public.workout_sessions(date);
