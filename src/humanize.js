import { ValidationError, ProcessingError } from "./errors.js";
import { logger } from "./logger.js";
import { getPatternsForStyle, fillerPatterns } from "./patterns.js";
import {
  calculateReadabilityMetrics,
  getReadabilityDescription,
  splitSentences,
} from "./readability.js";

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function preserveCase(replacement, match) {
  if (match.toUpperCase() === match) {
    return replacement.toUpperCase();
  }

  if (match[0] === match[0]?.toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement;
}

function applyReplacement(text, pattern, replacement, changes) {
  return text.replace(pattern, (match) => {
    const nextValue = preserveCase(replacement, match);
    if (match !== nextValue) {
      changes.push(`${match} -> ${nextValue}`);
    }

    return nextValue;
  });
}

function applyPatternReplacements(text, patterns, changes) {
  return patterns.reduce((currentText, { pattern, replacement }) => {
    return applyReplacement(currentText, pattern, replacement, changes);
  }, text);
}

function collapseRepeats(text) {
  return text
    .replace(/\b(\w+)(\s+\1\b){1,}/gi, "$1")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\s+!/g, "!")
    .replace(/\s+\?/g, "?");
}

function humanizeSentence(sentence, style) {
  let current = sentence.trim();

  if (style !== "formal") {
    const openerPatterns = [
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

function breakLongSentences(text) {
  const sentences = splitSentences(text);
  return sentences.map(sentence => {
    const words = sentence.split(/\s+/);
    if (words.length > 25) {
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

export function humanizeText(request) {
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

    const style = request.style ?? "balanced";
    const originalText = normalizeWhitespace(request.text);
    const changes = [];

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
