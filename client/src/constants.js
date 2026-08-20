import { IconBuilding, IconGraduationCap, IconHelpCircle } from './icons.jsx';

export const CLASSIFICACAO_OPTIONS = [
  { value: 'UNIDADE_ACADEMICA', label: 'Unidade Acadêmica', short: 'Acadêmica', icon: IconGraduationCap, tone: 'academica' },
  { value: 'UNIDADE_ADMINISTRATIVA', label: 'Unidade Administrativa', short: 'Administrativa', icon: IconBuilding, tone: 'administrativa' },
  { value: 'NAO_SEI', label: 'Não sei', short: 'Não sei', icon: IconHelpCircle, tone: 'nao-sei' },
];

export const CLASSIFICACAO_LABELS = Object.fromEntries(
  CLASSIFICACAO_OPTIONS.map((o) => [o.value, o.label])
);

export function statCountFor(stats, value) {
  if (!stats) return 0;
  if (value === 'UNIDADE_ACADEMICA') return stats.unidadeAcademica;
  if (value === 'UNIDADE_ADMINISTRATIVA') return stats.unidadeAdministrativa;
  return stats.naoSei;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
