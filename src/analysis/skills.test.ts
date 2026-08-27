import { describe, expect, it } from "vitest";
import { compareSkills, extractSkills } from "./skills";

describe("skills extraction", () => {
  it("detects technical and professional aliases across punctuation and case", () => {
    const skills = extractSkills(
      "Built with REACT, TypeScript, C++, AWS, RESTful APIs and project management.",
    );
    expect(skills.map((skill) => skill.name)).toEqual(
      expect.arrayContaining([
        "React",
        "TypeScript",
        "C++",
        "AWS",
        "REST APIs",
        "Project management",
      ]),
    );
  });

  it("does not mistake substrings or lowercase articles for short skill names", () => {
    const names = extractSkills(
      "I worked as a developer in a collaborative company.",
    ).map((skill) => skill.name);
    expect(names).not.toContain("C");
    expect(names).not.toContain("Go");
  });

  it("separates matched and missing requested skills", () => {
    const result = compareSkills(
      "JavaScript, React, Git, communication",
      "Requires JavaScript, React, TypeScript, Git, Docker, and strong communication.",
    );
    expect(result.matchedSkills.map((skill) => skill.name)).toEqual(
      expect.arrayContaining(["JavaScript", "React", "Git", "Communication"]),
    );
    expect(result.missingSkills.map((skill) => skill.name)).toEqual(
      expect.arrayContaining(["TypeScript", "Docker"]),
    );
  });

  it("recognizes common inflections of professional skills", () => {
    expect(
      extractSkills("Mentored two engineers.").map((skill) => skill.name),
    ).toContain("Mentoring");
  });
});
