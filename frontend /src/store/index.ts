import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  User,
  Repository,
  ChatMessage,
  Conversation,
  AIMemory,
  Notification,
  Upload,
  Deployment,
  SecurityFinding,
  AnalysisResult,
  AppStats,
  Settings,
  StreamingState,
} from '../types';

// ============================================================
// AUTH STORE
// ============================================================
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      login: (user, token) => set({ user, token, isAuthenticated: true, isLoading: false }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'gitmind-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// REPOSITORY STORE
// ============================================================
interface RepositoryStore {
  repositories: Repository[];
  selectedRepo: Repository | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
  setRepositories: (repos: Repository[]) => void;
  setSelectedRepo: (repo: Repository | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateRepository: (id: string, updates: Partial<Repository>) => void;
}

export const useRepositoryStore = create<RepositoryStore>()((set, get) => ({
  repositories: [],
  selectedRepo: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  setRepositories: (repositories) => set({ repositories, lastFetched: new Date().toISOString() }),
  setSelectedRepo: (selectedRepo) => set({ selectedRepo }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  updateRepository: (id, updates) => {
    const repos = get().repositories.map(r => r.id === id ? { ...r, ...updates } : r);
    set({ repositories: repos });
  },
}));

// ============================================================
// CHAT STORE
// ============================================================
interface ChatStore {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  streaming: StreamingState;
  isLoading: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  createConversation: (conversation: Conversation) => void;
  updateStreamingMessage: (token: string) => void;
  startStreaming: (conversationId: string) => void;
  stopStreaming: () => void;
  setLoading: (loading: boolean) => void;
  clearConversations: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversation: null,
      streaming: {
        isStreaming: false,
        currentMessage: '',
        conversationId: null,
      },
      isLoading: false,
      setConversations: (conversations) => set({ conversations }),
      setActiveConversation: (activeConversation) => set({ activeConversation }),
      addMessage: (conversationId, message) => {
        const conversations = get().conversations.map(c =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, message], updated_at: new Date().toISOString() }
            : c
        );
        const activeConversation = get().activeConversation;
        if (activeConversation?.id === conversationId) {
          set({
            conversations,
            activeConversation: {
              ...activeConversation,
              messages: [...activeConversation.messages, message],
              updated_at: new Date().toISOString(),
            },
          });
        } else {
          set({ conversations });
        }
      },
      createConversation: (conversation) => {
        set(state => ({
          conversations: [conversation, ...state.conversations],
          activeConversation: conversation,
        }));
      },
      updateStreamingMessage: (token) => {
        set(state => ({
          streaming: {
            ...state.streaming,
            currentMessage: state.streaming.currentMessage + token,
          },
        }));
      },
      startStreaming: (conversationId) => {
        set({
          streaming: {
            isStreaming: true,
            currentMessage: '',
            conversationId,
          },
        });
      },
      stopStreaming: () => {
        set({
          streaming: {
            isStreaming: false,
            currentMessage: '',
            conversationId: null,
          },
        });
      },
      setLoading: (isLoading) => set({ isLoading }),
      clearConversations: () => set({ conversations: [], activeConversation: null }),
    }),
    {
      name: 'gitmind-chat',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);

