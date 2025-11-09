import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { ROUTES } from "./utils/constants";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { ThemeProvider } from "next-themes";

// Pages
import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/auth/LoginScreen";
import RegisterScreen from "./pages/auth/RegisterScreen";
import ForgotPasswordScreen from "./pages/auth/ForgotPasswordScreen";
import WelcomeScreen from "./pages/onboarding/WelcomeScreen";
import PermissionsScreen from "./pages/onboarding/PermissionsScreen";
import MoodAssessmentScreen from "./pages/onboarding/MoodAssessmentScreen";
import DashboardScreen from "./pages/DashboardScreen";
import MoodCheckScreen from "./pages/mood/MoodCheckScreen";
import MoodHistoryScreen from "./pages/mood/MoodHistoryScreen";
import MoodInsightsScreen from "./pages/mood/MoodInsightsScreen";
import RecommendationsHub from "./pages/recommendations/RecommendationsHub";
import GoalsScreen from "./pages/goals/GoalsScreen";
import ProgressScreen from "./pages/ProgressScreen";
import ProfileScreen from "./pages/ProfileScreen";
import ProfileEditScreen from "./pages/ProfileEditScreen";
import SettingsScreen from "./pages/SettingsScreen";
import HelpScreen from "./pages/HelpScreen";
import CrisisScreen from "./pages/CrisisScreen";
import ChatbotScreen from "./pages/ChatbotScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              
              {/* Auth Routes */}
              <Route path={ROUTES.LOGIN} element={<LoginScreen />} />
              <Route path={ROUTES.REGISTER} element={<RegisterScreen />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordScreen />} />
              
              {/* Onboarding Routes - Protected */}
              <Route path={ROUTES.ONBOARDING.WELCOME} element={<ProtectedRoute><WelcomeScreen /></ProtectedRoute>} />
              <Route path={ROUTES.ONBOARDING.PERMISSIONS} element={<ProtectedRoute><PermissionsScreen /></ProtectedRoute>} />
              <Route path={ROUTES.ONBOARDING.MOOD_ASSESSMENT} element={<ProtectedRoute><MoodAssessmentScreen /></ProtectedRoute>} />
              
              {/* Main App Routes - Protected */}
              <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
              
              {/* Mood Routes - Protected */}
              <Route path={ROUTES.MOOD.CHECK} element={<ProtectedRoute><MoodCheckScreen /></ProtectedRoute>} />
              <Route path={ROUTES.MOOD.HISTORY} element={<ProtectedRoute><MoodHistoryScreen /></ProtectedRoute>} />
              <Route path={ROUTES.MOOD.INSIGHTS} element={<ProtectedRoute><MoodInsightsScreen /></ProtectedRoute>} />
              
              {/* Recommendations - Protected */}
              <Route path={ROUTES.RECOMMENDATIONS.HUB} element={<ProtectedRoute><RecommendationsHub /></ProtectedRoute>} />
              
              {/* Goals - Protected */}
              <Route path={ROUTES.GOALS.LIST} element={<ProtectedRoute><GoalsScreen /></ProtectedRoute>} />
              
              {/* Progress & Profile - Protected */}
              <Route path={ROUTES.PROGRESS} element={<ProtectedRoute><ProgressScreen /></ProtectedRoute>} />
              <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditScreen /></ProtectedRoute>} />
              
              {/* Chatbot - Protected */}
              <Route path={ROUTES.CHATBOT} element={<ProtectedRoute><ChatbotScreen /></ProtectedRoute>} />
              
              {/* Settings & Support - Protected */}
              <Route path={ROUTES.SETTINGS.MAIN} element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
              <Route path={ROUTES.HELP} element={<ProtectedRoute><HelpScreen /></ProtectedRoute>} />
              
              {/* Crisis - Always accessible */}
              <Route path={ROUTES.CRISIS} element={<CrisisScreen />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
