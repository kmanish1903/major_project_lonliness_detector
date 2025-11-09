import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Sparkles } from "lucide-react";
import { useGoals, Goal } from "@/hooks/useGoals";
import GoalCard from "@/components/goals/GoalCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMood } from "@/hooks/useMood";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";

const GoalsScreen = () => {
  const { goals, toggleGoalCompletion, addGoal, deleteGoal, getCompletionRate, isLoading } = useGoals();
  const { moodHistory } = useMood();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "custom" as Goal['category'],
    difficulty: "easy" as Goal['difficulty'],
  });

  const handleGenerateGoals = async () => {
    setIsGenerating(true);
    try {
      const recentMoods = moodHistory.slice(0, 7).map(entry => entry.moodScore);
      const currentMood = moodHistory[0]?.moodScore || 5;

      // Get health conditions from user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('health_conditions')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase.functions.invoke('generate-goals', {
        body: {
          moodScore: currentMood,
          recentMoods,
          healthConditions: profile?.health_conditions || [],
        },
      });

      if (error) throw error;

      // Add AI-generated goals to the database
      let addedCount = 0;
      for (const aiGoal of data.goals || []) {
        await addGoal({
          title: aiGoal.title,
          description: aiGoal.description || aiGoal.rationale,
          category: aiGoal.category,
          difficulty: aiGoal.difficulty,
        });
        addedCount++;
      }

      toast({
        title: "Goals generated!",
        description: `${addedCount} AI-powered goals added to your list`,
      });
    } catch (error) {
      console.error('Error generating goals:', error);
      toast({
        title: "Generation failed",
        description: "Unable to generate goals at this time",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a goal title",
        variant: "destructive",
      });
      return;
    }

    addGoal(newGoal);
    setNewGoal({
      title: "",
      description: "",
      category: "custom",
      difficulty: "easy",
    });
    setShowForm(false);
    toast({
      title: "Goal added!",
      description: "Your new goal has been created",
    });
  };

  const completionRate = getCompletionRate();

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Daily Goals</h1>
            <p className="text-muted-foreground">Track your wellness objectives</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateGoals} disabled={isGenerating}>
              {isGenerating ? (
                <><LoadingSpinner /> Generating...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> AI Goals</>
              )}
            </Button>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progress Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{completionRate}%</span>
              <span className="text-sm text-muted-foreground">
                {goals.filter(g => g.completed).length} of {goals.length} completed
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </CardContent>
        </Card>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newGoal.category}
                    onValueChange={(value: Goal['category']) => 
                      setNewGoal({ ...newGoal, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="mindfulness">Mindfulness</SelectItem>
                      <SelectItem value="self-care">Self-care</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={newGoal.difficulty}
                    onValueChange={(value: Goal['difficulty']) => 
                      setNewGoal({ ...newGoal, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddGoal} className="flex-1">
                  Add Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No goals yet. Click "Add Goal" to create your first one!
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggle={toggleGoalCompletion}
                onDelete={deleteGoal}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GoalsScreen;
