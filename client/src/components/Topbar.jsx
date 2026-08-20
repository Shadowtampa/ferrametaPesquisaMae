import { IconUsers, IconDownload } from '../icons.jsx';
import { EXPORT_CSV_URL } from '../api.js';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">
          <IconUsers size={20} strokeWidth={2} />
        </span>
        <div>
          <h1>Catálogo de Servidores</h1>
          <p>Cadastro, classificação e exportação de dados</p>
        </div>
      </div>
      <a className="button button-outline" href={EXPORT_CSV_URL}>
        <IconDownload size={16} />
        Exportar CSV
      </a>
    </header>
  );
}
