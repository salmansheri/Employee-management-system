import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className = '' }: TooltipProps) {
  const [show, setShow] = useState(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const animationVariants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: side === 'top' ? 4 : side === 'bottom' ? -4 : 0,
      x: side === 'left' ? 4 : side === 'right' ? -4 : 0,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: side === 'top' ? 4 : side === 'bottom' ? -4 : 0,
      x: side === 'left' ? 4 : side === 'right' ? -4 : 0,
    },
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && content && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`absolute z-50 px-2 py-1 text-[10px] font-bold text-crust bg-text rounded-md shadow-lg pointer-events-none whitespace-nowrap border border-surface0/20 ${sideClasses[side]} ${className}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
