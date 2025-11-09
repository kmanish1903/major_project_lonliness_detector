import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ROUTES } from "@/utils/constants";
import { AlertCircle, TrendingUp, Target, Sparkles, ArrowLeft, Phone } from "lucide-react";
import MLInsights from "@/components/mood/MLInsights";
import ActivityCard from "@/components/recommendations/ActivityCard";
import { MLAnalysisResult } from "@/utils/mlAnalysis";

interface LocationState {
  analysisType: 'ml' | 'ai' | 'none';
  mlAnalysis?: MLAnalysisResult;
  aiInsight?: string;
  isCrisis?: boolean;
  moodScore: number;
  emotionTags: string[];
  textNote?: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  duration?: string;
  difficulty?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level?: string;
}

const MoodInsightsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const state = location.state as LocationState;
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [isSavingGoals, setIsSavingGoals] = useState(false);

  useEffect(() => {
    // Redirect if no state provided
    if (!state || !state.moodScore) {
      toast({
        title: "No mood data found",
        description: "Please complete a mood check-in first",
        variant: "destructive",
      });
      navigate(ROUTES.MOOD.CHECK);
      return;
    }

    // Generate recommendations and goals in parallel
    generateRecommendations();
    generateGoals();
  }, []);

  const generateRecommendations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: {
          moodScore: state.moodScore,
          emotionTags: state.emotionTags,
          context: state.textNote || '',
        },
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Couldn't generate recommendations",
        description: "Using default recommendations instead",
        variant: "destructive",
      });
      // Set default recommendations
      setRecommendations([
        {
          id: '1',
          title: 'Take a mindful walk',
          description: 'A gentle walk can help clear your mind and improve your mood',
          category: 'Exercise',
          duration: '15 min',
          difficulty: 'Easy',
        },
        {
          id: '2',
          title: 'Practice deep breathing',
          description: 'Try the 4-7-8 breathing technique to calm your mind',
          category: 'Mindfulness',
          duration: '5 min',
          difficulty: 'Easy',
        },
      ]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const generateGoals = async () => {
    try {
      // Fetch recent mood entries for context
      const { data: recentMoods } = await supabase
        .from('mood_entries')
        .select('mood_score')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(7);

      const { data, error } = await supabase.functions.invoke('generate-goals', {
        body: {
          moodScore: state.moodScore,
          recentMoods: recentMoods?.map(m => m.mood_score) || [],
          healthConditions: [],
        },
      });

      if (error) throw error;

      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error generating goals:', error);
      toast({
        title: "Couldn't generate goals",
        description: "Using default goals instead",
        variant: "destructive",
      });
      // Set default goals
      setGoals([
        {
          id: '1',
          title: 'Practice gratitude',
          description: 'Write down three things you\'re grateful for today',
          category: 'Mindfulness',
          difficulty_level: 'easy',
        },
        {
          id: '2',
          title: 'Connect with a friend',
          description: 'Reach out to someone you care about',
          category: 'Social',
          difficulty_level: 'medium',
        },
      ]);
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const toggleGoalSelection = (goalId: string) => {
    setSelectedGoalIds(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSaveGoals = async () => {
    if (selectedGoalIds.length === 0) {
      toast({
        title: "No goals selected",
        description: "Please select at least one goal to save",
        variant: "destructive",
      });
      return;
    }

    setIsSavingGoals(true);
    try {
      const selectedGoals = goals.filter(g => selectedGoalIds.includes(g.id));
      
      const goalsToInsert = selectedGoals.map(goal => ({
        user_id: user?.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        difficulty_level: goal.difficulty_level,
        is_ai_generated: true,
        target_date: new Date().toISOString().split('T')[0],
      }));

      const { error } = await supabase
        .from('daily_goals')
        .insert(goalsToInsert);

      if (error) throw error;

      toast({
        title: "Goals saved!",
        description: `${selectedGoalIds.length} goal${selectedGoalIds.length > 1 ? 's' : ''} added to your daily goals`,
      });

      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Error saving goals:', error);
      toast({
        title: "Failed to save goals",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSavingGoals(false);
    }
  };

  const handleStartActivity = (category: string) => {
    toast({
      title: "Activity started",
      description: `Opening ${category} recommendations`,
    });
    navigate(ROUTES.RECOMMENDATIONS.HUB);
  };

  if (!state) return null;

  return (
    <Layout>
      <div className="container py-4 md:py-6 space-y-6 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Your Mood Insights & Actions</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Based on your mood check-in
            </p>
          </div>
        </div>

        {/* Crisis Alert */}
        {state.isCrisis && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Crisis Detected</AlertTitle>
            <AlertDescription>
              Based on your entry, we recommend reaching out for immediate support.
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-background"
                  onClick={() => navigate(ROUTES.CRISIS)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Get Help Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Analysis Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Analysis Results</CardTitle>
            </div>
            <CardDescription>
              {state.analysisType === 'ml' && 'Machine Learning Analysis'}
              {state.analysisType === 'ai' && 'AI-Powered Insights'}
              {state.analysisType === 'none' && 'Mood Summary'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.analysisType === 'ml' && state.mlAnalysis && (
              <MLInsights analysis={state.mlAnalysis} userMoodScore={state.moodScore} />
            )}
            
            {state.analysisType === 'ai' && state.aiInsight && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-foreground">{state.aiInsight}</p>
              </div>
            )}
            
            {state.analysisType === 'none' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    Mood Score: {state.moodScore}/10
                  </Badge>
                </div>
                {state.emotionTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {state.emotionTags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Personalized Recommendations</CardTitle>
            </div>
            <CardDescription>Activities tailored to your current mood</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecommendations ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.slice(0, 4).map(rec => (
                  <ActivityCard
                    key={rec.id}
                    title={rec.title}
                    description={rec.description}
                    category={rec.category}
                    duration={rec.duration}
                    difficulty={rec.difficulty}
                    onClick={() => handleStartActivity(rec.category)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Suggested Daily Goals</CardTitle>
            </div>
            <CardDescription>Select goals to add to your daily plan</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingGoals ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map(goal => (
                  <div
                    key={goal.id}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={() => toggleGoalSelection(goal.id)}
                  >
                    <Checkbox
                      checked={selectedGoalIds.includes(goal.id)}
                      onCheckedChange={() => toggleGoalSelection(goal.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{goal.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {goal.category}
                        </Badge>
                        {goal.difficulty_level && (
                          <Badge variant="secondary" className="text-xs">
                            {goal.difficulty_level}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSaveGoals}
            disabled={selectedGoalIds.length === 0 || isSavingGoals}
            className="flex-1"
          >
            {isSavingGoals ? 'Saving...' : `Save Selected Goals (${selectedGoalIds.length})`}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="flex-1"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default MoodInsightsScreen;
