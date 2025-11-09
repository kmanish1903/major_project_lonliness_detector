import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MapPin, Bell, Check, X, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants";
import { toast } from "sonner";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: any;
  granted: boolean | null;
}

const PermissionsScreen = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "microphone",
      name: "Microphone Access",
      description: "Record voice for mood analysis",
      icon: Mic,
      granted: null,
    },
    {
      id: "location",
      name: "Location Access",
      description: "Suggest nearby outdoor activities",
      icon: MapPin,
      granted: null,
    },
    {
      id: "notifications",
      name: "Notifications",
      description: "Receive wellness reminders",
      icon: Bell,
      granted: null,
    },
  ]);

  const requestPermission = async (permissionId: string) => {
    try {
      let granted = false;

      if (permissionId === "microphone") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        granted = true;
      } else if (permissionId === "location") {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        granted = true;
      } else if (permissionId === "notifications") {
        const result = await Notification.requestPermission();
        granted = result === "granted";
      }

      setPermissions(prev =>
        prev.map(p => (p.id === permissionId ? { ...p, granted } : p))
      );

      if (granted) {
        toast.success(`${permissions.find(p => p.id === permissionId)?.name} enabled`);
      }
    } catch (error) {
      setPermissions(prev =>
        prev.map(p => (p.id === permissionId ? { ...p, granted: false } : p))
      );
      toast.error("Permission denied");
    }
  };

  const handleContinue = () => {
    navigate(ROUTES.ONBOARDING.MOOD_ASSESSMENT);
  };

  const allPermissionsHandled = permissions.every(p => p.granted !== null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-accent/10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step 1 of 2</span>
            <span className="text-sm font-medium text-primary">50%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/2 transition-all duration-300" />
          </div>
          <CardTitle className="text-2xl mt-4">Enable Permissions</CardTitle>
          <CardDescription>
            These help us provide you with the best experience. You can change these later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissions.map((permission) => {
            const Icon = permission.icon;
            return (
              <div
                key={permission.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{permission.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                </div>
                <div className="ml-3">
                  {permission.granted === null ? (
                    <Button
                      size="sm"
                      onClick={() => requestPermission(permission.id)}
                    >
                      Allow
                    </Button>
                  ) : permission.granted ? (
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <X className="h-4 w-4 text-destructive" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handleContinue}
              disabled={!allPermissionsHandled}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {!allPermissionsHandled && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Please respond to all permission requests
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsScreen;
