import React, { useState } from 'react';
import { FileText, Book, Terminal, GitPullRequest, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './TabStyles.css';

const DOC_TABS = [
  { id: 'readme', label: 'README', icon: <FileText size={14} /> },
  { id: 'apiDocs', label: 'API Docs', icon: <Book size={14} /> },
  { id: 'setupGuide', label: 'Setup Guide', icon: <Terminal size={14} /> },
  { id: 'contributingGuide', label: 'Contributing', icon: <GitPullRequest size={14} /> },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className="copy-btn" onClick={copy}>
      {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
    </button>
  );
}

export default function DocumentationTab({ docs, repoName }) {
  const [active, setActive] = useState('readme');

  if (!docs) return <div className="tab-empty">No documentation generated.</div>;

  const content = docs[active] || '';

  return (
    <div className="tab-content animate-fade-in">
      <div className="doc-tabs">
        {DOC_TABS.map(tab => (
          <button key={tab.id}
            className={`doc-tab ${active === tab.id ? 'active' : ''}`}
            onClick={() => setActive(tab.id)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="doc-panel">
        <div className="doc-panel__header">
          <span className="doc-panel__title">{DOC_TABS.find(t => t.id === active)?.label}</span>
          {content && <CopyButton text={content} />}
        </div>
        <div className="doc-body">
          {content ? (
            <ReactMarkdown
              components={{
                h1: ({children}) => <h1 className="md-h1">{children}</h1>,
                h2: ({children}) => <h2 className="md-h2">{children}</h2>,
                h3: ({children}) => <h3 className="md-h3">{children}</h3>,
                p: ({children}) => <p className="md-p">{children}</p>,
                code: ({inline, children}) => inline
                  ? <code className="md-code-inline">{children}</code>
                  : <pre className="md-code-block"><code>{children}</code></pre>,
                ul: ({children}) => <ul className="md-ul">{children}</ul>,
                li: ({children}) => <li className="md-li">{children}</li>,
                strong: ({children}) => <strong className="md-strong">{children}</strong>,
                a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className="doc-empty">No {DOC_TABS.find(t => t.id === active)?.label} generated.</p>
          )}
        </div>
      </div>
    </div>
  );
}
