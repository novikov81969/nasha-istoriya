import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Intro from './components/Intro';
import ChapterView from './components/Chapter';
import Final from './components/Final';
import Progress from './components/Progress';
import MusicToggle from './components/MusicToggle';
import { chapters, final, site } from './content';

type Phase = 'intro' | 'story' | 'final';
type Saved = { phase: 'story' | 'final'; index: number };

const STORAGE_KEY = 'nasha-istoriya:progress:v1';

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    const index = parsed.index;
    const phase = parsed.phase;
    if (
      (phase === 'story' || phase === 'final') &&
      typeof index === 'number' &&
      Number.isInteger(index) &&
      index >= 0 &&
      index < chapters.length
    ) {
      return { phase, index };
    }
  } catch {
    /* localStorage может быть недоступен — это не критично */
  }
  return null;
}

function scrollTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<Saved | null>(() => readSaved());
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // запоминаем, где остановились
  useEffect(() => {
    if (phase === 'intro') return;
    const value: Saved = { phase, index };
    setSaved(value);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* приватный режим — просто не сохраняем */
    }
  }, [phase, index]);

  const start = useCallback(() => {
    setPhase('story');
    setIndex(0);
    scrollTop();
  }, []);

  const next = useCallback(() => {
    if (index < chapters.length - 1) setIndex((i) => i + 1);
    else setPhase('final');
    scrollTop();
  }, [index]);

  const prev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
    else setPhase('intro');
    scrollTop();
  }, [index]);

  const backToLastChapter = useCallback(() => {
    setPhase('story');
    setIndex(chapters.length - 1);
    scrollTop();
  }, []);

  const restart = useCallback(() => {
    setPhase('intro');
    setIndex(0);
    setSaved(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ок */
    }
    scrollTop();
  }, []);

  const resumeLabel = useMemo(() => {
    if (!saved) return null;
    if (saved.phase === 'final') return 'Вернуться к финалу';
    if (saved.index > 0) return `Продолжить с главы ${saved.index + 1}`;
    return null;
  }, [saved]);

  const resume = useCallback(() => {
    if (!saved) return;
    setPhase(saved.phase);
    setIndex(saved.index);
    scrollTop();
  }, [saved]);

  // клавиатура: ← / →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (document.querySelector('.lightbox')) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, input, select, textarea, [contenteditable="true"]')) return;

      e.preventDefault();
      if (phase === 'intro') {
        if (e.key === 'ArrowRight') start();
        return;
      }
      if (e.key === 'ArrowRight') {
        if (phase === 'story') next();
        return;
      }
      if (phase === 'story') prev();
      else if (phase === 'final') backToLastChapter();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, start, next, prev, backToLastChapter]);

  // свайпы на телефоне
  const onTouchStart = (e: React.TouchEvent) => {
    if (document.querySelector('.lightbox')) return;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || document.querySelector('.lightbox')) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.3) return;

    if (dx < 0) {
      if (phase === 'intro') start();
      else if (phase === 'story') next();
    } else if (phase === 'story') {
      prev();
    } else if (phase === 'final') {
      backToLastChapter();
    }
  };

  return (
    <div className="app" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <a className="skip-link" href="#main">
        К содержанию
      </a>

      {phase !== 'intro' && (
        <header className="topbar">
          <div className="topbar-brand">
            <span className="brand-mark" aria-hidden="true">
              ♥
            </span>
            <span className="brand-title">{site.title}</span>
          </div>
          <Progress
            current={phase === 'final' ? chapters.length : index + 1}
            total={chapters.length}
            label={phase === 'final' ? 'Финал' : 'Наша история'}
          />
          <span className="topbar-right">для {site.girlGenitive}</span>
        </header>
      )}

      <main className="app-main" id="main">
        {phase === 'intro' && (
          <Intro onStart={start} resumeLabel={resumeLabel} onResume={resume} />
        )}

        {phase === 'story' && (
          <ChapterView
            key={chapters[index].id}
            chapter={chapters[index]}
            index={index}
            onNext={next}
            onPrev={prev}
            nextLabel="К финалу"
            isFirst={index === 0}
            isLast={index === chapters.length - 1}
          />
        )}

        {phase === 'final' && <Final onRestart={restart} />}
      </main>

      <MusicToggle />
    </div>
  );
}
