import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, GitFork, AlertCircle, Globe, Clock, BarChart2, Code, Zap, FileText, RefreshCw } from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';
import AnalyzingLoader from '../components/dashboard/AnalyzingLoader';
import ArchitectureTab from '../components/analysis/ArchitectureTab';
import CodeSmellsTab from '../components/analysis/CodeSmellsTab';
import PerformanceTab from '../components/analysis/PerformanceTab';
import DocumentationTab from '../components/analysis/DocumentationTab';
import ScoreCard from '../components/analysis/ScoreCard';
import './AnalysisPage.css';

const TABS = [
  { id: 'architecture', label: 'Architecture', icon: <BarChart2 size={15} /> },
  { id: 'smells', label: 'Code Smells', icon: <Code size={15} /> },
  { id: 'performance', label: 'Performance', icon: <Zap size={15} /> },
  { id: 'docs', label: 'Documentation', icon: <FileText size={15} /> },
];

export default function AnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { analysis, status, error, progress, loadAnalysis } = useAnalysis();
  const [activeTab, setActiveTab] = useState('architecture');
  const [pollTimer, setPollTimer] = useState(null);

  useEffect(() => {
    if (!id) return navigate('/');
    loadAnalysis(id);
  }, [id]);

  // If analysis is still running, poll
  useEffect(() => {
    if (analysis?.status === 'analyzing' || analysis?.status === 'pending') {
      const t = setInterval(() => loadAnalysis(id), 3000);
      setPollTimer(t);
      return () => clearInterval(t);
    } else {
      if (pollTimer) clearInterval(pollTimer);
    }
  }, [analysis?.status]);

  const isLoading = status === 'loading' || analysis?.status === 'analyzing' || analysis?.status === 'pending';
  const isFailed = status === 'failed' || analysis?.status === 'failed';
  const isComplete = status === 'completed' && analysis?.status === 'completed';

  if (isLoading && !isComplete) {
    return (
      <div className="analysis-page">
        <AnalyzingLoader
          progress={progress || (analysis?.status === 'analyzing' ? 50 : 10)}
          repoName={analysis ? `${analysis.repoOwner}/${analysis.repoName}` : ''}
        />
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="analysis-page">
        <div className="analysis-error">
          <AlertCircle size={48} />
          <h2>Analysis Failed</h2>
          <p>{error || analysis?.errorMessage || 'Something went wrong. Please try again.'}</p>
          <div className="analysis-error__actions">
            <button onClick={() => navigate('/')} className="btn btn--primary">
              <ArrowLeft size={15} /> Try Another Repo
            </button>
            <button onClick={() => loadAnalysis(id)} className="btn btn--ghost">
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const { repoData, architecture, codeSmells, performanceIssues, documentation, metrics, summary } = analysis;

  return (
    <div className="analysis-page">
      {/* Header */}
      <div className="analysis-header">
        <div className="container">
          <button onClick={() => navigate('/')} className="analysis-back">
            <ArrowLeft size={15} /> Back
          </button>

          <div className="analysis-hero">
            <div className="analysis-repo-info">
              <h1 className="analysis-repo-name">
                <a href={analysis.repoUrl} target="_blank" rel="noopener noreferrer">
                  {analysis.repoOwner}/{analysis.repoName}
                </a>
              </h1>
              {repoData?.description && (
                <p className="analysis-repo-desc">{repoData.description}</p>
              )}
              <div className="analysis-repo-meta">
                {repoData?.language && (
                  <span className="meta-chip meta-chip--lang">{repoData.language}</span>
                )}
                {repoData?.stars !== undefined && (
                  <span className="meta-chip"><Star size={11} /> {repoData.stars.toLocaleString()}</span>
                )}
                {repoData?.forks !== undefined && (
                  <span className="meta-chip"><GitFork size={11} /> {repoData.forks.toLocaleString()}</span>
                )}
                {repoData?.license && repoData.license !== 'None' && (
                  <span className="meta-chip">{repoData.license}</span>
                )}
                {analysis.analysisTime && (
                  <span className="meta-chip meta-chip--time">
                    <Clock size={11} /> {(analysis.analysisTime / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            </div>

            {/* Score Cards */}
            {metrics && (
              <div className="analysis-scores">
                <ScoreCard label="Overall" value={metrics.overallScore} primary />
                <ScoreCard label="Architecture" value={metrics.architectureScore} />
                <ScoreCard label="Performance" value={metrics.performanceScore} />
                <ScoreCard label="Maintainability" value={metrics.maintainabilityScore} />
                <ScoreCard label="Documentation" value={metrics.documentationScore} />
              </div>
            )}
          </div>

          {summary && (
            <div className="analysis-summary">
              <p>{summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="analysis-tabs-wrap">
        <div className="container">
          <div className="analysis-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`analysis-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === 'smells' && codeSmells?.length > 0 && (
                  <span className="analysis-tab__badge">{codeSmells.length}</span>
                )}
                {tab.id === 'performance' && performanceIssues?.length > 0 && (
                  <span className="analysis-tab__badge analysis-tab__badge--warn">{performanceIssues.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="analysis-content">
        <div className="container">
          {activeTab === 'architecture' && <ArchitectureTab data={architecture} repoData={repoData} />}
          {activeTab === 'smells' && <CodeSmellsTab smells={codeSmells || []} />}
          {activeTab === 'performance' && <PerformanceTab issues={performanceIssues || []} />}
          {activeTab === 'docs' && <DocumentationTab docs={documentation} repoName={`${analysis.repoOwner}/${analysis.repoName}`} />}
        </div>
      </div>
    </div>
  );
}
