import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key, Bell, Shield, Upload, Save, Check,
  Eye, EyeOff, Brain, Zap, RefreshCw,
} from 'lucide-react';
import { useSettingsStore, useAuthStore } from '../store';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AVAILABLE_MODELS } from '../services/openrouter';
import { cn } from '../utils/cn';

export const Settings: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { user } = useAuthStore();
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [githubToken, setGithubToken] = useState(settings.github_token);
  const [apiKey, setApiKey] = useState(settings.openrouter_api_key);

  const handleSave = () => {
    updateSettings({
      github_token: githubToken,
      openrouter_api_key: apiKey,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    {
      title: 'GitHub Integration',
      icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="text-slate-300"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
      content: (
        <div className="space-y-4">
          <Input
            label="GitHub Personal Access Token"
            type={showGithubToken ? 'text' : 'password'}
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            leftIcon={<Key size={15} />}
            rightIcon={
              <button type="button" onClick={() => setShowGithubToken(!showGithubToken)}>
                {showGithubToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            hint="Required for repository access. Create at github.com/settings/tokens"
          />
          {githubToken && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Check size={12} />
              <span>GitHub token configured</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'AI Configuration',
      icon: <Brain size={18} className="text-violet-400" />,
      content: (
        <div className="space-y-4">
          <Input
            label="OpenRouter API Key"
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-xxxxxxxxxxxxxxxxxxxx"
            leftIcon={<Key size={15} />}
            rightIcon={
              <button type="button" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            hint="Get your key at openrouter.ai/keys. Leave blank to use demo mode."
          />
          {!apiKey && (
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Zap size={12} />
              <span>Running in demo mode — simulated AI responses</span>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Default AI Model</label>
            <div className="grid gap-2">
              {AVAILABLE_MODELS.slice(0, 4).map((model) => (
                <button
                  key={model.id}
                  onClick={() => updateSettings({ default_model: model.id })}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                    settings.default_model === model.id
                      ? 'bg-violet-600/20 border-violet-500/40 text-violet-200'
                      : 'bg-slate-800/60 border-slate-700/40 text-slate-300 hover:border-slate-600'
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{model.name}</p>
                    <p className="text-xs text-slate-500">{model.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{model.pricing.prompt}</p>
                    {settings.default_model === model.id && <Check size={14} className="text-violet-400 ml-auto mt-1" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Notifications',
      icon: <Bell size={18} className="text-amber-400" />,
      content: (
        <div className="space-y-3">
          {[
            { key: 'notifications_enabled', label: 'Enable Notifications', desc: 'Receive alerts for deployments, PRs, and security findings' },
            { key: 'ai_memory_enabled', label: 'AI Memory', desc: 'Allow AI to remember context from your conversations' },
            { key: 'auto_analyze', label: 'Auto-analyze Repositories', desc: 'Automatically analyze repositories when changes are detected' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
              <div>
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <button
                onClick={() => updateSettings({ [key]: !settings[key as keyof typeof settings] })}
                className={cn(
                  'relative w-10 h-5 rounded-full transition-colors duration-200',
                  settings[key as keyof typeof settings] ? 'bg-violet-600' : 'bg-slate-700'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200',
                  settings[key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Upload Settings',
      icon: <Upload size={18} className="text-cyan-400" />,
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1">Max Upload Size (MB)</label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={settings.upload_max_size_mb}
              onChange={(e) => updateSettings({ upload_max_size_mb: parseInt(e.target.value) })}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>10 MB</span>
              <span className="text-violet-400 font-medium">{settings.upload_max_size_mb} MB</span>
              <span>500 MB</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <p className="text-sm text-slate-500">Platform configuration and integrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={resetSettings}>
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={saved ? <Check size={14} /> : <Save size={14} />}
            onClick={handleSave}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {sections.map((section, idx) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <GlassCard padding="lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
                {section.icon}
              </div>
              <h3 className="font-semibold text-white">{section.title}</h3>
            </div>
            {section.content}
          </GlassCard>
        </motion.div>
      ))}

      {/* Danger Zone */}
      <GlassCard padding="lg" className="border-red-500/20">
        <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
          <Shield size={16} />
          Danger Zone
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-200">Clear All Data</p>
              <p className="text-xs text-slate-500">Remove all stored conversations, memories, and settings</p>
            </div>
            <Button variant="danger" size="sm" onClick={resetSettings}>
              Clear Data
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Settings;
