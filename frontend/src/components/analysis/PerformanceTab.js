import React, { useState } from 'react';
import { Zap, Database, Cpu, Wifi, Monitor, Wind, ChevronDown, ChevronUp } from 'lucide-react';
import './TabStyles.css';

const IMPACT_CONFIG = {
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'High Impact' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Medium Impact' },
  low: { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', label: 'Low Impact' }
};

const CATEGORY_ICONS = {
  database: <Database size={16} />,
  memory: <Cpu size={16} />,
  network: <Wifi size={16} />,
  rendering: <Monitor size={16} />,
  algorithm: <Wind size={16} />,
};

function PerfCard({ issue }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = IMPACT_CONFIG[issue.impact] || IMPACT_CONFIG.low;
  const categoryKey = issue.category?.toLowerCase().split(' ')[0];
  const icon = CATEGORY_ICONS[categoryKey] || <Zap size={16} />;

  return (
    <div className="perf-card" style={{ '--imp-color': cfg.color }}>
      <div className="perf-card__header" onClick={() => setExpanded(!expanded)}>
        <div className="perf-category-icon">{icon}</div>
        <div className="perf-card__main">
          <div className="perf-card__top">
            <span className="perf-category-name">{issue.category}</span>
            <span className="perf-impact-badge" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              {cfg.label}
            </span>
          </div>
          <p className="perf-description">{issue.description}</p>
          {issue.file && <span className="smell-file">{issue.file}</span>}
        </div>
        <button className="smell-expand">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>
      {expanded && issue.recommendation && (
        <div className="smell-card__body">
          <div className="smell-section smell-section--fix">
            <span className="smell-section-label">Recommendation</span>
            <p>{issue.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PerformanceTab({ issues }) {
  const [filter, setFilter] = useState('all');

  if (!issues?.length) return (
    <div className="tab-empty">
      <Zap size={40} />
      <p>No performance issues detected. The code looks efficient!</p>
    </div>
  );

  const filtered = filter === 'all' ? issues : issues.filter(i => i.impact === filter);
  const counts = issues.reduce((acc, i) => { acc[i.impact] = (acc[i.impact] || 0) + 1; return acc; }, {});

  return (
    <div className="tab-content animate-fade-in">
      <div className="severity-summary">
        {['high', 'medium', 'low'].map(imp => {
          const cfg = IMPACT_CONFIG[imp];
          return (
            <button key={imp} className={`sev-chip ${filter === imp ? 'active' : ''}`}
              style={{ '--sev-color': cfg.color }}
              onClick={() => setFilter(filter === imp ? 'all' : imp)}>
              <span>{counts[imp] || 0}</span>
              <span className="sev-chip-label">{cfg.label}</span>
            </button>
          );
        })}
        <button className={`sev-chip-all ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({issues.length})
        </button>
      </div>

      <div className="smell-list">
        {filtered.map((issue, i) => <PerfCard key={i} issue={issue} />)}
      </div>
    </div>
  );
}
