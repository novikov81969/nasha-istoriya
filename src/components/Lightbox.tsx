import { useEffect, useRef, useState } from 'react';
import type { MediaItem } from '../content';
import { ExpandIcon } from './icons';

type Props = {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export default function Lightbox({ items, index, onClose, onIndexChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const [fsAvailable, setFsAvailable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const item = items[index];
  const hasMany = items.length > 1;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      rootRef.current?.requestFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    setFsAvailable(Boolean(document.fullscreenEnabled));
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const go = (dir: -1 | 1) => {
    onIndexChange((index + dir + items.length) % items.length);
  };

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) return;
        e.preventDefault();
        onClose();
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
  }, [index, items.length, hasMany, onClose, onIndexChange]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

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
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || !hasMany) return;
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

      <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
        {hasMany && (
          <button className="lightbox-nav prev" onClick={() => go(-1)} aria-label="Предыдущее фото">
            ‹
          </button>
        )}
        <figure className={`lightbox-figure ${item.kind === 'chat' ? 'is-chat' : ''}`}>
          <img src={item.src} alt={item.alt} />
          {(item.caption || item.alt) && <figcaption>{item.caption ?? item.alt}</figcaption>}
        </figure>
        {hasMany && (
          <button className="lightbox-nav next" onClick={() => go(1)} aria-label="Следующее фото">
            ›
          </button>
        )}
      </div>

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
