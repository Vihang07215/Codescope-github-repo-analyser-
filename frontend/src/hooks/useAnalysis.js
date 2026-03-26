import { useState, useCallback, useRef } from 'react';
import { analysisAPI } from '../services/api';

const POLL_INTERVAL = 2500;
const MAX_POLLS = 120; // 5 minutes max

export const useAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | analyzing | completed | failed
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const pollRef = useRef(null);
  const pollCount = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (analysisId) => {
    pollCount.current += 1;

    if (pollCount.current > MAX_POLLS) {
      stopPolling();
      setStatus('failed');
      setError('Analysis timed out. Please try again.');
      return;
    }

    // Simulate progress
    setProgress(prev => Math.min(prev + Math.random() * 3, 90));

    try {
      const { data: statusData } = await analysisAPI.getStatus(analysisId);

      if (statusData.data.status === 'completed') {
        stopPolling();
        setProgress(100);
        const { data: fullData } = await analysisAPI.getById(analysisId);
        setAnalysis(fullData.data);
        setStatus('completed');
      } else if (statusData.data.status === 'failed') {
        stopPolling();
        setStatus('failed');
        setError(statusData.data.errorMessage || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      if (pollCount.current > 5) {
        stopPolling();
        setStatus('failed');
        setError('Failed to get analysis status. Please check your connection.');
      }
    }
  }, [stopPolling]);

  const startAnalysis = useCallback(async (repoUrl) => {
    try {
      setStatus('loading');
      setError(null);
      setAnalysis(null);
      setProgress(5);
      pollCount.current = 0;
      stopPolling();

      const { data } = await analysisAPI.create(repoUrl);

      if (data.cached) {
        setAnalysis(data.data);
        setStatus('completed');
        setProgress(100);
        return;
      }

      setStatus('analyzing');
      setProgress(15);

      pollRef.current = setInterval(() => {
        pollStatus(data.analysisId);
      }, POLL_INTERVAL);

    } catch (err) {
      setStatus('failed');
      setError(err.response?.data?.message || 'Failed to start analysis. Please try again.');
      setProgress(0);
    }
  }, [pollStatus, stopPolling]);

  const loadAnalysis = useCallback(async (id) => {
    try {
      setStatus('loading');
      setError(null);
      const { data } = await analysisAPI.getById(id);
      setAnalysis(data.data);
      setStatus('completed');
      setProgress(100);
    } catch (err) {
      setStatus('failed');
      setError(err.response?.data?.message || 'Failed to load analysis.');
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setAnalysis(null);
    setStatus('idle');
    setError(null);
    setProgress(0);
    pollCount.current = 0;
  }, [stopPolling]);

  return { analysis, status, error, progress, startAnalysis, loadAnalysis, reset };
};
