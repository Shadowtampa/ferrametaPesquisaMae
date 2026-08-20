import { useCatalog } from '../CatalogContext.jsx';
import RecordForm from '../components/RecordForm.jsx';
import RecordsTable from '../components/RecordsTable.jsx';
import SummaryWidget from '../components/SummaryWidget.jsx';
import PendingWidget from '../components/PendingWidget.jsx';
import ImportWidget from '../components/ImportWidget.jsx';

export default function Home() {
  const { records, cargosDisponiveis, stats } = useCatalog();

  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <RecordForm />

        <section className="panel">
          <h2>Registros cadastrados</h2>
          <RecordsTable records={records} cargosDisponiveis={cargosDisponiveis} />
        </section>
      </div>

      <div className="dashboard-side">
        <SummaryWidget stats={stats} />
        <PendingWidget />
        <ImportWidget />
      </div>
    </div>
  );
}
