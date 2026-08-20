const BASE = '/api';

async function handle(res) {
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch (err) {
      // resposta sem corpo JSON
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function listRecords({ search = '', cargo = '', classificacao = '' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (cargo) params.set('cargo', cargo);
  if (classificacao) params.set('classificacao', classificacao);
  const qs = params.toString();
  return fetch(`${BASE}/records${qs ? `?${qs}` : ''}`).then(handle);
}

export function createRecord(data) {
  return fetch(`${BASE}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updateRecord(id, data) {
  return fetch(`${BASE}/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);
}

export function deleteRecord(id) {
  return fetch(`${BASE}/records/${id}`, { method: 'DELETE' }).then(handle);
}

export function importCsv(csvText) {
  return fetch(`${BASE}/records/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv: csvText }),
  }).then(handle);
}

export function getStats() {
  return fetch(`${BASE}/stats`).then(handle);
}

export const EXPORT_CSV_URL = `${BASE}/records/export`;
