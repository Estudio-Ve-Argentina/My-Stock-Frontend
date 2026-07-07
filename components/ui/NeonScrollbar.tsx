"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NeonScrollbarProps {
  children: ReactNode;
  className?: string;
}

export function NeonScrollbar({ children, className = "" }: NeonScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [visible, setVisible] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const dragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScroll = useRef(0);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    const canScroll = scrollHeight > clientHeight;
    setNeedsScroll(canScroll);
    if (!canScroll) return;
    const ratio = clientHeight / scrollHeight;
    const trackHeight = clientHeight - 16;
    const height = Math.max(ratio * trackHeight, 24);
    const top = (scrollTop / (scrollHeight - clientHeight)) * (trackHeight - height) + 8;
    setThumbHeight(height);
    setThumbTop(top);
  }, []);

  const showTemporarily = useCallback(() => {
    if (!needsScroll) return;
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!dragging.current) setVisible(false);
    }, 1500);
  }, [needsScroll]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const handleScroll = useCallback(() => {
    measure();
    showTemporarily();
  }, [measure, showTemporarily]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragging.current = true;
      dragStartY.current = e.clientY;
      dragStartScroll.current = containerRef.current?.scrollTop ?? 0;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const el = containerRef.current;
    const trackHeight = el.clientHeight - 16;
    const scrollableHeight = el.scrollHeight - el.clientHeight;
    const deltaY = e.clientY - dragStartY.current;
    const scrollDelta = (deltaY / (trackHeight - thumbHeight)) * scrollableHeight;
    el.scrollTop = dragStartScroll.current + scrollDelta;
  }, [thumbHeight]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 1500);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto no-scrollbar"
      >
        {children}
      </div>
      <AnimatePresence>
        {visible && needsScroll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-2"
          >
            <motion.div
              ref={thumbRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="pointer-events-auto absolute right-0 w-[3px] cursor-grab rounded-full active:cursor-grabbing"
              style={{ height: thumbHeight, top: thumbTop }}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              <div className="h-full w-full rounded-full bg-brand shadow-[0_0_4px_rgba(22,163,74,0.4)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
