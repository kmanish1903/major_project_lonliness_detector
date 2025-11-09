import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: 'en' | 'hi' | 'te';
}

const VoiceInput = ({ onTranscript, language }: VoiceInputProps) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [useWebSpeech, setUseWebSpeech] = useState(true);
  const { startRecording, stopRecording } = useVoiceInput();
  
  const speechRecognition = useSpeechRecognition({
    language,
    onTranscript: (text) => {
      console.info('[VoiceInput] Web Speech transcript:', text);
      onTranscript(text);
      setIsRecording(false);
    },
    onError: (error) => {
      console.error('[VoiceInput] Web Speech error:', error);
      setUseWebSpeech(false);
      toast({
        title: "Info",
        description: "Switching to recorder mode",
        variant: "default",
      });
    }
  });

  useEffect(() => {
    if (speechRecognition.isSupported) {
      setUseWebSpeech(true);
    }
  }, [speechRecognition.isSupported]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      if (useWebSpeech && speechRecognition.isSupported) {
        speechRecognition.stopListening();
      } else {
        setIsRecording(false);
        const audioBlob = await stopRecording();
        
        if (audioBlob) {
          try {
            console.info('[VoiceInput] Transcribing audio via edge function');
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result?.toString().split(',')[1];
              if (base64Audio) {
                const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                  body: { audio: base64Audio, language }
                });

                if (error) {
                  if (error.message?.includes('402') || error.message?.includes('credits')) {
                    toast({
                      title: "Credits Required",
                      description: "Please add credits to your account to continue using transcription.",
                      variant: "destructive",
                    });
                  } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
                    toast({
                      title: "Rate Limited",
                      description: "Too many requests. Please try again in a moment.",
                      variant: "destructive",
                    });
                  } else {
                    throw error;
                  }
                  return;
                }
                
                if (data?.text) {
                  console.info('[VoiceInput] Transcription result:', data.text);
                  onTranscript(data.text);
                }
              }
            };
          } catch (error) {
            console.error('[VoiceInput] Transcription error:', error);
            toast({
              title: "Error",
              description: "Failed to transcribe audio",
              variant: "destructive",
            });
          }
        }
      }
    } else {
      if (useWebSpeech && speechRecognition.isSupported) {
        const started = speechRecognition.startListening();
        if (started) {
          setIsRecording(true);
        } else {
          setUseWebSpeech(false);
          toast({
            title: "Info",
            description: "Speech recognition unavailable. Using recorder.",
          });
        }
      } else {
        try {
          await startRecording();
          setIsRecording(true);
        } catch (error) {
          console.error('[VoiceInput] Microphone access error:', error);
          toast({
            title: "Error",
            description: "Microphone access denied",
            variant: "destructive",
          });
        }
      }
    }
  };

  const isActive = isRecording || speechRecognition.isListening;

  return (
    <Button
      variant={isActive ? "destructive" : "outline"}
      size="icon"
      onClick={handleToggleRecording}
      className="transition-all hover:scale-110 active:scale-95"
      aria-label={isActive ? "Stop recording" : "Start recording"}
    >
      {isActive ? (
        <MicOff className="h-4 w-4 animate-pulse" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};

export { VoiceInput };
export default VoiceInput;
