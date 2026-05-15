import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, File, X, CheckCircle, Cpu, Brain, Shield, Package,
  Zap, RefreshCw, AlertTriangle, FolderOpen, FileArchive,
  BarChart3, ArrowRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUploadStore, useRepositoryStore } from '../store';
import { mockRepositories, mockAnalysisResults } from '../services/mockData';
import { GlassCard, StatCard } from '../components/ui/GlassCard';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ScoreRing, MultiScore } from '../components/ui/ScoreRing';
import { analyzeRepository } from '../services/openrouter';
import { generateId, formatBytes, cn } from '../utils/cn';
import type { Upload as UploadType } from '../types';

const ACCEPTED_TYPES = [
  'application/zip', 'application/x-zip-compressed', 'application/x-tar',
  'application/gzip', 'text/plain', 'application/json', 'text/javascript',
  'text/typescript', 'text/x-python',
];

const MAX_SIZE_MB = 100;

export const AIAnalysis: React.FC = () => {
  const { uploads, addUpload, updateUpload } = useUploadStore();
  const { repositories } = useRepositoryStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [analysisResults, setAnalysisResults] = useState(mockAnalysisResults);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'upload' | 'repos' | 'results'>('upload');

  const handleFiles = useCallback(async (files: File[]) => {
    for (const file of files) {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_SIZE_MB) {
        alert(`File "${file.name}" exceeds the ${MAX_SIZE_MB}MB limit`);
        continue;
      }

      const upload: UploadType = {
        id: generateId(),
        filename: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
        original_name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        created_at: new Date().toISOString(),
      };

      addUpload(upload);

      // Simulate upload progress
      const simulateProgress = async () => {
        for (let progress = 0; progress <= 100; progress += Math.random() * 15 + 5) {
          await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
          updateUpload(upload.id, { progress: Math.min(progress, 95), status: 'uploading' });
        }
        updateUpload(upload.id, { progress: 100, status: 'processing' });
        await new Promise(r => setTimeout(r, 1000));
        updateUpload(upload.id, { status: 'extracting' });
        await new Promise(r => setTimeout(r, 1500));
        updateUpload(upload.id, { status: 'analyzing' });
        await new Promise(r => setTimeout(r, 2000));
        updateUpload(upload.id, {
          status: 'complete',
          repository_name: file.name.replace(/\.(zip|tar|gz)$/, ''),
        });
      };

      simulateProgress();
    }
  }, [addUpload, updateUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const analyzeSelectedRepo = async (repoName: string) => {
    if (!repoName || isAnalyzing) return;
    setIsAnalyzing(repoName);
    try {
      const repo = repositories.find(r => r.name === repoName) || mockRepositories.find(r => r.name === repoName);
      const result = await analyzeRepository(
        repoName,
        repo ? `Language: ${repo.language}, Stars: ${repo.stars}, Description: ${repo.description}` : undefined
      );
      setAiOutput(prev => ({ ...prev, [repoName]: result }));
      setActiveTab('results');
    } finally {
      setIsAnalyzing(null);
    }
  };

  const tabs = [
    { id: 'upload' as const, label: 'Upload Repository', icon: <Upload size={14} /> },
    { id: 'repos' as const, label: 'Analyze Repository', icon: <Brain size={14} /> },
    { id: 'results' as const, label: 'Analysis Results', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white">AI Analysis</h2>
        <p className="text-sm text-slate-500">Upload repositories or run AI analysis on connected repos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-700/50 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center',
              activeTab === tab.id
                ? 'bg-violet-600/30 text-violet-200 border border-violet-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              'relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300',
              isDragOver
                ? 'border-violet-500 bg-violet-500/10 scale-[1.02]'
                : 'border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/20 cursor-pointer'
            )}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept=".zip,.tar,.gz,.js,.ts,.py,.json,.md"
              onChange={handleFileInput}
              className="hidden"
            />

            <motion.div
              animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
                {isDragOver ? (
                  <FolderOpen size={32} className="text-violet-400" />
                ) : (
                  <Upload size={32} className="text-violet-400" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {isDragOver ? 'Drop files here' : 'Upload Repository'}
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Drag & drop files or click to browse
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                {['.zip', '.tar.gz', '.js', '.ts', '.py', '.json'].map(ext => (
                  <span key={ext} className="text-xs bg-slate-800/60 border border-slate-700/40 text-slate-500 px-2 py-0.5 rounded-lg font-mono">
                    {ext}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-600 mt-4">Maximum file size: {MAX_SIZE_MB}MB</p>
            </motion.div>
          </div>

          {/* Upload Queue */}
          {uploads.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Upload Queue</h3>
              {uploads.map((upload) => (
                <GlassCard key={upload.id} padding="md" animate={false}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
                      upload.type.includes('zip') ? 'bg-amber-500/20' : 'bg-violet-500/20'
                    )}>
                      {upload.type.includes('zip') ? (
                        <FileArchive size={16} className="text-amber-400" />
                      ) : (
                        <File size={16} className="text-violet-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-200 truncate">{upload.original_name}</span>
                        <StatusBadge status={upload.status} />
                      </div>

                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs text-slate-500">{formatBytes(upload.size)}</span>
                        {upload.repository_name && (
                          <span className="text-xs text-violet-400">→ {upload.repository_name}</span>
                        )}
                      </div>

                      {(upload.status === 'uploading' || upload.status === 'processing') && (
                        <div className="h-1 bg-slate-700/60 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                      )}

                      {upload.status === 'extracting' && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                          <RefreshCw size={10} className="animate-spin" />
                          <span>Extracting archive...</span>
                        </div>
                      )}

                      {upload.status === 'analyzing' && (
                        <div className="flex items-center gap-1.5 text-xs text-violet-400">
                          <Brain size={10} className="animate-pulse" />
                          <span>AI analysis in progress...</span>
                        </div>
                      )}

                      {upload.status === 'complete' && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle size={10} />
                          <span>Analysis complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Repos Tab */}
      {activeTab === 'repos' && (
        <div className="space-y-4">
          <GlassCard padding="lg">
            <h3 className="font-semibold text-white mb-4">Analyze Connected Repository</h3>
            <div className="flex gap-3">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-violet-500/50"
              >
                <option value="">Select a repository...</option>
                {mockRepositories.map(repo => (
                  <option key={repo.id} value={repo.name}>{repo.full_name}</option>
                ))}
              </select>
              <Button
                variant="primary"
                onClick={() => analyzeSelectedRepo(selectedRepo)}
                isLoading={!!isAnalyzing}
                disabled={!selectedRepo}
                leftIcon={<Brain size={14} />}
              >
                Analyze
              </Button>
            </div>
          </GlassCard>

          {/* Analysis Options */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: <Brain size={20} className="text-violet-400" />, title: 'Full Analysis', desc: 'Comprehensive AI review of architecture, code quality, and best practices', color: 'violet' },
              { icon: <Shield size={20} className="text-red-400" />, title: 'Security Scan', desc: 'Deep security analysis including CVE detection and secret scanning', color: 'red' },
              { icon: <Package size={20} className="text-amber-400" />, title: 'Dependency Audit', desc: 'Analyze all dependencies for vulnerabilities and outdated packages', color: 'orange' },
              { icon: <Zap size={20} className="text-emerald-400" />, title: 'Performance Review', desc: 'Identify performance bottlenecks and optimization opportunities', color: 'emerald' },
            ].map((option) => (
              <GlassCard key={option.title} padding="md" hover animate={false}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center">
                    {option.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{option.title}</h4>
                    <p className="text-xs text-slate-400">{option.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {/* AI Output */}
          {Object.entries(aiOutput).map(([repo, output]) => (
            <GlassCard key={repo} padding="lg" glow="violet">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={16} className="text-violet-400" />
                <h3 className="font-semibold text-white">AI Analysis: {repo}</h3>
                <Badge variant="violet" size="xs">Fresh</Badge>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            </GlassCard>
          ))}

          {/* Previous Results */}
          {analysisResults.map((result) => (
            <GlassCard key={result.id} padding="lg" animate={false}>
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{result.repository}</h3>
                    <Badge variant="success" size="xs">Complete</Badge>
                  </div>
                  <p className="text-sm text-slate-400">{result.summary}</p>
                </div>
                <MultiScore
                  scores={[
                    { label: 'Health', score: result.health_score },
                    { label: 'Security', score: result.security_score },
                    { label: 'Quality', score: result.maintainability_score },
                  ]}
                  size="sm"
                />
              </div>

              {result.recommendations.length > 0 && (
                <div className="border-t border-slate-700/40 pt-4">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <ArrowRight size={12} className="text-violet-400" />
                    Top Recommendations
                  </h4>
                  <div className="space-y-1.5">
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="text-violet-400 flex-shrink-0 font-mono">{idx + 1}.</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          ))}

          {Object.keys(aiOutput).length === 0 && analysisResults.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No analysis results yet</p>
              <p className="text-xs text-slate-600 mt-1">Upload a repository or analyze a connected repo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
