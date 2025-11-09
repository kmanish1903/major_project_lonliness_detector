import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Lightbulb, Target } from "lucide-react";
import type { MLTrendAnalysis } from "@/utils/mlTrendAnalysis";

interface MLTrendInsightsProps {
  analysis: MLTrendAnalysis;
}

const MLTrendInsights = ({ analysis }: MLTrendInsightsProps) => {
  const getTrendIcon = (direction: string) => {
    if (direction === "improving") return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (direction === "declining") return <TrendingDown className="h-5 w-5 text-destructive" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getImpactColor = (impact: string) => {
    if (impact === "positive") return "text-green-500";
    if (impact === "negative") return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      {/* Mood Trend Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTrendIcon(analysis.moodTrend.direction)}
            Mood Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Direction: {analysis.moodTrend.direction.charAt(0).toUpperCase() + analysis.moodTrend.direction.slice(1)}
              </span>
              <Badge variant={analysis.moodTrend.direction === "improving" ? "default" : "secondary"}>
                {(analysis.moodTrend.confidence * 100).toFixed(0)}% confidence
              </Badge>
            </div>
            <Progress value={analysis.moodTrend.confidence * 100} className="h-2" />
          </div>

          {analysis.moodTrend.prediction.length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">Predicted mood (next 3 days):</p>
              <div className="flex gap-2">
                {analysis.moodTrend.prediction.map((pred, i) => (
                  <div key={i} className="flex-1">
                    <div className="text-center text-sm font-medium mb-1">
                      Day {i + 1}
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2 text-center">
                      <span className="text-lg font-bold">{pred.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-2">
            Mood volatility: {analysis.moodTrend.volatility.toFixed(2)} 
            {analysis.moodTrend.volatility > 2.5 && " (high variability)"}
          </div>
        </CardContent>
      </Card>

      {/* Emotion Patterns Card */}
      {analysis.emotionPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Emotion Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.emotionPatterns.map((pattern, i) => (
                <div key={i} className="p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      {pattern.combination.map((emotion, j) => (
                        <Badge key={j} variant="secondary">{emotion}</Badge>
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {pattern.averageMood.toFixed(1)}/10
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Appears {pattern.frequency}x in your mood history
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trigger Words Card */}
      {analysis.triggerWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Words & Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.triggerWords.map((trigger, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-lg"
                >
                  <span className="font-medium">{trigger.word}</span>
                  <span className={`text-xs ${getImpactColor(trigger.impact)}`}>
                    {trigger.averageMood.toFixed(1)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {trigger.frequency}x
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Words colored by their association with your mood levels
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights Card */}
      {analysis.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.insights.map((insight, i) => (
                <div key={i} className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {(insight.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  <div className="bg-background/50 p-3 rounded border-l-4 border-primary">
                    <p className="text-xs font-medium text-primary">
                      💡 {insight.actionable}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MLTrendInsights;
