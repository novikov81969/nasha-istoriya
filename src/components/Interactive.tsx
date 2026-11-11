import { useRef, useState } from 'react';

const TIMES = ['вечер', 'день'];
const PLACES = ['у парка', 'у фонтана'];

export function InviteCard() {
  const [time, setTime] = useState(TIMES[0]);
  const [place, setPlace] = useState(PLACES[0]);
  const [accepted, setAccepted] = useState(false);

  return (
    <div className={`invite-card ${accepted ? 'is-accepted' : ''}`} aria-label="Стилизованное воспоминание о приглашении">
      <div className="invite-head">
        <span className="invite-dot" aria-hidden="true" />
        <span>приглашение</span>
        <span className="invite-seal" aria-hidden="true">
          ♥
        </span>
      </div>

      <div className="invite-row">
        <span className="invite-label">время</span>
        <div className="chips" role="group" aria-label="Выбери время">
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${time === t ? 'active' : ''}`}
              aria-pressed={time === t}
              onClick={() => {
                setTime(t);
                setAccepted(false);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="invite-row">
        <span className="invite-label">место</span>
        <div className="chips" role="group" aria-label="Выбери место">
          {PLACES.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip ${place === p ? 'active' : ''}`}
              aria-pressed={place === p}
              onClick={() => {
                setPlace(p);
                setAccepted(false);
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="invite-foot">
        {accepted ? (
          <p className="invite-done" role="status">
            Приглашение принято <span aria-hidden="true">❤</span>
          </p>
        ) : (
          <button type="button" className="invite-btn" onClick={() => setAccepted(true)}>
            Принять приглашение
          </button>
        )}
        <span className="invite-hint">
          {time}, {place}
        </span>
      </div>
    </div>
  );
}

export function NutellaJar() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`nutella ${open ? 'is-open' : ''}`}>
      <div className="nutella-scene" aria-hidden="true">
        <span className="nutella-lid" />
        <span className="nutella-jar">
          <span className="nutella-label">Nutella</span>
          <span className="nutella-shine" />
        </span>
        <span className="nutella-drip" />
        <span className="nutella-heart">♥</span>
      </div>

      <div className="nutella-copy">
        <button type="button" className="btn ghost small" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? 'Закрыть баночку' : 'Открыть баночку'}
        </button>
        {open && (
          <p className="nutella-note" role="status">
            28 августа. Навсегда в нашей истории.
          </p>
        )}
      </div>
    </div>
  );
}

type Heart = { id: number; left: number; delay: number; scale: number };

export function HeartsBox() {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [total, setTotal] = useState(0);
  const idRef = useRef(0);

  const addHeart = () => {
    const fresh: Heart[] = Array.from({ length: 4 }, () => ({
      id: ++idRef.current,
      left: 8 + Math.random() * 84,
      delay: Math.random() * 0.3,
      scale: 0.65 + Math.random() * 0.7,
    }));
    setHearts((h) => [...h, ...fresh]);
    setTotal((t) => t + 1);
  };

  return (
    <div className="hearts-box">
      <button type="button" className="btn ghost" onClick={addHeart}>
        Ещё одно маленькое воспоминание <span aria-hidden="true">❤</span>
      </button>
      {total > 0 && (
        <p className="hearts-count" aria-live="polite">
          Сохранено сердечек: {total}
        </p>
      )}
      <div className="hearts-layer" aria-hidden="true">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="heart-float"
            style={{ left: `${h.left}%`, animationDelay: `${h.delay}s`, fontSize: `${h.scale * 1.15}rem` }}
            onAnimationEnd={() => setHearts((list) => list.filter((x) => x.id !== h.id))}
          >
            ♥
          </span>
        ))}
      </div>
    </div>
  );
}
