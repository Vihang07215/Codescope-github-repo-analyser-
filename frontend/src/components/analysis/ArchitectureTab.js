import React from 'react';
import { Layers, Package, GitBranch, Lightbulb, Code2 } from 'lucide-react';
import './TabStyles.css';

export default function ArchitectureTab({ data, repoData }) {
  if (!data) return <div className="tab-empty">No architecture data available.</div>;

  const langTotal = repoData?.languages ? Object.values(repoData.languages).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="tab-content animate-fade-in">
      {/* Overview */}
      <div className="tab-section">
        <div className="section-header">
          <Layers size={16} className="section-icon section-icon--cyan" />
          <h3>Architecture Overview</h3>
        </div>
        <div className="overview-card">
          <div className="overview-badge">{data.projectType || 'Software Project'}</div>
          <p className="overview-text">{data.overview}</p>
        </div>
      </div>

      <div className="tab-grid-2">
        {/* Tech Stack */}
        <div className="tab-section">
          <div className="section-header">
            <Package size={16} className="section-icon section-icon--purple" />
            <h3>Tech Stack</h3>
          </div>
          <div className="tag-cloud">
            {data.techStack?.map((tech, i) => (
              <span key={i} className="tag tag--tech">{tech}</span>
            ))}
          </div>
        </div>

        {/* Design Patterns */}
        <div className="tab-section">
          <div className="section-header">
            <GitBranch size={16} className="section-icon section-icon--cyan" />
            <h3>Design Patterns</h3>
          </div>
          <div className="tag-cloud">
            {data.designPatterns?.map((p, i) => (
              <span key={i} className="tag tag--pattern">{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Language Breakdown */}
      {repoData?.languages && langTotal > 0 && (
        <div className="tab-section">
          <div className="section-header">
            <Code2 size={16} className="section-icon section-icon--cyan" />
            <h3>Language Breakdown</h3>
          </div>
          <div className="lang-bars">
            <div className="lang-bar-track">
              {Object.entries(repoData.languages)
                .sort((a, b) => b[1] - a[1])
                .map(([lang, bytes], i) => {
                  const pct = ((bytes / langTotal) * 100).toFixed(1);
                  const colors = ['#00e5ff','#a855f7','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899'];
                  return (
                    <div key={lang} title={`${lang}: ${pct}%`}
                      style={{ width: `${pct}%`, background: colors[i % colors.length], height: '100%', borderRadius: i === 0 ? '3px 0 0 3px' : '' }} />
                  );
                })}
            </div>
            <div className="lang-legend">
              {Object.entries(repoData.languages)
                .sort((a, b) => b[1] - a[1])
                .map(([lang, bytes], i) => {
                  const pct = ((bytes / langTotal) * 100).toFixed(1);
                  const colors = ['#00e5ff','#a855f7','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899'];
                  return (
                    <div key={lang} className="lang-legend-item">
                      <span className="lang-dot" style={{ background: colors[i % colors.length] }} />
                      <span className="lang-name">{lang}</span>
                      <span className="lang-pct">{pct}%</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Components */}
      {data.components?.length > 0 && (
        <div className="tab-section">
          <div className="section-header">
            <Package size={16} className="section-icon section-icon--purple" />
            <h3>Key Components</h3>
          </div>
          <div className="component-grid">
            {data.components.map((comp, i) => (
              <div key={i} className="component-card">
                <h4 className="component-name">{comp.name}</h4>
                <p className="component-purpose">{comp.purpose}</p>
                {comp.files?.length > 0 && (
                  <div className="component-files">
                    {comp.files.slice(0, 3).map((f, j) => (
                      <span key={j} className="file-chip">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Flow */}
      {data.dataFlow && (
        <div className="tab-section">
          <div className="section-header">
            <GitBranch size={16} className="section-icon section-icon--cyan" />
            <h3>Data Flow</h3>
          </div>
          <div className="info-block info-block--cyan">
            <p>{data.dataFlow}</p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations?.length > 0 && (
        <div className="tab-section">
          <div className="section-header">
            <Lightbulb size={16} className="section-icon section-icon--orange" />
            <h3>Recommendations</h3>
          </div>
          <div className="rec-list">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="rec-item">
                <span className="rec-num">{String(i + 1).padStart(2, '0')}</span>
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
