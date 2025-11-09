import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalTTS } from "./useLocalTTS";

const voiceMap = {
  en: 'alloy',
  hi: 'nova',
  te: 'echo'
};

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueue = useRef<(() => Promise<void>)[]>([]);
  const isProcessingQueue = useRef(false);
  const { toast } = useToast();
  const localTTS = useLocalTTS();

  const processQueue = async () => {
    if (isProcessingQueue.current || audioQueue.current.length === 0) return;
    
    isProcessingQueue.current = true;
    while (audioQueue.current.length > 0) {
      const playNext = audioQueue.current.shift();
      if (playNext) {
        await playNext();
      }
    }
    isProcessingQueue.current = false;
  };

  const speak = async (text: string, language: 'en' | 'hi' | 'te') => {
    console.info('[TTS] Speaking:', text.substring(0, 50) + '...');
    
    // Try local TTS first
    if (localTTS.isSupported) {
      const success = localTTS.speak(text, language);
      if (success) {
        setIsSpeaking(true);
        return;
      }
    }

    // Fallback to edge function TTS
    try {
      console.info('[TTS] Using edge function TTS');
      setIsSpeaking(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: voiceMap[language] }
      });

      if (error) {
        if (error.message?.includes('402') || error.message?.includes('credits')) {
          toast({
            title: "Credits Required",
            description: "Please add credits to continue using text-to-speech.",
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
        setIsSpeaking(false);
        return;
      }

      if (data?.audioContent) {
        const playAudio = () => new Promise<void>((resolve) => {
          const audioBlob = new Blob(
            [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
            { type: 'audio/mpeg' }
          );
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            audioRef.current.pause();
          }
          
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          
          audio.onerror = () => {
            console.error('[TTS] Audio playback error');
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          
          audio.play().catch((err) => {
            console.error('[TTS] Play error:', err);
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
            resolve();
          });
        });

        audioQueue.current.push(playAudio);
        processQueue();
      }
    } catch (error) {
      console.error('[TTS] Error:', error);
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: "Failed to play audio",
        variant: "destructive",
      });
    }
  };

  const stop = () => {
    audioQueue.current = [];
    localTTS.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking: isSpeaking || localTTS.isSpeaking };
};
