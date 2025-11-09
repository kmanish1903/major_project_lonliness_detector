import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";

interface ActivityCardProps {
  title: string;
  description: string;
  category?: string;
  duration?: string;
  difficulty?: string;
  onClick?: () => void;
}

const ActivityCard = ({ title, description, category, duration, difficulty, onClick }: ActivityCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {category && (
            <Badge variant="outline" className="shrink-0">
              {category}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{duration}</span>
            </div>
          )}
          {difficulty && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="capitalize">{difficulty}</span>
            </div>
          )}
        </div>
        {onClick && (
          <Button
            variant="outline"
            size="sm"
            className="w-full transition-all hover:bg-primary hover:text-primary-foreground"
            onClick={onClick}
          >
            Start Activity
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
