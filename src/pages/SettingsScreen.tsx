import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { generateMedicalReport } from "@/utils/medicalReportGenerator";

const SettingsScreen = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [notificationSettings, setNotificationSettings] = useState({
    moodReminders: true,
    goalReminders: true,
    crisisFollowUp: true,
    weeklyReports: true
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
      requestNotificationPermission();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (data?.preferences && typeof data.preferences === 'object') {
      const prefs = data.preferences as { notifications?: typeof notificationSettings };
      if (prefs.notifications) {
        setNotificationSettings(prefs.notifications);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll receive important reminders and updates"
        });
      }
    }
  };

  const saveSettings = async (newSettings: typeof notificationSettings) => {
    if (!user) return;

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
          notifications: newSettings
        }
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated"
      });
    }
  };

  const updateSetting = (key: keyof typeof notificationSettings) => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key]
    };
    setNotificationSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  const exportData = async () => {
    if (!user) return;

    toast({
      title: "Generating report...",
      description: "Please wait while we prepare your medical report"
    });

    try {
      // Fetch all necessary data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: moodEntries } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: goals } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false });

      const { data: crisisEvents } = await supabase
        .from('crisis_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Generate medical report HTML
      const reportHtml = generateMedicalReport({
        profile: profile || null,
        userEmail: user.email || 'Not provided',
        moodEntries: moodEntries || [],
        goals: goals || [],
        progress: progress || [],
        crisisEvents: crisisEvents || []
      });

      // Create and download HTML file
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MindCare-Medical-Report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Medical report exported!",
        description: "Professional medical report has been downloaded. Open it in a browser or share with healthcare providers."
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="mood-reminders">Daily Mood Check-in Reminders</Label>
            <Switch
              id="mood-reminders"
              checked={notificationSettings.moodReminders}
              onCheckedChange={() => updateSetting('moodReminders')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="goal-reminders">Goal Completion Reminders</Label>
            <Switch
              id="goal-reminders"
              checked={notificationSettings.goalReminders}
              onCheckedChange={() => updateSetting('goalReminders')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="crisis-followup">Crisis Follow-up Notifications</Label>
            <Switch
              id="crisis-followup"
              checked={notificationSettings.crisisFollowUp}
              onCheckedChange={() => updateSetting('crisisFollowUp')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="weekly-reports">Weekly Progress Reports</Label>
            <Switch
              id="weekly-reports"
              checked={notificationSettings.weeklyReports}
              onCheckedChange={() => updateSetting('weeklyReports')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Manage your data and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={exportData} disabled={!user} className="sm:flex-1">
              Export Medical Report (HTML)
            </Button>
            <Button
              onClick={async () => {
                if (!user || isGeneratingPdf) return;
                
                setIsGeneratingPdf(true);
                
                try {
                  toast({ 
                    title: "Generating PDF...", 
                    description: "This may take 10-15 seconds with charts. Please wait..." 
                  });
                  
                  // Fetch all data
                  const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                  const { data: moodEntries } = await supabase
                    .from('mood_entries')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                  const { data: goals } = await supabase
                    .from('daily_goals')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                  const { data: progress } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('year', { ascending: false });

                  const { data: crisisEvents } = await supabase
                    .from('crisis_events')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                  const reportHtml = generateMedicalReport({
                    profile: profile || null,
                    userEmail: user.email || 'Not provided',
                    moodEntries: moodEntries || [],
                    goals: goals || [],
                    progress: progress || [],
                    crisisEvents: crisisEvents || []
                  });

                  // Create container with better positioning for rendering
                  const container = document.createElement('div');
                  container.style.position = 'absolute';
                  container.style.left = '0';
                  container.style.top = '0';
                  container.style.zIndex = '-9999';
                  container.style.opacity = '0';
                  container.style.width = '210mm'; // A4 width
                  container.style.background = 'white';
                  container.innerHTML = reportHtml;
                  document.body.appendChild(container);

                  // Wait for Chart.js to render all charts
                  await new Promise(resolve => setTimeout(resolve, 2500));

                  const html2pdf = (await import('html2pdf.js')).default as any;
                  
                  await html2pdf()
                    .set({
                      margin: [10, 10, 10, 10],
                      filename: `MindCare-Report-${new Date().toISOString().split('T')[0]}.pdf`,
                      image: { type: 'jpeg', quality: 0.98 },
                      html2canvas: { 
                        scale: 2, 
                        useCORS: true,
                        logging: false,
                        letterRendering: true,
                        allowTaint: true
                      },
                      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    })
                    .from(container)
                    .save()
                    .then(() => {
                      // Remove container AFTER save completes
                      if (document.body.contains(container)) {
                        document.body.removeChild(container);
                      }
                    });

                  toast({ 
                    title: "✓ PDF Generated!", 
                    description: "Your report is ready with charts and graphs." 
                  });
                } catch (err) {
                  console.error('PDF export error:', err);
                  toast({ 
                    title: "PDF generation failed", 
                    description: "Try exporting as HTML instead.", 
                    variant: "destructive" 
                  });
                } finally {
                  setIsGeneratingPdf(false);
                }
              }}
              disabled={!user || isGeneratingPdf}
              className="sm:flex-1"
            >
              {isGeneratingPdf ? "Generating PDF..." : "Export Medical Report (PDF)"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Download a comprehensive medical report for caregivers and clinicians. Export as HTML for editable viewing, or as a PDF for easy sharing.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsScreen;
