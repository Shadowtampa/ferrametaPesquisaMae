import DonutChart from './DonutChart.jsx';
import { CLASSIFICACAO_OPTIONS, statCountFor } from '../constants.js';

const COLOR_VAR = {
  academica: 'var(--color-academica)',
  administrativa: 'var(--color-administrativa)',
  'nao-sei': 'var(--color-nao-sei)',
};

export default function SummaryWidget({ stats }) {
  const total = stats ? stats.total : 0;
  const data = CLASSIFICACAO_OPTIONS.map((opt) => ({
    key: opt.value,
    label: opt.label,
    value: statCountFor(stats, opt.value),
    color: COLOR_VAR[opt.tone],
  }));

  return (
    <section className="panel widget">
      <h2>Resumo por classificação</h2>
      <div className="summary-body">
        <DonutChart data={data} />
        <ul className="legend">
          {data.map((d) => {
            const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0';
            return (
              <li key={d.key}>
                <span className="legend-dot" style={{ background: d.color }} />
                <span className="legend-label">{d.label}</span>
                <span className="legend-value">
                  {d.value} ({pct}%)
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="widget-total">
        Total de registros <strong>{total}</strong>
      </p>
    </section>
  );
}
