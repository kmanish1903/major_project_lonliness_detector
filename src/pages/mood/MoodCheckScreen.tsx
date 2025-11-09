import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/utils/constants";
import { useMood } from "@/hooks/useMood";
import MoodScale from "@/components/mood/MoodScale";
import EmotionTags from "@/components/mood/EmotionTags";
import VoiceRecorder from "@/components/mood/VoiceRecorder";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AlertCircle, Phone, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { sendEmergencyAlert, shouldTriggerEmergencyAlert } from "@/utils/emergencyAlert";
import { performMLAnalysis, MLAnalysisResult } from "@/utils/mlAnalysis";
import MLInsights from "@/components/mood/MLInsights";

const MoodCheckScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    currentMood,
    setCurrentMood,
    selectedEmotions,
    toggleEmotion,
    addMoodEntry,
  } = useMood();
  
  const [textNote, setTextNote] = useState("");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMLAnalyzing, setIsMLAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [mlAnalysis, setMlAnalysis] = useState<MLAnalysisResult | null>(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [emergencyAlertSent, setEmergencyAlertSent] = useState(false);

  const handleMLAnalysis = async () => {
    setIsMLAnalyzing(true);
    
    // Show loading toast
    toast({
      title: "Analyzing with ML...",
      description: textNote.trim().length < 10 ? "Tip: add a short note for deeper insights" : "Loading models and analyzing your mood",
    });

    try {
      console.log('Starting ML analysis...');
      
      // Perform ML analysis first
      const result = await performMLAnalysis(textNote, selectedEmotions, currentMood);
      console.log('ML analysis complete:', result);
      
      setMlAnalysis(result);
      
      // Save the mood entry with ML results
      await addMoodEntry({
        moodScore: result.suggestedMoodScore,
        emotionTags: selectedEmotions,
        textNote: textNote || undefined,
        voiceNote: voiceBlob ? "recorded" : undefined,
      });

      // Update mood score if ML suggests significantly different
      if (Math.abs(result.suggestedMoodScore - currentMood) > 2) {
        setCurrentMood(result.suggestedMoodScore);
      }

      // Set crisis flag if detected
      if (result.crisis.isCrisis) {
        setIsCrisis(true);
      }

      // Check if emergency alert should be sent
      if (user && result.crisis.riskLevel === 'high') {
        const alertSent = await sendEmergencyAlert({
          userId: user.id,
          moodScore: result.suggestedMoodScore,
          emotionTags: selectedEmotions,
          textNote,
        });

        if (alertSent) {
          setEmergencyAlertSent(true);
          toast({
            title: "Emergency SMS Sent",
            description: "Your emergency contact has been notified via SMS",
          });
        }
      }

      toast({
        title: "ML Analysis Complete",
        description: `Confidence: ${Math.round(result.confidence * 100)}%`,
      });

      // Navigate to insights page with ML analysis data
      navigate(ROUTES.MOOD.INSIGHTS, {
        state: {
          analysisType: 'ml',
          mlAnalysis: result,
          isCrisis: result.crisis.isCrisis,
          moodScore: result.suggestedMoodScore,
          emotionTags: selectedEmotions,
          textNote,
        }
      });
    } catch (error) {
      console.error('ML analysis error:', error);
      toast({
        title: "ML Analysis Failed",
        description: error instanceof Error ? error.message : "Please try again or use AI analysis instead",
        variant: "destructive",
      });
      setMlAnalysis(null);
    } finally {
      setIsMLAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!textNote && selectedEmotions.length === 0) {
      toast({
        title: "No data to analyze",
        description: "Please add some text or select emotions first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // First, save the mood entry
      await addMoodEntry({
        moodScore: currentMood,
        emotionTags: selectedEmotions,
        textNote: textNote || undefined,
        voiceNote: voiceBlob ? "recorded" : undefined,
      });

      // Then perform AI analysis
      const { data, error } = await supabase.functions.invoke('analyze-mood', {
        body: {
          text: textNote,
          emotionTags: selectedEmotions,
          currentScore: currentMood,
        },
      });

      if (error) throw error;

      setAiInsight(data.analysis);
      setIsCrisis(data.isCrisis);
      
      // Update mood score if AI suggests a different one
      if (data.suggestedMoodScore && Math.abs(data.suggestedMoodScore - currentMood) > 2) {
        setCurrentMood(data.suggestedMoodScore);
        toast({
          title: "Mood score adjusted",
          description: `AI analysis suggests a score of ${data.suggestedMoodScore}/10`,
        });
      }

      if (data.isCrisis) {
        toast({
          title: "Crisis Detected",
          description: "Please consider reaching out to emergency support",
          variant: "destructive",
        });
      }

      // Check if emergency alert should be sent
      if (user && shouldTriggerEmergencyAlert(currentMood, selectedEmotions)) {
        const alertSent = await sendEmergencyAlert({
          userId: user.id,
          moodScore: currentMood,
          emotionTags: selectedEmotions,
          textNote,
        });

        if (alertSent) {
          setEmergencyAlertSent(true);
          toast({
            title: "Emergency SMS Sent",
            description: "Your emergency contact has been notified via SMS",
          });
        }
      }

      toast({
        title: "Mood Saved & Analyzed",
        description: "AI analysis complete",
      });

      // Navigate to insights page with AI analysis data
      navigate(ROUTES.MOOD.INSIGHTS, {
        state: {
          analysisType: 'ai',
          aiInsight: data.analysis,
          isCrisis: data.isCrisis,
          moodScore: data.suggestedMoodScore || currentMood,
          emotionTags: selectedEmotions,
          textNote,
        }
      });
    } catch (error) {
      console.error('Error analyzing mood:', error);
      toast({
        title: "Analysis failed",
        description: "Unable to analyze mood at this time",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    // Check if emergency alert should be sent
    if (user && shouldTriggerEmergencyAlert(currentMood, selectedEmotions)) {
      const alertSent = await sendEmergencyAlert({
        userId: user.id,
        moodScore: currentMood,
        emotionTags: selectedEmotions,
        textNote,
      });

      if (alertSent) {
        setEmergencyAlertSent(true);
        toast({
          title: "Emergency SMS Sent",
          description: "Your emergency contact has been notified via SMS",
          variant: "default",
        });
      } else {
        toast({
          title: "SMS not sent",
          description: "Please ensure your Emergency Contact is set in Profile with a valid Indian mobile number.",
          variant: "destructive",
        });
      }
    }

    addMoodEntry({
      moodScore: currentMood,
      emotionTags: selectedEmotions,
      textNote: textNote || undefined,
      voiceNote: voiceBlob ? "recorded" : undefined,
    });

    toast({
      title: "Mood recorded!",
      description: "Your mood has been saved successfully.",
    });

    // Navigate to insights page with basic mood data
    navigate(ROUTES.MOOD.INSIGHTS, {
      state: {
        analysisType: 'none',
        moodScore: currentMood,
        emotionTags: selectedEmotions,
        textNote,
      }
    });
  };

  return (
    <Layout>
      <div className="container py-4 md:py-6 space-y-4 md:space-y-6 max-w-2xl mx-auto px-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mood Check-In</h1>
          <p className="text-sm md:text-base text-muted-foreground">How are you feeling right now?</p>
        </div>

        {emergencyAlertSent && (
          <Alert className="border-accent bg-accent/10">
            <Phone className="h-4 w-4" />
            <AlertTitle>Emergency Contact Notified</AlertTitle>
            <AlertDescription>
              We've sent an alert to your emergency contact to let them know you may need support.
            </AlertDescription>
          </Alert>
        )}

        {isCrisis && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Crisis Detected</AlertTitle>
            <AlertDescription>
              Based on your entry, we recommend reaching out for immediate support.
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => navigate(ROUTES.CRISIS)}
              >
                Get Help Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Rate Your Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodScale value={currentMood} onChange={setCurrentMood} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Emotions</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionTags 
              selectedEmotions={selectedEmotions}
              onToggle={toggleEmotion}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Note (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceRecorder onRecordingComplete={setVoiceBlob} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your feelings in more detail..."
              value={textNote}
              onChange={(e) => setTextNote(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              onClick={handleMLAnalysis}
              disabled={isMLAnalyzing}
              className="w-full sm:flex-1"
            >
              {isMLAnalyzing ? (
                <><LoadingSpinner /> ML Analyzing...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Analyze & Save with ML</>
              )}
            </Button>
            <Button 
              variant="secondary"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:flex-1"
            >
              {isAnalyzing ? <><LoadingSpinner /> Analyzing...</> : "Analyze & Save with AI"}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="w-full sm:flex-1"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MoodCheckScreen;
