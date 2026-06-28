/**
 * Profiler Agent Node (Vanilla JS + Hugging Face Integration).
 * 
 * Uses LangChain's HuggingFaceInference model (Qwen/Qwen2.5-7B-Instruct) 
 * to profile input text for AI patterns and generate a directive.
 */

import { HuggingFaceInference } from "@langchain/community/llms/hf";

// Retrieve the token from environment variables
const apiKey = process.env.HUGGINGFACEHUB_API_TOKEN;

/**
 * Profiler node function.
 * 
 * @param {Object} state - Plain JS state object
 * @returns {Promise<Object>} State updates (directive)
 */
export async function profilerNode(state) {
  const { rawText } = state;

  if (!rawText) {
    throw new Error("Profiler Node: state.rawText is required.");
  }

  console.log("[Profiler Agent] Profiling text style using Qwen/Qwen2.5-7B-Instruct...");

  const prompt = `Analyze the following text for robotic, predictable, or AI-generated writing traits (such as clichés like 'delve', 'moreover', overly formal transitions, or passive voice). Generate a short, actionable editing directive to guide a writer in humanizing this text. Do not output anything other than the directive itself.
  
Text to analyze:
"${rawText}"

Actionable editing directive:`;

  let directive = "";

  if (!apiKey) {
    console.warn("[Profiler Agent] HUGGINGFACEHUB_API_TOKEN is not set. Using local mock profile rules.");
    // Heuristic rule-based fallback (no "Critic feedback" prefix here so that Critic rejects the first pass)
    const hasCliches = /\b(delve|moreover|testament|furthermore|in order to)\b/i.test(rawText);
    directive = hasCliches 
      ? "Please eliminate AI cliches like 'delve', 'moreover', and simplify wordy transitional structures."
      : "Ensure sentence lengths are varied and transitions are fluid and natural.";
  } else {
    try {
      // Instantiate model lazily inside the node to avoid throw on load when apiKey is missing
      const model = new HuggingFaceInference({
        model: "Qwen/Qwen2.5-7B-Instruct",
        apiKey: apiKey,
        temperature: 0.7,
      });

      const response = await model.invoke(prompt);
      directive = response.trim();
    } catch (error) {
      console.error("[Profiler Agent] Hugging Face Inference API call failed:", error.message);
      // Fallback in case of server failure
      directive = "The text contains typical AI-associated transition patterns. Simplify syntax and replace stiff connectors.";
    }
  }

  console.log(`[Profiler Agent] Generated Directive: "${directive}"`);

  return {
    directive: directive
  };
}
