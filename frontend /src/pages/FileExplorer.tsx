import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, FolderOpen, File, Code2, ChevronRight, ChevronDown,
  Search, GitBranch, Download, Copy, Check,
} from 'lucide-react';
import { useRepositoryStore } from '../store';
import { mockRepositories } from '../services/mockData';
import { fetchFileTree, fetchFileContent } from '../services/github';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { formatBytes, getLanguageColor, cn } from '../utils/cn';
import type { FileNode } from '../types';

const getFileLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
    py: 'Python', go: 'Go', rs: 'Rust', java: 'Java', cs: 'C#',
    cpp: 'C++', c: 'C', rb: 'Ruby', php: 'PHP', swift: 'Swift',
    kt: 'Kotlin', md: 'Markdown', json: 'JSON', yaml: 'YAML', yml: 'YAML',
    html: 'HTML', css: 'CSS', scss: 'CSS', sh: 'Shell', dockerfile: 'Docker',
  };
  return map[ext] || 'Text';
};

const FileIcon: React.FC<{ file: FileNode }> = ({ file }) => {
  if (file.type === 'dir') {
    return <Folder size={14} className="text-amber-400" />;
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const iconColors: Record<string, string> = {
    ts: 'text-blue-400', tsx: 'text-blue-400', js: 'text-amber-400', jsx: 'text-amber-400',
    py: 'text-blue-500', go: 'text-cyan-400', rs: 'text-orange-400', md: 'text-slate-300',
    json: 'text-amber-300', yaml: 'text-red-400', yml: 'text-red-400',
    html: 'text-orange-500', css: 'text-purple-400', scss: 'text-pink-400',
  };
  return <File size={14} className={iconColors[ext] || 'text-slate-400'} />;
};

const TreeNode: React.FC<{
  node: FileNode;
  depth: number;
  onSelect: (node: FileNode) => void;
  selectedPath: string | null;
  owner: string;
  repo: string;
}> = ({ node, depth, onSelect, selectedPath, owner, repo }) => {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const [children, setChildren] = useState<FileNode[]>(node.children || []);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  const isSelected = selectedPath === node.path;
  const isDir = node.type === 'dir';

  const handleClick = async () => {
    if (isDir) {
      if (!isOpen && children.length === 0 && !node.children) {
        setIsLoadingChildren(true);
        try {
          const loaded = await fetchFileTree(owner, repo, node.path);
          setChildren(loaded);
        } finally {
          setIsLoadingChildren(false);
        }
      }
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer hover:bg-slate-800/60 transition-colors text-sm group',
          isSelected && 'bg-violet-600/20 text-violet-200',
          !isSelected && 'text-slate-300'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isDir ? (
          <span className="flex-shrink-0 text-slate-500 w-3">
            {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </span>
        ) : <span className="w-3 flex-shrink-0" />}

        <span className="flex-shrink-0">
          {isDir ? (isOpen ? <FolderOpen size={14} className="text-amber-400" /> : <Folder size={14} className="text-amber-400" />) : <FileIcon file={node} />}
        </span>

        <span className="truncate text-xs">{node.name}</span>

        {node.size !== undefined && node.size > 0 && !isDir && (
          <span className="ml-auto text-[10px] text-slate-600 opacity-0 group-hover:opacity-100">{formatBytes(node.size)}</span>
        )}

        {isLoadingChildren && <div className="ml-auto w-3 h-3 rounded-full border border-violet-500 border-t-transparent animate-spin" />}
      </div>

      {isDir && isOpen && (children.length > 0 || (node.children && node.children.length > 0)) && (
        <div>
          {(children.length > 0 ? children : node.children || []).map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
              owner={owner}
              repo={repo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC = () => {
  const { repositories } = useRepositoryStore();
  const [selectedRepo, setSelectedRepo] = useState('');
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const allRepos = repositories.length > 0 ? repositories : mockRepositories;

  const loadFileTree = async (repoFullName: string) => {
    const [owner, repo] = repoFullName.split('/');
    setIsLoading(true);
    setSelectedFile(null);
    setFileContent('');
    try {
      const tree = await fetchFileTree(owner, repo);
      setFileTree(tree);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepoChange = (fullName: string) => {
    setSelectedRepo(fullName);
    if (fullName) loadFileTree(fullName);
  };

  const handleFileSelect = async (node: FileNode) => {
    setSelectedFile(node);
    if (node.type !== 'file') return;

    const [owner, repo] = selectedRepo.split('/');
    setIsLoadingContent(true);
    try {
      const content = await fetchFileContent(owner, repo, node.path);
      setFileContent(content);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [owner, repoName] = selectedRepo.split('/');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">File Explorer</h2>
          <p className="text-sm text-slate-500">Browse repository files and view content</p>
        </div>
      </div>

      {/* Repo selector */}
      <GlassCard padding="sm">
        <div className="flex gap-3 items-center">
          <GitBranch size={16} className="text-slate-400 flex-shrink-0" />
          <select
            value={selectedRepo}
            onChange={(e) => handleRepoChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none"
          >
            <option value="">Select a repository...</option>
            {allRepos.map(repo => (
              <option key={repo.id} value={repo.full_name}>{repo.full_name}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {selectedRepo ? (
        <div className="grid lg:grid-cols-5 gap-4 h-[calc(100vh-16rem)]">
          {/* File Tree */}
          <div className="lg:col-span-2">
            <GlassCard padding="none" className="h-full flex flex-col">
              <div className="p-3 border-b border-slate-700/50">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter files..."
                  leftIcon={<Search size={13} />}
                  className="py-1.5 text-xs"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="space-y-2 p-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-5 bg-slate-800/60 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%`, marginLeft: `${Math.random() * 30}px` }} />
                    ))}
                  </div>
                ) : fileTree.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">No files found</div>
                ) : (
                  fileTree.map((node) => (
                    <TreeNode
                      key={node.path}
                      node={node}
                      depth={0}
                      onSelect={handleFileSelect}
                      selectedPath={selectedFile?.path || null}
                      owner={owner}
                      repo={repoName}
                    />
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          {/* File Content */}
          <div className="lg:col-span-3">
            <GlassCard padding="none" className="h-full flex flex-col">
              {selectedFile ? (
                <>
                  <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <FileIcon file={selectedFile} />
                      <span className="text-sm font-medium text-slate-200">{selectedFile.path}</span>
                      {selectedFile.type === 'file' && (
                        <Badge variant="ghost" size="xs">{getFileLanguage(selectedFile.name)}</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="xs" leftIcon={copied ? <Check size={11} /> : <Copy size={11} />} onClick={copyContent}>
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    {isLoadingContent ? (
                      <div className="space-y-2">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="h-4 bg-slate-800/60 rounded animate-pulse" style={{ width: `${30 + Math.random() * 60}%` }} />
                        ))}
                      </div>
                    ) : (
                      <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                        {fileContent || '# File content preview not available'}
                      </pre>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                  <Code2 size={40} className="text-slate-600" />
                  <p className="text-slate-400 font-medium">Select a file to view its contents</p>
                  <p className="text-xs text-slate-600">Browse the file tree on the left and click any file</p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Folder size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-2">Select a Repository</p>
          <p className="text-sm text-slate-500">Choose a repository above to browse its files</p>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
