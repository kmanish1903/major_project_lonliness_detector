import { useNavigate } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-accent/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-3xl">Welcome, {userName}! 👋</CardTitle>
            <CardDescription className="text-base">
              We're excited to have you join MindCare AI
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Your AI-powered mental wellness companion is here to support you on your journey to better mental health.
            </p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Track Your Mood</p>
                  <p className="text-sm text-muted-foreground">Use voice or text to log your emotional state</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Personalized Support</p>
                  <p className="text-sm text-muted-foreground">Receive AI-powered wellness recommendations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Build Better Habits</p>
                  <p className="text-sm text-muted-foreground">Achieve daily goals tailored to your needs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate(ROUTES.ONBOARDING.PERMISSIONS)}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              This will take about 2 minutes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
