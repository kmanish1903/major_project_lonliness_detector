import { Slider } from "@/components/ui/slider";
import { MOOD_SCALE } from "@/utils/constants";

interface MoodScaleProps {
  value: number;
  onChange: (value: number) => void;
}

const MoodScale = ({ value, onChange }: MoodScaleProps) => {
  const getMoodEmoji = (score: number) => {
    if (score <= 2) return "😢";
    if (score <= 4) return "😕";
    if (score <= 6) return "😐";
    if (score <= 8) return "🙂";
    return "😊";
  };

  const getMoodColor = (score: number) => {
    if (score <= 3) return "text-destructive";
    if (score <= 5) return "text-orange-500";
    if (score <= 7) return "text-accent";
    return "text-primary";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`text-6xl mb-2 transition-all ${getMoodColor(value)}`}>
          {getMoodEmoji(value)}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">
          {value <= 2 && "Very Low"}
          {value > 2 && value <= 4 && "Low"}
          {value > 4 && value <= 6 && "Moderate"}
          {value > 6 && value <= 8 && "Good"}
          {value > 8 && "Excellent"}
        </div>
      </div>
      
      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          min={MOOD_SCALE.MIN}
          max={MOOD_SCALE.MAX}
          step={1}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Very Low</span>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  );
};

export default MoodScale;
