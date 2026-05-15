import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Plus, Search, Trash2, Tag, Star, Clock,
  Edit3, Save, X,
} from 'lucide-react';
import { useMemoryStore, useStatsStore } from '../store';
import { mockMemories } from '../services/mockData';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { generateId, formatRelativeTime, cn } from '../utils/cn';

type MemoryImportance = 'low' | 'medium' | 'high' | 'critical';
type MemorySource = 'user' | 'ai' | 'repository' | 'analysis';

interface MemoryItem {
  id: string;
  content: string;
  tags: string[];
  source: MemorySource;
  created_at: string;
  updated_at: string;
  importance: MemoryImportance;
  repository?: string;
}

const IMPORTANCE_COLORS: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low: 'text-slate-400 bg-slate-500/10 border-slate-600/30',
};

const SOURCE_BADGE_VARIANTS: Record<string, string> = {
  user: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  ai: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  repository: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  analysis: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

const MemoryCard: React.FC<{
  memory: MemoryItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<MemoryItem>) => void;
}> = ({ memory, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(memory.content);
  const [editTags, setEditTags] = useState(memory.tags.join(', '));

  const handleSave = () => {
    onUpdate(memory.id, {
      content: editContent,
      tags: editTags.split(',').map((t: string) => t.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  return (
    <GlassCard padding="none" animate={false} className="group">
      <div className="flex items-start gap-3 p-4">
        <div className={cn('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border', IMPORTANCE_COLORS[memory.importance])}>
          {memory.importance === 'critical' || memory.importance === 'high'
            ? <Star size={12} className="fill-current" />
            : memory.importance === 'medium'
            ? <Star size={12} />
            : <Clock size={12} />}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="mb-2 text-sm"
              rows={4}
            />
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed mb-2">{memory.content}</p>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            {isEditing ? (
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="text-xs py-1.5"
                leftIcon={<Tag size={11} />}
              />
            ) : (
              memory.tags.map((tag: string) => (
                <span key={tag} className="text-[10px] bg-slate-800/60 border border-slate-700/40 text-slate-400 px-1.5 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center transition-colors">
                <Save size={12} />
              </button>
              <button onClick={() => setIsEditing(false)} className="w-7 h-7 rounded-lg bg-slate-700/60 text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <X size={12} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="w-7 h-7 rounded-lg bg-slate-700/60 text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Edit3 size={12} />
              </button>
              <button onClick={() => onDelete(memory.id)} className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700/40 bg-slate-800/20 rounded-b-2xl">
        <div className="flex items-center gap-2">
          <span className={cn('text-[10px] px-2 py-0.5 rounded-md border font-medium', SOURCE_BADGE_VARIANTS[memory.source] || SOURCE_BADGE_VARIANTS.user)}>
            {memory.source}
          </span>
          {memory.repository && (
            <span className="text-[10px] text-slate-500">📁 {memory.repository}</span>
          )}
        </div>
        <span className="text-[10px] text-slate-600">{formatRelativeTime(memory.created_at)}</span>
      </div>
    </GlassCard>
  );
};

export const AIMemoryPage: React.FC = () => {
  const {
    memories, addMemory, removeMemory, updateMemory,
    searchQuery, setSearchQuery, selectedTags, setSelectedTags,
    getAllTags, getFilteredMemories,
  } = useMemoryStore();
  const { incrementStat } = useStatsStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImportance, setNewImportance] = useState<MemoryImportance>('medium');
  const [filterImportance, setFilterImportance] = useState('all');

  React.useEffect(() => {
    if (memories.length === 0) {
      mockMemories.forEach(m => addMemory(m));
    }
  }, []);

  const handleAddMemory = () => {
    if (!newContent.trim()) return;

    const memory = {
      id: generateId(),
      content: newContent.trim(),
      tags: newTags.split(',').map((t: string) => t.trim()).filter(Boolean),
      source: 'user' as MemorySource,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      importance: newImportance,
    };

    addMemory(memory);
    incrementStat('memories_stored');
    setNewContent('');
    setNewTags('');
    setShowAddForm(false);
  };

  const allTags = getAllTags();
  const filtered = getFilteredMemories().filter(m =>
    filterImportance === 'all' || m.importance === filterImportance
  );

  const stats = {
    total: memories.length,
    user: memories.filter(m => m.source === 'user').length,
    ai: memories.filter(m => m.source === 'ai' || m.source === 'analysis').length,
    critical: memories.filter(m => m.importance === 'critical').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">AI Memory</h2>
          <p className="text-sm text-slate-500">{stats.total} memories · {stats.critical} critical</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowAddForm(!showAddForm)}>
          Add Memory
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-violet-400' },
          { label: 'User Added', value: stats.user, color: 'text-cyan-400' },
          { label: 'AI Generated', value: stats.ai, color: 'text-emerald-400' },
          { label: 'Critical', value: stats.critical, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <p className={cn('text-xl font-bold', color)}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard padding="lg" glow="violet">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Brain size={16} className="text-violet-400" />
                Store New Memory
              </h3>
              <div className="space-y-3">
                <Textarea
                  label="Memory Content"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="What should I remember?"
                  rows={4}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Tags (comma separated)"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="react, architecture"
                    leftIcon={<Tag size={14} />}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">Importance</label>
                    <select
                      value={newImportance}
                      onChange={(e) => setNewImportance(e.target.value as MemoryImportance)}
                      className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleAddMemory} leftIcon={<Save size={14} />}>Store Memory</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search memories..." leftIcon={<Search size={14} />} />
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500">Importance:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((imp) => (
            <button key={imp} onClick={() => setFilterImportance(imp)}
              className={cn('text-xs px-2.5 py-1 rounded-lg capitalize transition-all',
                filterImportance === imp ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700'
              )}>
              {imp}
            </button>
          ))}
          <span className="text-xs text-slate-500 ml-2">Tags:</span>
          {allTags.slice(0, 8).map((tag: string) => (
            <button key={tag} onClick={() => setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag])}
              className={cn('text-xs px-2 py-0.5 rounded-lg transition-all',
                selectedTags.includes(tag) ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-slate-500 hover:text-slate-300 border border-slate-700/40'
              )}>
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Brain size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No memories found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((memory, idx) => (
            <motion.div key={memory.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <MemoryCard memory={memory as MemoryItem} onDelete={removeMemory} onUpdate={(id, updates) => updateMemory(id, updates)} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIMemoryPage;
