import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Shield, FileText, TrendingUp, ArrowRight, Github, Star, GitFork, ChevronRight } from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';
import AnalyzingLoader from '../components/dashboard/AnalyzingLoader';
import toast from 'react-hot-toast';
import './HomePage.css';

const SAMPLE_REPOS = [
  'https://github.com/facebook/react',
  'https://github.com/expressjs/express',
  'https://github.com/axios/axios',
  'https://github.com/vercel/next.js',
];

const FEATURES = [
  { icon: <Zap size={20} />, title: 'Architecture Analysis', desc: 'AI maps your entire codebase structure, design patterns, and tech stack in seconds.' },
  { icon: <TrendingUp size={20} />, title: 'Performance Insights', desc: 'Identify bottlenecks across database, memory, network, and algorithm layers.' },
  { icon: <Shield size={20} />, title: 'Code Smell Detection', desc: 'Catch anti-patterns, technical debt, and maintainability issues before they grow.' },
  { icon: <FileText size={20} />, title: 'Auto Documentation', desc: 'Generate README, API docs, setup guides, and contributing guidelines instantly.' },
];

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const navigate = useNavigate();
  const { startAnalysis, status, error, progress } = useAnalysis();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const url = repoUrl.trim();
    if (!url) return toast.error('Please enter a GitHub repository URL');
    if (!url.includes('github.com')) return toast.error('Please enter a valid GitHub URL');

    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ repoUrl: url })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      if (data.cached) {
        navigate(`/analysis/${data.data._id}`);
        return;
      }

      navigate(`/analysis/${data.analysisId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to start analysis');
    }
  };

  const handleSample = (url) => {
    setRepoUrl(url);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg-grid" />
        <div className="container">
          

          <h1 className="hero__title">
            Understand any<br />
            <span className="hero__title-accent">GitHub repo</span><br />
            in minutes
          </h1>

          <p className="hero__subtitle">
            Paste a GitHub link. Get instant AI-powered architecture analysis,<br className="hero__br" />
            performance insights, code smell detection, and documentation.
          </p>

          {/* Search Form */}
          <form className="hero__form" onSubmit={handleSubmit}>
            <div className="hero__input-wrap">
              <Github size={18} className="hero__input-icon" />
              <input
                type="text"
                className="hero__input"
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                disabled={status === 'analyzing' || status === 'loading'}
              />
              <button
                type="submit"
                className="hero__submit"
                disabled={status === 'analyzing' || status === 'loading' || !repoUrl.trim()}
              >
                {status === 'loading' ? (
                  <span className="hero__submit-spinner" />
                ) : (
                  <>Analyze <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </form>

          {/* Sample repos */}
          <div className="hero__samples">
            <span className="hero__samples-label">Try with:</span>
            {SAMPLE_REPOS.map((r) => (
              <button key={r} className="hero__sample-chip" onClick={() => handleSample(r)}>
                {r.split('/').slice(-1)[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="features__header">
            <p className="features__eyebrow">What you get</p>
            <h2 className="features__title">Four pillars of code intelligence</h2>
          </div>
          <div className="features__grid">
            {FEATURES.map((f, i) => (
              <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats__grid">
            {[
              { value: '< 2min', label: 'Avg. Analysis Time' },
              { value: '10+', label: 'Metrics Analyzed' },
              { value: '4', label: 'Report Sections' },
              { value: '100%', label: 'AI Powered' },
            ].map((s, i) => (
              <div className="stat" key={i}>
                <div className="stat__value">{s.value}</div>
                <div className="stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
