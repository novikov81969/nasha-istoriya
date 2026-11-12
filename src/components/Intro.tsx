import { intro, site } from '../content';

type Props = {
  onStart: () => void;
  resumeLabel?: string | null;
  onResume?: () => void;
};

export default function Intro({ onStart, resumeLabel, onResume }: Props) {
  const [beforeName, ...afterName] = intro.heading.split(site.girlName);

  return (
    <section className="scene intro">
      <div className="intro-glow" aria-hidden="true">
        <span className="glow glow-a" />
        <span className="glow glow-b" />
        <span className="glow glow-c" />
        <div className="stars">
          {Array.from({ length: 42 }).map((_, i) => (
            <span
              key={i}
              className={`star star-${i % 5}`}
              style={{
                left: `${(i * 53 + 7) % 100}%`,
                top: `${(i * 37 + 11) % 100}%`,
                animationDelay: `${(i % 9) * 0.55}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="intro-content">
        <p className="eyebrow">
          <span className="rule" aria-hidden="true" />
          {intro.kicker}
          <span className="rule" aria-hidden="true" />
        </p>

        <h1 className="intro-title">
          {beforeName}
          <em>{site.girlName}</em>
          {afterName.join(site.girlName)}
        </h1>

        <div className="intro-lines">
          {intro.lines.map((line, i) => (
            <p key={i} className="intro-line" style={{ animationDelay: `${0.35 + i * 0.18}s` }}>
              {line}
            </p>
          ))}
        </div>

        <div className="intro-actions">
          <button className="btn primary" type="button" onClick={onStart}>
            <span>{intro.button}</span>
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </button>
          {resumeLabel && onResume && (
            <button className="btn ghost" type="button" onClick={onResume}>
              {resumeLabel}
            </button>
          )}
        </div>

        <p className="note">{site.authorNote}</p>
      </div>

      <div className="intro-foot">
        <span>{site.occasion}</span>
        <span className="intro-heart" aria-hidden="true">
          ♥
        </span>
      </div>
    </section>
  );
}
