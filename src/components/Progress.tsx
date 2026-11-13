type Props = {
  current: number;
  total: number;
  label?: string;
  count?: string;
};

export default function Progress({ current, total, label = 'Наша история', count }: Props) {
  const pct = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
  return (
    <div className="progress">
      <div className="progress-meta">
        <span>{label}</span>
        <span className="progress-count">
          {count ?? (
            <>
              {String(current).padStart(2, '0')} <span aria-hidden="true">/</span> {String(total).padStart(2, '0')}
            </>
          )}
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Прогресс истории"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
