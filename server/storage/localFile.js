const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'servidores.csv');

async function readText() {
  if (!fs.existsSync(FILE_PATH)) return null;
  return fs.readFileSync(FILE_PATH, 'utf8');
}

async function writeText(text) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE_PATH, text);
}

module.exports = { readText, writeText };
