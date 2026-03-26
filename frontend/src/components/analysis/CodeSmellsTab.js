import React, { useState } from 'react';
import { Bug, Filter, AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp } from 'lucide-react';
import './TabStyles.css';

const SEVERITY_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: <AlertOctagon size={14} />, label: 'Critical' },
  high: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: <AlertTriangle size={14} />, label: 'High' },
  medium: { color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', icon: <Info size={14} />, label: 'Medium' },
  low: { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: <Info size={14} />, label: 'Low' }
};

function SmellCard({ smell }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[smell.severity] || SEVERITY_CONFIG.low;

  return (
    <div className="smell-card" style={{ '--sev-color': cfg.color, '--sev-bg': cfg.bg, '--sev-border': cfg.border }}>
      <div className="smell-card__header" onClick={() => setExpanded(!expanded)}>
        <div className="smell-badge" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          {cfg.icon} {cfg.label}
        </div>
        <div className="smell-card__main">
          <h4 className="smell-type">{smell.type}</h4>
          {smell.file && <span className="smell-file">{smell.file}{smell.line ? `:${smell.line}` : ''}</span>}
        </div>
        <button className="smell-expand">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>
      {expanded && (
        <div className="smell-card__body">
          <div className="smell-section">
            <span className="smell-section-label">Issue</span>
            <p>{smell.description}</p>
          </div>
          {smell.suggestion && (
            <div className="smell-section smell-section--fix">
              <span className="smell-section-label">Fix</span>
              <p>{smell.suggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CodeSmellsTab({ smells }) {
  const [filter, setFilter] = useState('all');

  if (!smells?.length) return (
    <div className="tab-empty">
      <Bug size={40} />
      <p>No code smells detected. Great code quality!</p>
    </div>
  );

  const counts = smells.reduce((acc, s) => {
    acc[s.severity] = (acc[s.severity] || 0) + 1;
    return acc;
  }, {});

  const filtered = filter === 'all' ? smells : smells.filter(s => s.severity === filter);

  return (
    <div className="tab-content animate-fade-in">
      {/* Summary */}
      <div className="severity-summary">
        {['critical', 'high', 'medium', 'low'].map(sev => {
          const cfg = SEVERITY_CONFIG[sev];
          const count = counts[sev] || 0;
          return (
            <button key={sev}
              className={`sev-chip ${filter === sev ? 'active' : ''} ${!count ? 'empty' : ''}`}
              style={{ '--sev-color': cfg.color }}
              onClick={() => setFilter(filter === sev ? 'all' : sev)}
            >
              {cfg.icon}
              <span>{count}</span>
              <span className="sev-chip-label">{cfg.label}</span>
            </button>
          );
        })}
        <button className={`sev-chip-all ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({smells.length})
        </button>
      </div>

      <div className="smell-list">
        {filtered.map((smell, i) => <SmellCard key={i} smell={smell} />)}
      </div>
    </div>
  );
}
