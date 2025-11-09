import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'social' | 'exercise' | 'mindfulness' | 'self-care' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  targetDate?: Date;
}

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load goals from database
  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const loadedGoals: Goal[] = (data || []).map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description || undefined,
        category: (goal.category as any) || 'custom',
        difficulty: (goal.difficulty_level as any) || 'easy',
        completed: goal.is_completed,
        createdAt: new Date(goal.created_at),
        completedAt: goal.completed_at ? new Date(goal.completed_at) : undefined,
        targetDate: goal.target_date ? new Date(goal.target_date) : undefined,
      }));

      setGoals(loadedGoals);
    } catch (error: any) {
      console.error('Error loading goals:', error);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoalCompletion = async (id: string) => {
    if (!user) return;

    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    try {
      const newCompletedState = !goal.completed;
      const { error } = await supabase
        .from('daily_goals')
        .update({
          is_completed: newCompletedState,
          completed_at: newCompletedState ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;

      setGoals(prev =>
        prev.map(g =>
          g.id === id
            ? {
                ...g,
                completed: newCompletedState,
                completedAt: newCompletedState ? new Date() : undefined,
              }
            : g
        )
      );

      toast({
        title: newCompletedState ? "Goal completed!" : "Goal uncompleted",
        description: newCompletedState ? "Great job! Keep up the good work." : undefined,
      });
    } catch (error: any) {
      console.error('Error toggling goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add goals",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('daily_goals')
        .insert({
          user_id: user.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          difficulty_level: goal.difficulty,
          target_date: goal.targetDate?.toISOString(),
          is_ai_generated: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal: Goal = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        category: (data.category as any) || 'custom',
        difficulty: (data.difficulty_level as any) || 'easy',
        completed: data.is_completed,
        createdAt: new Date(data.created_at),
        targetDate: data.target_date ? new Date(data.target_date) : undefined,
      };

      setGoals(prev => [newGoal, ...prev]);
      
      toast({
        title: "Success",
        description: "Goal added successfully",
      });

      return newGoal;
    } catch (error: any) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('daily_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== id));
      
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const getCompletionRate = () => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.completed).length;
    return Math.round((completed / goals.length) * 100);
  };

  return {
    goals,
    toggleGoalCompletion,
    addGoal,
    deleteGoal,
    getCompletionRate,
    isLoading,
  };
};
