import { useCatalog } from '../CatalogContext.jsx';
import { IconUpload } from '../icons.jsx';

export default function ImportWidget() {
  const { setPage } = useCatalog();

  return (
    <section className="panel widget">
      <h2>Importar planilhas</h2>
      <p className="widget-description">
        Importe dados das planilhas de Pedagogos e TAEs.
      </p>
      <button type="button" className="button button-outline" onClick={() => setPage('importar')}>
        <IconUpload size={16} />
        Importar agora
      </button>
    </section>
  );
}
