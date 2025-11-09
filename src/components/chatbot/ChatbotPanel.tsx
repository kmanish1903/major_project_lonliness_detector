import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Volume2, VolumeX } from "lucide-react";
import { VoiceInput } from "./VoiceInput";
import RecommendationCard from "@/components/recommendations/RecommendationCard";
import ThemeToggle from "@/components/ThemeToggle";
import { useChat } from "@/hooks/useChat";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

type Language = 'en' | 'hi' | 'te';

const ChatbotPanel = () => {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<Language>('en');
  const [autoPlay, setAutoPlay] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, isLoading } = useChat(language);
  const { speak, stop, isSpeaking } = useTextToSpeech();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (autoPlay && lastMessage?.role === 'assistant' && !isSpeaking) {
      speak(lastMessage.content, language);
    }
  }, [messages, autoPlay]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    await sendMessage(input);
    setInput("");
  };

  const handleVoiceInput = async (text: string) => {
    await sendMessage(text);
  };

  const languageNames = {
    en: 'English',
    hi: 'हिंदी',
    te: 'తెలుగు'
  };

  // Stub media recommendations - will be AI-generated in future phases
  const stubRecommendations = [];

  return (
    <Card className="flex flex-col h-[600px] md:h-[700px] w-full max-w-2xl mx-auto shadow-lg animate-in fade-in duration-500">
      <div className="p-4 md:p-6 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          MindCare AI Assistant
        </h2>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="w-24 md:w-32" aria-label="Select language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{languageNames.en}</SelectItem>
              <SelectItem value="hi">{languageNames.hi}</SelectItem>
              <SelectItem value="te">{languageNames.te}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isSpeaking) {
                stop();
              }
              setAutoPlay(!autoPlay);
            }}
            aria-label={autoPlay ? "Disable auto-play" : "Enable auto-play"}
            className="hover:scale-110 transition-transform"
          >
            {autoPlay ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12 animate-in fade-in duration-700">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Volume2 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xl md:text-2xl font-semibold mb-2 text-foreground">Welcome to MindCare AI</p>
              <p className="text-sm md:text-base">How can I support you today?</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className="animate-in slide-in-from-bottom-2 duration-300">
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 shadow-sm transition-all hover:shadow-md ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
              
              {message.role === 'assistant' && stubRecommendations.length > 0 && index === messages.length - 1 && (
                <div className="mt-3 space-y-2">
                  {stubRecommendations.map((rec: any, recIndex: number) => (
                    <RecommendationCard
                      key={recIndex}
                      title={rec.title}
                      description={rec.description}
                      source={rec.source}
                      url={rec.url}
                      thumbnail={rec.thumbnail}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-muted rounded-2xl rounded-bl-sm p-4 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 md:p-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex gap-2">
          <VoiceInput onTranscript={handleVoiceInput} language={language} />
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isLoading}
            className="flex-1 transition-all focus:ring-2 focus:ring-primary/20"
            aria-label="Message input"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="transition-all hover:scale-105 active:scale-95"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export { ChatbotPanel };
export default ChatbotPanel;
