import { ValidationError, ProcessingError } from "./errors.js";
import { logger } from "./logger.js";
import { getPatternsForStyle, fillerPatterns, type ReplacementPattern } from "./patterns.js";
import {
  calculateReadabilityMetrics,
  getReadabilityDescription,
  splitSentences,
} from "./readability.js";

export type HumanizeStyle = "balanced" | "casual" | "formal" | "professional" | "technical" | "creative";

export interface HumanizeRequest {
  text: string;
  style?: HumanizeStyle;
}

export interface HumanizeResult {
  originalText: string;
  humanizedText: string;
  style: HumanizeStyle;
  changes: string[];
  readability?: {
    original: string;
    humanized: string;
  };
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function preserveCase(replacement: string, match: string): string {
  if (match.toUpperCase() === match) {
    return replacement.toUpperCase();
  }

  if (match[0] === match[0]?.toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement;
}

function applyReplacement(
  text: string,
  pattern: RegExp,
  replacement: string,
  changes: string[]
): string {
  return text.replace(pattern, (match) => {
    const nextValue = preserveCase(replacement, match);
    if (match !== nextValue) {
      changes.push(`${match} -> ${nextValue}`);
    }

    return nextValue;
  });
}

function applyReplacements(
  text: string,
  replacements: Array<[RegExp, string]>,
  changes: string[]
): string {
  return replacements.reduce(
    (currentText, [pattern, replacement]) =>
      applyReplacement(currentText, pattern, replacement, changes),
    text
  );
}

function applyPatternReplacements(
  text: string,
  patterns: import("./patterns.js").ReplacementPattern[],
  changes: string[]
): string {
  return patterns.reduce((currentText, { pattern, replacement }) => {
    return applyReplacement(currentText, pattern, replacement, changes);
  }, text);
}

function collapseRepeats(text: string): string {
  return text
    .replace(/\b(\w+)(\s+\1\b){1,}/gi, "$1")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\s+!/g, "!")
    .replace(/\s+\?/g, "?");
}

function humanizeSentence(sentence: string, style: HumanizeStyle): string {
  let current = sentence.trim();

  if (style !== "formal") {
    const openerPatterns: Array<[RegExp, string]> = [
      [/^Additionally,\s*/i, "Also, "],
      [/^Moreover,\s*/i, "Also, "],
      [/^However,\s*/i, "But, "],
      [/^Therefore,\s*/i, "So, "],
      [/^In addition,\s*/i, "Also, "],
      [/^For example,\s*/i, "For instance, "],
      [/^As a result,\s*/i, "So, "],
    ];

    for (const [pattern, replacement] of openerPatterns) {
      current = current.replace(pattern, replacement);
    }
  }

  return current;
}

function breakLongSentences(text: string): string {
  const sentences = splitSentences(text);
  return sentences.map(sentence => {
    const words = sentence.split(/\s+/);
    if (words.length > 25) {
      // Find a suitable break point (e.g., after a comma or a conjunction)
      const mid = Math.floor(words.length / 2);
      const breakPoint = words.slice(mid - 5, mid + 5).findIndex(w => /[,;]/.test(w));
      
      if (breakPoint !== -1) {
        const actualBreak = mid - 5 + breakPoint;
        const firstHalf = words.slice(0, actualBreak + 1).join(" ").replace(/,$/, ".");
        const secondHalf = words.slice(actualBreak + 1).join(" ");
        if (secondHalf.length > 0) {
          const capitalizedSecond = secondHalf.charAt(0).toUpperCase() + secondHalf.slice(1);
          return `${firstHalf} ${capitalizedSecond}`;
        }
      }
    }
    return sentence;
  }).join(" ");
}

export function humanizeText(request: HumanizeRequest): HumanizeResult {
  try {
    if (!request.text || typeof request.text !== "string") {
      throw new ValidationError("Text is required and must be a string", "text");
    }

    if (request.text.trim().length === 0) {
      throw new ValidationError("Text cannot be empty", "text");
    }

    if (request.text.length > 10000) {
      throw new ValidationError("Text is too long (maximum 10,000 characters)", "text");
    }

    const style: HumanizeStyle = request.style ?? "balanced";
    const originalText = normalizeWhitespace(request.text);
    const changes: string[] = [];

    logger.info("Starting humanization", {
      textLength: originalText.length,
      style,
    });

    let humanizedText = originalText;

    const patterns = getPatternsForStyle(style);
    humanizedText = applyPatternReplacements(humanizedText, patterns, changes);

    humanizedText = collapseRepeats(humanizedText);
    humanizedText = humanizedText.replace(/\s+/g, " ").trim();

    humanizedText = breakLongSentences(humanizedText);

    const sentences = splitSentences(humanizedText).map((sentence) =>
      humanizeSentence(sentence, style)
    );

    humanizedText = sentences.join(" ");

    for (const pattern of fillerPatterns) {
      const before = humanizedText;
      humanizedText = humanizedText.replace(pattern, "");
      if (before !== humanizedText) {
        changes.push("Removed redundant emphasis");
      }
    }

    humanizedText = humanizedText
      .replace(/\s{2,}/g, " ")
      .replace(/\s+,/g, ",")
      .replace(/\s+([.!?])/g, "$1")
      .trim();

    if (humanizedText.length > 0) {
      humanizedText = humanizedText.charAt(0).toUpperCase() + humanizedText.slice(1);
    }

    if (humanizedText.length > 0 && !/[.!?]$/.test(humanizedText)) {
      humanizedText += ".";
    }

    const originalMetrics = calculateReadabilityMetrics(originalText);
    const humanizedMetrics = calculateReadabilityMetrics(humanizedText);

    logger.info("Completed humanization", {
      originalLength: originalText.length,
      humanizedLength: humanizedText.length,
      changesCount: changes.length,
    });

    return {
      originalText,
      humanizedText,
      style,
      changes: Array.from(new Set(changes)).slice(0, 20),
      readability: {
        original: getReadabilityDescription(originalMetrics),
        humanized: getReadabilityDescription(humanizedMetrics),
      },
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ProcessingError(
      `Failed to humanize text: ${error instanceof Error ? error.message : "Unknown error"}`,
      request.text
    );
  }
}