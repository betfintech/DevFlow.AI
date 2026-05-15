import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, GitBranch, Star, GitFork, AlertCircle, Lock, Globe,
  RefreshCw, Filter, SortDesc, ChevronRight, ExternalLink,
} from 'lucide-react';
import { useRepositoryStore, useSettingsStore } from '../store';
import { fetchUserRepositories } from '../services/github';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ScoreRing } from '../components/ui/ScoreRing';
import { formatRelativeTime, formatNumber, getLanguageColor, cn } from '../utils/cn';

type SortOption = 'updated' | 'stars' | 'name' | 'health';
type FilterOption = 'all' | 'public' | 'private';

export const Repositories: React.FC = () => {
  const navigate = useNavigate();
  const { repositories, setRepositories, isLoading, setLoading } = useRepositoryStore();
  const { settings } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('updated');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const repos = await fetchUserRepositories();
      setRepositories(repos);
    } finally {
      setLoading(false);
    }
  };

  const languages = [...new Set(repositories.map(r => r.language).filter(Boolean))];

  const filteredRepos = repositories
    .filter(repo => {
      const matchesSearch = !search ||
        repo.name.toLowerCase().includes(search.toLowerCase()) ||
        repo.description?.toLowerCase().includes(search.toLowerCase()) ||
        repo.topics?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesFilter = filter === 'all' || (filter === 'private' ? repo.private : !repo.private);
      const matchesLanguage = !selectedLanguage || repo.language === selectedLanguage;
      return matchesSearch && matchesFilter && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'stars': return b.stars - a.stars;
        case 'name': return a.name.localeCompare(b.name);
        case 'health': return (b.health_score || 0) - (a.health_score || 0);
        default: return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Repositories</h2>
          <p className="text-sm text-slate-500">{repositories.length} repositories tracked</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
          onClick={loadRepositories}
          isLoading={isLoading}
        >
          Sync
        </Button>
      </div>

      {/* Filters */}
      <GlassCard padding="sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search repositories..."
              leftIcon={<Search size={14} />}
              className="py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter:</span>
            {(['all', 'public', 'private'] as FilterOption[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'text-xs px-2.5 py-1.5 rounded-lg transition-all duration-200 capitalize',
                  filter === f
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-xs bg-slate-800/80 border border-slate-700/60 rounded-lg px-2 py-1.5 text-slate-300 outline-none focus:border-violet-500/50"
            >
              <option value="updated">Recently Updated</option>
              <option value="stars">Most Stars</option>
              <option value="name">Name</option>
              <option value="health">Health Score</option>
            </select>
          </div>

          {languages.length > 0 && (
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs bg-slate-800/80 border border-slate-700/60 rounded-lg px-2 py-1.5 text-slate-300 outline-none focus:border-violet-500/50"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          )}
        </div>
      </GlassCard>

      {/* Repository List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/40 rounded-2xl animate-pulse border border-slate-700/30" />
          ))}
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="text-center py-12">
          <GitBranch size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No repositories found</p>
          <p className="text-xs text-slate-600 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredRepos.map((repo, idx) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard
                hover
                glow="violet"
                padding="lg"
                onClick={() => navigate(`/repositories/${repo.owner}/${repo.name}`)}
                animate={false}
                className="group"
              >
                <div className="flex items-start gap-4">
                  {/* Score */}
                  <ScoreRing
                    score={repo.health_score || 0}
                    size="sm"
                    showGrade={false}
                    animate={false}
                    className="flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {repo.private ? (
                          <Lock size={13} className="text-slate-500" />
                        ) : (
                          <Globe size={13} className="text-slate-500" />
                        )}
                        <span className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                          {repo.full_name}
                        </span>
                      </div>
                      {repo.private && <Badge variant="ghost" size="xs">Private</Badge>}
                      {(repo.health_score || 0) < 60 && (
                        <Badge variant="warning" size="xs" dot>Low Health</Badge>
                      )}
                      {(repo.security_score || 0) < 60 && (
                        <Badge variant="danger" size="xs" dot>Security Risk</Badge>
                      )}
                    </div>

                    {repo.description && (
                      <p className="text-sm text-slate-400 mb-2 line-clamp-1">{repo.description}</p>
                    )}

                    {/* Topics */}
                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {repo.topics.slice(0, 4).map(topic => (
                          <span key={topic} className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md px-1.5 py-0.5">
                            {topic}
                          </span>
                        ))}
                        {repo.topics.length > 4 && (
                          <span className="text-[10px] text-slate-600">+{repo.topics.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {repo.language && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }} />
                          <span>{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-amber-400" />
                        <span>{formatNumber(repo.stars)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork size={11} />
                        <span>{formatNumber(repo.forks)}</span>
                      </div>
                      {repo.open_issues > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertCircle size={11} className="text-amber-400" />
                          <span>{repo.open_issues} issues</span>
                        </div>
                      )}
                      <span>Updated {formatRelativeTime(repo.updated_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs text-slate-500">Health</span>
                      <span className="text-sm font-semibold" style={{
                        color: (repo.health_score || 0) >= 80 ? '#22c55e' : (repo.health_score || 0) >= 60 ? '#eab308' : '#ef4444'
                      }}>
                        {repo.health_score || 0}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>

                {/* AI Summary */}
                {repo.ai_summary && (
                  <div className="mt-3 pt-3 border-t border-slate-700/40">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-semibold text-violet-400 flex-shrink-0 mt-0.5">AI</span>
                      <p className="text-xs text-slate-500 line-clamp-2">{repo.ai_summary}</p>
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Repositories;
