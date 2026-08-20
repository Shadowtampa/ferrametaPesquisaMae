import { useCatalog } from '../CatalogContext.jsx';
import RecordsTable from '../components/RecordsTable.jsx';

export default function Pendentes() {
  const { records, cargosDisponiveis } = useCatalog();

  return (
    <section className="panel">
      <h2>Classificação pendente</h2>
      <p className="widget-description">
        Registros cujo setor ainda não foi classificado como Unidade Acadêmica
        ou Unidade Administrativa. Clique em "Editar" para revisar e
        classificar.
      </p>
      <RecordsTable
        records={records}
        cargosDisponiveis={cargosDisponiveis}
        fixedClassificacao="NAO_SEI"
        showClassificacaoFilter={false}
        emptyMessage="Nenhum registro pendente de classificação."
      />
    </section>
  );
}
