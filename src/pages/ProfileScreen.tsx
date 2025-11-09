import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { User, Phone, Calendar, Heart, Edit, Send } from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  full_name: string | null;
  age: number | null;
  gender: string | null;
  health_conditions: string[] | null;
  emergency_contact: string | null;
}

const ProfileScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, location.key]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAlert = async () => {
    if (!profile?.emergency_contact) {
      toast({
        title: "No emergency contact",
        description: "Please add an emergency contact first",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-emergency-alert', {
        body: {
          emergencyContact: profile.emergency_contact,
          userName: profile.full_name || user?.email?.split('@')[0] || 'User',
          moodScore: 2,
          emotionTags: ['anxious'],
          textNote: 'TEST alert from MindCare AI',
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Test alert sent!",
          description: `WhatsApp message delivered (SID: ${data.messageSid})`,
        });
      } else {
        toast({
          title: "Alert failed",
          description: data.error || "Unable to send WhatsApp message",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Test alert error:', error);
      toast({
        title: "Test alert failed",
        description: error.message || "Check your phone number format and Twilio settings",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 md:py-6 space-y-4 md:space-y-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
            <p className="text-sm md:text-base text-muted-foreground">Your personal information</p>
          </div>
          <Button onClick={() => navigate('/profile/edit')} size="sm">
            <Edit className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile?.full_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Age
                </p>
                <p className="font-medium">{profile?.age || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">{profile?.gender || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health Information
            </CardTitle>
            <CardDescription>Medical conditions we're monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Health Conditions</p>
              <div className="flex flex-wrap gap-2">
                {profile?.health_conditions && profile.health_conditions.length > 0 ? (
                  profile.health_conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary">
                      {condition}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No health conditions reported</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
            <CardDescription>Contact information for emergencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{profile?.emergency_contact || 'Not provided'}</p>
            {profile?.emergency_contact && (
              <Button 
                onClick={handleTestAlert} 
                disabled={isSendingTest}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSendingTest ? 'Sending...' : 'Send Test WhatsApp Alert'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileScreen;
