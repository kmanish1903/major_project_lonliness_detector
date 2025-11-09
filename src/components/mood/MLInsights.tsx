import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MLAnalysisResult } from "@/utils/mlAnalysis";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MLInsightsProps {
  analysis: MLAnalysisResult;
  userMoodScore: number;
}

const MLInsights = ({ analysis, userMoodScore }: MLInsightsProps) => {
  const { sentiment, emotions, crisis, suggestedMoodScore, confidence } = analysis;

  const getSentimentColor = (label: string) => {
    return label === 'POSITIVE' ? 'text-green-600' : 'text-red-600';
  };

  const getRiskColor = (level: string): "default" | "destructive" => {
    return level === 'high' ? 'destructive' : 'default';
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Machine Learning Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment Analysis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sentiment Detected</span>
            <Badge variant="outline" className={getSentimentColor(sentiment.label)}>
              {sentiment.label}
            </Badge>
          </div>
          <Progress value={sentiment.score * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Confidence: {(sentiment.score * 100).toFixed(1)}%
          </p>
        </div>

        {/* Emotion Classification */}
        {emotions.length > 0 && (
          <div>
            <span className="text-sm font-medium mb-2 block">Detected Emotions</span>
            <div className="space-y-2">
              {emotions.slice(0, 3).map((emotion, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="capitalize">{emotion.label}</span>
                    <span className="text-muted-foreground">
                      {(emotion.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={emotion.score * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ML Mood Prediction */}
        <div className="bg-background/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">ML Mood Prediction</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{suggestedMoodScore}/10</p>
              <p className="text-xs text-muted-foreground">
                Your rating: {userMoodScore}/10
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Model Confidence</p>
              <p className="text-lg font-semibold">{(confidence * 100).toFixed(0)}%</p>
            </div>
          </div>
          {Math.abs(suggestedMoodScore - userMoodScore) > 2 && (
            <p className="text-xs text-muted-foreground italic">
              Note: ML suggests a {suggestedMoodScore > userMoodScore ? 'higher' : 'lower'} mood score based on your text
            </p>
          )}
        </div>

        {/* Crisis Assessment */}
        {crisis.isCrisis && (
          <Alert variant={getRiskColor(crisis.riskLevel)}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Crisis Indicators Detected</AlertTitle>
            <AlertDescription>
              <p className="text-sm mb-2">
                Risk Level: <strong className="capitalize">{crisis.riskLevel}</strong>
              </p>
              {crisis.indicators.length > 0 && (
                <ul className="text-xs space-y-1 ml-4 list-disc">
                  {crisis.indicators.map((indicator, index) => (
                    <li key={index}>{indicator}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Model Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          <p>Analysis powered by Hugging Face Transformers</p>
          <p className="text-[10px]">Models: DistilBERT (Sentiment) • BERT (Emotions) • MobileBERT (Crisis Detection)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MLInsights;
