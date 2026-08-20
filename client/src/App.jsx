import { CatalogProvider, useCatalog } from './CatalogContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import TipBar from './components/TipBar.jsx';
import Home from './pages/Home.jsx';
import Registros from './pages/Registros.jsx';
import Pendentes from './pages/Pendentes.jsx';
import Resumo from './pages/Resumo.jsx';
import Importar from './pages/Importar.jsx';
import Configuracoes from './pages/Configuracoes.jsx';

const PAGES = {
  home: Home,
  registros: Registros,
  pendentes: Pendentes,
  resumo: Resumo,
  importar: Importar,
  config: Configuracoes,
};

function AppShell() {
  const { page, error, setError } = useCatalog();
  const Page = PAGES[page] || Home;

  return (
    <div className="app-root">
      <div className="app-shell">
        <Sidebar />
        <div className="main-area">
          <Topbar />
          <main className="main-content">
            {error && (
              <div className="alert alert-error">
                {error}
                <button className="link-button" onClick={() => setError('')}>
                  fechar
                </button>
              </div>
            )}
            <Page />
          </main>
        </div>
      </div>
      <TipBar />
    </div>
  );
}

export default function App() {
  return (
    <CatalogProvider>
      <AppShell />
    </CatalogProvider>
  );
}
