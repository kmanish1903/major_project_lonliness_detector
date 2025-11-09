import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Users, Wind, Music, Video, Book, Sparkles, ExternalLink } from "lucide-react";
import BreathingVisualizer from "@/components/recommendations/BreathingVisualizer";
import { supabase } from "@/integrations/supabase/client";
import { useMood } from "@/hooks/useMood";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ROUTES } from "@/utils/constants";

const RecommendationsHub = () => {
  const { moodHistory } = useMood();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([
    {
      icon: Dumbbell,
      title: "Take a 15-minute walk",
      description: "Light exercise can boost your mood and energy",
      category: "exercise",
      color: "text-green-500",
      duration: "15 minutes",
      benefit: "Improves mood and energy",
      priority: "high" as const,
    },
    {
      icon: Users,
      title: "Call a friend or family member",
      description: "Social connection is important for mental health",
      category: "social",
      color: "text-blue-500",
      duration: "10 minutes",
      benefit: "Reduces feelings of loneliness",
      priority: "high" as const,
    },
    {
      icon: Music,
      title: "Listen to uplifting music",
      description: "Music can positively affect your emotional state",
      category: "entertainment",
      color: "text-purple-500",
      duration: "20 minutes",
      benefit: "Boosts mood naturally",
      priority: "medium" as const,
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'exercise': return Dumbbell;
      case 'social': return Users;
      case 'mindfulness': return Wind;
      case 'content': return Video;
      default: return Book;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'exercise': return 'text-green-500';
      case 'social': return 'text-blue-500';
      case 'mindfulness': return 'text-purple-500';
      case 'content': return 'text-pink-500';
      default: return 'text-orange-500';
    }
  };

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const latestMood = moodHistory[0];
      if (!latestMood) {
        toast({
          title: "No mood data",
          description: "Please check in your mood first",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: {
          moodScore: latestMood.moodScore,
          emotionTags: latestMood.emotionTags,
          context: "Generate personalized wellness recommendations",
        },
      });

      if (error) throw error;

      const aiRecommendations = (data.recommendations || []).map((rec: any) => ({
        icon: getIconForType(rec.type),
        title: rec.title,
        description: rec.description,
        category: rec.type,
        color: getColorForType(rec.type),
        duration: rec.duration,
        benefit: rec.benefit,
        priority: rec.priority,
      }));

      setRecommendations(aiRecommendations);
      
      toast({
        title: "Recommendations updated!",
        description: "AI-powered suggestions based on your current mood",
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Generation failed",
        description: "Unable to generate recommendations at this time",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartActivity = (category: string) => {
    if (category === 'mindfulness') {
      // Scroll to breathing exercise
      document.getElementById('breathing-exercise')?.scrollIntoView({ behavior: 'smooth' });
    } else if (category === 'social') {
      navigate(ROUTES.RECOMMENDATIONS.SOCIAL);
    } else if (category === 'exercise') {
      navigate(ROUTES.RECOMMENDATIONS.EXERCISE);
    } else {
      toast({
        title: "Activity Started",
        description: "Good luck with your activity!",
      });
    }
  };

  const handleTryExercise = (exerciseName: string) => {
    toast({
      title: `Starting ${exerciseName}`,
      description: "Let's begin your wellness activity",
    });
    // In a real app, this would open a detailed view or timer
  };

  return (
    <Layout>
      <div className="container py-4 md:py-6 space-y-4 md:space-y-6 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Recommendations</h1>
            <p className="text-sm md:text-base text-muted-foreground">Personalized activities for your well-being</p>
          </div>
          <Button onClick={handleGenerateRecommendations} disabled={isGenerating} className="w-full sm:w-auto">
            {isGenerating ? (
              <><LoadingSpinner /> Generating...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> AI Suggestions</>
            )}
          </Button>
        </div>

        <div id="breathing-exercise">
          <BreathingVisualizer />
        </div>

        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4">Suggested Activities</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <Card key={index} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${rec.color}`} />
                      {rec.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                    {rec.duration && (
                      <p className="text-xs text-muted-foreground">⏱️ {rec.duration}</p>
                    )}
                    {rec.benefit && (
                      <p className="text-xs text-accent">✨ {rec.benefit}</p>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleStartActivity(rec.category)}
                    >
                      Start Activity
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="bg-gradient-to-br from-accent/10 to-primary/10">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Exercise Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-background rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">Gentle Yoga</h3>
                <p className="text-sm text-muted-foreground">15 minutes • Easy</p>
              </div>
              <Button size="sm" onClick={() => handleTryExercise('Gentle Yoga')} className="w-full sm:w-auto">
                Try it
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-background rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">Walking in Nature</h3>
                <p className="text-sm text-muted-foreground">20 minutes • Easy</p>
              </div>
              <Button size="sm" onClick={() => handleTryExercise('Walking in Nature')} className="w-full sm:w-auto">
                Try it
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-background rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">Light Stretching</h3>
                <p className="text-sm text-muted-foreground">10 minutes • Easy</p>
              </div>
              <Button size="sm" onClick={() => handleTryExercise('Light Stretching')} className="w-full sm:w-auto">
                Try it
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RecommendationsHub;
