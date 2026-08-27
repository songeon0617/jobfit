interface ScoreGaugeProps {
  score: number;
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong alignment";
  if (score >= 60) return "Good foundation";
  if (score >= 40) return "Some alignment";
  return "Needs tailoring";
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="score-gauge"
      aria-label={`JOBFIT match score: ${score} out of 100, ${scoreLabel(score)}`}
    >
      <svg viewBox="0 0 128 128" role="img" aria-hidden="true">
        <circle className="score-gauge__track" cx="64" cy="64" r={radius} />
        <circle
          className="score-gauge__value"
          cx="64"
          cy="64"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-gauge__content">
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
      <p>{scoreLabel(score)}</p>
    </div>
  );
}
