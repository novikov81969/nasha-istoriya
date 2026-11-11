import { useEffect, useRef, useState } from 'react';
import { site } from '../content';

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onErr = () => setError(true);
    a.addEventListener('error', onErr);
    return () => a.removeEventListener('error', onErr);
  }, []);

  if (!site.music.enabled || error) return null;

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (playing) {
        a.pause();
        setPlaying(false);
      } else {
        a.volume = 0.55;
        await a.play();
        setPlaying(true);
      }
    } catch {
      setError(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={site.music.src} loop preload="none" />
      <button
        className={`music-toggle ${playing ? 'playing' : ''}`}
        onClick={toggle}
        aria-label={site.music.label}
        aria-pressed={playing}
        title={site.music.label}
      >
        <span aria-hidden="true">{playing ? '♫' : '♪'}</span>
      </button>
    </>
  );
}
