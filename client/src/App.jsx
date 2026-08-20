import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  importCsv,
  getStats,
  EXPORT_CSV_URL,
} from './api.js';

const CLASSIFICACAO_OPTIONS = [
  { value: 'UNIDADE_ACADEMICA', label: 'Unidade Acadêmica' },
  { value: 'UNIDADE_ADMINISTRATIVA', label: 'Unidade Administrativa' },
  { value: 'NAO_SEI', label: 'Não sei' },
];

const CLASSIFICACAO_LABELS = Object.fromEntries(
  CLASSIFICACAO_OPTIONS.map((o) => [o.value, o.label])
);

const EMPTY_FORM = { cargo: '', setor: '', classificacao_setor: 'NAO_SEI' };

function ClassificacaoBadge({ value }) {
  const cls =
    value === 'UNIDADE_ACADEMICA'
      ? 'badge badge-academica'
      : value === 'UNIDADE_ADMINISTRATIVA'
        ? 'badge badge-administrativa'
        : 'badge badge-nao-sei';
  return <span className={cls}>{CLASSIFICACAO_LABELS[value] || value}</span>;
}

export default function App() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCargo, setFilterCargo] = useState('');
  const [filterClassificacao, setFilterClassificacao] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [importSummary, setImportSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const cargosDisponiveis = useMemo(() => {
    const set = new Set(records.map((r) => r.cargo).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [records]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, st] = await Promise.all([
        listRecords({ search, cargo: filterCargo, classificacao: filterClassificacao }),
        getStats(),
      ]);
      setRecords(recs);
      setStats(st);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterCargo, filterClassificacao]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.cargo.trim()) {
      setError('Informe o cargo.');
      return;
    }
    try {
      if (editingId) {
        await updateRecord(editingId, form);
      } else {
        await createRecord(form);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setError('');
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(record) {
    setEditingId(record.id);
    setForm({
      cargo: record.cargo,
      setor: record.setor,
      classificacao_setor: record.classificacao_setor,
    });
    setError('');
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleDelete(id) {
    if (!window.confirm('Excluir este registro?')) return;
    try {
      await deleteRecord(id);
      if (editingId === id) handleCancelEdit();
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = await importCsv(text);
      setImportSummary(result);
      setError('');
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Catálogo de Servidores por Cargo e Setor</h1>
        <p className="subtitle">Pedagogos e Técnicos em Assuntos Educacionais (TAEs)</p>
      </header>

      {stats && (
        <section className="stats" aria-label="Indicadores">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.porCargo.Pedagogo || 0}</span>
            <span className="stat-label">Pedagogos</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.porCargo.TAE || 0}</span>
            <span className="stat-label">TAEs</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.unidadeAcademica}</span>
            <span className="stat-label">Unidade Acadêmica</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.unidadeAdministrativa}</span>
            <span className="stat-label">Unidade Administrativa</span>
          </div>
          <div className="stat-card stat-warning">
            <span className="stat-value">{stats.naoSei}</span>
            <span className="stat-label">Não sei</span>
          </div>
        </section>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {importSummary && (
        <div className="alert alert-info">
          Importação concluída: {importSummary.imported} registro(s) importado(s)
          {importSummary.skipped > 0 && `, ${importSummary.skipped} ignorado(s) por falta de cargo`}.
          <button className="link-button" onClick={() => setImportSummary(null)}>
            fechar
          </button>
        </div>
      )}

      <section className="panel">
        <h2>{editingId ? 'Editar registro' : 'Cadastrar registro'}</h2>
        <form className="record-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="cargo">Cargo</label>
            <input
              id="cargo"
              name="cargo"
              list="cargos-sugeridos"
              value={form.cargo}
              onChange={handleFormChange}
              placeholder="Pedagogo, TAE..."
              required
            />
            <datalist id="cargos-sugeridos">
              <option value="Pedagogo" />
              <option value="TAE" />
            </datalist>
          </div>

          <div className="field">
            <label htmlFor="setor">Setor / Unidade</label>
            <input
              id="setor"
              name="setor"
              value={form.setor}
              onChange={handleFormChange}
              placeholder="Ex.: Instituto de Ciências da Educação (ICED)"
            />
          </div>

          <div className="field">
            <label htmlFor="classificacao_setor">Classificação do setor</label>
            <select
              id="classificacao_setor"
              name="classificacao_setor"
              value={form.classificacao_setor}
              onChange={handleFormChange}
            >
              {CLASSIFICACAO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field field-actions">
            <button type="submit">{editingId ? 'Salvar alterações' : 'Adicionar registro'}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={handleCancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Registros</h2>

        <div className="toolbar">
          <input
            type="search"
            placeholder="Pesquisar por cargo ou setor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={filterCargo} onChange={(e) => setFilterCargo(e.target.value)}>
            <option value="">Todos os cargos</option>
            {cargosDisponiveis.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterClassificacao}
            onChange={(e) => setFilterClassificacao(e.target.value)}
          >
            <option value="">Todas as classificações</option>
            {CLASSIFICACAO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="secondary"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            Importar CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden-file-input"
            onChange={handleImportFile}
          />

          <a className="button-link" href={EXPORT_CSV_URL}>
            Exportar CSV
          </a>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cargo</th>
                <th>Setor / Unidade</th>
                <th>Classificação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className={r.classificacao_setor === 'NAO_SEI' ? 'row-nao-sei' : ''}>
                  <td>{r.cargo}</td>
                  <td>{r.setor || <span className="muted">—</span>}</td>
                  <td>
                    <ClassificacaoBadge value={r.classificacao_setor} />
                  </td>
                  <td className="actions">
                    <button type="button" className="link-button" onClick={() => handleEdit(r)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="link-button link-button-danger"
                      onClick={() => handleDelete(r.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-state">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
