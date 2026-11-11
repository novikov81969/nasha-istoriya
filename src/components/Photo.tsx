import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  contain?: boolean;
  onZoom?: () => void;
  zoomLabel?: string;
  eager?: boolean;
};

// Если реальный файл не найден — рисуем аккуратную заглушку.
export default function Photo({
  src,
  alt,
  caption,
  className = '',
  contain = false,
  onZoom,
  zoomLabel = 'Увеличить',
  eager = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className={`photo ${contain ? 'photo-contain' : ''} ${className}`.trim()}>
      <div className={`photo-frame ${loaded || failed ? 'is-ready' : 'is-loading'}`}>
        {failed ? (
          <div className="photo-placeholder" aria-label={alt}>
            <span>фото для Веры</span>
            <small>{alt}</small>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
        {onZoom && !failed && (
          <button className="photo-zoom" type="button" onClick={onZoom} aria-label={`${zoomLabel}: ${alt}`}>
            <span aria-hidden="true">⤢</span>
          </button>
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
