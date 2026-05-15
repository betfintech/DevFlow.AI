import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, GitBranch, Key, Brain, Rocket, ArrowRight, Check, ChevronRight } from 'lucide-react';
import { useSettingsStore, useAuthStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to GitMind AI',
    subtitle: 'Your AI-powered GitHub DevOps Operating System',
    icon: <Zap size={32} className="text-violet-400" />,
  },
  {
    id: 'github',
    title: 'Connect GitHub',
    subtitle: 'Link your GitHub account for repository intelligence',
    icon: <GitBranch size={32} className="text-cyan-400" />,
  },
  {
    id: 'ai',
    title: 'Configure AI',
    subtitle: 'Set up your AI model preferences and API access',
    icon: <Brain size={32} className="text-violet-400" />,
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    subtitle: 'Your workspace is ready. Let\'s explore GitMind AI.',
    icon: <Rocket size={32} className="text-emerald-400" />,
  },
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { updateSettings } = useSettingsStore();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [githubToken, setGithubToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');

  const handleNext = () => {
    if (currentStep === 1) {
      updateSettings({ github_token: githubToken });
    }
    if (currentStep === 2) {
      updateSettings({ openrouter_api_key: apiKey, default_model: selectedModel });
    }
    if (currentStep === steps.length - 1) {
      navigate('/dashboard');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleSkip = () => {
    if (currentStep === steps.length - 1) {
      navigate('/dashboard');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const models = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Best for complex analysis' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', desc: 'OpenAI flagship model' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', desc: 'Long context support' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', desc: 'Open source option' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-slate-950 to-indigo-950/40" />
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
                idx < currentStep
                  ? 'bg-violet-600 text-white'
                  : idx === currentStep
                  ? 'bg-violet-600/30 border-2 border-violet-500 text-violet-300'
                  : 'bg-slate-800 text-slate-600'
              }`}>
                {idx < currentStep ? <Check size={14} /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                  idx < currentStep ? 'bg-violet-600' : 'bg-slate-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/50 mb-4">
                {steps[currentStep].icon}
              </div>
              <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
              <p className="text-slate-400 text-sm mt-1">{steps[currentStep].subtitle}</p>
            </div>

            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed text-center">
                  Welcome, <span className="text-violet-400 font-semibold">{user?.username}</span>! 
                  Let's get your AI-powered DevOps workspace set up in just a few steps.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🤖', label: 'AI Code Review' },
                    { icon: '🔒', label: 'Security Scanning' },
                    { icon: '🚀', label: 'Deploy Monitor' },
                    { icon: '🧠', label: 'AI Memory' },
                    { icon: '📊', label: 'Analytics' },
                    { icon: '⚡', label: 'Real-time Updates' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/40">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: GitHub */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300">
                  <strong>Why connect GitHub?</strong> — Access your repositories, PRs, commits, and workflow runs directly in GitMind AI.
                </div>
                <Input
                  label="GitHub Personal Access Token"
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  hint="Create a token at github.com/settings/tokens with repo, read:org, read:user scopes"
                  leftIcon={<Key size={15} />}
                />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Check size={12} className="text-emerald-400" />
                  <span>Your token is stored locally and never sent to our servers</span>
                </div>
              </div>
            )}

            {/* Step 2: AI Config */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Input
                  label="OpenRouter API Key (optional)"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-xxxxxxxxxxxxxxxxxxxx"
                  hint="Get your key at openrouter.ai/keys. Leave blank to use demo mode."
                  leftIcon={<Key size={15} />}
                />
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-2">Default AI Model</p>
                  <div className="space-y-2">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left ${
                          selectedModel === model.id
                            ? 'bg-violet-600/20 border-violet-500/40 text-violet-200'
                            : 'bg-slate-800/60 border-slate-700/40 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{model.name}</p>
                          <p className="text-xs text-slate-500">{model.desc}</p>
                        </div>
                        {selectedModel === model.id && <Check size={16} className="text-violet-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {currentStep === 3 && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center"
                  >
                    <Check size={36} className="text-emerald-400" />
                  </motion.div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Your GitMind AI workspace is fully configured and ready to use.
                  Start by exploring your repositories or chatting with the AI assistant.
                </p>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/40 text-left space-y-2">
                  <p className="text-xs font-semibold text-slate-300 mb-2">Quick start tips:</p>
                  {[
                    'Visit Dashboard for an overview of your repos and deployments',
                    'Open AI Chat to get instant help with code and DevOps',
                    'Check Security Center for vulnerability reports',
                    'Upload a repository ZIP for instant AI analysis',
                  ].map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                      <ChevronRight size={12} className="text-violet-400 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Skip for now
                </button>
              )}
              <Button onClick={handleNext} fullWidth rightIcon={<ArrowRight size={16} />}>
                {currentStep === steps.length - 1 ? 'Enter GitMind AI' : 'Continue'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
