import { useEffect, useRef, useState } from 'react';
import Photo from './Photo';
import { final, site } from '../content';

export default function Final({ onRestart }: { onRestart: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowEnd(true), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section ref={ref} className="scene final" tabIndex={-1} aria-labelledby="final-title">
      <div className="final-glow" aria-hidden="true">
        <span className="glow glow-a" />
        <span className="glow glow-b" />
        <div className="final-burst">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} style={{ left: `${8 + i * 10.5}%`, animationDelay: `${0.15 + i * 0.16}s` }}>
              ♥
            </span>
          ))}
        </div>
      </div>

      <div className="final-inner">
        <p className="eyebrow">
          <span className="rule" aria-hidden="true" />
          финальная глава
          <span className="rule" aria-hidden="true" />
        </p>

        <h2 className="final-title" id="final-title" tabIndex={-1}>
          {final.title}
        </h2>

        <div className="final-photo">
          <Photo
            src={final.photo.src}
            alt={final.photo.alt}
            caption={final.photo.caption}
            contain={false}
            eager
          />
        </div>

        <div className="final-text">
          {final.paragraphs.map((p, i) => (
            <p key={i} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
              {p}
            </p>
          ))}
        </div>

        <p className="final-signature">
          {final.signature} <span aria-hidden="true">♥</span>
        </p>

        {showEnd && (
          <div className="final-end">
            <div className="divider" aria-hidden="true">
              <span />
              <span className="divider-heart">♥</span>
              <span />
            </div>
            <p className="end-line">{site.finalLine}</p>
            <p className="end-sub">{site.finalSubline}</p>
            <button className="btn ghost" type="button" onClick={onRestart}>
              <span className="btn-arrow" aria-hidden="true">
                ↺
              </span>
              <span>{final.restart}</span>
            </button>
            <p className="final-note">{site.authorNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}
