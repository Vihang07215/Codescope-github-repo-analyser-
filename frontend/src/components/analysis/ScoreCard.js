import React from 'react';
import './ScoreCard.css';

function getColor(value) {
  if (value >= 80) return '#10b981';
  if (value >= 60) return '#f59e0b';
  return '#ef4444';
}

function getGrade(value) {
  if (value >= 90) return 'A+';
  if (value >= 80) return 'A';
  if (value >= 70) return 'B';
  if (value >= 60) return 'C';
  return 'D';
}

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreCard({ label, value, primary }) {
  const color = getColor(value);
  const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;

  return (
    <div className={`score-card ${primary ? 'score-card--primary' : ''}`}>
      <div className="score-card__ring">
        <svg width={primary ? 70 : 58} height={primary ? 70 : 58} viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            cx="30" cy="30" r={RADIUS}
            fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="score-card__value" style={{ color }}>
          {primary ? value : getGrade(value)}
        </div>
      </div>
      <div className="score-card__label">{label}</div>
    </div>
  );
}
