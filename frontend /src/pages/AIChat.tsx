import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send, Brain, Plus, Trash2, Copy, RefreshCw, ChevronDown,
  Cpu, Sparkles, MessageSquare, Code2, AlertCircle,
} from 'lucide-react';
import { useChatStore, useStatsStore, useSettingsStore } from '../store';
import { streamAIResponse, AVAILABLE_MODELS } from '../services/openrouter';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { generateId, formatRelativeTime, cn } from '../utils/cn';
import type { ChatMessage, Conversation } from '../types';

const SUGGESTED_PROMPTS = [
  { text: 'Analyze the security posture of my repositories', icon: '🔒' },
  { text: 'Review the latest pull request for gitmind-core', icon: '🔍' },
  { text: 'Explain the architecture of our API gateway', icon: '🏗️' },
  { text: 'What are the top risks in my current deployments?', icon: '⚠️' },
  { text: 'Generate a code review checklist for my team', icon: '✅' },
  { text: 'How can I improve test coverage in ml-pipeline?', icon: '🧪' },
];

const MessageBubble: React.FC<{ message: ChatMessage; isStreaming?: boolean }> = ({ message, isStreaming }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3 group', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm',
        isUser
          ? 'bg-violet-600/30 border border-violet-500/30'
          : 'bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/20'
      )}>
        {isUser ? (
          <span className="text-violet-300">U</span>
        ) : (
          <Brain size={16} className="text-white" />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 max-w-[85%]', isUser && 'flex flex-col items-end')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 relative',
          isUser
            ? 'bg-violet-600/20 border border-violet-500/30 text-slate-100'
            : 'bg-slate-800/60 border border-slate-700/50 text-slate-100'
        )}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code: ({ className, children, ...props }) => {
                    const isBlock = className?.includes('language-');
                    if (isBlock) {
                      return (
                        <div className="relative my-2">
                          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-700/50 rounded-t-lg px-3 py-1.5">
                            <span className="text-[10px] text-slate-500 font-mono">
                              {className?.replace('language-', '') || 'code'}
                            </span>
                            <button
                              onClick={() => navigator.clipboard.writeText(String(children))}
                              className="text-[10px] text-slate-500 hover:text-slate-300"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                          <pre className="bg-slate-900/60 border border-t-0 border-slate-700/50 rounded-b-lg p-3 overflow-x-auto">
                            <code className={cn('text-xs font-mono text-slate-300', className)} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    }
                    return (
                      <code className="bg-slate-700/60 text-violet-300 rounded px-1 py-0.5 text-xs font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                  h1: ({ children }) => <h1 className="text-base font-bold text-white mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold text-slate-200 mb-1.5">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-300 mb-1">{children}</h3>,
                  ul: ({ children }) => <ul className="list-none space-y-1 mb-2">{children}</ul>,
                  li: ({ children }) => (
                    <li className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-violet-400 mt-1 flex-shrink-0">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-violet-500 pl-3 text-slate-400 italic my-2">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {isStreaming && (
            <span className="inline-flex gap-0.5 ml-1">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-violet-400 inline-block"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className={cn(
          'flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isUser && 'flex-row-reverse'
        )}>
          <span className="text-[10px] text-slate-600">{formatRelativeTime(message.timestamp)}</span>
          {!isUser && (
            <button onClick={copyToClipboard} className="text-slate-600 hover:text-slate-400 transition-colors">
              {copied ? <span className="text-[10px] text-emerald-400">Copied!</span> : <Copy size={11} />}
            </button>
          )}
          {message.model && (
            <span className="text-[10px] text-slate-600 font-mono">
              {message.model.split('/').pop()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const AIChat: React.FC = () => {
  const {
    conversations, activeConversation, streaming,
    createConversation, addMessage, setActiveConversation,
    updateStreamingMessage, startStreaming, stopStreaming,
  } = useChatStore();
  const { incrementStat } = useStatsStore();
  const { settings } = useSettingsStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [selectedModel, setSelectedModel] = useState(settings.default_model);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<boolean>(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, streaming.currentMessage]);

  const createNewConversation = useCallback(() => {
    const conv: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      model: selectedModel,
    };
    createConversation(conv);
  }, [createConversation, selectedModel]);

  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    } else if (!activeConversation) {
      setActiveConversation(conversations[0]);
    }
  }, []);

  const sendMessage = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading || !activeConversation) return;

    setInput('');
    setIsLoading(true);
    abortRef.current = false;

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    if (activeConversation.messages.length === 0) {
      // Update conversation title
      const updatedConv = {
        ...activeConversation,
        title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        messages: [userMessage],
        updated_at: new Date().toISOString(),
      };
      setActiveConversation(updatedConv);
      useChatStore.getState().setConversations(
        conversations.map(c => c.id === activeConversation.id ? updatedConv : c)
      );
    } else {
      addMessage(activeConversation.id, userMessage);
    }

    // Start streaming
    startStreaming(activeConversation.id);
    incrementStat('ai_messages_sent');

    let fullResponse = '';

    try {
      const history = activeConversation.messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      for await (const chunk of streamAIResponse(text, history)) {
        if (abortRef.current) break;
        if (!chunk.done) {
          fullResponse += chunk.token;
          updateStreamingMessage(chunk.token);
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      fullResponse = 'Sorry, there was an error processing your request. Please try again.';
    }

    // Add assistant message
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: fullResponse || streaming.currentMessage,
      timestamp: new Date().toISOString(),
      model: selectedModel,
    };

    addMessage(activeConversation.id, assistantMessage);
    stopStreaming();
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const messages = activeConversation?.messages || [];
  const showWelcome = messages.length === 0 && !streaming.isStreaming;

  return (
    <div className="flex h-[calc(100vh-4rem-1rem)] gap-4">
      {/* Conversations Sidebar */}
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0">
        <GlassCard padding="none" className="flex flex-col h-full">
          <div className="p-3 border-b border-slate-700/50">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              leftIcon={<Plus size={14} />}
              onClick={createNewConversation}
            >
              New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={cn(
                  'w-full text-left p-2.5 rounded-xl text-xs transition-all duration-200',
                  activeConversation?.id === conv.id
                    ? 'bg-violet-600/20 text-violet-200 border border-violet-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <MessageSquare size={10} className="flex-shrink-0" />
                  <span className="truncate font-medium">{conv.title}</span>
                </div>
                <span className="text-[10px] text-slate-600 pl-4">
                  {formatRelativeTime(conv.updated_at)}
                </span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <GlassCard padding="none" className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {activeConversation?.title || 'New Chat'}
                </p>
                <p className="text-[10px] text-slate-500">GitMind AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Model selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModelSelect(!showModelSelect)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-300 hover:text-slate-100 hover:border-slate-600 transition-all"
                >
                  <Cpu size={11} />
                  <span className="max-w-[100px] truncate">{selectedModel.split('/').pop()}</span>
                  <ChevronDown size={11} />
                </button>
                {showModelSelect && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowModelSelect(false)} />
                    <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900/95 border border-slate-700/60 rounded-xl shadow-xl z-50 overflow-hidden">
                      {AVAILABLE_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => { setSelectedModel(model.id); setShowModelSelect(false); }}
                          className={cn(
                            'w-full text-left px-3 py-2.5 hover:bg-slate-800/60 transition-colors',
                            selectedModel === model.id && 'bg-violet-600/20'
                          )}
                        >
                          <p className="text-xs font-medium text-slate-200">{model.name}</p>
                          <p className="text-[10px] text-slate-500">{model.description}</p>
                          <p className="text-[10px] text-slate-600">{model.pricing.prompt} / {model.pricing.completion}</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {!settings.openrouter_api_key && (
                <Badge variant="warning" size="xs" dot>Demo Mode</Badge>
              )}

              <button
                onClick={createNewConversation}
                className="w-7 h-7 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {showWelcome ? (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-500/30">
                    <Sparkles size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">GitMind AI Assistant</h3>
                  <p className="text-slate-400 text-sm max-w-sm">
                    Ask me anything about your repositories, deployments, security vulnerabilities, or code quality.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <motion.button
                      key={prompt.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => sendMessage(prompt.text)}
                      className="flex items-start gap-2.5 p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl text-left transition-all duration-200"
                    >
                      <span className="text-lg flex-shrink-0">{prompt.icon}</span>
                      <span className="text-xs text-slate-300 leading-relaxed">{prompt.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {streaming.isStreaming && streaming.currentMessage && (
                  <MessageBubble
                    message={{
                      id: 'streaming',
                      role: 'assistant',
                      content: streaming.currentMessage,
                      timestamp: new Date().toISOString(),
                    }}
                    isStreaming
                  />
                )}

                {isLoading && !streaming.currentMessage && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                      <Brain size={16} className="text-white" />
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl px-4 py-3">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-violet-400"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about code, security, deployments... (Enter to send, Shift+Enter for newline)"
                  rows={1}
                  disabled={isLoading}
                  className="w-full bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none transition-all duration-200 max-h-32 disabled:opacity-50"
                  style={{ height: 'auto', minHeight: '48px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                leftIcon={isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              >
                Send
              </Button>
            </div>
            <p className="text-[10px] text-slate-600 mt-2 text-center">
              GitMind AI may make mistakes. Review important information.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AIChat;
