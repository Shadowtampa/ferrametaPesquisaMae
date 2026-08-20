const express = require('express');
const store = require('./store');

const app = express();

app.use(express.json({ limit: '10mb' }));

app.get('/api/records', async (req, res, next) => {
  try {
    const { search, cargo, classificacao } = req.query;
    const records = await store.list({ search, cargo, classificacao });
    res.json(records);
  } catch (err) {
    next(err);
  }
});

app.get('/api/records/export', async (req, res, next) => {
  try {
    const csv = await store.exportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="servidores.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

app.get('/api/stats', async (req, res, next) => {
  try {
    res.json(await store.stats());
  } catch (err) {
    next(err);
  }
});

app.post('/api/records', async (req, res, next) => {
  try {
    const record = await store.create(req.body || {});
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

app.put('/api/records/:id', async (req, res, next) => {
  try {
    const record = await store.update(req.params.id, req.body || {});
    res.json(record);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/records/:id', async (req, res, next) => {
  try {
    await store.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.post('/api/records/import', async (req, res, next) => {
  try {
    const { csv } = req.body || {};
    if (typeof csv !== 'string' || !csv.trim()) {
      res.status(400).json({ error: 'Conteúdo CSV vazio ou inválido.' });
      return;
    }
    const result = await store.importCsv(csv);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof store.ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof store.NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

module.exports = app;
