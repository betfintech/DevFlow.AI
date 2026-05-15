import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Search,
  ExternalLink, Brain, RefreshCw, Key, Package, Code,
  Settings, FileText,
} from 'lucide-react';
import { useSecurityStore } from '../store';
import { mockSecurityFindings } from '../services/mockData';
import { GlassCard, StatCard } from '../components/ui/GlassCard';
import { Badge, SeverityBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ScoreRing } from '../components/ui/ScoreRing';
import { callAI } from '../services/openrouter';
import { formatRelativeTime, cn } from '../utils/cn';
import type { SecurityFinding } from '../types';

const FINDING_ICONS: Record<string, React.ReactNode> = {
  vulnerability: <AlertTriangle size={14} />,
  secret: <Key size={14} />,
  dependency: <Package size={14} />,
  configuration: <Settings size={14} />,
  code: <Code size={14} />,
};

const FindingCard: React.FC<{
  finding: SecurityFinding;
  onAIAnalyze: (finding: SecurityFinding) => void;
  onStatusChange: (id: string, status: SecurityFinding['status']) => void;
  aiAnalysis?: string;
  isAnalyzing?: boolean;
}> = ({ finding, onAIAnalyze, onStatusChange, aiAnalysis, isAnalyzing }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <GlassCard padding="none" animate={false}>
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <div className={cn(
            'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
            finding.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
            finding.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
            finding.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
            'bg-blue-500/20 text-blue-400'
          )}>
            {FINDING_ICONS[finding.type] || <Shield size={14} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <SeverityBadge severity={finding.severity} />
              <span className="text-sm font-medium text-white">{finding.title}</span>
              <StatusBadge status={finding.status} />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="capitalize">{finding.type}</span>
              <span>{finding.repository}</span>
              {finding.file_path && (
                <span className="font-mono text-violet-400">{finding.file_path}
                  {finding.line_number && `:${finding.line_number}`}
                </span>
              )}
              {finding.cve_id && (
                <span className="text-red-400 font-mono">{finding.cve_id}</span>
              )}
              <span>{formatRelativeTime(finding.created_at)}</span>
            </div>
          </div>

          <div className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors">
            {expanded ? <XCircle size={14} /> : <CheckCircle size={14} />}
          </div>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-slate-700/40 p-4 space-y-4"
        >
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-1">Description</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{finding.description}</p>
          </div>

          {finding.package_name && (
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-slate-500">Package: </span>
                <span className="text-slate-200 font-mono">{finding.package_name}</span>
              </div>
              <div>
                <span className="text-slate-500">Current: </span>
                <span className="text-red-400 font-mono">{finding.current_version}</span>
              </div>
              {finding.fixed_version && (
                <div>
                  <span className="text-slate-500">Fixed in: </span>
                  <span className="text-emerald-400 font-mono">{finding.fixed_version}</span>
                </div>
              )}
            </div>
          )}

          {(finding.ai_recommendation || aiAnalysis) && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Brain size={12} className="text-violet-400" />
                <span className="text-xs font-semibold text-violet-400">AI Recommendation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {aiAnalysis || finding.ai_recommendation}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<Brain size={11} />}
              onClick={() => onAIAnalyze(finding)}
              isLoading={isAnalyzing}
            >
              AI Analysis
            </Button>

            {finding.status === 'open' && (
              <>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onStatusChange(finding.id, 'acknowledged')}
                >
                  Acknowledge
                </Button>
                <Button
                  variant="success"
                  size="xs"
                  onClick={() => onStatusChange(finding.id, 'fixed')}
                >
                  Mark Fixed
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onStatusChange(finding.id, 'false_positive')}
                >
                  False Positive
                </Button>
              </>
            )}

            {finding.cve_id && (
              <a
                href={`https://nvd.nist.gov/vuln/detail/${finding.cve_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <ExternalLink size={10} />
                View CVE
              </a>
            )}
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
};

export const Security: React.FC = () => {
  const { findings, setFindings, updateFinding } = useSecurityStore();
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('open');
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, string>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setFindings(mockSecurityFindings);
  }, []);

  const handleAIAnalyze = async (finding: SecurityFinding) => {
    if (analyzingId) return;
    setAnalyzingId(finding.id);
    try {
      const analysis = await callAI(
        `Analyze this security finding and provide remediation steps: ${JSON.stringify(finding)}`,
        'You are a cybersecurity expert. Provide specific, actionable remediation guidance.'
      );
      setAiAnalyses(prev => ({ ...prev, [finding.id]: analysis }));
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleStatusChange = (id: string, status: SecurityFinding['status']) => {
    updateFinding(id, { status });
  };

  const runScan = async () => {
    setIsScanning(true);
    await new Promise(r => setTimeout(r, 3000));
    setIsScanning(false);
  };

  const filtered = findings.filter(f => {
    const matchSearch = !search || f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.repository.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = selectedSeverity === 'all' || f.severity === selectedSeverity;
    const matchType = selectedType === 'all' || f.type === selectedType;
    const matchStatus = selectedStatus === 'all' || f.status === selectedStatus;
    return matchSearch && matchSeverity && matchType && matchStatus;
  });

  const stats = {
    critical: findings.filter(f => f.severity === 'critical' && f.status === 'open').length,
    high: findings.filter(f => f.severity === 'high' && f.status === 'open').length,
    medium: findings.filter(f => f.severity === 'medium' && f.status === 'open').length,
    low: findings.filter(f => f.severity === 'low' && f.status === 'open').length,
    fixed: findings.filter(f => f.status === 'fixed').length,
  };

  const overallScore = Math.max(0, 100 - (stats.critical * 25) - (stats.high * 10) - (stats.medium * 5) - (stats.low * 2));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Security Center</h2>
          <p className="text-sm text-slate-500">{findings.filter(f => f.status === 'open').length} open findings across {new Set(findings.map(f => f.repository)).size} repositories</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Shield size={14} />}
          onClick={runScan}
          isLoading={isScanning}
        >
          {isScanning ? 'Scanning...' : 'Run Security Scan'}
        </Button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1 flex justify-center">
          <ScoreRing score={overallScore} size="lg" label="Security Score" />
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Critical" value={stats.critical} icon={<AlertTriangle size={18} />} color="red" />
          <StatCard title="High" value={stats.high} icon={<AlertTriangle size={18} />} color="orange" />
          <StatCard title="Medium" value={stats.medium} icon={<AlertTriangle size={18} />} color="cyan" />
          <StatCard title="Fixed" value={stats.fixed} icon={<CheckCircle size={18} />} color="emerald" />
        </div>
      </div>

      {/* Filters */}
      <GlassCard padding="sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search findings..."
              leftIcon={<Search size={14} />}
              className="py-2"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs bg-slate-800/80 border border-slate-700/60 rounded-lg px-2 py-2 text-slate-300 outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-800/80 border border-slate-700/60 rounded-lg px-2 py-2 text-slate-300 outline-none"
          >
            <option value="all">All Types</option>
            <option value="vulnerability">Vulnerability</option>
            <option value="secret">Secret</option>
            <option value="dependency">Dependency</option>
            <option value="configuration">Configuration</option>
          </select>

          <div className="flex gap-1">
            {(['all', 'open', 'acknowledged', 'fixed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={cn(
                  'text-xs px-2.5 py-1.5 rounded-lg capitalize transition-all',
                  selectedStatus === s
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Findings */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Shield size={40} className="text-emerald-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No findings match your filters</p>
          <p className="text-sm text-slate-500 mt-1">Adjust filters or run a new security scan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((finding, idx) => (
            <motion.div
              key={finding.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <FindingCard
                finding={finding}
                onAIAnalyze={handleAIAnalyze}
                onStatusChange={handleStatusChange}
                aiAnalysis={aiAnalyses[finding.id]}
                isAnalyzing={analyzingId === finding.id}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Security;
