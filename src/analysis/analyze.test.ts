import { describe, expect, it } from "vitest";
import { analyzeResume } from "./analyze";

describe("representative resume-to-job analysis", () => {
  it("returns a stable summary, gaps, skills, findings, and ranked priorities", () => {
    const resume = `Morgan Chen\nmorgan@example.com\n\nEXPERIENCE\nDeveloped React applications with JavaScript and REST APIs. Improved performance by 30%.\n\nSKILLS\nJavaScript, React, Git, REST\n\nEDUCATION\nB.S. Software Engineering`;
    const job = `Build React and TypeScript applications. Design GraphQL APIs. Use AWS, Docker, and Git. Strong communication and leadership are important. React experience required.`;
    const result = analyzeResume(resume, job);

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
    expect(result.keywordScore).toBeGreaterThan(0);
    expect(result.matchedSkills.map((skill) => skill.name)).toEqual(
      expect.arrayContaining(["React", "Git"]),
    );
    expect(result.missingSkills.map((skill) => skill.name)).toEqual(
      expect.arrayContaining([
        "TypeScript",
        "GraphQL",
        "AWS",
        "Docker",
        "Communication",
        "Leadership",
      ]),
    );
    expect(result.priorities).toHaveLength(3);
    expect(result.priorities[0]?.detail.toLowerCase()).toContain("truth");
  });

  it("handles empty inputs without throwing or producing NaN", () => {
    const result = analyzeResume("", "");
    expect(result.score).toBe(0);
    expect(result.keywordScore).toBe(0);
    expect(result.matchedKeywords).toEqual([]);
    expect(result.missingKeywords).toEqual([]);
    expect(result.findings).toEqual([]);
  });

  it("does not double-count duplicate requested skills", () => {
    const result = analyzeResume("React", "React React REACT");
    expect(result.matchedSkills.map((skill) => skill.name)).toEqual(["React"]);
    expect(result.missingSkills).toEqual([]);
  });
});
