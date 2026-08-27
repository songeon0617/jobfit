import { useRef, useState } from "react";
import { analyzeResume } from "./analysis/analyze";
import { InputWorkspace } from "./components/InputWorkspace";
import { LockIcon } from "./components/Icons";
import { Results } from "./components/Results";
import { EXAMPLE_JOB_DESCRIPTION, EXAMPLE_RESUME } from "./data/example";
import type { AnalysisResult } from "./types";

function App() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const resumeRef = useRef<HTMLTextAreaElement>(null);

  function analyze() {
    if (!resume.trim() || !jobDescription.trim()) {
      setError(
        "Paste both your resume and the job description to run a comparison.",
      );
      return;
    }

    setError("");
    setResult(analyzeResume(resume, jobDescription));
    window.setTimeout(() => {
      document
        .querySelector<HTMLElement>(".results")
        ?.focus({ preventScroll: true });
      document
        .querySelector(".results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function reset() {
    setResume("");
    setJobDescription("");
    setResult(null);
    setError("");
    window.setTimeout(() => resumeRef.current?.focus(), 0);
  }

  function loadExample() {
    setResume(EXAMPLE_RESUME);
    setJobDescription(EXAMPLE_JOB_DESCRIPTION);
    setResult(null);
    setError("");
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="JOBFIT home">
          <span className="brand__mark">JF</span>
          <span>JOBFIT</span>
        </a>
        <a className="header-link" href="#workspace">
          Check my resume <span aria-hidden="true">↓</span>
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__eyebrow">
            <span /> Private resume matching, instantly
          </div>
          <h1>
            Your resume.
            <br />
            <em>Better aligned.</em>
          </h1>
          <p className="hero__lede">
            Compare your resume with any job description to surface keyword
            gaps, requested skills, and practical improvements—without uploading
            a thing.
          </p>
          <div className="hero__proof" aria-label="Product benefits">
            <span>
              <strong>01</strong> No sign-up
            </span>
            <span>
              <strong>02</strong> No AI API
            </span>
            <span>
              <strong>03</strong> Immediate results
            </span>
          </div>
        </section>

        <aside className="privacy-banner">
          <div className="privacy-banner__icon">
            <LockIcon />
          </div>
          <div>
            <strong>Your documents stay private</strong>
            <p>
              Your resume and job description are analyzed locally in your
              browser and are not uploaded to our servers.
            </p>
          </div>
          <span className="privacy-banner__status">
            <i /> Local only
          </span>
        </aside>

        <div id="workspace">
          <InputWorkspace
            resume={resume}
            jobDescription={jobDescription}
            error={error}
            resumeRef={resumeRef}
            onResumeChange={(value) => {
              setResume(value);
              setError("");
            }}
            onJobDescriptionChange={(value) => {
              setJobDescription(value);
              setError("");
            }}
            onAnalyze={analyze}
            onReset={reset}
            onExample={loadExample}
          />
        </div>

        {result && <Results result={result} />}
      </main>

      <footer>
        <a className="brand brand--footer" href="#top">
          <span className="brand__mark">JF</span>
          <span>JOBFIT</span>
        </a>
        <p>Private by design. Built for better applications.</p>
        <p className="footer-note">
          Heuristic guidance, not an official ATS score.
        </p>
      </footer>
    </>
  );
}

export default App;
