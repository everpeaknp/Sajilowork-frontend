'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  type PanInfo,
} from 'motion/react';
import { List, Map } from 'lucide-react';

export type BrowseSheetSnap = 'map' | 'list';

/** Visible sheet height when map mode is active (grabber + toggle + label). */
const PEEK_HEIGHT = 112;

interface TaskBrowseMobileSheetProps {
  snap: BrowseSheetSnap;
  onSnapChange: (snap: BrowseSheetSnap) => void;
  taskCount: number;
  /** Singular label for the listing kind (default: task). */
  countLabel?: string;
  /** Hide while full-screen task details are open */
  hidden?: boolean;
  children: ReactNode;
}

export default function TaskBrowseMobileSheet({
  snap,
  onSnapChange,
  taskCount,
  countLabel = 'task',
  hidden = false,
  children,
}: TaskBrowseMobileSheetProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const [sheetHeight, setSheetHeight] = useState(480);
  const y = useMotionValue(0);

  const collapsedY = Math.max(0, sheetHeight - PEEK_HEIGHT);

  useLayoutEffect(() => {
    const parent = measureRef.current?.parentElement;
    if (!parent) return;

    const measure = () => {
      const h = parent.getBoundingClientRect().height;
      setSheetHeight(Math.max(280, Math.round(h * 0.92)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const target = snap === 'map' ? collapsedY : 0;
    const controls = animate(y, target, {
      type: 'spring',
      damping: 34,
      stiffness: 400,
    });
    return () => controls.stop();
  }, [snap, collapsedY, y]);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [snap, sheetHeight]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const current = y.get();
      const mid = collapsedY * 0.45;

      if (info.velocity.y > 350 || current > mid) {
        onSnapChange('map');
        return;
      }
      if (info.velocity.y < -350 || current < mid) {
        onSnapChange('list');
        return;
      }
      onSnapChange(current > mid ? 'map' : 'list');
    },
    [collapsedY, onSnapChange, y]
  );

  if (hidden) return null;

  return (
    <div
      ref={measureRef}
      className="pointer-events-none absolute inset-0 z-[35] lg:hidden"
      aria-hidden={hidden}
    >
      <motion.div
        className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[22px] border-t border-outline-variant/70 bg-white shadow-[0_-10px_48px_rgba(0,13,69,0.14)] dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-[0_-10px_48px_rgba(0,0,0,0.45)]"
        style={{ height: sheetHeight, y }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: collapsedY }}
        dragElastic={0.06}
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex shrink-0 cursor-grab flex-col touch-none active:cursor-grabbing"
          aria-label="Drag to show map or list"
          onPointerDown={(event) => dragControls.start(event)}
        >
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="h-1 w-9 rounded-full bg-outline-variant/90 dark:bg-neutral-700" />
          </div>

          <p className="px-4 pb-2 text-center text-xs font-semibold text-on-surface-variant">
            {taskCount} {taskCount === 1 ? countLabel : `${countLabel}s`} · swipe up for list
          </p>

          <div className="mx-4 mb-2 flex rounded-full bg-[#f1f4f9] p-1 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => onSnapChange('map')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-bold transition-all ${
                snap === 'map'
                  ? 'bg-white text-brand-dark shadow-sm dark:bg-neutral-900 dark:text-stone-100'
                  : 'text-on-surface-variant'
              }`}
            >
              <Map className="h-4 w-4 shrink-0" aria-hidden />
              Map
            </button>
            <button
              type="button"
              onClick={() => onSnapChange('list')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-bold transition-all ${
                snap === 'list'
                  ? 'bg-white text-brand-dark shadow-sm dark:bg-neutral-900 dark:text-stone-100'
                  : 'text-on-surface-variant'
              }`}
            >
              <List className="h-4 w-4 shrink-0" aria-hidden />
              List
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
