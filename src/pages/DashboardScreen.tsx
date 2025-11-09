import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Target, TrendingUp, Sparkles, MessageCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { useGoals } from "@/hooks/useGoals";
import { useMood } from "@/hooks/useMood";
import RecommendationCard from "@/components/recommendations/RecommendationCard";

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { goals, getCompletionRate } = useGoals();
  const { moodHistory, getMoodLabel, getMoodColor } = useMood();

  const todaysGoals = goals.slice(0, 3);
  const completionRate = getCompletionRate();
  const latestMood = moodHistory[0];
  
  // Get mood-related recommendations
  const getMoodRecommendations = () => {
    if (!latestMood) return [];
    
    const score = latestMood.moodScore;
    if (score <= 4) {
      return [
        {
          title: "5-Minute Breathing Exercise",
          description: "Calm your mind with guided breathing",
          source: "MindCare",
          url: ROUTES.RECOMMENDATIONS.BREATHING,
        },
        {
          title: "Connect with a Friend",
          description: "Reach out to someone you trust",
          source: "Social",
          url: ROUTES.RECOMMENDATIONS.SOCIAL,
        },
      ];
    } else if (score <= 7) {
      return [
        {
          title: "Light Exercise",
          description: "Boost your energy with gentle movement",
          source: "Exercise",
          url: ROUTES.RECOMMENDATIONS.EXERCISE,
        },
      ];
    }
    return [];
  };
  
  const recommendations = getMoodRecommendations();

  return (
    <Layout>
      <div className="container py-4 md:py-6 space-y-4 md:space-y-6 px-4">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome Back</h1>
          <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            MindCare AI intelligently detects loneliness patterns in your wellness journey
          </p>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Current Mood
            </CardTitle>
            <CardDescription>
              {latestMood 
                ? `You're feeling ${getMoodLabel(latestMood.moodScore).toLowerCase()}`
                : "How are you feeling today?"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestMood && (
              <div className="text-center py-4">
                <div className="text-5xl mb-2">
                  {latestMood.moodScore <= 2 && "😢"}
                  {latestMood.moodScore > 2 && latestMood.moodScore <= 4 && "😕"}
                  {latestMood.moodScore > 4 && latestMood.moodScore <= 6 && "😐"}
                  {latestMood.moodScore > 6 && latestMood.moodScore <= 8 && "🙂"}
                  {latestMood.moodScore > 8 && "😊"}
                </div>
                <div className="text-2xl font-bold" style={{ color: getMoodColor(latestMood.moodScore) }}>
                  {latestMood.moodScore}/10
                </div>
              </div>
            )}
            <Button 
              onClick={() => navigate(ROUTES.MOOD.CHECK)}
              className="w-full"
            >
              <Heart className="mr-2 h-4 w-4" />
              {latestMood ? 'Update Your Mood' : 'Check Your Mood'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Today's Goals
            </CardTitle>
            <CardDescription>
              {completionRate}% complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completionRate} className="h-2" />
            <div className="space-y-2">
              {todaysGoals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-primary' : 'bg-muted'}`} />
                  <span className={goal.completed ? 'line-through text-muted-foreground' : ''}>
                    {goal.title}
                  </span>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => navigate(ROUTES.GOALS.LIST)}
              variant="outline"
              className="w-full"
            >
              <Target className="mr-2 h-4 w-4" />
              View All Goals
            </Button>
          </CardContent>
        </Card>

        {latestMood && (
          <>
            <Card className="bg-gradient-to-br from-accent/5 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-4 w-4" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You've logged {moodHistory.length} mood {moodHistory.length === 1 ? 'entry' : 'entries'} this month. Keep tracking to see patterns and improvements in your mental wellness journey.
                </p>
                <p className="text-sm font-medium text-primary">
                  {completionRate >= 75 ? '🎉 Great job staying consistent with your goals!' : 
                   completionRate >= 50 ? '💪 You\'re making good progress!' : 
                   '🌱 Every step counts. Keep going!'}
                </p>
              </CardContent>
            </Card>

          </>
        )}

        <Card 
          className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 cursor-pointer hover:border-primary transition-all group"
          onClick={() => navigate(ROUTES.CHATBOT)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Need to Talk?
            </CardTitle>
            <CardDescription>
              Chat with our AI companion for personalized support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="default">
              Start Conversation
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate(ROUTES.PROGRESS)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-4 w-4" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View your mental health trends</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate(ROUTES.RECOMMENDATIONS.HUB)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-4 w-4" />
                Recommendations
              </CardTitle>
              <CardDescription>
                {recommendations.length > 0 ? 'Based on your current mood' : 'Log your mood to get personalized suggestions'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.length > 0 ? (
                <>
                  {recommendations.slice(0, 2).map((rec, idx) => (
                    <RecommendationCard
                      key={idx}
                      title={rec.title}
                      description={rec.description}
                      source={rec.source}
                      url={rec.url}
                    />
                  ))}
                  <Button variant="outline" className="w-full mt-2">
                    See more recommendations
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Personalized wellness activities</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardScreen;
