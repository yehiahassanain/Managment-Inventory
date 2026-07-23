"use client";

import { TrendPoint } from "../../app/dashboard/analytics/actions";

interface Props {
  data: TrendPoint[];
  activeMetric: "revenue" | "profit" | "unitsSold";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export default function SalesTrendChart({ data, activeMetric }: Props) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
        No data available
      </div>
    );
  }

  const values = data.map((d) => d[activeMetric]);
  const max = Math.max(...values, 1);
  const min = 0;

  const W = 800;
  const H = 180;
  const PAD_L = 50;
  const PAD_R = 20;
  const PAD_T = 16;
  const PAD_B = 30;

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const points = data.map((d, i) => {
    const x = PAD_L + (i / (data.length - 1)) * plotW;
    const y = PAD_T + plotH - ((d[activeMetric] - min) / (max - min)) * plotH;
    return { x, y, d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(2)} ${(PAD_T + plotH).toFixed(2)} L ${PAD_L} ${(PAD_T + plotH).toFixed(2)} Z`;

  // Show ~5 labels
  const labelStep = Math.max(1, Math.floor(data.length / 5));
  const labelIndices = data.map((_, i) => i).filter((i) => i % labelStep === 0 || i === data.length - 1);

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((frac) => {
    const y = PAD_T + plotH * frac;
    const val = max * (1 - frac);
    return { y, val };
  });

  const strokeColor =
    activeMetric === "revenue"
      ? "#6366f1"
      : activeMetric === "profit"
      ? "#10b981"
      : "#f59e0b";

  const areaColor =
    activeMetric === "revenue"
      ? "url(#indigoGrad)"
      : activeMetric === "profit"
      ? "url(#emeraldGrad)"
      : "url(#amberGrad)";

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 320 }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map(({ y, val }) => (
          <g key={y}>
            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#1e293b" strokeWidth="1" />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#475569">
              {activeMetric === "unitsSold" ? Math.round(val) : formatCurrency(val)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill={areaColor} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots at data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={strokeColor} fillOpacity="0.9" />
        ))}

        {/* X-axis labels */}
        {labelIndices.map((i) => (
          <text
            key={i}
            x={points[i].x}
            y={H - 6}
            textAnchor="middle"
            fontSize="9"
            fill="#475569"
          >
            {formatDate(data[i].date)}
          </text>
        ))}
      </svg>
    </div>
  );
}
