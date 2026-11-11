import { useEffect, useMemo, useRef, useState } from 'react';
import Photo from './Photo';
import Lightbox from './Lightbox';
import { HeartsBox, InviteCard, NutellaJar } from './Interactive';
import type { Chapter, MediaItem } from '../content';

type Props = {
  chapter: Chapter;
  index: number;
  onNext: () => void;
  onPrev: () => void;
  nextLabel: string;
  isFirst: boolean;
  isLast: boolean;
};

export default function ChapterView({ chapter, index, onNext, onPrev, nextLabel, isFirst, isLast }: Props) {
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);

  const media = useMemo<MediaItem[]>(() => {
    const list: MediaItem[] = [];
    if (chapter.photo) list.push(chapter.photo);
    if (chapter.chat) list.push(chapter.chat);
    if (chapter.gallery) list.push(...chapter.gallery);
    return list;
  }, [chapter]);

  useEffect(() => {
    setVisible(false);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [chapter.id]);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [chapter.id]);

  const primary = media[0];
  const thumbs = media.slice(1);

  return (
    <section
      ref={ref}
      className={`scene chapter ${visible ? 'is-visible' : ''} side-${chapter.side ?? 'right'}`}
      id={chapter.id}
      data-index={index}
      aria-labelledby={`${chapter.id}-title`}
    >
      <div className="chapter-inner">
        <header className="chapter-head">
          <div className="chapter-meta">
            {chapter.number && (
              <span className="chapter-num">
                <span className="chapter-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {chapter.number}
              </span>
            )}
            {chapter.date && <span className="chapter-date">{chapter.date}</span>}
          </div>
          <h2 ref={titleRef} id={`${chapter.id}-title`} tabIndex={-1}>
            {chapter.title}
          </h2>
        </header>

        <div className={`chapter-body ${media.length ? 'has-media' : 'no-media'}`}>
          <div className="chapter-text">
            {chapter.paragraphs.map((p, i) => (
              <p key={i} style={{ animationDelay: `${0.05 + i * 0.035}s` }}>
                {p}
              </p>
            ))}

            {chapter.highlight && (
              <div className="highlight">
                {chapter.highlight.map((h, i) => (
                  <p key={i}>{h}</p>
                ))}
              </div>
            )}
          </div>

          {primary && (
            <div className={`chapter-media ${thumbs.length ? 'has-thumbs' : ''}`}>
              <div className="media-primary">
                <Photo
                  src={primary.src}
                  alt={primary.alt}
                  caption={primary.caption}
                  contain={primary.kind === 'chat'}
                  className="primary"
                  onZoom={() => setLightbox(0)}
                  zoomLabel="Открыть на весь экран"
                  eager={index === 0}
                />
                {primary.kind === 'chat' && <span className="media-tag">переписка</span>}
                {primary.kind === 'chat' && (
                  <p className="media-hint">нажми на фото, чтобы прочитать переписку</p>
                )}
              </div>

              {thumbs.length > 0 && (
                <div className="media-thumbs">
                  {thumbs.map((item, i) => (
                    <Photo
                      key={item.src + i}
                      src={item.src}
                      alt={item.alt}
                      caption={item.caption}
                      contain={item.kind === 'chat'}
                      className="compact"
                      onZoom={() => setLightbox(i + 1)}
                      zoomLabel="Открыть на весь экран"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {(chapter.interactive || chapter.secret) && (
            <div className="chapter-extras">
              {chapter.interactive === 'invite' && <InviteCard />}
              {chapter.interactive === 'nutella' && <NutellaJar />}
              {chapter.interactive === 'hearts' && <HeartsBox />}

              {chapter.secret && (
                <div className="secret-wrap">
                  <button
                    type="button"
                    className={`secret-dot ${secretOpen ? 'is-open' : ''}`}
                    aria-label="Секретное послание"
                    aria-expanded={secretOpen}
                    onClick={() => setSecretOpen((v) => !v)}
                  >
                    <span aria-hidden="true">✦</span>
                  </button>
                  {!secretOpen && <span className="secret-hint">секрет</span>}
                  {secretOpen && (
                    <div className="secret-msg" role="status">
                      {chapter.secret}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="chapter-actions">
          <button type="button" className="btn ghost" onClick={onPrev}>
            <span className="btn-arrow" aria-hidden="true">
              ←
            </span>
            <span>{isFirst ? 'К началу' : 'Назад'}</span>
          </button>
          <button type="button" className="btn primary" onClick={onNext}>
            <span>{isLast ? nextLabel : 'Дальше'}</span>
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
          items={media}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndexChange={setLightbox}
        />
      )}
    </section>
  );
}
