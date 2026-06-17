'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';

const colorThemes = {
  tasknepal: {
    from: '217 100% 50%',
    to: '224 91% 18%',
    foreground: '0 0% 100%',
  },
  blue: {
    from: '217 91% 60%',
    to: '221 83% 53%',
    foreground: '0 0% 100%',
  },
  violet: {
    from: '262 83% 58%',
    to: '262 70% 50%',
    foreground: '0 0% 100%',
  },
  orange: {
    from: '24 94% 52%',
    to: '35 92% 60%',
    foreground: '0 0% 100%',
  },
} as const;

export type HighlightCardColor = keyof typeof colorThemes;

export interface HighlightCardProps {
  title: string;
  description: string;
  metricValue: string;
  metricLabel: string;
  buttonText: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
  bookmark?: React.ReactNode;
  color?: HighlightCardColor;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' },
  },
};

export const HighlightCard = React.forwardRef<HTMLDivElement, HighlightCardProps>(
  (
    {
      title,
      description,
      metricValue,
      metricLabel,
      buttonText,
      onButtonClick,
      icon,
      bookmark,
      color = 'tasknepal',
      className,
      isActive = false,
      onClick,
    },
    ref
  ) => {
    const theme = colorThemes[color] ?? colorThemes.tasknepal;
    const handleAction = onButtonClick ?? onClick;

    return (
      <motion.div
        ref={ref}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={cn(
          'relative w-full overflow-hidden rounded-2xl p-5 shadow-lg transition-shadow sm:p-6',
          onClick && 'cursor-pointer',
          isActive && 'shadow-xl ring-2 ring-white/40',
          className
        )}
        style={{
          '--card-from-color': `hsl(${theme.from})`,
          '--card-to-color': `hsl(${theme.to})`,
          '--card-foreground-color': `hsl(${theme.foreground})`,
          color: 'var(--card-foreground-color)',
          backgroundImage: `
            radial-gradient(circle at 1px 1px, hsla(0,0%,100%,0.14) 1px, transparent 0),
            linear-gradient(to bottom right, var(--card-from-color), var(--card-to-color))
          `,
          backgroundSize: '0.5rem 0.5rem, 100% 100%',
        } as any}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={onClick ? { scale: 1.01 } : undefined}
        whileTap={onClick ? { scale: 0.99 } : undefined}
      >
        <div className="absolute top-0 right-5 h-14 w-11 bg-white/95 backdrop-blur-sm [clip-path:polygon(0%_0%,_100%_0%,_100%_100%,_50%_75%,_0%_100%)] sm:right-6 sm:h-16 sm:w-12">
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden p-1.5"
            style={{ color: 'var(--card-from-color)' }}
          >
            {bookmark ?? icon}
          </div>
        </div>

        <div className="flex h-full min-h-[148px] flex-col justify-between">
          <div className="min-w-0 pr-14">
            <motion.h3
              variants={itemVariants}
              className="font-formula text-lg font-black leading-snug tracking-tight text-balance sm:text-xl"
            >
              {title}
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className="mt-1.5 line-clamp-2 max-w-[85%] font-body text-xs leading-relaxed opacity-90 sm:text-sm"
            >
              {description}
            </motion.p>
          </div>

          <motion.div variants={itemVariants} className="my-3 h-px w-full bg-white/20 sm:my-4" />

          <div className="flex items-end justify-between gap-3">
            <motion.div variants={itemVariants} className="min-w-0">
              <p className="font-formula text-2xl font-black tracking-tight sm:text-3xl">
                {metricValue}
              </p>
              <p className="font-body text-xs opacity-90 sm:text-sm">{metricLabel}</p>
            </motion.div>
            {buttonText && handleAction && (
              <motion.button
                type="button"
                variants={itemVariants}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction();
                }}
                className="shrink-0 rounded-full bg-white/30 px-3.5 py-2 font-body text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:px-4 sm:text-sm"
                aria-label={buttonText}
              >
                {buttonText}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

HighlightCard.displayName = 'HighlightCard';

export default HighlightCard;
