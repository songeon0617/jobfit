import type { ResumeFinding } from "../types";
import { normalizeText, sentenceWords, tokenize, wordCount } from "./normalize";

const WEAK_PATTERNS = [
  "assisted with",
  "helped with",
  "worked on",
  "participated in",
  "responsible for",
  "tasked with",
  "supported",
] as const;

const VAGUE_PATTERNS = [
  "detail-oriented",
  "excellent communication skills",
  "go-getter",
  "hard-working",
  "hardworking",
  "many",
  "results-driven",
  "several",
  "significant improvement",
  "team player",
  "various",
] as const;

const ACTION_VERBS = [
  "achieved",
  "built",
  "created",
  "delivered",
  "designed",
  "developed",
  "drove",
  "implemented",
  "improved",
  "increased",
  "launched",
  "led",
  "managed",
  "optimized",
  "reduced",
  "shipped",
  "streamlined",
] as const;

function countPhrase(text: string, phrase: string): number {
  const escaped = phrase
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\-/g, "[- ]");
  return [...text.matchAll(new RegExp(`(^|\\W)${escaped}(?=$|\\W)`, "gi"))]
    .length;
}

function repeatedLines(
  text: string,
): { line: string; count: number } | undefined {
  const counts = new Map<string, number>();
  normalizeText(text)
    .split("\n")
    .map((line) => line.replace(/^[•*\-–—\s]+/, "").trim())
    .filter((line) => line.length >= 24)
    .forEach((line) =>
      counts.set(line.toLowerCase(), (counts.get(line.toLowerCase()) ?? 0) + 1),
    );

  const duplicate = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])[0];

  return duplicate ? { line: duplicate[0], count: duplicate[1] } : undefined;
}

function phrasePreview(phrase: string): string {
  return phrase.length > 52 ? `${phrase.slice(0, 49)}…` : phrase;
}

