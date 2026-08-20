import { useCatalog } from '../CatalogContext.jsx';

export default function PendingWidget() {
  const { stats, setPage } = useCatalog();
  const count = stats ? stats.naoSei : 0;

  return (
    <section className="panel widget">
      <h2>Registros pendentes</h2>
      <p className="widget-description">
        Setores que ainda não foram classificados como unidade acadêmica ou
        administrativa.
      </p>
      <div className="widget-cta">
        <span className="widget-count">{count}</span>
        <button type="button" className="button button-outline" onClick={() => setPage('pendentes')}>
          Ver pendentes
        </button>
      </div>
    </section>
  );
}
