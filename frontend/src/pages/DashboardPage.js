import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Clock, Trash2, ExternalLink, Plus, Github, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analysisAPI } from '../services/api';
import toast from 'react-hot-toast';
import './DashboardPage.css';

function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Completed', color: '#10b981' },
    analyzing: { label: 'Analyzing…', color: '#f59e0b' },
    pending: { label: 'Pending', color: '#a855f7' },
    failed: { label: 'Failed', color: '#ef4444' },
  };
  const cfg = map[status] || map.failed;
  return (
    <span className="status-badge" style={{ '--sc': cfg.color }}>
      <span className="status-dot" />
      {cfg.label}
    </span>
  );
}

function ScorePill({ value }) {
  if (value === undefined || value === null) return null;
  const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';
  return <span className="score-pill" style={{ '--sc': color }}>{value}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAnalyses();
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const { data } = await analysisAPI.getAll({ limit: 20 });
      setAnalyses(data.data || []);
    } catch {
      toast.error('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Delete this analysis?')) return;
    try {
      setDeleting(id);
      await analysisAPI.delete(id);
      setAnalyses(prev => prev.filter(a => a._id !== id));
      toast.success('Analysis deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const completed = analyses.filter(a => a.status === 'completed');
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.metrics?.overallScore || 0), 0) / completed.length)
    : 0;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="container">
          <div className="dashboard__hero">
            <div>
              <h1 className="dashboard__title">Dashboard</h1>
              <p className="dashboard__subtitle">Welcome back, <span>{user?.name}</span></p>
            </div>
            <Link to="/" className="btn btn--primary">
              <Plus size={15} /> New Analysis
            </Link>
          </div>

          <div className="dashboard__stats">
            {[
              { label: 'Total Analyses', value: analyses.length, icon: <BarChart2 size={16} /> },
              { label: 'Completed', value: completed.length, icon: <Github size={16} /> },
              { label: 'Avg. Score', value: avgScore || '—', icon: <Star size={16} /> },
              { label: 'Plan', value: user?.plan?.toUpperCase() || 'FREE', icon: <Clock size={16} /> },
            ].map((s, i) => (
              <div className="dash-stat" key={i}>
                <div className="dash-stat__icon">{s.icon}</div>
                <div>
                  <div className="dash-stat__value">{s.value}</div>
                  <div className="dash-stat__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard__content">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Recent Analyses
            </h2>
          </div>

          {loading ? (
            <div className="dash-loading">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 82, borderRadius: 12, marginBottom: 10 }} />
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <div className="dash-empty">
              <BarChart2 size={48} />
              <h3>No analyses yet</h3>
              <p>Analyze a GitHub repository to get started.</p>
              <Link to="/" className="btn btn--primary"><Plus size={14} /> Analyze Repo</Link>
            </div>
          ) : (
            <div className="analysis-list">
              {analyses.map(a => (
                <Link
                  key={a._id}
                  to={`/analysis/${a._id}`}
                  className="analysis-row"
                >
                  <div className="analysis-row__repo">
                    <Github size={15} className="analysis-row__icon" />
                    <div>
                      <div className="analysis-row__name">{a.repoOwner}/{a.repoName}</div>
                      <div className="analysis-row__meta">
                        {a.repoData?.language && <span className="meta-chip meta-chip--lang">{a.repoData.language}</span>}
                        <span className="meta-chip">
                          <Clock size={10} /> {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="analysis-row__right">
                    <StatusBadge status={a.status} />
                    {a.metrics?.overallScore !== undefined && (
                      <ScorePill value={a.metrics.overallScore} />
                    )}
                    <a href={a.repoUrl} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()} className="analysis-row__ext">
                      <ExternalLink size={13} />
                    </a>
                    <button
                      className="analysis-row__del"
                      onClick={e => handleDelete(a._id, e)}
                      disabled={deleting === a._id}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