function languageFindings(resume: string): ResumeFinding[] {
  const findings: ResumeFinding[] = [];
  const weakCounts = WEAK_PATTERNS.map((phrase) => ({
    phrase,
    count: countPhrase(resume, phrase),
  }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);
  const weakTotal = weakCounts.reduce((sum, item) => sum + item.count, 0);

  if (weakTotal >= 2) {
    const examples = weakCounts
      .slice(0, 3)
      .map(({ phrase, count }) => `“${phrase}” (${count}×)`);
    findings.push({
      id: "weak-language",
      category: "language",
      severity: weakTotal >= 5 ? "high" : "medium",
      title: "Some experience statements use weak framing",
      evidence: `${weakTotal} potentially weak phrase${weakTotal === 1 ? "" : "s"} found: ${examples.join(", ")}.`,
      suggestion:
        "Where accurate, lead with the action you took and the result you produced.",
    });
  }

  const repeatedVerb = ACTION_VERBS.map((verb) => ({
    verb,
    count: countPhrase(resume, verb),
  }))
    .filter(({ count }) => count >= 3)
    .sort((a, b) => b.count - a.count)[0];

  if (repeatedVerb) {
    findings.push({
      id: "repeated-action-verb",
      category: "language",
      severity: repeatedVerb.count >= 6 ? "medium" : "low",
      title: `“${repeatedVerb.verb[0]?.toUpperCase()}${repeatedVerb.verb.slice(1)}” appears ${repeatedVerb.count} times`,
      evidence:
        "Repeated openings can make otherwise strong accomplishments feel similar.",
      suggestion:
        "Vary the verb where a more precise action—such as launched, optimized, or led—is truthful.",
    });
  }

  const vagueMatches = VAGUE_PATTERNS.map((phrase) => ({
    phrase,
    count: countPhrase(resume, phrase),
  }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);

  if (vagueMatches.length > 0) {
    const examples = vagueMatches
      .slice(0, 3)
      .map(({ phrase }) => `“${phrase}”`);
    findings.push({
      id: "vague-claims",
      category: "language",
      severity: "medium",
      title: "A few claims could be more specific",
      evidence: `Potentially vague wording found: ${examples.join(", ")}.`,
      suggestion:
        "Replace broad claims with a concrete action, scope, outcome, or measured result when available.",
    });
  }

  const sentences = sentenceWords(resume);
  const longSentences = sentences.filter((words) => words.length > 35);
  const longestSentence = Math.max(
    0,
    ...sentences.map((words) => words.length),
  );

  if (longSentences.length > 0) {
    findings.push({
      id: "long-sentences",
      category: "readability",
      severity: longSentences.length >= 3 ? "medium" : "low",
      title: `${longSentences.length} long sentence${longSentences.length === 1 ? "" : "s"} may slow scanning`,
      evidence: `The longest sentence is approximately ${longestSentence} words; this check flags sentences over 35 words.`,
      suggestion:
        "Split long statements or convert distinct accomplishments into concise bullets.",
    });
  }

  return findings;
}

function readabilityFindings(resume: string): ResumeFinding[] {
  const findings: ResumeFinding[] = [];
  const totalWords = wordCount(resume);

  if (totalWords < 180) {
    findings.push({
      id: "resume-short",
      category: "readability",
      severity: totalWords < 100 ? "high" : "medium",
      title: "The resume may be too brief for a full review",
      evidence: `${totalWords} words detected; many professional resumes contain roughly 300–900 words.`,
      suggestion:
        "Check that relevant roles, accomplishments, education, and skills are represented without adding filler.",
    });
  } else if (totalWords > 1_200) {
    findings.push({
      id: "resume-long",
      category: "readability",
      severity: totalWords > 1_600 ? "high" : "medium",
      title: "The resume is unusually long",
      evidence: `${totalWords.toLocaleString()} words detected; dense resumes can be difficult to scan quickly.`,
      suggestion:
        "Prioritize recent, relevant achievements and remove duplicated or low-value detail.",
    });
  }

  const paragraphs = normalizeText(resume)
    .split(/\n\s*\n|\n(?=[A-Z][A-Z &/]{2,}$)/)
    .map((paragraph) => ({ paragraph, words: wordCount(paragraph) }));
  const denseParagraphs = paragraphs.filter(({ words }) => words > 110);
  const densest = Math.max(0, ...paragraphs.map(({ words }) => words));

  if (denseParagraphs.length > 0) {
    findings.push({
      id: "dense-paragraphs",
      category: "readability",
      severity: densest > 180 ? "high" : "medium",
      title: `${denseParagraphs.length} dense text block${denseParagraphs.length === 1 ? "" : "s"} found`,
      evidence: `The largest block is approximately ${densest} words; this check flags blocks over 110 words.`,
      suggestion:
        "Break large blocks into short, outcome-focused bullets with clear visual spacing.",
    });
  }

  const normalizedLength = normalizeText(resume).replace(/\s/g, "").length;
  const specialCharacters = (
    resume.match(/[^\p{L}\p{N}\s.,'’()\-–—/&:+#%@$]/gu) ?? []
  ).length;
  const specialRatio =
    normalizedLength === 0 ? 0 : specialCharacters / normalizedLength;

  if (specialRatio > 0.035) {
    findings.push({
      id: "special-characters",
      category: "readability",
      severity: specialRatio > 0.08 ? "high" : "medium",
      title: "Unusual symbols may affect text readability",
      evidence: `${Math.round(specialRatio * 100)}% of non-space characters are outside common resume punctuation.`,
      suggestion:
        "Use standard bullets and plain-text symbols, especially if the resume came from a designed template.",
    });
  }

  const duplicate = repeatedLines(resume);
  if (duplicate) {
    findings.push({
      id: "duplicate-line",
      category: "readability",
      severity: "medium",
      title: "An identical line appears more than once",
      evidence: `“${phrasePreview(duplicate.line)}” appears ${duplicate.count} times.`,
      suggestion:
        "Remove accidental duplication or make each accomplishment distinct.",
    });
  }

  return findings;
}

function structureFindings(resume: string): ResumeFinding[] {
  const findings: ResumeFinding[] = [];
  const sectionGroups = [
    /(?:^|\n)\s*(?:experience|employment|work history|professional experience)\s*:?(?:\n|$)/i,
    /(?:^|\n)\s*(?:education|academic background)\s*:?(?:\n|$)/i,
    /(?:^|\n)\s*(?:skills|technical skills|core competencies)\s*:?(?:\n|$)/i,
  ];
  const sectionsFound = sectionGroups.filter((pattern) =>
    pattern.test(resume),
  ).length;

  if (sectionsFound < 2) {
    findings.push({
      id: "section-headings",
      category: "structure",
      severity: sectionsFound === 0 ? "high" : "medium",
      title: "Common section headings are hard to identify",
      evidence: `${sectionsFound} of 3 common section types (experience, education, skills) were detected as standalone headings.`,
      suggestion:
        "Use simple, conventional headings so readers can locate key information quickly.",
    });
  } else {
    findings.push({
      id: "section-headings-positive",
      category: "structure",
      severity: "positive",
      title: "Section structure is easy to identify",
      evidence: `${sectionsFound} common resume section types were detected.`,
      suggestion: "Keep headings short and consistent in the final document.",
    });
  }

  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resume);
  const hasPhone = /(?:\+?\d[\d\s().-]{7,}\d)/.test(resume);
  const hasProfessionalLink =
    /(?:linkedin\.com|github\.com|portfolio|https?:\/\/|www\.)/i.test(resume);
  const contactSignals = [hasEmail, hasPhone, hasProfessionalLink].filter(
    Boolean,
  ).length;

  if (contactSignals === 0) {
    findings.push({
      id: "contact-info",
      category: "structure",
      severity: "high",
      title: "No common contact-information indicator was detected",
      evidence:
        "No email address, phone-like number, or professional link was found in the pasted text.",
      suggestion:
        "Confirm the submitted resume includes current contact details in selectable text.",
    });
  } else if (!hasEmail) {
    findings.push({
      id: "email-missing",
      category: "structure",
      severity: "medium",
      title: "No email address was detected",
      evidence: `${contactSignals} other contact indicator${contactSignals === 1 ? " was" : "s were"} found.`,
      suggestion:
        "Confirm a current professional email address appears in the resume text.",
    });
  }

  return findings;
}

export function runResumeChecks(resume: string): ResumeFinding[] {
  if (tokenize(resume).length === 0) return [];

  const severityOrder = { high: 0, medium: 1, low: 2, positive: 3 };
  return [
    ...languageFindings(resume),
    ...readabilityFindings(resume),
    ...structureFindings(resume),
  ].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
