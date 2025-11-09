import { supabase } from "@/integrations/supabase/client";

export interface EmergencyAlertParams {
  userId: string;
  moodScore: number;
  emotionTags: string[];
  textNote?: string;
}

export async function sendEmergencyAlert(params: EmergencyAlertParams): Promise<boolean> {
  try {
    // Get user profile with emergency contact
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('emergency_contact, full_name')
      .eq('id', params.userId)
      .single();

    if (profileError || !profile?.emergency_contact) {
      console.error('No emergency contact found:', profileError);
      return false;
    }

    // Send alert via edge function (which will handle SMS via Twilio)
    const { data, error } = await supabase.functions.invoke('send-emergency-alert', {
      body: {
        emergencyContact: profile.emergency_contact,
        userName: profile.full_name || 'User',
        moodScore: params.moodScore,
        emotionTags: params.emotionTags,
        textNote: params.textNote,
      },
    });

    if (error) {
      console.error('Failed to send emergency alert:', error);
      return false;
    }

    if (!data.success) {
      console.error('Emergency alert failed:', data.error, data.details);
      return false;
    }

    console.log('Emergency alert sent successfully:', data.messageSid);
    return true;
  } catch (error) {
    console.error('Emergency alert error:', error);
    return false;
  }
}

export function shouldTriggerEmergencyAlert(moodScore: number, emotionTags: string[]): boolean {
  // Trigger if mood is very low (1-3)
  if (moodScore <= 3) {
    return true;
  }

  // Trigger if certain critical emotions are present
  const criticalEmotions = ['anxious', 'sad', 'angry', 'stressed'];
  const hasCriticalEmotions = emotionTags.some(tag => 
    criticalEmotions.some(critical => tag.toLowerCase().includes(critical))
  );

  // Trigger if mood is low (4-5) AND has critical emotions
  if (moodScore <= 5 && hasCriticalEmotions) {
    return true;
  }

  return false;
}
