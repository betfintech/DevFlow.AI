import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, Shield, Rocket, GitBranch } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const LoadingStep: React.FC<{ text: string; delay: number; icon: React.ReactNode }> = ({ text, delay, icon }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 text-slate-400"
        >
          <span className="text-violet-400">{icon}</span>
          <span className="text-sm font-mono">{text}</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-emerald-400 text-xs ml-auto"
          >
            ✓ ready
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { text: 'Initializing AI orchestration engine...', delay: 300, icon: <Brain size={14} /> },
    { text: 'Loading GitHub integration layer...', delay: 800, icon: <GitBranch size={14} /> },
    { text: 'Starting security analysis service...', delay: 1300, icon: <Shield size={14} /> },
    { text: 'Connecting deployment monitor...', delay: 1800, icon: <Rocket size={14} /> },
    { text: 'GitMind AI OS ready.', delay: 2300, icon: <Zap size={14} /> },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const stepTimers = steps.map((_, idx) =>
      setTimeout(() => setCurrentStep(idx + 1), _.delay)
    );

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(interval);
      stepTimers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-slate-950 to-indigo-950/50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 flex items-center justify-center shadow-2xl shadow-violet-500/40 mb-4">
            <Zap size={40} className="text-white" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-black text-white tracking-tight"
          >
            GitMind AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-400 text-sm mt-1 font-mono"
          >
            DevOps Operating System
          </motion.p>
        </motion.div>

        {/* Loading steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          {steps.map((step, idx) => (
            <LoadingStep
              key={idx}
              text={step.text}
              delay={step.delay}
              icon={step.icon}
            />
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-xs text-slate-500">
            <span className="font-mono">Loading modules...</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
        </motion.div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
