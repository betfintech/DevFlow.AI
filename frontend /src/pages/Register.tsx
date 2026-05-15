import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Eye, EyeOff, Lock, Mail, User, ArrowRight, Cpu, Check } from 'lucide-react';
import { useAuthStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { User as UserType } from '../types';
import { generateId } from '../utils/cn';

const FEATURES = [
  'AI-powered code review',
  'Real-time deployment monitoring',
  'Security vulnerability scanning',
  'AI memory & context system',
  'GitHub repository intelligence',
  'Multi-model AI support',
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockUser: UserType = {
        id: generateId(),
        username: formData.username || formData.email.split('@')[0],
        email: formData.email,
        github_username: formData.username,
        created_at: new Date().toISOString(),
        plan: 'free',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
      };

      login(mockUser, 'token-' + generateId());
      navigate('/onboarding');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignup = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockUser: UserType = {
      id: generateId(),
      username: 'demo-user',
      email: 'demo@gitmind.ai',
      github_username: 'demo-user',
      created_at: new Date().toISOString(),
      plan: 'pro',
    };
    login(mockUser, 'demo-token-' + generateId());
    setIsLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-slate-950 to-indigo-950/40" />
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side — Features */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">GitMind AI</h1>
              <p className="text-xs text-slate-500">DevOps Operating System</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">
            The AI-powered
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400"> DevOps OS</span>
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Transform your development workflow with AI-powered repository intelligence, automated security scanning, and real-time deployment monitoring.
          </p>

          <div className="space-y-3">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-violet-400" />
                </div>
                <span className="text-sm text-slate-300">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-900/60 border border-slate-700/50 rounded-2xl">
            <p className="text-xs text-slate-500 mb-2">Trusted by engineering teams at</p>
            <div className="flex gap-4">
              {['Acme Corp', 'TechFlow', 'DevStack', 'CodeLabs'].map((name) => (
                <span key={name} className="text-[11px] font-semibold text-slate-400">{name}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right side — Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create your account</h2>
            <p className="text-slate-400 text-sm mt-1">Start your free DevOps OS workspace</p>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={handleDemoSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 mb-4 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl text-violet-300 hover:text-violet-200 transition-all duration-200 font-medium text-sm"
            >
              <Cpu size={16} />
              Try Demo Account (No signup needed)
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-900/70 text-slate-500">or create account</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Input
                label="Username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="johndoe"
                leftIcon={<User size={15} />}
              />

              <Input
                label="Email address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@company.com"
                leftIcon={<Mail size={15} />}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Min. 8 characters"
                leftIcon={<Lock size={15} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-slate-200 transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                required
              />

              <Input
                label="Confirm password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repeat password"
                leftIcon={<Lock size={15} />}
                required
              />

              <p className="text-xs text-slate-500">
                By creating an account, you agree to our{' '}
                <button type="button" className="text-violet-400 hover:text-violet-300">Terms of Service</button>
                {' '}and{' '}
                <button type="button" className="text-violet-400 hover:text-violet-300">Privacy Policy</button>
              </p>

              <Button type="submit" fullWidth size="lg" isLoading={isLoading} rightIcon={<ArrowRight size={16} />}>
                Create Account
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
