import { useState, useRef, useCallback } from "react";

interface UseSpeechRecognitionProps {
  language: 'en' | 'hi' | 'te';
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
}

const languageMap = {
  en: 'en-US',
  hi: 'hi-IN',
  te: 'te-IN'
};

export const useSpeechRecognition = ({ language, onTranscript, onError }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isSupported = useCallback(() => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported()) {
      onError?.('Speech recognition not supported in this browser');
      return false;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = languageMap[language];
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.info('[SpeechRecognition] Started listening');
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.info('[SpeechRecognition] Transcript:', transcript);
        onTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('[SpeechRecognition] Error:', event.error);
        setIsListening(false);
        onError?.(event.error);
      };

      recognition.onend = () => {
        console.info('[SpeechRecognition] Stopped listening');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      return true;
    } catch (error) {
      console.error('[SpeechRecognition] Failed to start:', error);
      onError?.('Failed to start speech recognition');
      return false;
    }
  }, [language, onTranscript, onError, isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    isSupported: isSupported()
  };
};
