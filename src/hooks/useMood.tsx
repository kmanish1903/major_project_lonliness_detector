import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface MoodEntry {
  id: string;
  timestamp: Date;
  moodScore: number;
  emotionTags: string[];
  voiceNote?: string;
  textNote?: string;
  transcription?: string;
}

export const useMood = () => {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState<number>(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load mood history from database
  useEffect(() => {
    if (user) {
      loadMoodHistory();
    }
  }, [user]);

  const loadMoodHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const entries: MoodEntry[] = (data || []).map(entry => ({
        id: entry.id,
        timestamp: new Date(entry.created_at),
        moodScore: entry.mood_score,
        emotionTags: entry.emotion_tags || [],
        textNote: entry.notes || undefined,
        transcription: entry.voice_transcription || undefined,
        voiceNote: entry.audio_url || undefined,
      }));

      setMoodHistory(entries);
    } catch (error: any) {
      console.error('Error loading mood history:', error);
      toast({
        title: "Error",
        description: "Failed to load mood history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMoodEntry = async (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add mood entries",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_score: entry.moodScore,
          emotion_tags: entry.emotionTags,
          notes: entry.textNote,
          voice_transcription: entry.transcription,
          audio_url: entry.voiceNote,
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry: MoodEntry = {
        id: data.id,
        timestamp: new Date(data.created_at),
        moodScore: data.mood_score,
        emotionTags: data.emotion_tags || [],
        textNote: data.notes || undefined,
        transcription: data.voice_transcription || undefined,
        voiceNote: data.audio_url || undefined,
      };

      setMoodHistory(prev => [newEntry, ...prev]);
      
      toast({
        title: "Success",
        description: "Mood entry saved successfully",
      });

      return newEntry;
    } catch (error: any) {
      console.error('Error adding mood entry:', error);
      toast({
        title: "Error",
        description: "Failed to save mood entry",
        variant: "destructive",
      });
    }
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const getMoodColor = (score: number) => {
    if (score <= 3) return 'hsl(var(--destructive))';
    if (score <= 5) return 'hsl(var(--warning))';
    if (score <= 7) return 'hsl(var(--accent))';
    return 'hsl(var(--primary))';
  };

  const getMoodLabel = (score: number) => {
    if (score <= 2) return 'Very Low';
    if (score <= 4) return 'Low';
    if (score <= 6) return 'Moderate';
    if (score <= 8) return 'Good';
    return 'Excellent';
  };

  return {
    currentMood,
    setCurrentMood,
    selectedEmotions,
    setSelectedEmotions,
    toggleEmotion,
    moodHistory,
    addMoodEntry,
    isRecording,
    setIsRecording,
    getMoodColor,
    getMoodLabel,
    isLoading,
  };
};
