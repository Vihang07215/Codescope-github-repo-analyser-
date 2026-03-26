const mongoose = require('mongoose');

const codeSmellSchema = new mongoose.Schema({
  type: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  file: String,
  line: Number,
  description: String,
  suggestion: String
}, { _id: false });

const performanceIssueSchema = new mongoose.Schema({
  category: String,
  impact: { type: String, enum: ['low', 'medium', 'high'] },
  description: String,
  recommendation: String,
  file: String
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  repoUrl: {
    type: String,
    required: [true, 'Repository URL is required'],
    trim: true
  },
  repoOwner: { type: String, required: true },
  repoName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'failed'],
    default: 'pending'
  },
  repoData: {
    description: String,
    language: String,
    languages: { type: Map, of: Number },
    stars: Number,
    forks: Number,
    openIssues: Number,
    size: Number,
    defaultBranch: String,
    topics: [String],
    license: String,
    createdAt: Date,
    updatedAt: Date,
    fileTree: mongoose.Schema.Types.Mixed,
    totalFiles: Number,
    readmeContent: String
  },
  architecture: {
    overview: String,
    designPatterns: [String],
    projectType: String,
    techStack: [String],
    components: [{ name: String, purpose: String, files: [String] }],
    dataFlow: String,
    recommendations: [String]
  },
  performanceIssues: [performanceIssueSchema],
  codeSmells: [codeSmellSchema],
  documentation: {
    readme: String,
    apiDocs: String,
    setupGuide: String,
    contributingGuide: String
  },
  metrics: {
    overallScore: { type: Number, min: 0, max: 100 },
    architectureScore: { type: Number, min: 0, max: 100 },
    performanceScore: { type: Number, min: 0, max: 100 },
    maintainabilityScore: { type: Number, min: 0, max: 100 },
    documentationScore: { type: Number, min: 0, max: 100 }
  },
  summary: String,
  analysisTime: Number,
  errorMessage: String
}, {
  timestamps: true
});

// Index for faster queries
analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ repoUrl: 1 });
analysisSchema.index({ status: 1 });

module.exports = mongoose.model('Analysis', analysisSchema);
