import { pipeline } from "@huggingface/transformers";
import type { MoodEntry } from "@/hooks/useMood";

// Lazy-loaded embedding model
let embeddingModel: any = null;

async function getEmbeddingModel() {
  if (!embeddingModel) {
    console.log("Loading text embedding model...");
    embeddingModel = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
      { device: "auto" }
    );
  }
  return embeddingModel;
}

export interface EmotionPattern {
  combination: string[];
  frequency: number;
  averageMood: number;
}

export interface TriggerWord {
  word: string;
  frequency: number;
  averageMood: number;
  impact: "positive" | "negative" | "neutral";
}

export interface MoodTrend {
  direction: "improving" | "declining" | "stable";
  confidence: number;
  prediction: number[];
  volatility: number;
}

export interface PatternInsight {
  title: string;
  description: string;
  confidence: number;
  actionable: string;
}

export interface MLTrendAnalysis {
  emotionPatterns: EmotionPattern[];
  triggerWords: TriggerWord[];
  moodTrend: MoodTrend;
  insights: PatternInsight[];
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  const stopWords = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "you", "your", "he", "him",
    "his", "she", "her", "it", "its", "they", "them", "their", "what", "which",
    "who", "when", "where", "why", "how", "a", "an", "the", "and", "but", "if",
    "or", "because", "as", "until", "while", "of", "at", "by", "for", "with",
    "about", "against", "between", "into", "through", "during", "before", "after",
    "to", "from", "in", "out", "on", "off", "over", "under", "again", "further",
    "then", "once", "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "should", "could"
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  return words;
}

// Analyze emotion co-occurrence patterns
export function analyzeEmotionPatterns(
  moodHistory: MoodEntry[]
): EmotionPattern[] {
  if (moodHistory.length < 3) return [];

  const patternMap = new Map<string, { count: number; totalMood: number }>();

  moodHistory.forEach(entry => {
    if (entry.emotionTags.length >= 2) {
      // Sort emotions to ensure consistent key
      const sorted = [...entry.emotionTags].sort();
      
      // Create pairs
      for (let i = 0; i < sorted.length - 1; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const key = `${sorted[i]}|${sorted[j]}`;
          const existing = patternMap.get(key) || { count: 0, totalMood: 0 };
          patternMap.set(key, {
            count: existing.count + 1,
            totalMood: existing.totalMood + entry.moodScore,
          });
        }
      }
    }
  });

  const patterns: EmotionPattern[] = [];
  patternMap.forEach((value, key) => {
    if (value.count >= 2) {
      patterns.push({
        combination: key.split("|"),
        frequency: value.count,
        averageMood: value.totalMood / value.count,
      });
    }
  });

  return patterns.sort((a, b) => b.frequency - a.frequency).slice(0, 5);
}

// Analyze trigger words from mood entries
export function analyzeTriggerWords(
  moodHistory: MoodEntry[]
): TriggerWord[] {
  if (moodHistory.length < 3) return [];

  const wordMap = new Map<string, { count: number; totalMood: number }>();

  moodHistory.forEach(entry => {
    const text = (entry as any).notes || (entry as any).transcription || "";
    if (text) {
      const keywords = extractKeywords(text);
      keywords.forEach(word => {
        const existing = wordMap.get(word) || { count: 0, totalMood: 0 };
        wordMap.set(word, {
          count: existing.count + 1,
          totalMood: existing.totalMood + entry.moodScore,
        });
      });
    }
  });

  const triggerWords: TriggerWord[] = [];
  wordMap.forEach((value, word) => {
    if (value.count >= 2) {
      const avgMood = value.totalMood / value.count;
      let impact: "positive" | "negative" | "neutral";
      if (avgMood >= 7) impact = "positive";
      else if (avgMood <= 4) impact = "negative";
      else impact = "neutral";

      triggerWords.push({
        word,
        frequency: value.count,
        averageMood: avgMood,
        impact,
      });
    }
  });

  return triggerWords
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
}

// Calculate moving average
function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const windowData = data.slice(start, i + 1);
    const avg = windowData.reduce((sum, val) => sum + val, 0) / windowData.length;
    result.push(avg);
  }
  return result;
}

