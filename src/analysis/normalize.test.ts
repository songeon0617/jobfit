import { describe, expect, it } from "vitest";
import { normalizeText, stemToken, tokenize, wordCount } from "./normalize";

describe("text normalization", () => {
  it("normalizes whitespace, line endings, unicode punctuation, and casing during tokenization", () => {
    expect(normalizeText("Hello\r\n  “world”\t— test")).toBe(
      "Hello\n “world” - test",
    );
    expect(tokenize("React, REACT! Node.js; C++")).toEqual([
      "react",
      "react",
      "node.js",
      "c++",
    ]);
  });

  it("handles empty text and punctuation-only text", () => {
    expect(tokenize("")).toEqual([]);
    expect(tokenize("... — !!!")).toEqual([]);
    expect(wordCount("")).toBe(0);
  });

  it("reduces common word variants to a comparable stem", () => {
    expect(stemToken("developed")).toBe("develop");
    expect(stemToken("developing")).toBe("develop");
    expect(stemToken("technologies")).toBe("technology");
  });
});
