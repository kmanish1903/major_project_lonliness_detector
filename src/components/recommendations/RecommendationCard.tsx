import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationCardProps {
  title: string;
  description: string;
  source?: string;
  url?: string;
  thumbnail?: string;
}

const RecommendationCard = ({ title, description, thumbnail }: RecommendationCardProps) => {

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm mt-1 line-clamp-2">
                {description}
              </CardDescription>
            )}
          </div>
          {thumbnail && (
            <img 
              src={thumbnail} 
              alt={title}
              className="w-20 h-20 object-cover rounded transition-transform hover:scale-105"
              loading="lazy"
            />
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default RecommendationCard;
