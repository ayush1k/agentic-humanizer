export const commonReplacements = [
  { pattern: /\bin order to\b/gi, replacement: "to", context: "formal" },
  { pattern: /\bdue to the fact that\b/gi, replacement: "because", context: "formal" },
  { pattern: /\bthe fact that\b/gi, replacement: "that", context: "formal" },
  { pattern: /\bmoreover\b/gi, replacement: "also", context: "formal" },
  { pattern: /\bfurthermore\b/gi, replacement: "also", context: "formal" },
  { pattern: /\btherefore\b/gi, replacement: "so", context: "formal" },
  { pattern: /\bthus\b/gi, replacement: "so", context: "formal" },
  { pattern: /\butilize\b/gi, replacement: "use", context: "formal" },
  { pattern: /\bleverage\b/gi, replacement: "use", context: "business" },
  { pattern: /\bcommence\b/gi, replacement: "start", context: "formal" },
  { pattern: /\bendeavor\b/gi, replacement: "try", context: "formal" },
  { pattern: /\bapproximately\b/gi, replacement: "about", context: "formal" },
  { pattern: /\bindividuals\b/gi, replacement: "people", context: "formal" },
  { pattern: /\boptimal\b/gi, replacement: "best", context: "technical" },
  { pattern: /\boptimize\b/gi, replacement: "improve", context: "technical" },
  { pattern: /\bsubsequently\b/gi, replacement: "then", context: "formal" },
  { pattern: /\binitially\b/gi, replacement: "at first", context: "formal" },
  { pattern: /\bas a result\b/gi, replacement: "so", context: "formal" },
  { pattern: /\bin addition\b/gi, replacement: "also", context: "formal" },
  { pattern: /\bfor example\b/gi, replacement: "for instance", context: "formal" },
  { pattern: /\bit is important to note that\b/gi, replacement: "note that", context: "formal" },
  { pattern: /\bit should be noted that\b/gi, replacement: "note that", context: "formal" },
  { pattern: /\bnotably\b/gi, replacement: "also", context: "formal" },
  { pattern: /\bconsequently\b/gi, replacement: "so", context: "formal" },
  { pattern: /\bultimately\b/gi, replacement: "finally", context: "formal" },
];

export const aiClichePatterns = [
  { pattern: /\bdelve into\b/gi, replacement: "look at", context: "formal" },
  { pattern: /\ba tapestry of\b/gi, replacement: "a mix of", context: "creative" },
  { pattern: /\ba comprehensive guide\b/gi, replacement: "a full guide", context: "formal" },
  { pattern: /\bmultifaceted\b/gi, replacement: "complex", context: "formal" },
  { pattern: /\bin the ever-evolving landscape\b/gi, replacement: "in the changing world", context: "business" },
  { pattern: /\btestament to\b/gi, replacement: "proof of", context: "formal" },
  { pattern: /\bunleash\b/gi, replacement: "use", context: "creative" },
  { pattern: /\bpivotal\b/gi, replacement: "key", context: "formal" },
  { pattern: /\bit is essential to\b/gi, replacement: "we should", context: "formal" },
  { pattern: /\bfoster\b/gi, replacement: "build", context: "formal" },
  { pattern: /\benhance\b/gi, replacement: "improve", context: "formal" },
  { pattern: /\bstreamline\b/gi, replacement: "simplify", context: "business" },
  { pattern: /\btransformative\b/gi, replacement: "major", context: "formal" },
  { pattern: /\binnovative\b/gi, replacement: "new", context: "business" },
  { pattern: /\brobust\b/gi, replacement: "strong", context: "technical" },
  { pattern: /\bempower\b/gi, replacement: "help", context: "formal" },
  { pattern: /\bjourney\b/gi, replacement: "process", context: "creative" },
  { pattern: /\bseamless\b/gi, replacement: "easy", context: "technical" },
  { pattern: /\bunlock\b/gi, replacement: "start using", context: "creative" },
  { pattern: /\bshed light on\b/gi, replacement: "explain", context: "formal" },
  { pattern: /\bbridge the gap\b/gi, replacement: "connect", context: "formal" },
  { pattern: /\bat the forefront of\b/gi, replacement: "leading", context: "business" },
  { pattern: /\benvision\b/gi, replacement: "imagine", context: "creative" },
  { pattern: /\bmeticulous\b/gi, replacement: "careful", context: "formal" },
  { pattern: /\bparadigm shift\b/gi, replacement: "big change", context: "business" },
];

export const casualContractions = [
  { pattern: /\bdo not\b/gi, replacement: "don't", context: "casual" },
  { pattern: /\bcannot\b/gi, replacement: "can't", context: "casual" },
  { pattern: /\bwill not\b/gi, replacement: "won't", context: "casual" },
  { pattern: /\bis not\b/gi, replacement: "isn't", context: "casual" },
  { pattern: /\bare not\b/gi, replacement: "aren't", context: "casual" },
  { pattern: /\bdoes not\b/gi, replacement: "doesn't", context: "casual" },
  { pattern: /\bdid not\b/gi, replacement: "didn't", context: "casual" },
  { pattern: /\bit is\b/gi, replacement: "it's", context: "casual" },
  { pattern: /\bthat is\b/gi, replacement: "that's", context: "casual" },
  { pattern: /\bthere is\b/gi, replacement: "there's", context: "casual" },
  { pattern: /\bwe are\b/gi, replacement: "we're", context: "casual" },
  { pattern: /\byou are\b/gi, replacement: "you're", context: "casual" },
  { pattern: /\bthey are\b/gi, replacement: "they're", context: "casual" },
  { pattern: /\bi am\b/gi, replacement: "I'm", context: "casual" },
];

