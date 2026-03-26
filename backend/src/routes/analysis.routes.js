const express = require('express');
const router = express.Router();
const {
  createAnalysis,
  getAnalysis,
  getAnalysisStatus,
  getUserAnalyses,
  deleteAnalysis
} = require('../controllers/analysis.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: AI Repository Analysis APIs
 */

/**
 * @swagger
 * /api/analysis:
 *   post:
 *     summary: Start new repository analysis
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - repoUrl
 *             properties:
 *               repoUrl:
 *                 type: string
 *                 example: https://github.com/facebook/react
 *     responses:
 *       201:
 *         description: Analysis started successfully
 *       400:
 *         description: Invalid request
 */
router.post('/', optionalAuth, createAnalysis);

/**
 * @swagger
 * /api/analysis:
 *   get:
 *     summary: Get logged in user's analyses
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of analyses
 */
router.get('/', protect, getUserAnalyses);

/**
 * @swagger
 * /api/analysis/{id}:
 *   get:
 *     summary: Get analysis result by ID
 *     tags: [Analysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 65f1a2b3c4d5e6f7890a1234
 *     responses:
 *       200:
 *         description: Analysis data
 *       404:
 *         description: Analysis not found
 */
router.get('/:id', getAnalysis);

/**
 * @swagger
 * /api/analysis/{id}/status:
 *   get:
 *     summary: Get analysis processing status
 *     tags: [Analysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status fetched
 */
router.get('/:id/status', getAnalysisStatus);

/**
 * @swagger
 * /api/analysis/{id}:
 *   delete:
 *     summary: Delete analysis
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analysis deleted
 */
router.delete('/:id', protect, deleteAnalysis);

module.exports = router;