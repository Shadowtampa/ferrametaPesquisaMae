import { useCatalog } from '../CatalogContext.jsx';
import RecordsTable from '../components/RecordsTable.jsx';

export default function Registros() {
  const { records, cargosDisponiveis } = useCatalog();

  return (
    <section className="panel">
      <h2>Todos os registros</h2>
      <RecordsTable records={records} cargosDisponiveis={cargosDisponiveis} pageSize={15} />
    </section>
  );
}