export const openerReplacements = [
  { pattern: /^Additionally,\s*/i, replacement: "Also, ", context: "formal" },
  { pattern: /^Moreover,\s*/i, replacement: "Also, ", context: "formal" },
  { pattern: /^However,\s*/i, replacement: "But, ", context: "formal" },
  { pattern: /^Therefore,\s*/i, replacement: "So, ", context: "formal" },
  { pattern: /^In addition,\s*/i, replacement: "Also, ", context: "formal" },
  { pattern: /^For example,\s*/i, replacement: "For instance, ", context: "formal" },
  { pattern: /^As a result,\s*/i, replacement: "So, ", context: "formal" },
];

export const businessPatterns = [
  { pattern: /\bsynergy\b/gi, replacement: "collaboration", context: "business" },
  { pattern: /\bleverage\b/gi, replacement: "use", context: "business" },
  { pattern: /\bparadigm shift\b/gi, replacement: "major change", context: "business" },
  { pattern: /\bthink outside the box\b/gi, replacement: "think creatively", context: "business" },
  { pattern: /\bmove the needle\b/gi, replacement: "make progress", context: "business" },
  { pattern: /\bcircle back\b/gi, replacement: "follow up", context: "business" },
  { pattern: /\btouch base\b/gi, replacement: "talk", context: "business" },
  { pattern: /\band so forth\b/gi, replacement: "etc.", context: "business" },
  { pattern: /\bat the end of the day\b/gi, replacement: "ultimately", context: "business" },
  { pattern: /\bgoing forward\b/gi, replacement: "in the future", context: "business" },
];

export const technicalPatterns = [
  { pattern: /\bimplement\b/gi, replacement: "add", context: "technical" },
  { pattern: /\butilize\b/gi, replacement: "use", context: "technical" },
  { pattern: /\bmethodology\b/gi, replacement: "method", context: "technical" },
  { pattern: /\bfunctionality\b/gi, replacement: "feature", context: "technical" },
  { pattern: /\barchitect\b/gi, replacement: "design", context: "technical" },
  { pattern: /\boptimize\b/gi, replacement: "improve", context: "technical" },
  { pattern: /\bexecute\b/gi, replacement: "run", context: "technical" },
  { pattern: /\binitiate\b/gi, replacement: "start", context: "technical" },
  { pattern: /\bterminate\b/gi, replacement: "end", context: "technical" },
  { pattern: /\bfacilitate\b/gi, replacement: "help", context: "technical" },
];

export const academicPatterns = [
  { pattern: /\belucidate\b/gi, replacement: "explain", context: "formal" },
  { pattern: /\bdemonstrate\b/gi, replacement: "show", context: "formal" },
  { pattern: /\bexhibit\b/gi, replacement: "show", context: "formal" },
  { pattern: /\bmanifest\b/gi, replacement: "show", context: "formal" },
  { pattern: /\bconstitute\b/gi, replacement: "form", context: "formal" },
  { pattern: /\bcomprise\b/gi, replacement: "include", context: "formal" },
  { pattern: /\bpertaining to\b/gi, replacement: "about", context: "formal" },
  { pattern: /\bwith regard to\b/gi, replacement: "about", context: "formal" },
  { pattern: /\bconcerning\b/gi, replacement: "about", context: "formal" },
  { pattern: /\bnotwithstanding\b/gi, replacement: "despite", context: "formal" },
];

export const creativePatterns = [
  { pattern: /\bvery\b/gi, replacement: "", context: "creative" },
  { pattern: /\breally\b/gi, replacement: "", context: "creative" },
  { pattern: /\bquite\b/gi, replacement: "", context: "creative" },
  { pattern: /\bsomewhat\b/gi, replacement: "", context: "creative" },
  { pattern: /\bextremely\b/gi, replacement: "", context: "creative" },
  { pattern: /\babsolutely\b/gi, replacement: "", context: "creative" },
  { pattern: /\bcompletely\b/gi, replacement: "", context: "creative" },
  { pattern: /\butterly\b/gi, replacement: "", context: "creative" },
  { pattern: /\btruly\b/gi, replacement: "", context: "creative" },
  { pattern: /\bhighly\b/gi, replacement: "", context: "creative" },
];

export const fillerPatterns = [
  /\bvery very\b/gi,
  /\breally really\b/gi,
  /\bquite quite\b/gi,
  /\bso so\b/gi,
];

export function getPatternsForStyle(style) {
  const patterns = [
    ...commonReplacements, 
    ...openerReplacements,
    ...aiClichePatterns
  ];

  if (style === "casual") {
    patterns.push(...casualContractions);
  }

  if (style === "business" || style === "professional") {
    patterns.push(...businessPatterns);
  }

  if (style === "technical") {
    patterns.push(...technicalPatterns);
  }

  if (style === "creative") {
    patterns.push(...creativePatterns);
  }

  patterns.push(...academicPatterns);

  return patterns;
}
