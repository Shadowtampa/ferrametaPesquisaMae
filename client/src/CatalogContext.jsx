import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  importCsv,
  getStats,
} from './api.js';

export const EMPTY_FORM = { cargo: '', setor: '', classificacao_setor: 'NAO_SEI' };

const CatalogContext = createContext(null);

export function CatalogProvider({ children, initialPage = 'home' }) {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState('');
  const [importSummary, setImportSummary] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(initialPage);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, st] = await Promise.all([listRecords(), getStats()]);
      setRecords(recs);
      setStats(st);
      setOnline(true);
      setError('');
    } catch (err) {
      setOnline(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cargosDisponiveis = useMemo(() => {
    const set = new Set(records.map((r) => r.cargo).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [records]);

  function startEdit(record) {
    setEditingId(record.id);
    setForm({
      cargo: record.cargo,
      setor: record.setor,
      classificacao_setor: record.classificacao_setor,
    });
    setError('');
    setPage('home');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function submitForm() {
    if (!form.cargo.trim() && !form.setor.trim()) {
      setError('Informe ao menos o cargo ou o setor.');
      return false;
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
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function removeRecord(id) {
    try {
      await deleteRecord(id);
      if (editingId === id) cancelEdit();
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function doImport(text) {
    try {
      const result = await importCsv(text);
      setImportSummary(result);
      setError('');
      await refresh();
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  const value = {
    records,
    stats,
    loading,
    online,
    error,
    setError,
    importSummary,
    setImportSummary,
    form,
    setForm,
    editingId,
    startEdit,
    cancelEdit,
    submitForm,
    removeRecord,
    doImport,
    refresh,
    cargosDisponiveis,
    page,
    setPage,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog deve ser usado dentro de CatalogProvider');
  return ctx;
}
