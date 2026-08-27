import type { AnalysisResult, Priority } from "../types";
import { runResumeChecks } from "./checks";
import { matchKeywords } from "./keywords";
import { compareSkills } from "./skills";
import { wordCount } from "./normalize";

function buildPriorities(
  result: Omit<AnalysisResult, "priorities">,
): Priority[] {
  const priorities: Priority[] = [];
  const technicalSkills = result.missingSkills
    .filter((skill) => skill.category === "technical")
    .slice(0, 4);

  if (technicalSkills.length > 0) {
    priorities.push({
      title: `Verify the highest-priority skill gaps: ${technicalSkills.map((skill) => skill.name).join(", ")}`,
      detail:
        "Add them only if they truthfully reflect your experience; otherwise, use the gaps to assess role fit.",
    });
  }

  if (result.missingKeywords.length > 0) {
    const terms = result.missingKeywords
      .slice(0, 4)
      .map((keyword) => keyword.term);
    priorities.push({
      title: `Strengthen relevant evidence for: ${terms.join(", ")}`,
      detail:
        "Mirror the employer’s language naturally when it accurately describes work you have done.",
    });
  }

  const topFinding = result.findings.find(
    (finding) => finding.severity === "high" || finding.severity === "medium",
  );
  if (topFinding) {
    priorities.push({
      title: topFinding.title,
      detail: topFinding.suggestion,
    });
  }

  if (priorities.length < 3) {
    priorities.push({
      title: "Lead with the most relevant outcomes",
      detail:
        "Put the accomplishments most closely related to this role near the top of each relevant position.",
    });
  }

  return priorities.slice(0, 3);
}

export function analyzeResume(
  resume: string,
  jobDescription: string,
): AnalysisResult {
  const keywords = matchKeywords(resume, jobDescription);
  const skills = compareSkills(resume, jobDescription);
  const findings = runResumeChecks(resume);
  const requestedSkillCount =
    skills.matchedSkills.length + skills.missingSkills.length;
  const skillScore =
    requestedSkillCount === 0
      ? keywords.score
      : Math.round((skills.matchedSkills.length / requestedSkillCount) * 100);
  const score =
    requestedSkillCount === 0
      ? keywords.score
      : Math.round(keywords.score * 0.72 + skillScore * 0.28);

  const resultWithoutPriorities: Omit<AnalysisResult, "priorities"> = {
    score,
    keywordScore: keywords.score,
    matchedKeywords: keywords.matched,
    missingKeywords: keywords.missing,
    matchedSkills: skills.matchedSkills,
    missingSkills: skills.missingSkills,
    resumeSkills: skills.resumeSkills,
    findings,
    stats: {
      resumeWords: wordCount(resume),
      jobWords: wordCount(jobDescription),
      analyzedKeywords: keywords.matched.length + keywords.missing.length,
    },
  };

  return {
    ...resultWithoutPriorities,
    priorities: buildPriorities(resultWithoutPriorities),
  };
}
