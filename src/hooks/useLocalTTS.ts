import { useState, useCallback, useRef } from "react";

const languageMap = {
  en: 'en-US',
  hi: 'hi-IN',
  te: 'te-IN'
};

export const useLocalTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = useCallback(() => {
    return 'speechSynthesis' in window;
  }, []);

  const speak = useCallback((text: string, language: 'en' | 'hi' | 'te') => {
    if (!isSupported()) {
      return false;
    }

    try {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageMap[language];
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Find the best voice for the language
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(languageMap[language].split('-')[0])) || voices[0];
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        console.info('[LocalTTS] Started speaking');
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        console.info('[LocalTTS] Finished speaking');
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('[LocalTTS] Error:', event);
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('[LocalTTS] Failed to speak:', error);
      setIsSpeaking(false);
      return false;
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported: isSupported()
  };
};
