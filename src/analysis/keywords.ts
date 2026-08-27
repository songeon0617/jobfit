import type { KeywordResult } from "../types";
import { cleanToken, stemToken, tokenize } from "./normalize";
import { SKILLS } from "./skills";
import { STOP_WORDS } from "./stopWords";

const MAX_KEYWORDS = 24;
const skillTerms = new Set(
  SKILLS.flatMap((skill) => skill.aliases.flatMap((alias) => tokenize(alias))),
);

function isMeaningful(token: string): boolean {
  if (!token || STOP_WORDS.has(token)) return false;
  if (/^\d+$/.test(token)) return false;
  if (token.length < 3 && !["go", "c#"].includes(token)) return false;
  return /[a-z]/.test(token);
}

export function extractKeywords(
  text: string,
  limit = MAX_KEYWORDS,
): KeywordResult[] {
  const groups = new Map<
    string,
    { variants: Map<string, number>; count: number }
  >();

  for (const rawToken of tokenize(text)) {
    const token = cleanToken(rawToken);
    if (!isMeaningful(token)) continue;

    const stem = stemToken(token);
    const current = groups.get(stem) ?? { variants: new Map(), count: 0 };
    current.count += 1;
    current.variants.set(token, (current.variants.get(token) ?? 0) + 1);
    groups.set(stem, current);
  }

  return [...groups.entries()]
    .map(([stem, group]) => {
      const term =
        [...group.variants.entries()].sort(
          (a, b) =>
            b[1] - a[1] ||
            b[0].length - a[0].length ||
            a[0].localeCompare(b[0]),
        )[0]?.[0] ?? stem;
      const technicalBonus = skillTerms.has(term) ? 0.65 : 0;
      const specificityBonus = Math.min(
        Math.max(term.length - 6, 0) * 0.04,
        0.35,
      );
      return {
        term,
        count: group.count,
        weight: Number(
          (
            1 +
            Math.log2(group.count) +
            technicalBonus +
            specificityBonus
          ).toFixed(3),
        ),
        matched: false,
      };
    })
    .sort(
      (a, b) =>
        b.weight - a.weight ||
        b.count - a.count ||
        a.term.localeCompare(b.term),
    )
    .slice(0, limit);
}

export function matchKeywords(
  resume: string,
  jobDescription: string,
): {
  score: number;
  matched: KeywordResult[];
  missing: KeywordResult[];
} {
  const keywords = extractKeywords(jobDescription);
  const resumeStems = new Set(tokenize(resume).map(stemToken));
  const evaluated = keywords.map((keyword) => ({
    ...keyword,
    matched: resumeStems.has(stemToken(keyword.term)),
  }));
  const totalWeight = evaluated.reduce(
    (sum, keyword) => sum + keyword.weight,
    0,
  );
  const matchedWeight = evaluated
    .filter((keyword) => keyword.matched)
    .reduce((sum, keyword) => sum + keyword.weight, 0);

  return {
    score:
      totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100),
    matched: evaluated.filter((keyword) => keyword.matched),
    missing: evaluated.filter((keyword) => !keyword.matched),
  };
}
