import { CLASSIFICACAO_OPTIONS, statCountFor } from '../constants.js';

export default function ClassificationCards({ value, onChange, stats }) {
  const total = stats ? stats.total : 0;

  return (
    <div className="classification-cards">
      {CLASSIFICACAO_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const count = statCountFor(stats, opt.value);
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`classification-card tone-${opt.tone}${selected ? ' is-selected' : ''}`}
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
          >
            <Icon size={20} />
            <span className="classification-card-label">{opt.label}</span>
            <span className="classification-card-count">
              {count} ({pct}%)
            </span>
          </button>
        );
      })}
    </div>
  );
}
