import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Heart, Award, Brain, Loader2 } from "lucide-react";
import { useMood } from "@/hooks/useMood";
import { useGoals } from "@/hooks/useGoals";
import MoodTrendChart from "@/components/mood/MoodTrendChart";
import MLTrendInsights from "@/components/mood/MLTrendInsights";
import { performMLTrendAnalysis, type MLTrendAnalysis } from "@/utils/mlTrendAnalysis";
import { useToast } from "@/hooks/use-toast";

const ProgressScreen = () => {
  const { moodHistory, getMoodLabel } = useMood();
  const { goals, getCompletionRate } = useGoals();
  const { toast } = useToast();
  const [mlTrendAnalysis, setMlTrendAnalysis] = useState<MLTrendAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canAnalyze = moodHistory.length >= 5;

  const handleMLTrendAnalysis = async () => {
    if (!canAnalyze) {
      toast({
        title: "Not enough data",
        description: "Keep tracking! ML insights available after 5+ mood entries",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await performMLTrendAnalysis(moodHistory);
      setMlTrendAnalysis(analysis);
      toast({
        title: "ML Analysis Complete",
        description: `Found ${analysis.insights.length} insights from your mood patterns`,
      });
    } catch (error) {
      console.error("ML trend analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not complete ML analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze on mount if enough data
  useEffect(() => {
    if (canAnalyze && !mlTrendAnalysis) {
      handleMLTrendAnalysis();
    }
  }, [canAnalyze]);

  const averageMood = moodHistory.length > 0
    ? Math.round(moodHistory.reduce((sum, entry) => sum + entry.moodScore, 0) / moodHistory.length * 10) / 10
    : 0;

  const completionRate = getCompletionRate();
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.completed).length;

  const stats = [
    {
      title: "Average Mood",
      value: averageMood > 0 ? `${averageMood}/10` : "N/A",
      description: averageMood > 0 ? getMoodLabel(averageMood) : "Start tracking",
      icon: Heart,
      color: "text-primary",
    },
    {
      title: "Goal Completion",
      value: `${completionRate}%`,
      description: `${completedGoals} of ${totalGoals} goals`,
      icon: Target,
      color: "text-accent",
    },
    {
      title: "Mood Entries",
      value: moodHistory.length,
      description: "Total check-ins",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Active Streak",
      value: "7 days",
      description: "Keep it up!",
      icon: Award,
      color: "text-orange-500",
    },
  ];

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Progress & Insights</h1>
          <p className="text-muted-foreground">Track your mental wellness journey</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <MoodTrendChart entries={moodHistory} />

        {/* ML Trend Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Machine Learning Insights
              </div>
              {canAnalyze && (
                <Button
                  onClick={handleMLTrendAnalysis}
                  disabled={isAnalyzing}
                  size="sm"
                  variant="outline"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Refresh Analysis"
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!canAnalyze ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground mb-2">
                  Keep tracking your mood to unlock ML-powered insights
                </p>
                <p className="text-xs text-muted-foreground">
                  {5 - moodHistory.length} more {moodHistory.length === 4 ? 'entry' : 'entries'} needed
                </p>
              </div>
            ) : mlTrendAnalysis ? (
              <MLTrendInsights analysis={mlTrendAnalysis} />
            ) : (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Analyzing your mood patterns...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Most Common Emotions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {moodHistory.length > 0 ? (
                  (() => {
                    const emotionCounts = moodHistory.reduce((acc, entry) => {
                      entry.emotionTags.forEach(tag => {
                        acc[tag] = (acc[tag] || 0) + 1;
                      });
                      return acc;
                    }, {} as Record<string, number>);

                    const topEmotions = Object.entries(emotionCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5);

                    return topEmotions.length > 0 ? (
                      topEmotions.map(([emotion, count]) => (
                        <div key={emotion} className="flex items-center justify-between">
                          <Badge variant="secondary">{emotion}</Badge>
                          <span className="text-sm text-muted-foreground">{count}x</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No emotion data yet
                      </p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Start tracking your mood to see patterns
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-accent/10 rounded-lg">
                  <Award className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium text-sm">First Check-in</p>
                    <p className="text-xs text-muted-foreground">Started your journey</p>
                  </div>
                </div>
                {completedGoals >= 3 && (
                  <div className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Goal Achiever</p>
                      <p className="text-xs text-muted-foreground">Completed 3 goals</p>
                    </div>
                  </div>
                )}
                {moodHistory.length >= 7 && (
                  <div className="flex items-center gap-3 p-2 bg-green-500/10 rounded-lg">
                    <Award className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">Consistent Tracker</p>
                      <p className="text-xs text-muted-foreground">7+ mood entries</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProgressScreen;
