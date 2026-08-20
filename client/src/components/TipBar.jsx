import { IconLightbulb } from '../icons.jsx';

export default function TipBar() {
  return (
    <div className="tip-bar">
      <IconLightbulb size={16} />
      <span>
        Dica: Você pode cadastrar os dados mesmo sem saber a classificação do
        setor. Depois, use o filtro "Não sei" para revisar e classificar.
      </span>
    </div>
  );
}
