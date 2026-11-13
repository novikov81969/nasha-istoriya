import { useEffect, useRef, useState } from 'react';
import Photo from './Photo';
import Lightbox from './Lightbox';
import { LockIcon } from './icons';
import { gallery, secretAlbum } from '../content';

type Props = {
  onNext: () => void;
  onPrev: () => void;
};

export default function Gallery({ onNext, onPrev }: Props) {
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [secretIndex, setSecretIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section
      ref={ref}
      className={`scene gallery-scene ${visible ? 'is-visible' : ''}`}
      aria-labelledby="gallery-title"
    >
      <div className="gallery-inner">
        <header className="chapter-head gallery-head">
          <p className="eyebrow">
            <span className="rule" aria-hidden="true" />
            {gallery.eyebrow}
            <span className="rule" aria-hidden="true" />
          </p>
          <h2 ref={titleRef} id="gallery-title" tabIndex={-1}>
            {gallery.title}
          </h2>
          <p className="gallery-note">{gallery.note}</p>
        </header>

        <div className="gallery-grid">
          {gallery.items.map((item, i) => (
            <div
              className={`gallery-cell cell-${i} ${item.kind === 'chat' ? 'is-chat' : ''}`.trim()}
              key={item.src + i}
            >
              <Photo
                src={item.src}
                alt={item.alt}
                caption={item.caption}
                contain={item.kind === 'chat'}
                className="gallery-photo"
                onZoom={() => setLightbox(i)}
                zoomLabel="Открыть на весь экран"
              />
            </div>
          ))}
        </div>

        <div className="secret-album">
          <button
            type="button"
            className="secret-open"
            onClick={() => setSecretIndex(0)}
            aria-haspopup="dialog"
          >
            <span className="secret-open-icon" aria-hidden="true">
              <LockIcon />
            </span>
            <span className="secret-open-text">
              <strong>{secretAlbum.title}</strong>
              <small>{secretAlbum.hint}</small>
            </span>
          </button>
        </div>

        <div className="chapter-actions">
          <button type="button" className="btn ghost" onClick={onPrev}>
            <span className="btn-arrow" aria-hidden="true">
              ←
            </span>
            <span>К последней главе</span>
          </button>
          <button type="button" className="btn primary" onClick={onNext}>
            <span>К финалу</span>
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>

        <p className="key-hint" aria-hidden="true">
          <kbd>←</kbd>
          <kbd>→</kbd>
          <span>листать</span>
        </p>
      </div>

      {lightbox !== null && (
        <Lightbox
          items={gallery.items}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndexChange={setLightbox}
        />
      )}

      {secretIndex !== null && (
        <Lightbox
          items={secretAlbum.items}
          index={secretIndex}
          onClose={() => setSecretIndex(null)}
          onIndexChange={setSecretIndex}
        />
      )}
    </section>
  );
}
