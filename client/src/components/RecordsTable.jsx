import { useEffect, useMemo, useState } from 'react';
import { useCatalog } from '../CatalogContext.jsx';
import { CLASSIFICACAO_OPTIONS, CLASSIFICACAO_LABELS, formatDate } from '../constants.js';
import { IconSearch, IconRefresh, IconEdit, IconTrash, IconChevronLeft, IconChevronRight } from '../icons.jsx';

function classificacaoBadgeClass(value) {
  if (value === 'UNIDADE_ACADEMICA') return 'badge tone-academica';
  if (value === 'UNIDADE_ADMINISTRATIVA') return 'badge tone-administrativa';
  return 'badge tone-nao-sei';
}

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result = [];
  let prev = null;
  for (const p of sorted) {
    if (prev !== null && p - prev > 1) result.push('ellipsis');
    result.push(p);
    prev = p;
  }
  return result;
}

export default function RecordsTable({
  records,
  cargosDisponiveis,
  showSearch = true,
  showCargoFilter = true,
  showClassificacaoFilter = true,
  fixedClassificacao = null,
  pageSize = 10,
  emptyMessage = 'Nenhum registro encontrado.',
}) {
  const { removeRecord, startEdit, refresh } = useCatalog();
  const [search, setSearch] = useState('');
  const [filterCargo, setFilterCargo] = useState('');
  const [filterClassificacao, setFilterClassificacao] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = records;
    const classFilter = fixedClassificacao || filterClassificacao;
    if (classFilter) list = list.filter((r) => r.classificacao_setor === classFilter);
    if (filterCargo) {
      list = list.filter((r) => r.cargo.toLowerCase() === filterCargo.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.cargo.toLowerCase().includes(q) || r.setor.toLowerCase().includes(q)
      );
    }
    return list;
  }, [records, search, filterCargo, filterClassificacao, fixedClassificacao]);

  useEffect(() => {
    setPage(1);
  }, [search, filterCargo, filterClassificacao, records.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  async function handleDelete(id) {
    if (!window.confirm('Excluir este registro?')) return;
    await removeRecord(id);
  }

  return (
    <div>
      <div className="toolbar">
        {showSearch && (
          <div className="search-input">
            <IconSearch size={16} />
            <input
              type="search"
              placeholder="Buscar por cargo ou setor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {showCargoFilter && (
          <select value={filterCargo} onChange={(e) => setFilterCargo(e.target.value)}>
            <option value="">Todos os cargos</option>
            {cargosDisponiveis.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        {showClassificacaoFilter && !fixedClassificacao && (
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
        )}

        <button type="button" className="icon-button" title="Atualizar" onClick={refresh}>
          <IconRefresh size={16} />
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Cargo</th>
              <th>Setor</th>
              <th>Classificação do Setor</th>
              <th>Data de cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((r, idx) => (
              <tr key={r.id}>
                <td>{start + idx + 1}</td>
                <td>{r.cargo || <span className="muted">— Não informado —</span>}</td>
                <td>{r.setor || <span className="muted">— Não informado —</span>}</td>
                <td>
                  <span className={classificacaoBadgeClass(r.classificacao_setor)}>
                    {CLASSIFICACAO_LABELS[r.classificacao_setor]}
                  </span>
                </td>
                <td>{formatDate(r.created_at)}</td>
                <td className="actions">
                  <button
                    type="button"
                    className="icon-button"
                    title="Editar"
                    onClick={() => startEdit(r)}
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button-danger"
                    title="Excluir"
                    onClick={() => handleDelete(r.id)}
                  >
                    <IconTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="pagination">
          <span className="pagination-summary">
            Mostrando {start + 1} a {Math.min(start + pageSize, filtered.length)} de{' '}
            {filtered.length} registros
          </span>
          <div className="pagination-controls">
            <button
              type="button"
              className="icon-button"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <IconChevronLeft size={16} />
            </button>
            {pageNumbers(currentPage, totalPages).map((p, idx) =>
              p === 'ellipsis' ? (
                <span key={`e${idx}`} className="pagination-ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`pagination-page${p === currentPage ? ' is-active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              className="icon-button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
