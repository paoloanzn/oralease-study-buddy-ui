
-- Create enum types for better data integrity
CREATE TYPE public.exam_status AS ENUM ('setup', 'in_progress', 'completed');
CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'open_ended', 'true_false');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create notes table to store user study materials
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_urls TEXT[], -- Array to store multiple file URLs
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exams table to track exam sessions
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notes_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 10,
  status exam_status NOT NULL DEFAULT 'setup',
  total_score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  percentage_score DECIMAL(5,2),
  duration_minutes INTEGER, -- Total time taken
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table to store generated questions
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL DEFAULT 'open_ended',
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  correct_answer TEXT,
  multiple_choice_options JSONB, -- For multiple choice questions
  points DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create answers table to store user responses
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  user_answer TEXT,
  audio_url TEXT, -- For storing recorded audio responses
  is_correct BOOLEAN,
  score DECIMAL(5,2),
  feedback TEXT,
  response_time_seconds INTEGER, -- Time taken to answer
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_feedback table for overall exam feedback
CREATE TABLE public.exam_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  overall_feedback TEXT,
  strengths TEXT[],
  areas_for_improvement TEXT[],
  study_recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notes table
CREATE POLICY "Users can view their own notes" 
  ON public.notes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
  ON public.notes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
  ON public.notes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
  ON public.notes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for exams table
CREATE POLICY "Users can view their own exams" 
  ON public.exams 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exams" 
  ON public.exams 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams" 
  ON public.exams 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams" 
  ON public.exams 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for questions table
CREATE POLICY "Users can view questions for their exams" 
  ON public.questions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE exams.id = questions.exam_id 
      AND exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create questions for their exams" 
  ON public.questions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE exams.id = questions.exam_id 
      AND exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions for their exams" 
  ON public.questions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE exams.id = questions.exam_id 
      AND exams.user_id = auth.uid()
    )
  );

-- Create RLS policies for answers table
CREATE POLICY "Users can view answers for their questions" 
  ON public.answers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.questions 
      JOIN public.exams ON exams.id = questions.exam_id
      WHERE questions.id = answers.question_id 
      AND exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create answers for their questions" 
  ON public.answers 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions 
      JOIN public.exams ON exams.id = questions.exam_id
      WHERE questions.id = answers.question_id 
      AND exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update answers for their questions" 
  ON public.answers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.questions 
      JOIN public.exams ON exams.id = questions.exam_id
      WHERE questions.id = answers.question_id 
      AND exams.user_id = auth.uid()
    )
  );

-- Create RLS policies for exam_feedback table
CREATE POLICY "Users can view feedback for their exams" 
  ON public.exam_feedback 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE exams.id = exam_feedback.exam_id 
      AND exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feedback for their exams" 
  ON public.exam_feedback 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE exams.id = exam_feedback.exam_id 
      AND exams.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX idx_exams_user_id ON public.exams(user_id);
CREATE INDEX idx_exams_status ON public.exams(status);
CREATE INDEX idx_exams_created_at ON public.exams(created_at DESC);
CREATE INDEX idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX idx_questions_order_index ON public.questions(order_index);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);
CREATE INDEX idx_exam_feedback_exam_id ON public.exam_feedback(exam_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
