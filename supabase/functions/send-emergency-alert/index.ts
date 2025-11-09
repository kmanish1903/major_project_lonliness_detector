import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmergencyAlertRequest {
  emergencyContact: string;
  userName: string;
  moodScore: number;
  emotionTags: string[];
  textNote?: string;
}

async function sendTwilioSMS(to: string, message: string): Promise<any> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const body = new URLSearchParams({
    From: TWILIO_PHONE_NUMBER!,
    To: to,
    Body: message,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Twilio API error:', errorData);
    throw new Error(`Twilio API error: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emergencyContact, userName, moodScore, emotionTags, textNote }: EmergencyAlertRequest = await req.json();

    console.log('Emergency alert triggered for:', { userName, moodScore, emotionTags });

    // Validate Twilio configuration
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Twilio credentials not configured' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Format SMS message
    const message = `🚨 Emergency Alert from MindCare AI

${userName} may need your support.

Mood Score: ${moodScore}/10
Emotions: ${emotionTags.join(', ')}
${textNote ? `\nNote: ${textNote}` : ''}

Please reach out to them soon. They might be going through a difficult time.

This is an automated alert from MindCare AI mental health app.`;

    // Format phone number - default to +91 for Indian numbers
    let phoneNumber = emergencyContact.replace(/[^\d+]/g, '');
    if (!phoneNumber.startsWith('+')) {
      // If no country code, assume India (+91)
      phoneNumber = '+91' + phoneNumber;
    }

    console.log('Sending SMS to:', phoneNumber);

    // Send SMS via Twilio
    try {
      const twilioResponse = await sendTwilioSMS(phoneNumber, message);
      
      console.log('SMS sent successfully:', twilioResponse.sid);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Emergency alert sent successfully',
          messageSid: twilioResponse.sid,
          status: twilioResponse.status,
          to: phoneNumber,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (twilioError: any) {
      console.error('Twilio send error:', twilioError);
      
      // Return error but don't fail completely
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send SMS',
          details: twilioError.message,
          phoneNumber: phoneNumber,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('Error in send-emergency-alert:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
