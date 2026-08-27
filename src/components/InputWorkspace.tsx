import type { RefObject } from "react";
import { DocumentIcon, ResetIcon, SparkIcon } from "./Icons";

interface InputWorkspaceProps {
  resume: string;
  jobDescription: string;
  error: string;
  resumeRef: RefObject<HTMLTextAreaElement | null>;
  onResumeChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  onAnalyze: () => void;
  onReset: () => void;
  onExample: () => void;
}

interface TextInputProps {
  id: string;
  label: string;
  eyebrow: string;
  value: string;
  placeholder: string;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
}

function TextInput({
  id,
  label,
  eyebrow,
  value,
  placeholder,
  inputRef,
  onChange,
}: TextInputProps) {
  return (
    <div className="text-input">
      <div className="text-input__heading">
        <div>
          <span className="text-input__eyebrow">{eyebrow}</span>
          <label htmlFor={id}>{label}</label>
        </div>
        <span className="character-count" aria-live="polite">
          {value.length.toLocaleString()} characters
        </span>
      </div>
      <textarea
        ref={inputRef}
        id={id}
        value={value}
        placeholder={placeholder}
        spellCheck
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function InputWorkspace({
  resume,
  jobDescription,
  error,
  resumeRef,
  onResumeChange,
  onJobDescriptionChange,
  onAnalyze,
  onReset,
  onExample,
}: InputWorkspaceProps) {
  const hasContent = resume.length > 0 || jobDescription.length > 0;

  return (
    <section className="workspace" aria-labelledby="workspace-title">
      <div className="workspace__header">
        <div>
          <p className="section-kicker">Workspace</p>
          <h2 id="workspace-title">Compare your materials</h2>
        </div>
        <button
          className="button button--quiet"
          type="button"
          onClick={onExample}
        >
          <SparkIcon />
          Load example
        </button>
      </div>

      <div className="input-grid">
        <TextInput
          id="resume"
          label="Your resume"
          eyebrow="01"
          value={resume}
          placeholder={
            "Paste your resume here…\n\nTip: Include headings and bullet text for the most useful checks."
          }
          inputRef={resumeRef}
          onChange={onResumeChange}
        />
        <TextInput
          id="job-description"
          label="Job description"
          eyebrow="02"
          value={jobDescription}
          placeholder={
            "Paste the full job description here…\n\nInclude responsibilities and qualifications for a better comparison."
          }
          onChange={onJobDescriptionChange}
        />
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="workspace__actions">
        <p>
          <DocumentIcon /> Plain text works best. Nothing is saved.
        </p>
        <div className="workspace__buttons">
          <button
            className="button button--quiet"
            type="button"
            disabled={!hasContent}
            onClick={onReset}
          >
            <ResetIcon />
            Clear
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={onAnalyze}
          >
            Analyze match
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
