import { ReactNode } from "react";
import Header from "./Header";
import BottomTabBar from "./BottomTabBar";
import FloatingChatbot from "./FloatingChatbot";

interface LayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

const Layout = ({ children, showBottomNav = true }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-6 overflow-x-hidden">
        {children}
      </main>
      {showBottomNav && <BottomTabBar />}
      <FloatingChatbot />
    </div>
  );
};

export default Layout;
