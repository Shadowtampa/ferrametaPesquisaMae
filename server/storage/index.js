// Usa Vercel Blob quando o projeto está conectado a um Blob Store (variável
// BLOB_READ_WRITE_TOKEN injetada automaticamente pela Vercel); caso
// contrário, mantém o CSV local em disco para uso auto-hospedado.
const backend = process.env.BLOB_READ_WRITE_TOKEN
  ? require('./vercelBlob')
  : require('./localFile');

module.exports = backend;