// Calculate volatility (standard deviation)
function calculateVolatility(data: number[]): number {
  if (data.length < 2) return 0;
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance =
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

// Analyze mood trends and make predictions
export function analyzeMoodTrend(moodHistory: MoodEntry[]): MoodTrend {
  if (moodHistory.length < 5) {
    return {
      direction: "stable",
      confidence: 0,
      prediction: [],
      volatility: 0,
    };
  }

  const scores = moodHistory.map(e => e.moodScore);
  const recentScores = scores.slice(-7); // Last 7 entries

  // Calculate moving averages
  const ma3 = movingAverage(scores, 3);
  const ma7 = movingAverage(scores, 7);

  // Determine trend direction
  const recentMA = ma3.slice(-3);
  const slope =
    (recentMA[recentMA.length - 1] - recentMA[0]) / recentMA.length;

  let direction: "improving" | "declining" | "stable";
  if (slope > 0.3) direction = "improving";
  else if (slope < -0.3) direction = "declining";
  else direction = "stable";

  // Calculate confidence based on consistency
  const volatility = calculateVolatility(recentScores);
  const confidence = Math.max(0, Math.min(1, 1 - volatility / 5));

  // Simple linear prediction for next 3 days
  const lastValue = scores[scores.length - 1];
  const prediction = [1, 2, 3].map(i => {
    const pred = lastValue + slope * i;
    return Math.max(1, Math.min(10, pred));
  });

  return {
    direction,
    confidence: Math.round(confidence * 100) / 100,
    prediction,
    volatility: Math.round(volatility * 100) / 100,
  };
}

// Generate actionable insights
export function generateInsights(
  moodHistory: MoodEntry[],
  emotionPatterns: EmotionPattern[],
  triggerWords: TriggerWord[],
  trend: MoodTrend
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  // Insight from emotion patterns
  if (emotionPatterns.length > 0) {
    const topPattern = emotionPatterns[0];
    const moodLevel =
      topPattern.averageMood >= 7
        ? "positive"
        : topPattern.averageMood <= 4
        ? "challenging"
        : "neutral";
    
    insights.push({
      title: "Recurring Emotional Pattern",
      description: `When you experience ${topPattern.combination.join(" and ")}, your mood tends to be ${moodLevel} (${topPattern.averageMood.toFixed(1)}/10). This combination appears ${topPattern.frequency} times in your history.`,
      confidence: Math.min(0.9, topPattern.frequency / moodHistory.length),
      actionable:
        moodLevel === "challenging"
          ? `Try mindfulness exercises when you notice this pattern emerging.`
          : `This combination seems to work well for you - consider activities that foster these feelings.`,
    });
  }

  // Insight from trigger words
  const negativeWords = triggerWords.filter(w => w.impact === "negative");
  const positiveWords = triggerWords.filter(w => w.impact === "positive");

  if (negativeWords.length > 0) {
    const topNegative = negativeWords[0];
    insights.push({
      title: "Identified Challenge Area",
      description: `The word "${topNegative.word}" appears frequently (${topNegative.frequency}x) in lower mood entries (avg ${topNegative.averageMood.toFixed(1)}/10).`,
      confidence: Math.min(0.85, topNegative.frequency / moodHistory.length),
      actionable: `Consider discussing concerns related to "${topNegative.word}" with a trusted friend or counselor.`,
    });
  }

  if (positiveWords.length > 0) {
    const topPositive = positiveWords[0];
    insights.push({
      title: "Mood Booster Identified",
      description: `Activities or thoughts related to "${topPositive.word}" appear to lift your mood (avg ${topPositive.averageMood.toFixed(1)}/10).`,
      confidence: Math.min(0.85, topPositive.frequency / moodHistory.length),
      actionable: `Try to incorporate more "${topPositive.word}"-related activities into your routine.`,
    });
  }

  // Insight from trend
  if (trend.direction === "improving" && trend.confidence > 0.5) {
    insights.push({
      title: "Positive Trend Detected",
      description: `Your mood has been steadily improving over recent entries. Keep up the good work!`,
      confidence: trend.confidence,
      actionable: "Continue your current wellness practices and consider what's been helping.",
    });
  } else if (trend.direction === "declining" && trend.confidence > 0.5) {
    insights.push({
      title: "Declining Trend Noticed",
      description: `Your mood has been trending downward recently. This is a good time to reach out for support.`,
      confidence: trend.confidence,
      actionable: "Consider connecting with your support network or a mental health professional.",
    });
  }

  // Volatility insight
  if (trend.volatility > 2.5) {
    insights.push({
      title: "High Mood Variability",
      description: `Your mood has been fluctuating significantly (volatility: ${trend.volatility.toFixed(1)}). This is normal, but consistency can help.`,
      confidence: 0.7,
      actionable: "Try establishing a regular sleep schedule and daily routine to help stabilize your mood.",
    });
  }

  return insights.slice(0, 4); // Return top 4 insights
}

// Main function to perform complete ML trend analysis
export async function performMLTrendAnalysis(
  moodHistory: MoodEntry[]
): Promise<MLTrendAnalysis> {
  if (moodHistory.length < 5) {
    throw new Error("Need at least 5 mood entries for trend analysis");
  }

  console.log("Starting ML trend analysis...");

  // Analyze emotion patterns
  const emotionPatterns = analyzeEmotionPatterns(moodHistory);
  console.log("Emotion patterns analyzed:", emotionPatterns.length);

  // Analyze trigger words
  const triggerWords = analyzeTriggerWords(moodHistory);
  console.log("Trigger words identified:", triggerWords.length);

  // Analyze mood trends
  const moodTrend = analyzeMoodTrend(moodHistory);
  console.log("Mood trend calculated:", moodTrend.direction);

  // Generate insights
  const insights = generateInsights(
    moodHistory,
    emotionPatterns,
    triggerWords,
    moodTrend
  );
  console.log("Insights generated:", insights.length);

  return {
    emotionPatterns,
    triggerWords,
    moodTrend,
    insights,
  };
}
