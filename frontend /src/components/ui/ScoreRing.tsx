import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  sublabel?: string;
  showGrade?: boolean;
  animate?: boolean;
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 'md',
  label,
  sublabel,
  showGrade = true,
  animate = true,
  className,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  const sizeConfig = {
    sm: { svg: 60, radius: 22, stroke: 4, textSize: 'text-sm', labelSize: 'text-[10px]' },
    md: { svg: 80, radius: 30, stroke: 5, textSize: 'text-lg', labelSize: 'text-xs' },
    lg: { svg: 100, radius: 38, stroke: 6, textSize: 'text-2xl', labelSize: 'text-xs' },
    xl: { svg: 130, radius: 50, stroke: 7, textSize: 'text-3xl', labelSize: 'text-sm' },
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getColor = (score: number): string => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const color = getColor(clampedScore);
  const grade = getGrade(clampedScore);

  const svgSize = config.svg;
  const center = svgSize / 2;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={config.stroke}
          />
          {/* Score ring */}
          {animate ? (
            <motion.circle
              cx={center}
              cy={center}
              r={config.radius}
              fill="none"
              stroke={color}
              strokeWidth={config.stroke}
              strokeDasharray={circumference}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
              style={{
                filter: `drop-shadow(0 0 6px ${color}60)`,
              }}
            />
          ) : (
            <circle
              cx={center}
              cy={center}
              r={config.radius}
              fill="none"
              stroke={color}
              strokeWidth={config.stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${color}60)`,
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn('font-bold leading-none', config.textSize)}
            style={{ color }}
          >
            {showGrade ? grade : `${Math.round(clampedScore)}`}
          </span>
          {showGrade && (
            <span className="text-[9px] text-slate-500 font-medium mt-0.5">
              {Math.round(clampedScore)}
            </span>
          )}
        </div>
      </div>

      {label && (
        <div className="text-center">
          <p className={cn('font-medium text-slate-200', config.labelSize)}>{label}</p>
          {sublabel && (
            <p className="text-[10px] text-slate-500">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Multi-score display
interface MultiScoreProps {
  scores: Array<{ label: string; score: number; icon?: string }>;
  size?: ScoreRingProps['size'];
  className?: string;
}

export const MultiScore: React.FC<MultiScoreProps> = ({ scores, size = 'sm', className }) => {
  return (
    <div className={cn('flex flex-wrap gap-4 justify-center', className)}>
      {scores.map((item) => (
        <ScoreRing
          key={item.label}
          score={item.score}
          size={size}
          label={item.label}
          showGrade={false}
        />
      ))}
    </div>
  );
};

export default ScoreRing;
