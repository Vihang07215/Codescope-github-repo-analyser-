import React, { useState, useEffect } from 'react';
import './AnalyzingLoader.css';

const STEPS = [
  { label: 'Fetching repository data', icon: '📦' },
  { label: 'Reading file structure', icon: '🗂️' },
  { label: 'Analyzing architecture', icon: '🏗️' },
  { label: 'Detecting code smells', icon: '🔍' },
  { label: 'Evaluating performance', icon: '⚡' },
  { label: 'Generating documentation', icon: '📝' },
  { label: 'Compiling report', icon: '✨' },
];

export default function AnalyzingLoader({ progress = 0, repoName = '' }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const step = Math.floor((progress / 100) * STEPS.length);
    setCurrentStep(Math.min(step, STEPS.length - 1));
  }, [progress]);

  return (
    <div className="loader">
      <div className="loader__orb">
        <div className="loader__orb-inner">
          <div className="loader__orb-ring loader__orb-ring--1" />
          <div className="loader__orb-ring loader__orb-ring--2" />
          <div className="loader__orb-ring loader__orb-ring--3" />
          <span className="loader__orb-icon">⚙️</span>
        </div>
      </div>

      <h2 className="loader__title">Analyzing Repository</h2>
      {repoName && <p className="loader__repo">{repoName}</p>}

      <div className="loader__progress-wrap">
        <div className="loader__progress-bar">
          <div className="loader__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="loader__progress-pct">{Math.round(progress)}%</span>
      </div>

      <div className="loader__steps">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`loader__step ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}
          >
            <span className="loader__step-icon">{step.icon}</span>
            <span className="loader__step-label">{step.label}</span>
            {i < currentStep && <span className="loader__step-check">✓</span>}
            {i === currentStep && <span className="loader__step-spinner" />}
          </div>
        ))}
      </div>

      <p className="loader__note">This usually takes 1–2 minutes. We're running 4 AI analyses in parallel.</p>
    </div>
  );
}
