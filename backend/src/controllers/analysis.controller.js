const Analysis = require('../models/Analysis.model');
const githubService = require('../services/github.service');
const aiService = require('../services/ai.service');
const logger = require('../utils/logger');

// @desc    Start new analysis
// @route   POST /api/analysis
// @access  Public
const createAnalysis = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ success: false, message: 'Repository URL is required' });

    const { owner, repo } = githubService.parseRepoUrl(repoUrl);

    // Check for recent analysis (within 1 hour)
    const recent = await Analysis.findOne({
      repoUrl: repoUrl.trim(),
      status: 'completed',
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    if (recent) {
      return res.json({ success: true, data: recent, cached: true });
    }

    // Create pending analysis
    const analysis = await Analysis.create({
      user: req.user?._id,
      repoUrl: repoUrl.trim(),
      repoOwner: owner,
      repoName: repo,
      status: 'analyzing'
    });

    // Send immediate response with analysis ID
    res.status(202).json({
      success: true,
      message: 'Analysis started',
      analysisId: analysis._id,
      status: 'analyzing'
    });

    // Run analysis in background
    runAnalysis(analysis._id, owner, repo, startTime);

  } catch (error) {
    next(error);
  }
};

async function runAnalysis(analysisId, owner, repo, startTime) {
  try {
    logger.info(`Starting analysis for ${owner}/${repo}`);

    // Fetch all repo data
    const [repoInfo, languages, fileTree, readmeContent] = await Promise.all([
      githubService.getRepoInfo(owner, repo),
      githubService.getLanguages(owner, repo),
      githubService.getFileTree(owner, repo),
      githubService.getReadme(owner, repo)
    ]);

    const keyFiles = await githubService.getKeyFiles(owner, repo, fileTree);

    const repoData = {
      owner, repo,
      ...repoInfo,
      languages,
      fileTree,
      readmeContent,
      keyFiles
    };

    // Run AI analyses in parallel
    const [architecture, codeSmells, performanceIssues] = await Promise.all([
      aiService.analyzeArchitecture(repoData),
      aiService.detectCodeSmells(repoData),
      aiService.analyzePerformance(repoData)
    ]);

    const documentation = await aiService.generateDocumentation(repoData, architecture);
    const summary = await aiService.generateSummary(repoData, architecture, codeSmells, performanceIssues);
    const metrics = aiService.calculateMetrics(codeSmells, performanceIssues, architecture, repoData);

    const analysisTime = Date.now() - startTime;

    await Analysis.findByIdAndUpdate(analysisId, {
      status: 'completed',
      repoData: {
        description: repoInfo.description,
        language: repoInfo.language,
        languages,
        stars: repoInfo.stars,
        forks: repoInfo.forks,
        openIssues: repoInfo.openIssues,
        size: repoInfo.size,
        defaultBranch: repoInfo.defaultBranch,
        topics: repoInfo.topics,
        license: repoInfo.license,
        createdAt: repoInfo.createdAt,
        updatedAt: repoInfo.updatedAt,
        fileTree,
        totalFiles: fileTree.files?.length || 0,
        readmeContent
      },
      architecture,
      performanceIssues,
      codeSmells,
      documentation,
      metrics,
      summary,
      analysisTime
    });

    logger.info(`Analysis completed for ${owner}/${repo} in ${analysisTime}ms`);
  } catch (error) {
    logger.error(`Analysis failed for ${owner}/${repo}: ${error.message}`);
    await Analysis.findByIdAndUpdate(analysisId, {
      status: 'failed',
      errorMessage: error.message
    });
  }
}

// @desc    Get analysis by ID
// @route   GET /api/analysis/:id
// @access  Public
const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id).populate('user', 'name email');
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analysis status
// @route   GET /api/analysis/:id/status
// @access  Public
const getAnalysisStatus = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id).select('status errorMessage analysisTime');
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all analyses for user
// @route   GET /api/analysis
// @access  Private
const getUserAnalyses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    const [analyses, total] = await Promise.all([
      Analysis.find(query)
        .select('-documentation -codeSmells -performanceIssues -architecture.components')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Analysis.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: analyses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete analysis
// @route   DELETE /api/analysis/:id
// @access  Private
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user._id });
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    await analysis.deleteOne();
    res.json({ success: true, message: 'Analysis deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAnalysis, getAnalysis, getAnalysisStatus, getUserAnalyses, deleteAnalysis };
