const axios = require('axios');
const logger = require('../utils/logger');

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Analyzer-App',
      ...(process.env.GITHUB_TOKEN && {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      })
    };
  }

  parseRepoUrl(url) {
    const patterns = [
      /github\.com\/([^/]+)\/([^/\s.]+)/,
      /^([^/]+)\/([^/\s.]+)$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
    throw new Error('Invalid GitHub repository URL');
  }

  async getRepoInfo(owner, repo) {
    try {
      const { data } = await axios.get(`${this.baseURL}/repos/${owner}/${repo}`, { headers: this.headers });
      return {
        description: data.description || '',
        language: data.language || 'Unknown',
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        size: data.size,
        defaultBranch: data.default_branch,
        topics: data.topics || [],
        license: data.license?.name || 'None',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      if (error.response?.status === 404) throw new Error('Repository not found');
      if (error.response?.status === 403) throw new Error('GitHub API rate limit exceeded. Please add a GitHub token.');
      throw new Error(`Failed to fetch repo info: ${error.message}`);
    }
  }

  async getLanguages(owner, repo) {
    try {
      const { data } = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/languages`, { headers: this.headers });
      return data;
    } catch (error) {
      logger.warn(`Could not fetch languages: ${error.message}`);
      return {};
    }
  }

  async getFileTree(owner, repo, branch = 'main', maxFiles = 150) {
    try {
      const { data } = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers: this.headers }
      );
      const files = data.tree
        .filter(item => item.type === 'blob')
        .slice(0, maxFiles)
        .map(item => ({ path: item.path, size: item.size }));
      return { files, truncated: data.truncated };
    } catch (error) {
      try {
        const { data } = await axios.get(
          `${this.baseURL}/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          { headers: this.headers }
        );
        const files = data.tree
          .filter(item => item.type === 'blob')
          .slice(0, maxFiles)
          .map(item => ({ path: item.path, size: item.size }));
        return { files, truncated: data.truncated };
      } catch (e) {
        logger.warn(`Could not fetch file tree: ${e.message}`);
        return { files: [], truncated: false };
      }
    }
  }

  async getReadme(owner, repo) {
    try {
      const { data } = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/readme`, { headers: this.headers });
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return content.slice(0, 3000);
    } catch (error) {
      return '';
    }
  }

  async getFileContent(owner, repo, filePath) {
    try {
      const { data } = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/contents/${filePath}`,
        { headers: this.headers }
      );
      if (data.size > 100000) return '// File too large to analyze';
      return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch (error) {
      return null;
    }
  }

  async getKeyFiles(owner, repo, fileTree) {
    const keyFilePatterns = [
      'package.json', 'requirements.txt', 'Cargo.toml', 'go.mod', 'pom.xml',
      'docker-compose.yml', 'Dockerfile', '.env.example',
      'src/App.js', 'src/App.tsx', 'src/index.js', 'src/main.js',
      'index.js', 'main.py', 'app.py', 'server.js', 'app.js'
    ];

    const keyFiles = {};
    const filePaths = fileTree.files?.map(f => f.path) || [];

    for (const pattern of keyFilePatterns) {
      const match = filePaths.find(p => p === pattern || p.endsWith('/' + pattern));
      if (match) {
        const content = await this.getFileContent(owner, repo, match);
        if (content) keyFiles[match] = content.slice(0, 2000);
      }
    }
    return keyFiles;
  }
}

module.exports = new GitHubService();
