import { describe, expect, it } from "vitest";
import { runResumeChecks } from "./checks";

describe("resume heuristic checks", () => {
  it("returns no findings for empty input", () => {
    expect(runResumeChecks("")).toEqual([]);
  });

  it("produces concrete findings for weak, vague, and repeated language", () => {
    const resume = `Taylor Kim\ntaylor@example.com\n\nEXPERIENCE\nWorked on analytics. Worked on reporting. Developed tools. Developed dashboards. Developed APIs.\nI am a results-driven team player who helped with various projects.\n\nSKILLS\nSQL\n\nEDUCATION\nB.S. Computer Science`;
    const findings = runResumeChecks(resume);
    expect(findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining([
        "weak-language",
        "repeated-action-verb",
        "vague-claims",
      ]),
    );
    expect(
      findings.find((finding) => finding.id === "repeated-action-verb")?.title,
    ).toContain("3 times");
  });

  it("detects section and contact signals without claiming certainty", () => {
    const complete = `Alex Smith\nalex@example.com\n(555) 555-0100\n\nEXPERIENCE\nBuilt systems.\n\nSKILLS\nPython\n\nEDUCATION\nB.S.`;
    const findings = runResumeChecks(complete);
    expect(
      findings.find((finding) => finding.id === "section-headings-positive"),
    ).toBeDefined();
    expect(
      findings.find((finding) => finding.id === "contact-info"),
    ).toBeUndefined();
  });
});