// ============================================================
// MEMORY STORE
// ============================================================
interface MemoryStore {
  memories: AIMemory[];
  isLoading: boolean;
  searchQuery: string;
  selectedTags: string[];
  setMemories: (memories: AIMemory[]) => void;
  addMemory: (memory: AIMemory) => void;
  removeMemory: (id: string) => void;
  updateMemory: (id: string, updates: Partial<AIMemory>) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setLoading: (loading: boolean) => void;
  getAllTags: () => string[];
  getFilteredMemories: () => AIMemory[];
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      memories: [],
      isLoading: false,
      searchQuery: '',
      selectedTags: [],
      setMemories: (memories) => set({ memories }),
      addMemory: (memory) => set(state => ({ memories: [memory, ...state.memories] })),
      removeMemory: (id) => set(state => ({ memories: state.memories.filter(m => m.id !== id) })),
      updateMemory: (id, updates) => set(state => ({
        memories: state.memories.map(m => m.id === id ? { ...m, ...updates } : m),
      })),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedTags: (selectedTags) => set({ selectedTags }),
      setLoading: (isLoading) => set({ isLoading }),
      getAllTags: () => {
        const tags = get().memories.flatMap(m => m.tags);
        return [...new Set(tags)];
      },
      getFilteredMemories: () => {
        const { memories, searchQuery, selectedTags } = get();
        return memories.filter(m => {
          const matchesSearch = !searchQuery ||
            m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
          const matchesTags = selectedTags.length === 0 ||
            selectedTags.some(t => m.tags.includes(t));
          return matchesSearch && matchesTags;
        });
      },
    }),
    {
      name: 'gitmind-memory',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// NOTIFICATION STORE
// ============================================================
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) => {
        set(state => {
          const notifications = [notification, ...state.notifications].slice(0, 100);
          return {
            notifications,
            unreadCount: notifications.filter(n => !n.read).length,
          };
        });
      },
      markAsRead: (id) => {
        set(state => {
          const notifications = state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          );
          return { notifications, unreadCount: notifications.filter(n => !n.read).length };
        });
      },
      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      removeNotification: (id) => {
        set(state => {
          const notifications = state.notifications.filter(n => n.id !== id);
          return { notifications, unreadCount: notifications.filter(n => !n.read).length };
        });
      },
      clearAll: () => set({ notifications: [], unreadCount: 0 }),
      setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
      }),
    }),
    {
      name: 'gitmind-notifications',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// UPLOAD STORE
// ============================================================
interface UploadStore {
  uploads: Upload[];
  isUploading: boolean;
  addUpload: (upload: Upload) => void;
  updateUpload: (id: string, updates: Partial<Upload>) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
  setUploading: (uploading: boolean) => void;
}

export const useUploadStore = create<UploadStore>()((set) => ({
  uploads: [],
  isUploading: false,
  addUpload: (upload) => set(state => ({ uploads: [upload, ...state.uploads] })),
  updateUpload: (id, updates) => set(state => ({
    uploads: state.uploads.map(u => u.id === id ? { ...u, ...updates } : u),
  })),
  removeUpload: (id) => set(state => ({ uploads: state.uploads.filter(u => u.id !== id) })),
  clearCompleted: () => set(state => ({
    uploads: state.uploads.filter(u => u.status !== 'complete' && u.status !== 'error'),
  })),
  setUploading: (isUploading) => set({ isUploading }),
}));

// ============================================================
// DEPLOYMENT STORE
// ============================================================
interface DeploymentStore {
  deployments: Deployment[];
  activeDeployment: Deployment | null;
  isLoading: boolean;
  setDeployments: (deployments: Deployment[]) => void;
  setActiveDeployment: (deployment: Deployment | null) => void;
  addDeploymentLog: (deploymentId: string, log: import('../types').DeploymentLog) => void;
  updateDeployment: (id: string, updates: Partial<Deployment>) => void;
  setLoading: (loading: boolean) => void;
}

export const useDeploymentStore = create<DeploymentStore>()((set, get) => ({
  deployments: [],
  activeDeployment: null,
  isLoading: false,
  setDeployments: (deployments) => set({ deployments }),
  setActiveDeployment: (activeDeployment) => set({ activeDeployment }),
  addDeploymentLog: (deploymentId, log) => {
    const deployments = get().deployments.map(d =>
      d.id === deploymentId
        ? { ...d, logs: [...d.logs, log] }
        : d
    );
    set({ deployments });
  },
  updateDeployment: (id, updates) => set(state => ({
    deployments: state.deployments.map(d => d.id === id ? { ...d, ...updates } : d),
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));

// ============================================================
// SECURITY STORE
// ============================================================
interface SecurityStore {
  findings: SecurityFinding[];
  analysisResults: AnalysisResult[];
  isLoading: boolean;
  selectedSeverity: string | null;
  setFindings: (findings: SecurityFinding[]) => void;
  addFinding: (finding: SecurityFinding) => void;
  updateFinding: (id: string, updates: Partial<SecurityFinding>) => void;
  setAnalysisResults: (results: AnalysisResult[]) => void;
  addAnalysisResult: (result: AnalysisResult) => void;
  setSelectedSeverity: (severity: string | null) => void;
  setLoading: (loading: boolean) => void;
  getCriticalCount: () => number;
  getHighCount: () => number;
}

export const useSecurityStore = create<SecurityStore>()((set, get) => ({
  findings: [],
  analysisResults: [],
  isLoading: false,
  selectedSeverity: null,
  setFindings: (findings) => set({ findings }),
  addFinding: (finding) => set(state => ({ findings: [finding, ...state.findings] })),
  updateFinding: (id, updates) => set(state => ({
    findings: state.findings.map(f => f.id === id ? { ...f, ...updates } : f),
  })),
  setAnalysisResults: (analysisResults) => set({ analysisResults }),
  addAnalysisResult: (result) => set(state => ({
    analysisResults: [result, ...state.analysisResults],
  })),
  setSelectedSeverity: (selectedSeverity) => set({ selectedSeverity }),
  setLoading: (isLoading) => set({ isLoading }),
  getCriticalCount: () => get().findings.filter(f => f.severity === 'critical' && f.status === 'open').length,
  getHighCount: () => get().findings.filter(f => f.severity === 'high' && f.status === 'open').length,
}));

// ============================================================
// APP STATS STORE
// ============================================================
interface StatsStore {
  stats: AppStats;
  isLoading: boolean;
  setStats: (stats: AppStats) => void;
  setLoading: (loading: boolean) => void;
  incrementStat: (key: keyof AppStats, amount?: number) => void;
}

export const useStatsStore = create<StatsStore>()((set, get) => ({
  stats: {
    total_repositories: 0,
    total_pull_requests: 0,
    open_pull_requests: 0,
    total_deployments: 0,
    successful_deployments: 0,
    security_findings: 0,
    critical_findings: 0,
    ai_messages_sent: 0,
    memories_stored: 0,
    uploads_processed: 0,
    avg_health_score: 0,
  },
  isLoading: false,
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  incrementStat: (key, amount = 1) => {
    set(state => ({
      stats: { ...state.stats, [key]: (state.stats[key] as number) + amount },
    }));
  },
}));

// ============================================================
// SETTINGS STORE
// ============================================================
interface SettingsStore {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: {
    mode: 'dark',
    accent: 'violet',
    glassmorphism: true,
    animations: true,
  },
  github_token: '',
  openrouter_api_key: '',
  default_model: 'anthropic/claude-3.5-sonnet',
  notifications_enabled: true,
  ai_memory_enabled: true,
  auto_analyze: false,
  upload_max_size_mb: 100,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (updates) => set(state => ({
        settings: { ...state.settings, ...updates },
      })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'gitmind-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// UI STORE (ephemeral, no persistence)
// ============================================================
interface UIStore {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  commandPaletteOpen: boolean;
  activeModal: string | null;
  setSidebarOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()((set, get) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  commandPaletteOpen: false,
  activeModal: null,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setActiveModal: (activeModal) => set({ activeModal }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}));
