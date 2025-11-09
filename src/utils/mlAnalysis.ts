import { pipeline } from '@huggingface/transformers';

// Cache for loaded models
let sentimentAnalyzer: any = null;
let emotionClassifier: any = null;
let zeroShotClassifier: any = null;

// Initialize sentiment analysis model
async function getSentimentAnalyzer() {
  if (!sentimentAnalyzer) {
    console.log('Loading sentiment analysis model...');
    try {
      sentimentAnalyzer = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      console.log('Sentiment model loaded successfully');
    } catch (error) {
      console.error('Failed to load sentiment model:', error);
      throw new Error('Failed to load sentiment analysis model');
    }
  }
  return sentimentAnalyzer;
}

// Initialize emotion classification model
async function getEmotionClassifier() {
  if (!emotionClassifier) {
    console.log('Loading emotion classification model...');
    try {
      emotionClassifier = await pipeline(
        'text-classification',
        'Xenova/bert-base-multilingual-uncased-sentiment'
      );
      console.log('Emotion model loaded successfully');
    } catch (error) {
      console.error('Failed to load emotion model:', error);
      throw new Error('Failed to load emotion classification model');
    }
  }
  return emotionClassifier;
}

// Initialize zero-shot classification for crisis detection
async function getZeroShotClassifier() {
  if (!zeroShotClassifier) {
    console.log('Loading zero-shot classification model...');
    try {
      zeroShotClassifier = await pipeline(
        'zero-shot-classification',
        'Xenova/mobilebert-uncased-mnli'
      );
      console.log('Zero-shot model loaded successfully');
    } catch (error) {
      console.error('Failed to load zero-shot model:', error);
      throw new Error('Failed to load crisis detection model');
    }
  }
  return zeroShotClassifier;
}

export interface SentimentResult {
  label: string;
  score: number;
  normalizedScore: number; // -1 to 1
}

export interface EmotionResult {
  label: string;
  score: number;
}

export interface CrisisAssessment {
  isCrisis: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  indicators: string[];
}

export interface MLAnalysisResult {
  sentiment: SentimentResult;
  emotions: EmotionResult[];
  crisis: CrisisAssessment;
  suggestedMoodScore: number;
  confidence: number;
}

// Analyze sentiment from text
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  if (!text || text.trim().length === 0) {
    return {
      label: 'NEUTRAL',
      score: 0.5,
      normalizedScore: 0,
    };
  }

  const analyzer = await getSentimentAnalyzer();
  const result = await analyzer(text);
  
  const sentiment = result[0];
  // Convert to -1 to 1 scale (NEGATIVE = -1, POSITIVE = 1)
  const normalizedScore = sentiment.label === 'POSITIVE' 
    ? sentiment.score 
    : -sentiment.score;

  return {
    label: sentiment.label,
    score: sentiment.score,
    normalizedScore,
  };
}

// Detect emotions from text
export async function detectEmotions(text: string): Promise<EmotionResult[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const classifier = await getEmotionClassifier();
  const results = await classifier(text, { topk: 5 });
  
  return results.map((r: any) => ({
    label: r.label,
    score: r.score,
  }));
}

// Assess crisis level based on text and emotion tags
export async function assessCrisisLevel(
  text: string,
  emotionTags: string[]
): Promise<CrisisAssessment> {
  const crisisKeywords = [
    'suicide',
    'self-harm',
    'hopeless',
    'worthless',
    'end it all',
    'give up',
    'no point',
    'cant go on',
  ];

  const crisisEmotions = ['hopeless', 'desperate', 'overwhelmed', 'anxious'];
  
  let indicators: string[] = [];
  let riskScore = 0;

  // Check for crisis keywords in text
  const lowerText = text.toLowerCase();
  crisisKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      indicators.push(`Crisis keyword detected: "${keyword}"`);
      riskScore += 0.3;
    }
  });

  // Check emotion tags for crisis indicators
  emotionTags.forEach(tag => {
    if (crisisEmotions.includes(tag.toLowerCase())) {
      indicators.push(`High-risk emotion: ${tag}`);
      riskScore += 0.2;
    }
  });

  // Use zero-shot classification if there's text
  if (text && text.trim().length > 10) {
    try {
      const classifier = await getZeroShotClassifier();
      const result = await classifier(text, [
        'mental health crisis',
        'suicidal thoughts',
        'self-harm ideation',
        'severe depression',
        'normal emotional expression',
      ]);

      const crisisScores = result.scores.slice(0, 4); // First 4 are crisis-related
      const maxCrisisScore = Math.max(...crisisScores);
      
      if (maxCrisisScore > 0.5) {
        indicators.push('ML model detected crisis indicators');
        riskScore += maxCrisisScore * 0.5;
      }
    } catch (error) {
      console.error('Zero-shot classification failed:', error);
    }
  }

  // Normalize risk score
  riskScore = Math.min(riskScore, 1);

  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore > 0.7) {
    riskLevel = 'high';
  } else if (riskScore > 0.4) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  return {
    isCrisis: riskScore > 0.4,
    riskLevel,
    score: riskScore,
    indicators,
  };
}

// Calculate mood score from ML analysis
export function calculateMoodScore(
  sentiment: SentimentResult,
  emotions: EmotionResult[],
  userScore: number
): number {
  // Base score from sentiment (-1 to 1 → 1 to 10)
  let mlScore = ((sentiment.normalizedScore + 1) / 2) * 9 + 1;

  // Adjust based on top emotions
  const topEmotion = emotions[0];
  if (topEmotion) {
    const emotionAdjustments: Record<string, number> = {
      '1 star': -2,
      '2 stars': -1,
      '3 stars': 0,
      '4 stars': 1,
      '5 stars': 2,
    };

    const adjustment = emotionAdjustments[topEmotion.label] || 0;
    mlScore += adjustment;
  }

  // Clamp to 1-10 range
  mlScore = Math.max(1, Math.min(10, mlScore));

  // Blend with user score (70% ML, 30% user input for suggestion)
  const blendedScore = mlScore * 0.7 + userScore * 0.3;

  return Math.round(blendedScore);
}

// Main ML analysis function
export async function performMLAnalysis(
  text: string,
  emotionTags: string[],
  currentMoodScore: number
): Promise<MLAnalysisResult> {
  // Run analyses in parallel for better performance
  const [sentiment, emotions, crisis] = await Promise.all([
    analyzeSentiment(text),
    detectEmotions(text),
    assessCrisisLevel(text, emotionTags),
  ]);

  const suggestedMoodScore = calculateMoodScore(sentiment, emotions, currentMoodScore);

  // Calculate overall confidence based on text length and model confidence
  const textLength = text.trim().length;
  const textConfidence = Math.min(textLength / 100, 1); // More text = more confidence
  const modelConfidence = sentiment.score;
  const confidence = (textConfidence * 0.4 + modelConfidence * 0.6);

  return {
    sentiment,
    emotions,
    crisis,
    suggestedMoodScore,
    confidence,
  };
}
