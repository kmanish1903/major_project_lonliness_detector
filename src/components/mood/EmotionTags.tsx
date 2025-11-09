import { Badge } from "@/components/ui/badge";
import { EMOTION_TAGS } from "@/utils/constants";

interface EmotionTagsProps {
  selectedEmotions: string[];
  onToggle: (emotion: string) => void;
}

const EmotionTags = ({ selectedEmotions, onToggle }: EmotionTagsProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">How are you feeling?</label>
      <div className="flex flex-wrap gap-2">
        {EMOTION_TAGS.map((emotion) => (
          <Badge
            key={emotion}
            variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => onToggle(emotion)}
          >
            {emotion}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default EmotionTags;
