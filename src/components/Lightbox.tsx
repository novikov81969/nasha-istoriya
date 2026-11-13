import { useEffect, useRef, useState } from 'react';
import type { MediaItem } from '../content';
import { ExpandIcon } from './icons';

type Props = {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

type Gesture = {
  mode: 'none' | 'swipe' | 'pan' | 'pinch';
  startX: number;
  startY: number;
  startDist: number;
  startScale: number;
  startTx: number;
  startTy: number;
  midX: number;
  midY: number;
  lastTap: number;
  moved: boolean;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function Lightbox({ items, index, onClose, onIndexChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const gesture = useRef<Gesture>({
    mode: 'none',
    startX: 0,
    startY: 0,
    startDist: 0,
    startScale: 1,
    startTx: 0,
    startTy: 0,
    midX: 0,
    midY: 0,
    lastTap: 0,
    moved: false,
  });
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [fsAvailable, setFsAvailable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const item = items[index];
  const hasMany = items.length > 1;

  const go = (dir: -1 | 1) => {
    onIndexChange((index + dir + items.length) % items.length);
  };

  const resetZoom = () => {
    setScale(1);
    setTx(0);
    setTy(0);
    gesture.current.mode = 'none';
    gesture.current.lastTap = 0;
  };

  const clampPan = (x: number, y: number, s = scale) => {
    const stage = stageRef.current;
    if (!stage) return { x, y };
    const iw = imgRef.current?.clientWidth ?? stage.clientWidth;
    const ih = imgRef.current?.clientHeight ?? stage.clientHeight;
    const maxX = Math.max(0, (iw * s - stage.clientWidth) / 2 + 16);
    const maxY = Math.max(0, (ih * s - stage.clientHeight) / 2 + 16);
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  };

  /** Приближение к точке (px, py) в координатах экрана. */
  const zoomAround = (nextScale: number, px: number, py: number) => {
    const stage = stageRef.current;
    const target = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    if (!stage) return;
    if (target === 1) {
      resetZoom();
      return;
    }
    const r = stage.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const k = target / scale;
    const ntx = px - cx - k * (px - cx - tx);
    const nty = py - cy - k * (py - cy - ty);
    const p = clampPan(ntx, nty, target);
    setScale(target);
    setTx(p.x);
    setTy(p.y);
  };

  const zoomBy = (factor: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    zoomAround(scale * factor, r.left + r.width / 2, r.top + r.height / 2);
  };

  const handleTap = (x: number, y: number) => {
    const g = gesture.current;
    const now = Date.now();
    if (now - g.lastTap < 300) {
      g.lastTap = 0;
      zoomAround(scale > 1 ? 1 : 2.2, x, y);
    } else {
      g.lastTap = now;
    }
  };

  const onFigureTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const g = gesture.current;
    g.moved = false;
    if (e.touches.length >= 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      g.mode = 'pinch';
      g.startScale = scale;
      g.startTx = tx;
      g.startTy = ty;
      g.startDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY) || 1;
      g.midX = (t0.clientX + t1.clientX) / 2;
      g.midY = (t0.clientY + t1.clientY) / 2;
      return;
    }
    const t = e.touches[0];
    g.startX = t.clientX;
    g.startY = t.clientY;
    if (scale > 1) {
      g.mode = 'pan';
      g.startTx = tx;
      g.startTy = ty;
    } else {
      g.mode = 'swipe';
    }
  };

  const onFigureTouchMove = (e: React.TouchEvent) => {
    const g = gesture.current;
    if (g.mode === 'pinch' && e.touches.length >= 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY) || 1;
      const next = clamp(g.startScale * (dist / g.startDist), MIN_SCALE, MAX_SCALE);
      const stage = stageRef.current;
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const k = next / g.startScale;
      const ntx = g.midX - cx - k * (g.midX - cx - g.startTx);
      const nty = g.midY - cy - k * (g.midY - cy - g.startTy);
      setScale(next);
      if (next <= MIN_SCALE) {
        setTx(0);
        setTy(0);
      } else {
        const p = clampPan(ntx, nty, next);
        setTx(p.x);
        setTy(p.y);
      }
      return;
    }

    if (g.mode === 'pan' && e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - g.startX;
      const dy = t.clientY - g.startY;
      if (Math.abs(dx) + Math.abs(dy) > 8) g.moved = true;
      const p = clampPan(g.startTx + dx, g.startTy + dy);
      setTx(p.x);
      setTy(p.y);
      return;
    }

    if (g.mode === 'swipe' && e.touches.length === 1) {
      const t = e.touches[0];
      if (Math.hypot(t.clientX - g.startX, t.clientY - g.startY) > 10) g.moved = true;
    }
  };

  const onFigureTouchEnd = (e: React.TouchEvent) => {
    const g = gesture.current;
    if (g.mode === 'pinch') {
      g.mode = 'none';
      return;
    }
    const t = e.changedTouches[0];
    if (!t) {
      g.mode = 'none';
      return;
    }
    const wasPan = g.mode === 'pan';
    const wasSwipe = g.mode === 'swipe';
    g.mode = 'none';

    if (!wasPan && !wasSwipe) return;

    const dx = t.clientX - g.startX;
    const dy = t.clientY - g.startY;

    if (g.moved) {
      if (wasSwipe && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        go(dx < 0 ? 1 : -1);
      }
      return;
    }

    handleTap(t.clientX, t.clientY);
  };

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, []);

  // смена кадра — сбрасываем приближение
  useEffect(() => {
    setScale(1);
    setTx(0);
    setTy(0);
    gesture.current.mode = 'none';
    gesture.current.lastTap = 0;
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) return;
        e.preventDefault();
        onClose();
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomBy(1.25);
      }
      if (e.key === '-') {
        e.preventDefault();
        zoomBy(0.8);
      }
      if (!hasMany) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onIndexChange((index + 1) % items.length);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onIndexChange((index - 1 + items.length) % items.length);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    setFsAvailable(Boolean(document.fullscreenEnabled));
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      rootRef.current?.requestFullscreen().catch(() => {});
    }
  };

  if (!item) return null;

  return (
    <div
      ref={rootRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.caption ?? item.alt}
      onClick={onClose}
      onTouchStart={(e) => {
        if (scale > 1 || e.touches.length !== 1) return;
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (scale > 1 || touchX.current === null || !hasMany) return;
        const delta = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
      }}
    >
      <div className="lightbox-top">
        <span className="lightbox-counter">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
        <div className="lightbox-actions">
          <button
            type="button"
            className="lightbox-zoom"
            onClick={(e) => {
              e.stopPropagation();
              zoomBy(0.8);
            }}
            disabled={scale <= MIN_SCALE}
            aria-label="Отдалить"
            title="Отдалить"
          >
            −
          </button>
          <button
            type="button"
            className="lightbox-zoom"
            onClick={(e) => {
              e.stopPropagation();
              zoomBy(1.25);
            }}
            disabled={scale >= MAX_SCALE}
            aria-label="Приблизить"
            title="Приблизить"
          >
            +
          </button>
          {fsAvailable && (
            <button
              type="button"
              className="lightbox-fs"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'Открыть на весь экран'}
              aria-pressed={isFullscreen}
              title={isFullscreen ? 'Свернуть' : 'На весь экран'}
            >
              <ExpandIcon collapsed={isFullscreen} />
            </button>
          )}
          <button ref={closeRef} className="lightbox-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
      </div>

      <div ref={stageRef} className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
        {hasMany && (
          <button className="lightbox-nav prev" onClick={() => go(-1)} aria-label="Предыдущее фото">
            ‹
          </button>
        )}
        <figure
          className={`lightbox-figure ${item.kind === 'chat' ? 'is-chat' : ''} ${scale > 1 ? 'is-zoomed' : ''}`}
          style={{ transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})` }}
          onTouchStart={onFigureTouchStart}
          onTouchMove={onFigureTouchMove}
          onTouchEnd={onFigureTouchEnd}
          onTouchCancel={() => {
            gesture.current.mode = 'none';
          }}
        >
          <img ref={imgRef} src={item.src} alt={item.alt} draggable={false} />
          {(item.caption || item.alt) && <figcaption>{item.caption ?? item.alt}</figcaption>}
        </figure>
        {hasMany && (
          <button className="lightbox-nav next" onClick={() => go(1)} aria-label="Следующее фото">
            ›
          </button>
        )}
      </div>

      <p className="lightbox-hint">щипок или двойной тап — приблизить</p>

      {hasMany && (
        <div className="lightbox-dots" onClick={(e) => e.stopPropagation()}>
          {items.map((it, i) => (
            <button
              key={it.src + i}
              className={`lightbox-dot ${i === index ? 'active' : ''}`}
              onClick={() => onIndexChange(i)}
              aria-label={`Фото ${i + 1}`}
              aria-current={i === index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
