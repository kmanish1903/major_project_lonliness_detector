import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { promptPWAInstall, isPWAInstalled } from "@/utils/pwaInstall";

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('pwa-prompt-seen');
    if (!hasSeenPrompt && !isPWAInstalled()) {
      setTimeout(() => setShowPrompt(true), 3000);
    }
  }, []);

  const handleInstall = async () => {
    const installed = await promptPWAInstall();
    if (installed) {
      localStorage.setItem('pwa-prompt-seen', 'true');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-seen', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="p-4 shadow-lg border-primary/20">
        <div className="flex items-start gap-3">
          <Download className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install MindCare AI</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Install our app for offline access and a better experience
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstall}>
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 flex-shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
