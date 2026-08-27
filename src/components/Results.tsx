import type {
  AnalysisResult,
  DetectedSkill,
  FindingSeverity,
  KeywordResult,
} from "../types";
import { CheckIcon, WarningIcon } from "./Icons";
import { ScoreGauge } from "./ScoreGauge";

interface ResultsProps {
  result: AnalysisResult;
}

function plural(
  count: number,
  singular: string,
  pluralForm = `${singular}s`,
): string {
  return count === 1 ? singular : pluralForm;
}

function KeywordList({
  keywords,
  tone,
}: {
  keywords: KeywordResult[];
  tone: "matched" | "missing";
}) {
  if (keywords.length === 0) {
    return <p className="empty-state">None detected in this comparison.</p>;
  }

  return (
    <ul className="chip-list" aria-label={`${tone} keywords`}>
      {keywords.map((keyword) => (
        <li className={`chip chip--${tone}`} key={keyword.term}>
          {tone === "matched" && <CheckIcon />}
          {keyword.term}
          {keyword.count > 1 && <span>{keyword.count}× in job</span>}
        </li>
      ))}
    </ul>
  );
}

function SkillList({
  skills,
  tone,
}: {
  skills: DetectedSkill[];
  tone: "matched" | "missing";
}) {
  if (skills.length === 0) return <p className="empty-state">None detected.</p>;

  return (
    <ul className="skill-list">
      {skills.map((skill) => (
        <li key={skill.name}>
          <span
            className={`status-dot status-dot--${tone}`}
            aria-hidden="true"
          />
          <span>{skill.name}</span>
          <small>{skill.category}</small>
        </li>
      ))}
    </ul>
  );
}

const severityLabel: Record<FindingSeverity, string> = {
  high: "Priority",
  medium: "Review",
  low: "Consider",
  positive: "Looking good",
};

export function Results({ result }: ResultsProps) {
  const issueFindings = result.findings.filter(
    (finding) => finding.severity !== "positive",
  );
  const positiveFindings = result.findings.filter(
    (finding) => finding.severity === "positive",
  );

  return (
    <section className="results" aria-labelledby="results-title" tabIndex={-1}>
      <div className="results__heading">
        <div>
          <p className="section-kicker">Your analysis</p>
          <h2 id="results-title">Where your resume stands</h2>
          <p className="results__intro">
            A practical snapshot based on the text you provided—not an official
            ATS score.
          </p>
        </div>
        <div className="analysis-meta">
          <span>{result.stats.resumeWords.toLocaleString()} resume words</span>
          <span>{result.stats.jobWords.toLocaleString()} job words</span>
        </div>
      </div>

      <div className="summary-panel">
        <ScoreGauge score={result.score} />
        <div className="summary-panel__metrics">
          <div>
            <strong>{result.keywordScore}%</strong>
            <span>weighted keyword coverage</span>
          </div>
          <div>
            <strong>{result.matchedKeywords.length}</strong>
            <span>
              matched {plural(result.matchedKeywords.length, "keyword")}
            </span>
          </div>
          <div>
            <strong>{result.missingKeywords.length}</strong>
            <span>
              missing {plural(result.missingKeywords.length, "keyword")}
            </span>
          </div>
          <div>
            <strong>{result.matchedSkills.length}</strong>
            <span>matched {plural(result.matchedSkills.length, "skill")}</span>
          </div>
        </div>
        <div className="method-note">
          <strong>How this is calculated</strong>
          <p>
            The JOBFIT score combines weighted job-description keyword coverage
            (72%) with detected requested skills (28%). Repeated and more
            specific terms carry modestly more weight.
          </p>
        </div>
      </div>

      <div className="results-grid">
        <article className="result-card result-card--wide">
          <div className="result-card__header">
            <div>
              <span className="result-card__number">01</span>
              <h3>Keyword coverage</h3>
            </div>
            <span className="count-badge">
              {result.stats.analyzedKeywords} analyzed
            </span>
          </div>
          <div className="keyword-columns">
            <div>
              <h4>Missing, highest priority first</h4>
              <p>
                Use these terms only where they accurately describe your
                background.
              </p>
              <KeywordList keywords={result.missingKeywords} tone="missing" />
            </div>
            <div>
              <h4>Already represented</h4>
              <p>These relevant terms appear in both texts.</p>
              <KeywordList keywords={result.matchedKeywords} tone="matched" />
            </div>
          </div>
        </article>

        <article className="result-card">
          <div className="result-card__header">
            <div>
              <span className="result-card__number">02</span>
              <h3>Skills</h3>
            </div>
          </div>
          <div className="skill-columns">
            <div>
              <h4>Matched</h4>
              <SkillList skills={result.matchedSkills} tone="matched" />
            </div>
            <div>
              <h4>Requested, not found</h4>
              <SkillList skills={result.missingSkills} tone="missing" />
            </div>
          </div>
        </article>

        <article className="result-card">
          <div className="result-card__header">
            <div>
              <span className="result-card__number">03</span>
              <h3>Recommended priorities</h3>
            </div>
          </div>
          <ol className="priority-list">
            {result.priorities.map((priority, index) => (
              <li key={priority.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{priority.title}</strong>
                  <p>{priority.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="result-card result-card--wide">
          <div className="result-card__header">
            <div>
              <span className="result-card__number">04</span>
              <h3>Resume improvement findings</h3>
            </div>
            <span className="count-badge">
              {issueFindings.length} to review
            </span>
          </div>
          <p className="card-description">
            Explainable language, structure, and readability checks. These are
            guidelines, not absolute rules.
          </p>
          {issueFindings.length === 0 ? (
            <div className="all-clear">
              <CheckIcon /> No notable issues were detected by these checks.
            </div>
          ) : (
            <div className="finding-list">
              {issueFindings.map((finding) => (
                <div className="finding" key={finding.id}>
                  <div
                    className={`finding__icon finding__icon--${finding.severity}`}
                  >
                    <WarningIcon />
                  </div>
                  <div>
                    <span className={`severity severity--${finding.severity}`}>
                      {severityLabel[finding.severity]}
                    </span>
                    <h4>{finding.title}</h4>
                    <p>{finding.evidence}</p>
                    <p className="finding__suggestion">
                      <strong>Try:</strong> {finding.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {positiveFindings.map((finding) => (
            <div className="positive-note" key={finding.id}>
              <CheckIcon />
              <div>
                <strong>{finding.title}</strong>
                <p>{finding.evidence}</p>
              </div>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
