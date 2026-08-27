import { describe, expect, it } from "vitest";
import { extractKeywords, matchKeywords } from "./keywords";

describe("keyword extraction and matching", () => {
  it("ignores common filler, punctuation, numbers, and duplicate variants", () => {
    const keywords = extractKeywords(
      "The ideal candidate will work with the team. React! React, APIs. 2025.",
    );
    expect(keywords.map((keyword) => keyword.term)).toEqual(
      expect.arrayContaining(["react", "apis"]),
    );
    expect(keywords.map((keyword) => keyword.term)).not.toEqual(
      expect.arrayContaining(["the", "candidate", "2025"]),
    );
    expect(keywords.find((keyword) => keyword.term === "react")?.count).toBe(2);
  });

  it("weights repeated and technical terms above one-off generic terms", () => {
    const keywords = extractKeywords("React React React architecture planning");
    expect(keywords[0]?.term).toBe("react");
    expect(keywords[0]?.weight).toBeGreaterThan(keywords.at(-1)?.weight ?? 0);
  });

  it("matches case-insensitively and recognizes simple word variants", () => {
    const result = matchKeywords(
      "DEVELOPING React applications",
      "Developed scalable React systems",
    );
    expect(result.matched.map((keyword) => keyword.term)).toEqual(
      expect.arrayContaining(["developed", "react"]),
    );
    expect(result.missing.map((keyword) => keyword.term)).toContain("scalable");
  });

  it("returns deterministic empty results for empty job text", () => {
    expect(matchKeywords("React developer", "")).toEqual({
      score: 0,
      matched: [],
      missing: [],
    });
  });
});
