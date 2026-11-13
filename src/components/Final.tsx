import { useEffect, useRef, useState } from 'react';
import Envelope from './Envelope';
import { final, site } from '../content';

export default function Final({ onRestart }: { onRestart: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [endVisible, setEndVisible] = useState(false);

  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEndVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section ref={ref} className="scene final" tabIndex={-1} aria-labelledby="final-title">
      <div className="final-glow" aria-hidden="true">
        <span className="glow glow-a" />
        <span className="glow glow-b" />
        <span className="glow glow-c" />
      </div>

      <div className="final-inner">
        <p className="eyebrow">
          <span className="rule" aria-hidden="true" />
          {final.eyebrow}
          <span className="rule" aria-hidden="true" />
        </p>

        <h2 className="final-title" id="final-title" tabIndex={-1}>
          {final.title}
        </h2>

        <p className="final-lead">{final.lead}</p>

        <Envelope />

        <div ref={endRef} className={`final-endscene ${endVisible ? 'is-visible' : ''}`}>
          <div className="end-stars" aria-hidden="true">
            {Array.from({ length: 26 }).map((_, i) => (
              <span
                key={i}
                className={`end-star star-${i % 4}`}
                style={{
                  left: `${(i * 41 + 9) % 100}%`,
                  top: `${(i * 29 + 7) % 100}%`,
                  animationDelay: `${(i % 8) * 0.6}s`,
                }}
              />
            ))}
          </div>

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
      </div>
    </section>
  );
}
