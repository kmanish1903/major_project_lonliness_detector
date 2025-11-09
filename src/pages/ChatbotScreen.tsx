import Layout from "@/components/Layout";
import { ChatbotPanel } from "@/components/chatbot/ChatbotPanel";

const ChatbotScreen = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 md:py-8 min-h-screen">
        <div className="mb-4 md:mb-6 text-center md:text-left animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            AI Assistant
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Chat with our AI assistant for mental health support in your language
          </p>
        </div>
        <ChatbotPanel />
      </div>
    </Layout>
  );
};

export default ChatbotScreen;
