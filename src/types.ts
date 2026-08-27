export type FindingSeverity = "high" | "medium" | "low" | "positive";

export type FindingCategory = "language" | "readability" | "structure";

export interface KeywordResult {
  term: string;
  count: number;
  weight: number;
  matched: boolean;
}

export interface SkillDefinition {
  name: string;
  aliases: readonly string[];
  category: "technical" | "professional";
  caseSensitive?: boolean;
}

export interface DetectedSkill {
  name: string;
  category: SkillDefinition["category"];
}

export interface ResumeFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  evidence: string;
  suggestion: string;
}

export interface Priority {
  title: string;
  detail: string;
}

export interface AnalysisResult {
  score: number;
  keywordScore: number;
  matchedKeywords: KeywordResult[];
  missingKeywords: KeywordResult[];
  matchedSkills: DetectedSkill[];
  missingSkills: DetectedSkill[];
  resumeSkills: DetectedSkill[];
  findings: ResumeFinding[];
  priorities: Priority[];
  stats: {
    resumeWords: number;
    jobWords: number;
    analyzedKeywords: number;
  };
}
