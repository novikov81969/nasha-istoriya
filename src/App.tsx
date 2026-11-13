import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Intro from './components/Intro';
import ChapterView from './components/Chapter';
import Gallery from './components/Gallery';
import Final from './components/Final';
import Progress from './components/Progress';
import { ExpandIcon, SpeakerIcon } from './components/icons';
import { chapters, gallery, site } from './content';
import { musicSrc } from './music';

type Phase = 'intro' | 'story' | 'gallery' | 'final';
type Saved = { phase: 'story' | 'gallery' | 'final'; index: number };

const STORAGE_KEY = 'nasha-istoriya:progress:v2';
const TOTAL_STEPS = chapters.length + 2; // главы + фотоальбом + финал

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    const { index, phase } = parsed;
    if (
      (phase === 'story' || phase === 'gallery' || phase === 'final') &&
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [fsAvailable, setFsAvailable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const musicAvailable = site.music.enabled && Boolean(musicSrc);

  // полноэкранный режим
  useEffect(() => {
    setFsAvailable(Boolean(document.fullscreenEnabled));
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // на вступлении музыка молчит (и останавливается при возврате к нему)
  useEffect(() => {
    if (phase !== 'intro') return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    setMuted(false);
  }, [phase]);

  const playMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = site.music.volume;
    audio.muted = false;
    setMuted(false);
    audio.play().catch(() => {
      /* браузер может запретить автозапуск — тогда просто без музыки */
    });
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  // запоминаем, где остановились
  useEffect(() => {
    if (phase === 'intro') return;
    const value: Saved = {
      phase,
      index: phase === 'story' ? index : Math.max(0, chapters.length - 1),
    };
    setSaved(value);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* приватный режим — просто не сохраняем */
    }
  }, [phase, index]);

  const start = useCallback(() => {
    playMusic();
    setPhase('story');
    setIndex(0);
    scrollTop();
  }, [playMusic]);

  const next = useCallback(() => {
    if (phase === 'story') {
      if (index < chapters.length - 1) setIndex(index + 1);
      else setPhase('gallery');
    } else if (phase === 'gallery') {
      setPhase('final');
    }
    scrollTop();
  }, [phase, index]);

  const prev = useCallback(() => {
    if (phase === 'story') {
      if (index > 0) setIndex(index - 1);
      else setPhase('intro');
    } else if (phase === 'gallery') {
      setPhase('story');
      setIndex(chapters.length - 1);
    } else if (phase === 'final') {
      setPhase('gallery');
    }
    scrollTop();
  }, [phase, index]);

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
    if (saved.phase === 'gallery') return 'Открыть фотоальбом';
    if (saved.index > 0) return `Продолжить с главы ${saved.index + 1}`;
    return null;
  }, [saved]);

  const resume = useCallback(() => {
    if (!saved) return;
    playMusic();
    setPhase(saved.phase);
    setIndex(saved.index);
    scrollTop();
  }, [saved, playMusic]);

  const step = phase === 'story' ? index + 1 : phase === 'gallery' ? chapters.length + 1 : TOTAL_STEPS;
  const progressLabel = phase === 'story' ? 'Наша история' : phase === 'gallery' ? 'Фотоальбом' : 'Финал';
  const progressCount =
    phase === 'story'
      ? `${String(index + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`
      : phase === 'gallery'
        ? `${gallery.items.length} кадров`
        : '♥';

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
      if (e.key === 'ArrowRight') next();
      else prev();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, start, next, prev]);

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
      else next();
    } else {
      prev();
    }
  };

  return (
    <div className="app" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <a className="skip-link" href="#main">
        К содержанию
      </a>

      {musicSrc && site.music.enabled && (
        <audio ref={audioRef} src={musicSrc} loop preload="metadata" />
      )}

      {phase !== 'intro' && (
        <header className="topbar">
          <div className="topbar-brand">
            <span className="brand-mark" aria-hidden="true">
              ♥
            </span>
            <span className="brand-title">{site.title}</span>
          </div>
          <Progress current={step} total={TOTAL_STEPS} label={progressLabel} count={progressCount} />
          <div className="topbar-actions">
            {musicAvailable && (
              <button
                type="button"
                className={`icon-btn ${muted ? 'is-off' : ''}`}
                onClick={toggleMusic}
                aria-label={muted ? 'Включить музыку' : 'Выключить музыку'}
                aria-pressed={muted}
                title={muted ? 'Включить музыку' : 'Выключить музыку'}
              >
                <SpeakerIcon muted={muted} />
              </button>
            )}
            {fsAvailable && (
              <button
                type="button"
                className="icon-btn"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'Открыть на весь экран'}
                aria-pressed={isFullscreen}
                title={isFullscreen ? 'Свернуть' : 'На весь экран'}
              >
                <ExpandIcon collapsed={isFullscreen} />
              </button>
            )}
          </div>
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
            nextLabel="К фотоальбому"
            isFirst={index === 0}
            isLast={index === chapters.length - 1}
          />
        )}

        {phase === 'gallery' && <Gallery onNext={next} onPrev={prev} />}

        {phase === 'final' && <Final onRestart={restart} />}
      </main>
    </div>
  );
}
