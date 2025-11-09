import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { ROUTES } from "@/utils/constants";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(ROUTES.LOGIN);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
      <div className="animate-scale-in">
        <Heart className="h-20 w-20 text-primary mb-4" />
      </div>
      <h1 className="text-4xl font-bold text-primary mb-2 animate-fade-in">
        MindCare AI
      </h1>
      <p className="text-muted-foreground animate-fade-in">
        Your AI-powered mental wellness companion
      </p>
    </div>
  );
};

export default SplashScreen;
