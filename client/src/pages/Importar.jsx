import { useRef } from 'react';
import { useCatalog } from '../CatalogContext.jsx';
import { IconUpload } from '../icons.jsx';

export default function Importar() {
  const { doImport, importSummary, setImportSummary } = useCatalog();
  const fileInputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    await doImport(text);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <section className="panel">
          <h2>Importar planilhas</h2>
          <p className="widget-description">
            Selecione um arquivo CSV com os dados já existentes de Pedagogos e
            TAEs. As colunas esperadas são <code>cargo</code>, <code>setor</code>{' '}
            e <code>classificacao_setor</code> (ou <code>classificacao</code>).
            Linhas sem cargo e sem setor são ignoradas; quando a classificação
            não é reconhecida, o registro é importado como "Não sei" para
            revisão posterior.
          </p>

          <button
            type="button"
            className="button button-dark import-dropzone"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <IconUpload size={18} />
            Selecionar arquivo CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden-file-input"
            onChange={handleFile}
          />

          {importSummary && (
            <div className="alert alert-info">
              Importação concluída: {importSummary.imported} registro(s)
              importado(s)
              {importSummary.skipped > 0 &&
                `, ${importSummary.skipped} ignorado(s) por falta de cargo e setor`}
              .
              <button className="link-button" onClick={() => setImportSummary(null)}>
                fechar
              </button>
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-side">
        <section className="panel widget">
          <h2>Formato esperado</h2>
          <pre className="code-block">
{`cargo,setor,classificacao_setor
Pedagogo,ICED,UNIDADE_ACADEMICA
Pedagogo,Diretoria de Ensino,UNIDADE_ADMINISTRATIVA
TAE,ICS,UNIDADE_ACADEMICA
Pedagogo,Núcleo de Apoio Psicopedagógico,NAO_SEI`}
          </pre>
        </section>
      </div>
    </div>
  );
}
