const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

class AIAnalysisService {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.model = 'claude-opus-4-5';
  }

  async analyzeArchitecture(repoData) {
    const prompt = `You are an expert software architect. Analyze this GitHub repository and provide a detailed architecture analysis.

Repository: ${repoData.owner}/${repoData.repo}
Description: ${repoData.description}
Primary Language: ${repoData.language}
Languages: ${JSON.stringify(repoData.languages)}
Topics: ${repoData.topics?.join(', ')}
File Structure: ${JSON.stringify(repoData.fileTree?.files?.map(f => f.path), null, 2).slice(0, 3000)}
Key Files Content: ${JSON.stringify(repoData.keyFiles, null, 2).slice(0, 5000)}
README: ${repoData.readmeContent?.slice(0, 2000)}

Respond ONLY with a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "overview": "Detailed architecture overview paragraph",
  "projectType": "Type of project (e.g., REST API, SPA, Microservices, CLI Tool)",
  "designPatterns": ["Pattern 1", "Pattern 2"],
  "techStack": ["Tech 1", "Tech 2"],
  "components": [
    {"name": "Component Name", "purpose": "What it does", "files": ["file1.js"]}
  ],
  "dataFlow": "How data flows through the application",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });
      return this._parseJSON(response.content[0].text);
    } catch (error) {
      logger.error(`Architecture analysis failed: ${error.message}`);
      return this._defaultArchitecture(repoData);
    }
  }

  async detectCodeSmells(repoData) {
    const prompt = `You are a senior code quality engineer. Analyze this repository for code smells and anti-patterns.

Repository: ${repoData.owner}/${repoData.repo}
Language: ${repoData.language}
File Structure: ${JSON.stringify(repoData.fileTree?.files?.map(f => f.path)).slice(0, 2000)}
Key Files: ${JSON.stringify(repoData.keyFiles, null, 2).slice(0, 4000)}

Identify the most significant code smells. Respond ONLY with a valid JSON array (no markdown):
[
  {
    "type": "Code Smell Type (e.g., Long Method, God Object, Magic Numbers)",
    "severity": "low|medium|high|critical",
    "file": "filename.js",
    "line": 0,
    "description": "What the issue is",
    "suggestion": "How to fix it"
  }
]

Provide 5-10 specific, actionable items.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });
      const result = this._parseJSON(response.content[0].text);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      logger.error(`Code smell detection failed: ${error.message}`);
      return [];
    }
  }

  async analyzePerformance(repoData) {
    const prompt = `You are a performance optimization expert. Analyze this repository for performance bottlenecks and improvement opportunities.

Repository: ${repoData.owner}/${repoData.repo}
Language: ${repoData.language}
Tech Stack: Based on files and structure
File Structure: ${JSON.stringify(repoData.fileTree?.files?.map(f => f.path)).slice(0, 2000)}
Key Files: ${JSON.stringify(repoData.keyFiles, null, 2).slice(0, 4000)}

Identify performance issues. Respond ONLY with a valid JSON array (no markdown):
[
  {
    "category": "Category (e.g., Database, Memory, Network, Rendering, Algorithm)",
    "impact": "low|medium|high",
    "description": "What the performance issue is",
    "recommendation": "Specific steps to fix it",
    "file": "relevant file if applicable"
  }
]

Provide 5-8 specific, actionable performance improvements.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });
      const result = this._parseJSON(response.content[0].text);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      logger.error(`Performance analysis failed: ${error.message}`);
      return [];
    }
  }

  async generateDocumentation(repoData, architecture) {
    const prompt = `You are a technical writer. Generate comprehensive documentation for this repository.

Repository: ${repoData.owner}/${repoData.repo}
Description: ${repoData.description}
Language: ${repoData.language}
Architecture: ${JSON.stringify(architecture)}
Tech Stack: ${architecture?.techStack?.join(', ')}
Key Files: ${JSON.stringify(repoData.keyFiles, null, 2).slice(0, 3000)}
Existing README: ${repoData.readmeContent?.slice(0, 1000)}

Generate comprehensive documentation. Respond ONLY with a valid JSON object (no markdown):
{
  "readme": "Full README.md content in markdown format",
  "apiDocs": "API documentation if applicable, in markdown",
  "setupGuide": "Step-by-step setup guide in markdown",
  "contributingGuide": "Contributing guidelines in markdown"
}`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });
      return this._parseJSON(response.content[0].text);
    } catch (error) {
      logger.error(`Documentation generation failed: ${error.message}`);
      return this._defaultDocumentation(repoData);
    }
  }

  async generateSummary(repoData, architecture, codeSmells, performanceIssues) {
    const criticalSmells = codeSmells.filter(s => s.severity === 'critical' || s.severity === 'high').length;
    const highImpactPerf = performanceIssues.filter(p => p.impact === 'high').length;

    const prompt = `Provide a concise executive summary (3-4 sentences) for this code review:
Repository: ${repoData.owner}/${repoData.repo}
Project Type: ${architecture?.projectType}
Tech Stack: ${architecture?.techStack?.join(', ')}
Critical Code Smells: ${criticalSmells}
High Impact Performance Issues: ${highImpactPerf}
Total Issues: ${codeSmells.length + performanceIssues.length}

Write a professional, balanced summary highlighting strengths and key areas for improvement.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      });
      return response.content[0].text;
    } catch (error) {
      return `Analysis of ${repoData.owner}/${repoData.repo} completed. Found ${codeSmells.length} code issues and ${performanceIssues.length} performance opportunities.`;
    }
  }

  calculateMetrics(codeSmells, performanceIssues, architecture, repoData) {
    const criticalSmells = codeSmells.filter(s => s.severity === 'critical').length;
    const highSmells = codeSmells.filter(s => s.severity === 'high').length;
    const mediumSmells = codeSmells.filter(s => s.severity === 'medium').length;

    const highPerf = performanceIssues.filter(p => p.impact === 'high').length;
    const medPerf = performanceIssues.filter(p => p.impact === 'medium').length;

    const maintainabilityScore = Math.max(0, 100 - (criticalSmells * 20) - (highSmells * 10) - (mediumSmells * 5));
    const performanceScore = Math.max(0, 100 - (highPerf * 20) - (medPerf * 10));
    const architectureScore = architecture?.designPatterns?.length > 0 ? 80 : 60;
    const documentationScore = repoData.readmeContent?.length > 500 ? 75 : repoData.readmeContent?.length > 100 ? 55 : 30;
    const overallScore = Math.round((maintainabilityScore + performanceScore + architectureScore + documentationScore) / 4);

    return {
      overallScore,
      architectureScore,
      performanceScore,
      maintainabilityScore,
      documentationScore
    };
  }

  _parseJSON(text) {
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      const jsonMatch = text.match(/[\[{][\s\S]*[\]}]/);
      if (jsonMatch) {
        try { return JSON.parse(jsonMatch[0]); } catch (e2) {}
      }
      return null;
    }
  }

  _defaultArchitecture(repoData) {
    return {
      overview: `${repoData.repo} is a ${repoData.language} project.`,
      projectType: 'Software Application',
      designPatterns: [],
      techStack: [repoData.language],
      components: [],
      dataFlow: 'Standard application data flow',
      recommendations: ['Add comprehensive documentation', 'Implement testing suite']
    };
  }

  _defaultDocumentation(repoData) {
    return {
      readme: `# ${repoData.repo}\n\n${repoData.description || 'No description available.'}\n\n## Setup\n\nClone and install dependencies.\n\n## Usage\n\nSee documentation for usage details.`,
      apiDocs: '# API Documentation\n\nNo API documentation available.',
      setupGuide: '# Setup Guide\n\n1. Clone the repository\n2. Install dependencies\n3. Configure environment\n4. Run the application',
      contributingGuide: '# Contributing\n\nWe welcome contributions! Please read our guidelines before submitting PRs.'
    };
  }
}

module.exports = new AIAnalysisService();
