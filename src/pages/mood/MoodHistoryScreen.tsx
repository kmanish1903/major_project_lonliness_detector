import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMood } from "@/hooks/useMood";
import MoodTrendChart from "@/components/mood/MoodTrendChart";

const MoodHistoryScreen = () => {
  const { moodHistory, getMoodLabel, getMoodColor } = useMood();

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mood History</h1>
          <p className="text-muted-foreground">Track your emotional patterns over time</p>
        </div>

        <MoodTrendChart entries={moodHistory} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {moodHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No mood entries yet. Start tracking your mood to see your history!
              </p>
            ) : (
              moodHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-3xl">
                    {entry.moodScore <= 2 && "😢"}
                    {entry.moodScore > 2 && entry.moodScore <= 4 && "😕"}
                    {entry.moodScore > 4 && entry.moodScore <= 6 && "😐"}
                    {entry.moodScore > 6 && entry.moodScore <= 8 && "🙂"}
                    {entry.moodScore > 8 && "😊"}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg" style={{ color: getMoodColor(entry.moodScore) }}>
                          {entry.moodScore}/10
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {getMoodLabel(entry.moodScore)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {entry.emotionTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.emotionTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {entry.textNote && (
                      <p className="text-sm text-muted-foreground">{entry.textNote}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MoodHistoryScreen;
