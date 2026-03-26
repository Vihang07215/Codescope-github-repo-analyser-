const express = require('express');
const router = express.Router();
const githubService = require('../services/github.service');

// @desc    Validate and preview repo
// @route   GET /api/repo/preview

/**
 * @swagger
 * tags:
 *   name: Repo
 *   description: GitHub Repository APIs
 */

/**
 * @swagger
 * /api/repo/preview:
 *   get:
 *     summary: Validate and preview GitHub repository
 *     tags: [Repo]
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         required: true
 *         description: GitHub repository URL
 *         example: https://github.com/facebook/react
 *     responses:
 *       200:
 *         description: Repository preview fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     owner:
 *                       type: string
 *                       example: facebook
 *                     repo:
 *                       type: string
 *                       example: react
 *                     stars:
 *                       type: number
 *                       example: 200000
 *                     forks:
 *                       type: number
 *                       example: 40000
 *       400:
 *         description: URL is required
 *       500:
 *         description: Server error
 */

router.get('/preview', async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });

    const { owner, repo } = githubService.parseRepoUrl(url);
    const repoInfo = await githubService.getRepoInfo(owner, repo);

    res.json({ success: true, data: { owner, repo, ...repoInfo } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
