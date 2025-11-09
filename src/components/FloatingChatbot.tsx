import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FloatingChatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Don't show on chatbot screen
  if (location.pathname === ROUTES.CHATBOT) {
    return null;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showWelcome) {
      const hideTimer = setTimeout(() => {
        setShowWelcome(false);
      }, 8000);
      return () => clearTimeout(hideTimer);
    }
  }, [showWelcome]);

  if (!isVisible) return null;

  return (
    <>
      {showWelcome && (
        <Card className="fixed bottom-24 right-6 md:right-8 z-40 p-4 max-w-xs animate-in slide-in-from-bottom-4 duration-500 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">👋</div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Hi there!</p>
              <p className="text-xs text-muted-foreground">
                I'm your mental wellness companion. Would you like to talk?
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1"
              onClick={() => setShowWelcome(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      )}

      <div className="fixed bottom-20 md:bottom-6 right-6 md:right-8 z-50">
        {/* Highlight Badge */}
        <div className="absolute -top-1 -right-1 z-10">
          <div className="relative">
            <div className="h-4 w-4 rounded-full bg-accent animate-scale-in" />
            <div className="absolute inset-0 h-4 w-4 rounded-full bg-accent/60 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        <Button
          onClick={() => navigate(ROUTES.CHATBOT)}
          size="lg"
          className="relative h-16 w-16 rounded-full shadow-2xl
                     bg-gradient-to-br from-primary via-primary/90 to-accent
                     hover:from-primary/90 hover:via-primary/80 hover:to-accent/90
                     transition-all duration-300 hover:scale-110
                     before:absolute before:inset-0 before:rounded-full 
                     before:bg-gradient-to-br before:from-primary/20 before:to-accent/20
                     before:blur-lg before:animate-pulse
                     group"
          aria-label="Chat for Support"
        >
          <MessageCircle className="h-7 w-7 text-primary-foreground group-hover:scale-110 transition-transform" />
          <span className="sr-only">Chat for Support</span>
          
          {/* Tooltip */}
          <div className="absolute -top-12 right-0 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg
                          opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none
                          border border-border">
            Chat for Support 💬
          </div>
        </Button>
      </div>
    </>
  );
};

export default FloatingChatbot;
