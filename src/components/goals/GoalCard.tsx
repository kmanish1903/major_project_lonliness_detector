import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Goal } from "@/hooks/useGoals";

interface GoalCardProps {
  goal: Goal;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const GoalCard = ({ goal, onToggle, onDelete }: GoalCardProps) => {
  const categoryColors: Record<Goal['category'], string> = {
    social: 'bg-blue-500',
    exercise: 'bg-green-500',
    mindfulness: 'bg-purple-500',
    'self-care': 'bg-pink-500',
    custom: 'bg-gray-500',
  };

  const difficultyLabels: Record<Goal['difficulty'], string> = {
    easy: '⭐',
    medium: '⭐⭐',
    hard: '⭐⭐⭐',
  };

  return (
    <Card className={goal.completed ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={goal.completed}
            onCheckedChange={() => onToggle(goal.id)}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className={`font-medium ${goal.completed ? "line-through" : ""}`}>
                {goal.title}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(goal.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            )}
            <div className="flex gap-2">
              <Badge variant="outline" className={categoryColors[goal.category]}>
                {goal.category}
              </Badge>
              <Badge variant="outline">
                {difficultyLabels[goal.difficulty]}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
