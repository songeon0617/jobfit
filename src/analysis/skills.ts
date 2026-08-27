import type { DetectedSkill, SkillDefinition } from "../types";
import { normalizeText } from "./normalize";

export const SKILLS: readonly SkillDefinition[] = [
  {
    name: "JavaScript",
    aliases: ["javascript", "js", "ecmascript"],
    category: "technical",
  },
  { name: "TypeScript", aliases: ["typescript", "ts"], category: "technical" },
  {
    name: "React",
    aliases: ["react", "react.js", "reactjs"],
    category: "technical",
  },
  {
    name: "Angular",
    aliases: ["angular", "angular.js"],
    category: "technical",
  },
  { name: "Vue", aliases: ["vue", "vue.js", "vuejs"], category: "technical" },
  {
    name: "Node.js",
    aliases: ["node.js", "nodejs", "node"],
    category: "technical",
  },
  { name: "Python", aliases: ["python"], category: "technical" },
  { name: "Java", aliases: ["java"], category: "technical" },
  { name: "C", aliases: ["C"], category: "technical", caseSensitive: true },
  { name: "C++", aliases: ["c++", "cpp"], category: "technical" },
  { name: "C#", aliases: ["c#", "csharp"], category: "technical" },
  { name: "Go", aliases: ["golang"], category: "technical" },
  { name: "Ruby", aliases: ["ruby"], category: "technical" },
  { name: "PHP", aliases: ["php"], category: "technical" },
  { name: "SQL", aliases: ["sql"], category: "technical" },
  {
    name: "PostgreSQL",
    aliases: ["postgresql", "postgres"],
    category: "technical",
  },
  { name: "MySQL", aliases: ["mysql"], category: "technical" },
  { name: "MongoDB", aliases: ["mongodb", "mongo"], category: "technical" },
  { name: "Git", aliases: ["git"], category: "technical" },
  {
    name: "AWS",
    aliases: ["aws", "amazon web services"],
    category: "technical",
  },
  {
    name: "Azure",
    aliases: ["azure", "microsoft azure"],
    category: "technical",
  },
  {
    name: "Google Cloud",
    aliases: ["google cloud", "gcp"],
    category: "technical",
  },
  {
    name: "Docker",
    aliases: ["docker", "containerization"],
    category: "technical",
  },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"], category: "technical" },
  { name: "Linux", aliases: ["linux"], category: "technical" },
  {
    name: "REST APIs",
    aliases: [
      "rest api",
      "rest apis",
      "restful api",
      "restful apis",
      "restful services",
      "rest",
    ],
    category: "technical",
  },
  { name: "GraphQL", aliases: ["graphql"], category: "technical" },
  {
    name: "CI/CD",
    aliases: ["ci/cd", "continuous integration", "continuous delivery"],
    category: "technical",
  },
  { name: "Terraform", aliases: ["terraform"], category: "technical" },
  { name: "Jenkins", aliases: ["jenkins"], category: "technical" },
  { name: "Agile", aliases: ["agile", "scrum"], category: "professional" },
  {
    name: "Communication",
    aliases: ["communication", "communicating"],
    category: "professional",
  },
  {
    name: "Leadership",
    aliases: ["leadership", "team leadership"],
    category: "professional",
  },
  {
    name: "Project management",
    aliases: ["project management", "project manager"],
    category: "professional",
  },
  {
    name: "Stakeholder management",
    aliases: ["stakeholder management", "stakeholder communication"],
    category: "professional",
  },
  {
    name: "Problem solving",
    aliases: ["problem solving", "problem-solving"],
    category: "professional",
  },
  {
    name: "Mentoring",
    aliases: ["mentoring", "mentorship", "mentor", "mentored", "mentors"],
    category: "professional",
  },
  {
    name: "Data analysis",
    aliases: ["data analysis", "data analytics"],
    category: "professional",
  },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsAlias(
  text: string,
  alias: string,
  caseSensitive: boolean,
): boolean {
  const escaped = escapeRegExp(alias).replace(/\\ /g, "\\s+");
  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}+#])${escaped}(?=$|[^\\p{L}\\p{N}+#])`,
    `u${caseSensitive ? "" : "i"}`,
  );
  return pattern.test(text);
}

export function extractSkills(text: string): DetectedSkill[] {
  const normalized = normalizeText(text);

  return SKILLS.filter((skill) =>
    skill.aliases.some((alias) =>
      containsAlias(normalized, alias, skill.caseSensitive ?? false),
    ),
  ).map(({ name, category }) => ({ name, category }));
}

export function compareSkills(
  resume: string,
  jobDescription: string,
): {
  resumeSkills: DetectedSkill[];
  matchedSkills: DetectedSkill[];
  missingSkills: DetectedSkill[];
} {
  const resumeSkills = extractSkills(resume);
  const jobSkills = extractSkills(jobDescription);
  const resumeNames = new Set(resumeSkills.map((skill) => skill.name));

  return {
    resumeSkills,
    matchedSkills: jobSkills.filter((skill) => resumeNames.has(skill.name)),
    missingSkills: jobSkills.filter((skill) => !resumeNames.has(skill.name)),
  };
}
