import { useCatalog } from '../CatalogContext.jsx';
import DonutChart from '../components/DonutChart.jsx';
import { CLASSIFICACAO_OPTIONS, statCountFor } from '../constants.js';

const COLOR_VAR = {
  academica: 'var(--color-academica)',
  administrativa: 'var(--color-administrativa)',
  'nao-sei': 'var(--color-nao-sei)',
};

export default function Resumo() {
  const { stats } = useCatalog();
  const total = stats ? stats.total : 0;

  const data = CLASSIFICACAO_OPTIONS.map((opt) => ({
    key: opt.value,
    label: opt.label,
    value: statCountFor(stats, opt.value),
    color: COLOR_VAR[opt.tone],
  }));

  const porCargo = stats ? Object.entries(stats.porCargo).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <section className="panel">
          <h2>Resumo por classificação</h2>
          <div className="summary-body summary-body-large">
            <DonutChart data={data} size={200} />
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
      </div>

      <div className="dashboard-side">
        <section className="panel widget">
          <h2>Registros por cargo</h2>
          {porCargo.length === 0 ? (
            <p className="widget-description">Nenhum registro cadastrado.</p>
          ) : (
            <ul className="cargo-breakdown">
              {porCargo.map(([cargo, count]) => (
                <li key={cargo}>
                  <span>{cargo}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
