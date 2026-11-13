import { useEffect, useRef, useState } from 'react';
import { letter } from '../content';

/**
 * Конверт «Для тебя»: по клику открывается, письмо проявляется
 * строка за строкой, в конце появляется сердечко.
 */
export default function Envelope() {
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!opened) return;
    const el = letterRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      window.requestAnimationFrame(() => {
        const top = el.getBoundingClientRect().top;
        if (top > window.innerHeight * 0.55) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }, [opened]);

  const open = () => {
    if (opening || opened) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setOpening(true);
    timer.current = window.setTimeout(() => setOpened(true), reduce ? 0 : 520);
  };

  return (
    <section className={`envelope-block ${opened ? 'is-open' : ''}`} aria-label="Письмо для Веры">
      <p className="eyebrow">
        <span className="rule" aria-hidden="true" />
        {letter.eyebrow}
        <span className="rule" aria-hidden="true" />
      </p>

      {!opened && (
        <button
          type="button"
          className={`envelope ${opening ? 'is-opening' : ''}`}
          onClick={open}
          aria-label={`${letter.title}. ${letter.hint}`}
        >
          <span className="envelope-body" aria-hidden="true">
            <span className="envelope-pocket" />
            <span className="envelope-flap" />
            <span className="envelope-to">Для тебя</span>
            <span className="envelope-seal" aria-hidden="true">
              ♥
            </span>
          </span>
          <span className="envelope-caption">
            <span className="envelope-hint">{letter.hint}</span>
          </span>
        </button>
      )}

      {opened && (
        <div className="letter" ref={letterRef} role="region" aria-labelledby="letter-title">
          <h3 className="sr-only" id="letter-title">
            Письмо для тебя
          </h3>
          <div className="letter-top" aria-hidden="true">
            <span>♥</span>
          </div>
          <div className="letter-body">
            {letter.paragraphs.map((text, i) => (
              <p key={i} style={{ animationDelay: `${0.12 + i * 0.16}s` }}>
                {text}
              </p>
            ))}
          </div>
          <p className="letter-sign">
            {letter.signature} <span aria-hidden="true">❤️</span>
          </p>
          <p className="letter-heart" aria-hidden="true">
            ♥
          </p>
        </div>
      )}
    </section>
  );
}
