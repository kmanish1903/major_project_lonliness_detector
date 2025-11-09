export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  ONBOARDING: {
    WELCOME: "/onboarding/welcome",
    PERMISSIONS: "/onboarding/permissions",
    MOOD_ASSESSMENT: "/onboarding/mood-assessment",
  },
  DASHBOARD: "/dashboard",
  CHATBOT: "/chatbot",
  MOOD: {
    CHECK: "/mood-check",
    HISTORY: "/mood-history",
    ENTRY: "/mood-entry/:id",
    INSIGHTS: "/mood/insights",
  },
  RECOMMENDATIONS: {
    HUB: "/recommendations",
    EXERCISE: "/recommendations/exercise",
    SOCIAL: "/recommendations/social",
    BREATHING: "/recommendations/breathing",
  },
  GOALS: {
    LIST: "/goals",
    CREATE: "/goals/create",
  },
  PROGRESS: "/progress",
  PROFILE: "/profile",
  SETTINGS: {
    MAIN: "/settings",
    PRIVACY: "/settings/privacy",
  },
  HELP: "/help",
  CRISIS: "/crisis",
} as const;

export const MOOD_SCALE = {
  MIN: 1,
  MAX: 10,
} as const;

export const EMOTION_TAGS = [
  "Happy",
  "Sad",
  "Anxious",
  "Calm",
  "Excited",
  "Tired",
  "Angry",
  "Content",
  "Stressed",
  "Peaceful",
] as const;
