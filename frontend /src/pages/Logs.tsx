import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Download, Trash2, Filter, RefreshCw, Play, Pause } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn, formatRelativeTime } from '../utils/cn';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'debug';
  service: string;
  message: string;
}

const LEVEL_COLORS: Record<string, string> = {
  info: 'text-blue-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
  success: 'text-emerald-400',
  debug: 'text-slate-500',
};

const LEVEL_PREFIXES: Record<string, string> = {
  info: '[INFO ]',
  warn: '[WARN ]',
  error: '[ERROR]',
  success: '[OK   ]',
  debug: '[DEBUG]',
};

const generateMockLogs = (): LogEntry[] => {
  const services = ['api-gateway', 'ai-service', 'auth-service', 'repo-service', 'deploy-service'];
  const messages: Array<{ level: LogEntry['level']; msg: string }> = [
    { level: 'info', msg: 'Request received: GET /api/repositories' },
    { level: 'success', msg: 'Repository sync completed in 342ms' },
    { level: 'info', msg: 'AI analysis job queued for gitmind-core' },
    { level: 'warn', msg: 'Rate limit approaching: 4800/5000 requests' },
    { level: 'info', msg: 'WebSocket connection established from 192.168.1.42' },
    { level: 'success', msg: 'Deployment pipeline completed: gitmind-core v2.4.1' },
    { level: 'error', msg: 'Failed to connect to Redis: Connection refused' },
    { level: 'info', msg: 'Security scan initiated for ml-pipeline' },
    { level: 'warn', msg: 'High memory usage detected: 87% (threshold: 80%)' },
    { level: 'success', msg: 'JWT token validation successful for user sarah-chen' },
    { level: 'info', msg: 'OpenRouter API call: claude-3.5-sonnet, 1247 tokens' },
    { level: 'debug', msg: 'Cache hit ratio: 94.2% (excellent)' },
    { level: 'success', msg: 'File upload processed: project-repo.zip (47.2 MB)' },
    { level: 'info', msg: 'PR review requested for #142 in gitmind-core' },
    { level: 'error', msg: 'Build failed: TypeScript compilation errors in dist/main.js' },
    { level: 'info', msg: 'Database connection pool: 12/50 connections active' },
    { level: 'success', msg: 'Security vulnerability fixed: CVE-2023-52160 remediated' },
    { level: 'warn', msg: 'Slow query detected: SELECT * FROM deployments took 2.3s' },
    { level: 'info', msg: 'AI memory stored: 5 new entries added to knowledge base' },
    { level: 'debug', msg: 'Health check: all services operational' },
  ];

  return messages.map((m, idx) => ({
    id: idx.toString(),
    timestamp: new Date(Date.now() - (messages.length - idx) * 15000).toISOString(),
    level: m.level,
    service: services[idx % services.length],
    message: m.msg,
  }));
};

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(generateMockLogs);
  const [isLive, setIsLive] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const services = [...new Set(logs.map(l => l.service))];

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newMessages: Array<{ level: LogEntry['level']; msg: string; svc: string }> = [
        { level: 'info', msg: `Heartbeat check: all ${Math.floor(Math.random() * 5) + 1} services healthy`, svc: 'monitor' },
        { level: 'debug', msg: `Request ${Math.random().toString(36).substring(7)} processed in ${Math.floor(Math.random() * 200) + 50}ms`, svc: 'api-gateway' },
        { level: Math.random() > 0.8 ? 'warn' : 'success', msg: `AI inference complete: ${Math.floor(Math.random() * 2000) + 500} tokens`, svc: 'ai-service' },
      ];

      const picked = newMessages[Math.floor(Math.random() * newMessages.length)];
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: picked.level,
        service: picked.svc,
        message: picked.msg,
      };

      setLogs(prev => [...prev.slice(-200), newLog]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filtered = logs.filter(log => {
    const matchLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchService = filterService === 'all' || log.service === filterService;
    const matchSearch = !search || log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.service.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchService && matchSearch;
  });

  const levelCounts = {
    error: logs.filter(l => l.level === 'error').length,
    warn: logs.filter(l => l.level === 'warn').length,
    info: logs.filter(l => l.level === 'info').length,
    success: logs.filter(l => l.level === 'success').length,
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white">System Logs</h2>
          <p className="text-sm text-slate-500">{filtered.length} log entries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLive ? 'danger' : 'success'}
            size="sm"
            leftIcon={isLive ? <Pause size={14} /> : <Play size={14} />}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'Pause' : 'Live'}
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setLogs([])}>
            Clear
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => setLogs(generateMockLogs())}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 flex-shrink-0">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs..."
          className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500/50 flex-1 min-w-48"
        />

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
        >
          <option value="all">All Levels</option>
          <option value="error">Error ({levelCounts.error})</option>
          <option value="warn">Warning ({levelCounts.warn})</option>
          <option value="info">Info ({levelCounts.info})</option>
          <option value="success">Success ({levelCounts.success})</option>
          <option value="debug">Debug</option>
        </select>

        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
        >
          <option value="all">All Services</option>
          {services.map(svc => (
            <option key={svc} value={svc}>{svc}</option>
          ))}
        </select>
      </div>

      {/* Log Terminal */}
      <GlassCard padding="none" className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <Terminal size={12} className="text-slate-500 ml-2" />
            <span className="text-xs text-slate-500 font-mono">gitmind-logs</span>
            {isLive && <Badge variant="success" size="xs" dot pulse>Live</Badge>}
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="accent-violet-500"
            />
            Auto-scroll
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/40 font-mono text-xs">
          {filtered.length === 0 ? (
            <p className="text-slate-600">No log entries match your filters.</p>
          ) : (
            filtered.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn('flex gap-2 py-0.5 hover:bg-slate-800/30 px-1 rounded leading-relaxed', LEVEL_COLORS[log.level])}
              >
                <span className="text-slate-600 flex-shrink-0 tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="flex-shrink-0 font-bold">{LEVEL_PREFIXES[log.level]}</span>
                <span className="text-slate-500 flex-shrink-0">[{log.service}]</span>
                <span className="text-slate-300">{log.message}</span>
              </motion.div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </GlassCard>
    </div>
  );
};

export default Logs;
