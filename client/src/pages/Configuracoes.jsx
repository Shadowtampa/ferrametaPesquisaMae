import { EXPORT_CSV_URL } from '../api.js';

export default function Configuracoes() {
  return (
    <section className="panel">
      <h2>Configurações</h2>

      <div className="config-block">
        <h3>Persistência de dados</h3>
        <p>
          Os registros são armazenados em <code>server/data/servidores.csv</code>{' '}
          no servidor que hospeda a aplicação. Não há dependência de serviços
          externos, banco de dados em nuvem ou autenticação de terceiros.
        </p>
      </div>

      <div className="config-block">
        <h3>Backup</h3>
        <p>
          Para fazer backup, copie o arquivo <code>servidores.csv</code> ou use
          a exportação abaixo, que gera uma cópia completa e atualizada dos
          registros.
        </p>
        <a className="button button-outline" href={EXPORT_CSV_URL}>
          Exportar CSV agora
        </a>
      </div>

      <div className="config-block">
        <h3>Sobre</h3>
        <p>
          Catálogo de Servidores por Cargo e Setor — versão 1. Aplicação
          auto-hospedada, sem dependências externas obrigatórias.
        </p>
      </div>
    </section>
  );
}
