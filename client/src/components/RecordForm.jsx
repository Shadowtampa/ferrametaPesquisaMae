import { useCatalog, EMPTY_FORM } from '../CatalogContext.jsx';
import ClassificationCards from './ClassificationCards.jsx';
import { IconInfo, IconX, IconPlus } from '../icons.jsx';

export default function RecordForm() {
  const { form, setForm, editingId, submitForm, cancelEdit, stats } = useCatalog();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await submitForm();
  }

  return (
    <section className="panel">
      <h2>{editingId ? 'Editar registro' : 'Adicionar registro'}</h2>
      <form className="record-form" onSubmit={handleSubmit}>
        <div className="record-form-row">
          <div className="field">
            <label htmlFor="cargo">Cargo (opcional)</label>
            <input
              id="cargo"
              name="cargo"
              list="cargos-sugeridos"
              value={form.cargo}
              onChange={handleChange}
              placeholder="Ex: Pedagogo, Técnico em Assuntos Educacionais..."
            />
            <datalist id="cargos-sugeridos">
              <option value="Pedagogo" />
              <option value="TAE" />
            </datalist>
          </div>

          <div className="field">
            <label htmlFor="setor">Setor (opcional)</label>
            <input
              id="setor"
              name="setor"
              value={form.setor}
              onChange={handleChange}
              placeholder="Ex: Diretoria de Ensino, Coordenação Acadêmica..."
            />
          </div>

          <div className="field field-classification">
            <label>
              Classificação do Setor{' '}
              <span title="Classificação institucional do setor informado">
                <IconInfo size={14} />
              </span>
            </label>
            <ClassificationCards
              value={form.classificacao_setor}
              onChange={(value) => setForm((f) => ({ ...f, classificacao_setor: value }))}
              stats={stats}
            />
          </div>
        </div>

        <div className="info-box">
          <IconInfo size={16} />
          <div>
            <strong>Regras para cadastro</strong>
            <ul>
              <li>Pelo menos um dos campos (Cargo ou Setor) deve ser informado.</li>
              <li>A classificação do setor é opcional e pode ser definida depois.</li>
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button button-outline"
            onClick={() => (editingId ? cancelEdit() : setForm(EMPTY_FORM))}
          >
            <IconX size={16} />
            Limpar
          </button>
          <button type="submit" className="button button-dark">
            <IconPlus size={16} />
            {editingId ? 'Salvar alterações' : 'Adicionar registro'}
          </button>
        </div>
      </form>
    </section>
  );
}
