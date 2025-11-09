export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;
  transcription?: string;
  audio_url?: string;
  tags: string[];
  notes?: string;
  created_at: string;
}

export interface DailyGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  completed: boolean;
  created_at: string;
}

export interface Route {
  path: string;
  name: string;
  icon?: any;
}
