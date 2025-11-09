import { AlertCircle, Phone, MapPin, Heart, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const CrisisScreen = () => {
  const { user } = useAuth();
  const [safetyPlan, setSafetyPlan] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (user) {
      loadSafetyPlan();
    }
  }, [user]);

  const loadSafetyPlan = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (!error && data?.preferences && typeof data.preferences === 'object') {
      const prefs = data.preferences as { safetyPlan?: string };
      if (prefs.safetyPlan) {
        setSafetyPlan(prefs.safetyPlan);
      }
    }
  };

  const saveSafetyPlan = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a safety plan",
        variant: "destructive"
      });
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    const existingPrefs = (profile?.preferences && typeof profile.preferences === 'object') 
      ? profile.preferences as Record<string, any>
      : {};

    const { error } = await supabase
      .from('profiles')
      .update({
        preferences: {
          ...existingPrefs,
          safetyPlan
        }
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save safety plan",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Safety plan saved successfully"
      });
    }
  };

  const logCrisisEvent = async (severity: string, triggerType: string) => {
    if (!user) return;

    await supabase.from('crisis_events').insert({
      user_id: user.id,
      severity,
      trigger_type: triggerType,
      intervention_taken: 'User accessed crisis resources',
      notes: location ? `Location: ${location.lat}, ${location.lng}` : undefined
    });
  };

  const getLocation = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
          toast({
            title: "Location obtained",
            description: "Finding nearby resources..."
          });
        },
        (error) => {
          setIsLoadingLocation(false);
          toast({
            title: "Location unavailable",
            description: "Please enable location services",
            variant: "destructive"
          });
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast({
        title: "Not supported",
        description: "Location services not available on this device",
        variant: "destructive"
      });
    }
  };

  const notifyEmergencyContact = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('emergency_contact')
      .eq('id', user.id)
      .single();

    if (profile?.emergency_contact) {
      await logCrisisEvent('high', 'emergency_contact_notification');
      toast({
        title: "Emergency contact",
        description: `Contact: ${profile.emergency_contact}`,
      });
    } else {
      toast({
        title: "No emergency contact",
        description: "Please add an emergency contact in your profile",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen p-4 bg-destructive/5">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Crisis Support</CardTitle>
            </div>
            <CardDescription>Immediate help is available 24/7</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                National Crisis Hotlines
              </h3>
              <Button 
                variant="destructive" 
                className="w-full justify-start" 
                asChild
                onClick={() => logCrisisEvent('crisis', 'hotline_988')}
              >
                <a href="tel:988">
                  <Phone className="mr-2 h-4 w-4" />
                  988 - Suicide & Crisis Lifeline
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                asChild
                onClick={() => logCrisisEvent('high', 'hotline_1800')}
              >
                <a href="tel:1-800-273-8255">
                  <Phone className="mr-2 h-4 w-4" />
                  1-800-273-8255 - National Helpline
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                asChild
              >
                <a href="sms:741741">
                  <Phone className="mr-2 h-4 w-4" />
                  Text HOME to 741741 - Crisis Text Line
                </a>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Find Nearby Resources
              </h3>
              <Button
                variant="outline"
                className="w-full"
                onClick={getLocation}
                disabled={isLoadingLocation}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {isLoadingLocation ? "Getting location..." : "Find Local Crisis Centers"}
              </Button>
              {location && (
                <p className="text-sm text-muted-foreground">
                  Location obtained. Search Google Maps for "crisis center near me"
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Emergency Actions
              </h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={notifyEmergencyContact}
              >
                <Heart className="mr-2 h-4 w-4" />
                Contact Emergency Contact
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Personal Safety Plan
            </CardTitle>
            <CardDescription>
              Create a plan for when you're in crisis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Warning signs I notice...&#10;&#10;Coping strategies that help me...&#10;&#10;People I can reach out to...&#10;&#10;Professional contacts...&#10;&#10;Ways to make my environment safe..."
              value={safetyPlan}
              onChange={(e) => setSafetyPlan(e.target.value)}
              className="min-h-[200px]"
            />
            <Button onClick={saveSafetyPlan} disabled={!user}>
              Save Safety Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrisisScreen;
