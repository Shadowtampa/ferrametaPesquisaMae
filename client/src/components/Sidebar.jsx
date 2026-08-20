import { useCatalog } from '../CatalogContext.jsx';
import {
  IconHome,
  IconList,
  IconClock,
  IconPieChart,
  IconUpload,
  IconSettings,
  IconDatabase,
} from '../icons.jsx';

const NAV_ITEMS = [
  { key: 'home', label: 'Início', icon: IconHome },
  { key: 'registros', label: 'Registros', icon: IconList },
  { key: 'pendentes', label: 'Classificação pendente', icon: IconClock, badgeKey: 'naoSei' },
  { key: 'resumo', label: 'Resumo', icon: IconPieChart },
  { key: 'importar', label: 'Importar planilhas', icon: IconUpload },
  { key: 'config', label: 'Configurações', icon: IconSettings },
];

export default function Sidebar() {
  const { page, setPage, stats, online } = useCatalog();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const badge = item.badgeKey && stats ? stats[item.badgeKey] : null;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`nav-item${active ? ' nav-item-active' : ''}`}
              onClick={() => setPage(item.key)}
            >
              <Icon size={18} />
              <span className="nav-item-label">{item.label}</span>
              {badge !== null && badge !== undefined && badge > 0 && (
                <span className="nav-badge">{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="storage-card">
          <IconDatabase size={18} />
          <div className="storage-card-text">
            <span>Dados salvos localmente</span>
            <strong>CSV</strong>
          </div>
        </div>
        <div className="storage-status">
          <span className={`status-dot${online ? ' status-dot-ok' : ' status-dot-off'}`} />
          {online ? 'Conectado' : 'Offline'}
        </div>
      </div>
    </aside>
  );
}
