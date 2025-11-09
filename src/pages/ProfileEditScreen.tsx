import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { User, Phone, Save, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/utils/constants";

interface ProfileData {
  full_name: string;
  age: number | null;
  gender: string;
  emergency_contact: string;
}

const ProfileEditScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    age: null,
    gender: "",
    emergency_contact: "",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          age: data.age,
          gender: data.gender || "",
          emergency_contact: data.emergency_contact || "",
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 10) {
      return '+91' + digits;
    }
    
    if (digits.length === 12 && digits.startsWith('91')) {
      return '+' + digits;
    }
    
    if (phone.startsWith('+91')) {
      return phone;
    }
    
    if (digits.length > 0) {
      return '+91' + digits;
    }
    
    return phone;
  };

  const handleSave = async () => {
    if (!profile.full_name || !profile.emergency_contact) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and emergency contact",
        variant: "destructive",
      });
      return;
    }

    const formattedPhone = formatPhoneNumber(profile.emergency_contact);
    
    if (!formattedPhone.match(/^\+91\d{10}$/)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit Indian mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: profile.full_name,
          age: profile.age,
          gender: profile.gender,
          emergency_contact: formatPhoneNumber(profile.emergency_contact),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your information has been saved successfully",
      });

      navigate(ROUTES.PROFILE, { replace: true });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Unable to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6 flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 md:py-6 space-y-4 md:space-y-6 max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(ROUTES.PROFILE)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Edit Profile</h1>
            <p className="text-sm md:text-base text-muted-foreground">Update your personal details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-sm">Your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ""}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Your age"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  placeholder="Your gender"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Phone className="h-5 w-5" />
              Emergency Contact *
            </CardTitle>
            <CardDescription className="text-sm">
              This contact will be notified if your mood indicates distress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="emergency_contact">Mobile Number (10 digits)</Label>
            <Input
              id="emergency_contact"
              value={profile.emergency_contact}
              onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
              placeholder="9876543210"
              type="tel"
            />
            <p className="text-xs text-muted-foreground">
              Will be saved as +91[your number]. SMS alerts will be sent to this number.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.PROFILE)}
            className="w-full sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:flex-1"
          >
            {isSaving ? (
              <>
                <LoadingSpinner /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileEditScreen;
