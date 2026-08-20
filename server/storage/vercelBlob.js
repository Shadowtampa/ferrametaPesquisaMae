const { put, get } = require('@vercel/blob');

const PATHNAME = 'servidores.csv';

async function readText() {
  const result = await get(PATHNAME, { access: 'private', useCache: false });
  if (!result) return null;
  return new Response(result.stream).text();
}

async function writeText(text) {
  await put(PATHNAME, text, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'text/csv; charset=utf-8',
  });
}

module.exports = { readText, writeText };
