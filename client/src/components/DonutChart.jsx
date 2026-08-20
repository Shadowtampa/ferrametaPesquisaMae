const SIZE = 120;
const RADIUS = 45;
const STROKE = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

export default function DonutChart({ data, size = SIZE }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const center = SIZE / 2;

  let cumulative = 0;
  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const fraction = total > 0 ? d.value / total : 0;
      const rawLength = fraction * CIRCUMFERENCE;
      const length = Math.max(rawLength - GAP, 0);
      const offset = cumulative;
      cumulative += rawLength;
      return { ...d, length, offset };
    });

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={size}
      height={size}
      role="img"
      aria-label={`Distribuição por classificação: ${data
        .map((d) => `${d.label} ${d.value}`)
        .join(', ')}`}
    >
      <g transform={`rotate(-90 ${center} ${center})`}>
        {total === 0 ? (
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            fill="none"
            stroke="var(--gridline)"
            strokeWidth={STROKE}
          />
        ) : (
          segments.map((seg) => (
            <circle
              key={seg.key}
              cx={center}
              cy={center}
              r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={`${seg.length} ${CIRCUMFERENCE - seg.length}`}
              strokeDashoffset={-seg.offset}
            />
          ))
        )}
      </g>
    </svg>
  );
}
