import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES, EMOTION_TAGS } from "@/utils/constants";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const MoodAssessmentScreen = () => {
  const navigate = useNavigate();
  const [moodScore, setMoodScore] = useState([5]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleComplete = () => {
    if (selectedTags.length === 0) {
      toast.error("Please select at least one emotion tag");
      return;
    }

    // Store initial mood assessment (would save to Supabase in real implementation)
    toast.success("Mood assessment saved!");
    navigate(ROUTES.DASHBOARD);
  };

  const getMoodEmoji = (score: number) => {
    if (score <= 3) return "😢";
    if (score <= 5) return "😐";
    if (score <= 7) return "🙂";
    return "😊";
  };

  const getMoodColor = (score: number) => {
    if (score <= 3) return "text-destructive";
    if (score <= 5) return "text-yellow-500";
    if (score <= 7) return "text-primary";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-accent/10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step 2 of 2</span>
            <span className="text-sm font-medium text-primary">100%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-full transition-all duration-300" />
          </div>
          <CardTitle className="text-2xl mt-4">How are you feeling?</CardTitle>
          <CardDescription>
            Help us understand your current emotional state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <span className={`text-6xl ${getMoodColor(moodScore[0])}`}>
                {getMoodEmoji(moodScore[0])}
              </span>
              <p className="text-2xl font-bold mt-2">{moodScore[0]}/10</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mood Score</label>
              <Slider
                value={moodScore}
                onValueChange={setMoodScore}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very Low</span>
                <span>Neutral</span>
                <span>Very High</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">How do you feel?</label>
            <div className="flex flex-wrap gap-2">
              {EMOTION_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes (Optional)</label>
            <Textarea
              placeholder="Tell us more about how you're feeling..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleComplete}
          >
            Complete Setup
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodAssessmentScreen;
