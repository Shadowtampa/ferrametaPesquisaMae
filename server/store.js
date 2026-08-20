const { parseCSV, rowsToObjects, toCSV } = require('./csv');
const storage = require('./storage');

const HEADERS = ['id', 'cargo', 'setor', 'classificacao_setor', 'created_at', 'updated_at'];
const CLASSIFICACOES = ['UNIDADE_ACADEMICA', 'UNIDADE_ADMINISTRATIVA', 'NAO_SEI'];

class ValidationError extends Error {}
class NotFoundError extends Error {}

function normalizeClassificacao(value) {
  return CLASSIFICACOES.includes(value) ? value : 'NAO_SEI';
}

function mapClassificacaoLabel(raw) {
  const normalized = (raw || '').toUpperCase().trim();
  if (CLASSIFICACOES.includes(normalized)) return normalized;
  if (/ACAD/.test(normalized)) return 'UNIDADE_ACADEMICA';
  if (/ADMIN/.test(normalized)) return 'UNIDADE_ADMINISTRATIVA';
  return 'NAO_SEI';
}

async function readRaw() {
  const text = await storage.readText();
  if (!text) return [];
  const objects = rowsToObjects(parseCSV(text));
  return objects.map((o) => ({
    id: Number(o.id),
    cargo: o.cargo || '',
    setor: o.setor || '',
    classificacao_setor: normalizeClassificacao(o.classificacao_setor),
    created_at: o.created_at || '',
    updated_at: o.updated_at || '',
  }));
}

async function writeRaw(records) {
  await storage.writeText(toCSV(records, HEADERS));
}

function nextId(records) {
  return records.reduce((max, r) => Math.max(max, r.id || 0), 0) + 1;
}

// Serializa leituras/escritas para evitar corrida entre requisições concorrentes
// dentro da mesma instância do processo (não protege contra instâncias
// serverless concorrentes distintas escrevendo ao mesmo tempo).
let queue = Promise.resolve();
function withLock(fn) {
  const result = queue.then(fn);
  queue = result.then(
    () => {},
    () => {}
  );
  return result;
}

async function list({ search, cargo, classificacao } = {}) {
  return withLock(async () => {
    let records = await readRaw();
    if (cargo) {
      records = records.filter((r) => r.cargo.toLowerCase() === cargo.toLowerCase());
    }
    if (classificacao) {
      records = records.filter((r) => r.classificacao_setor === classificacao);
    }
    if (search) {
      const q = search.toLowerCase();
      records = records.filter(
        (r) => r.cargo.toLowerCase().includes(q) || r.setor.toLowerCase().includes(q)
      );
    }
    return records.sort((a, b) => a.id - b.id);
  });
}

async function create({ cargo, setor, classificacao_setor }) {
  return withLock(async () => {
    const trimmedCargo = (cargo || '').trim();
    const trimmedSetor = (setor || '').trim();
    if (!trimmedCargo && !trimmedSetor) {
      throw new ValidationError('Informe ao menos o cargo ou o setor.');
    }
    const records = await readRaw();
    const now = new Date().toISOString();
    const record = {
      id: nextId(records),
      cargo: trimmedCargo,
      setor: trimmedSetor,
      classificacao_setor: normalizeClassificacao(classificacao_setor),
      created_at: now,
      updated_at: now,
    };
    records.push(record);
    await writeRaw(records);
    return record;
  });
}

async function update(id, { cargo, setor, classificacao_setor }) {
  return withLock(async () => {
    const records = await readRaw();
    const idx = records.findIndex((r) => r.id === Number(id));
    if (idx === -1) throw new NotFoundError('Registro não encontrado.');
    const existing = records[idx];
    const newCargo = cargo !== undefined ? cargo.trim() : existing.cargo;
    const newSetor = setor !== undefined ? setor.trim() : existing.setor;
    if (!newCargo && !newSetor) {
      throw new ValidationError('Informe ao menos o cargo ou o setor.');
    }
    const updated = {
      ...existing,
      cargo: newCargo,
      setor: newSetor,
      classificacao_setor:
        classificacao_setor !== undefined
          ? normalizeClassificacao(classificacao_setor)
          : existing.classificacao_setor,
      updated_at: new Date().toISOString(),
    };
    records[idx] = updated;
    await writeRaw(records);
    return updated;
  });
}

async function remove(id) {
  return withLock(async () => {
    const records = await readRaw();
    const idx = records.findIndex((r) => r.id === Number(id));
    if (idx === -1) throw new NotFoundError('Registro não encontrado.');
    const [removed] = records.splice(idx, 1);
    await writeRaw(records);
    return removed;
  });
}

async function importCsv(text) {
  return withLock(async () => {
    const objects = rowsToObjects(parseCSV(text));
    const records = await readRaw();
    let id = nextId(records);
    const now = new Date().toISOString();
    let imported = 0;
    let skipped = 0;
    for (const obj of objects) {
      const cargo = (obj.cargo || obj.Cargo || '').trim();
      const setor = (obj.setor || obj.Setor || obj['setor/unidade'] || '').trim();
      const classRaw =
        obj.classificacao_setor || obj.classificacao || obj['classificação'] || '';
      if (!cargo && !setor) {
        skipped += 1;
        continue;
      }
      records.push({
        id: id++,
        cargo,
        setor,
        classificacao_setor: mapClassificacaoLabel(classRaw),
        created_at: now,
        updated_at: now,
      });
      imported += 1;
    }
    await writeRaw(records);
    return { imported, skipped, total: records.length };
  });
}

async function exportCsv() {
  return withLock(async () => {
    const records = (await readRaw()).sort((a, b) => a.id - b.id);
    return toCSV(records, HEADERS);
  });
}

async function stats() {
  return withLock(async () => {
    const records = await readRaw();
    const result = {
      total: records.length,
      porCargo: {},
      unidadeAcademica: 0,
      unidadeAdministrativa: 0,
      naoSei: 0,
    };
    for (const r of records) {
      result.porCargo[r.cargo] = (result.porCargo[r.cargo] || 0) + 1;
      if (r.classificacao_setor === 'UNIDADE_ACADEMICA') result.unidadeAcademica += 1;
      else if (r.classificacao_setor === 'UNIDADE_ADMINISTRATIVA') result.unidadeAdministrativa += 1;
      else result.naoSei += 1;
    }
    return result;
  });
}

module.exports = {
  list,
  create,
  update,
  remove,
  importCsv,
  exportCsv,
  stats,
  CLASSIFICACOES,
  ValidationError,
  NotFoundError,
};
