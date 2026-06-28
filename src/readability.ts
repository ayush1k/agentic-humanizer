export interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  averageSentenceLength: number;
  averageSyllablesPerWord: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  complexity: "simple" | "moderate" | "complex" | "very complex";
}

export function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) {
    return 1;
  }

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  const syllables = matches ? matches.length : 0;
  return Math.max(1, syllables);
}

export function splitSentences(text: string): string[] {
  const pieces = text.match(/[^.!?]+[.!?]*/g);
  return pieces?.length ? pieces.map((piece) => piece.trim()).filter(Boolean) : [text];
}

export function splitWords(text: string): string[] {
  return text.match(/\b[\w'-]+\b/g) || [];
}

export function calculateReadabilityMetrics(text: string): ReadabilityMetrics {
  const sentences = splitSentences(text);
  const words = splitWords(text);

  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);

  const averageSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const averageSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0;

  const fleschKincaidGrade =
    0.39 * averageSentenceLength + 11.8 * averageSyllablesPerWord - 15.59;

  const fleschReadingEase =
    206.835 - 1.015 * averageSentenceLength - 84.6 * averageSyllablesPerWord;

  let complexity: "simple" | "moderate" | "complex" | "very complex";
  if (fleschKincaidGrade < 8) {
    complexity = "simple";
  } else if (fleschKincaidGrade < 12) {
    complexity = "moderate";
  } else if (fleschKincaidGrade < 16) {
    complexity = "complex";
  } else {
    complexity = "very complex";
  }

  return {
    fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
    fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
    averageSentenceLength,
    averageSyllablesPerWord,
    wordCount,
    sentenceCount,
    syllableCount,
    complexity,
  };
}

export function getReadabilityDescription(metrics: ReadabilityMetrics): string {
  const { fleschReadingEase, complexity } = metrics;

  let easeDescription: string;
  if (fleschReadingEase >= 90) {
    easeDescription = "Very easy to read";
  } else if (fleschReadingEase >= 80) {
    easeDescription = "Easy to read";
  } else if (fleschReadingEase >= 70) {
    easeDescription = "Fairly easy to read";
  } else if (fleschReadingEase >= 60) {
    easeDescription = "Plain English";
  } else if (fleschReadingEase >= 50) {
    easeDescription = "Fairly difficult to read";
  } else if (fleschReadingEase >= 30) {
    easeDescription = "Difficult to read";
  } else {
    easeDescription = "Very difficult to read";
  }

  return `${easeDescription}. Complexity: ${complexity}. Grade level: ${metrics.fleschKincaidGrade.toFixed(1)}`;
}

export function analyzeSentenceStructure(text: string): {
  shortSentences: number;
  mediumSentences: number;
  longSentences: number;
  veryLongSentences: number;
} {
  const sentences = splitSentences(text);
  const wordsPerSentence = sentences.map((sentence) => splitWords(sentence).length);

  const shortSentences = wordsPerSentence.filter((count) => count <= 10).length;
  const mediumSentences = wordsPerSentence.filter((count) => count > 10 && count <= 20).length;
  const longSentences = wordsPerSentence.filter((count) => count > 20 && count <= 30).length;
  const veryLongSentences = wordsPerSentence.filter((count) => count > 30).length;

  return {
    shortSentences,
    mediumSentences,
    longSentences,
    veryLongSentences,
  };
}