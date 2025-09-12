import React from 'react';

/**
 * CircleProfile
 * Props:
 *  - scores: { R, I, A, S, E, C }  (valores inteiros 0..6)
 *  - size: (optional) pixel size (default 360)
 *  - showLabels: boolean (default true)
 *
 * Retorna: SVG com o círculo unitário (hexagon positions), polígono e interpretação textual.
 */

const TYPES = [
  { key: 'R', label: 'Realista' },
  { key: 'I', label: 'Investigativo' },
  { key: 'A', label: 'Artístico' },
  { key: 'S', label: 'Social' },
  { key: 'E', label: 'Empreendedor' },
  { key: 'C', label: 'Convencional' }
];

function deg2rad(d){ return (d * Math.PI) / 180; }

function computePositions(cx, cy, maxR) {
  // Angles: R=0°, I=60°, A=120°, S=180°, E=240°, C=300°
  const anglesDeg = [0, 60, 120, 180, 240, 300];
  return anglesDeg.map(a => {
    const theta = deg2rad(a);
    return { x: cx + maxR * Math.cos(theta), y: cy + maxR * Math.sin(theta), a };
  });
}

function scoresToPoints(scores, cx, cy, maxR){
  // normalize each score (0..6) to radius (0..maxR)
  const basePositions = computePositions(cx, cy, maxR);
  return basePositions.map((pos, i) => {
    const key = TYPES[i].key;
    const s = Math.max(0, Math.min(6, Number(scores[key] ?? 0)));
    const r = (s / 6) * maxR;
    const theta = deg2rad(pos.a);
    return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta), key, score: s };
  });
}

function computeInterpretation(scores){
  // returns an object with top types, neighbors, opposites, and readable text
  const list = TYPES.map((t,i) => ({ key: t.key, label: t.label, score: Number(scores[t.key] ?? 0), idx: i }));
  list.sort((a,b) => b.score - a.score);

  const top = list.slice(0, 2);
  const secondTier = list.slice(2, 4);

  // helper: opposite index = (idx + 3) % 6 ; neighbors = idx +/-1 (mod 6)
  const neighborsOf = (idx) => [ (idx+5)%6, (idx+1)%6 ];
  const oppositeOf = (idx) => (idx+3)%6;

  const topInfo = top.map(t => {
    const nbIdx = neighborsOf(t.idx);
    const nb = nbIdx.map(i => TYPES[i].label);
    const opp = TYPES[oppositeOf(t.idx)].label;
    return { key: t.key, label: t.label, score: t.score, neighbors: nb, opposite: opp };
  });

  // a short plain-language summary
  let summary = '';
  if (top[0].score === 0 && top[1].score === 0) {
    summary = 'Perfil sem preferências fortes detectadas — explore várias áreas.';
  } else {
    summary = `Os seus interesses mais fortes são ${top.map(t => t.label + ` (${t.score})`).join(' e ')}. `;
    // add neighbor suggestions
    summary += topInfo.map(t => `Quem tem ${t.label} costuma também gostar de ${t.neighbors.join(' e ')}; o oposto usualmente é ${t.opposite}.`).join(' ');
  }

  // suggested areas: map rough suggestions
  const suggestions = [];
  const mapSuggest = {
    R: ['Manutenção, Agricultura, Construção', 'Técnico de campo'],
    I: ['Investigação, TI, Laboratório', 'Análise técnica'],
    A: ['Design, Artes, Comunicação Criativa', 'Produção cultural'],
    S: ['Educação, Saúde, Trabalho social', 'Serviços comunitários'],
    E: ['Gestão pequena, Vendas, Empreendedorismo', 'Negócios locais'],
    C: ['Administração, Contabilidade, Registos', 'Controlo e organização']
  };
  // add suggestions based on top two
  top.forEach(t => {
    if (mapSuggest[t.key]) suggestions.push(...mapSuggest[t.key]);
  });
  // deduplicate
  const uniqueSuggestions = [...new Set(suggestions)].slice(0,6);

  return {
    top,
    secondTier,
    text: summary,
    suggestions: uniqueSuggestions
  };
}

export default function CircleProfile({ scores = {R:0,I:0,A:0,S:0,E:0,C:0}, size = 360, showLabels = true }) {
  const padding = 36;
  const sizeInner = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = sizeInner / 2;

  const basePos = computePositions(cx, cy, maxR);
  const points = scoresToPoints(scores, cx, cy, maxR);
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const interpretation = computeInterpretation(scores);

  return (
    <div className="w-full max-w-full">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        {/* base circle */}
        <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        {/* hexagon guide (lines between base positions) */}
        <polygon points={basePos.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#d1d5db" strokeWidth="1" strokeDasharray="6 4" />
        {/* radial lines */}
        {basePos.map((p,i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#f3f4f6" strokeWidth="1" />
        ))}

        {/* draw polygon (user) */}
        <polygon points={polygonPoints} fill="rgba(34,197,94,0.18)" stroke="rgba(34,197,94,0.9)" strokeWidth="2" />

        {/* draw small circles on each score point */}
        {points.map((p,i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="rgba(34,197,94,1)" stroke="#fff" strokeWidth="1"/>
        ))}

        {/* labels around circle */}
        {basePos.map((p,i) => {
          const label = TYPES[i].label;
          const lx = cx + (maxR + 18) * Math.cos(deg2rad(p.a));
          const ly = cy + (maxR + 18) * Math.sin(deg2rad(p.a));
          const anchor = Math.abs(Math.cos(deg2rad(p.a))) > 0.5 ? (Math.cos(deg2rad(p.a)) > 0 ? 'start' : 'end') : 'middle';
          return (
            <text key={i} x={lx} y={ly} fontSize="12" textAnchor={anchor} fill="#111827">{label}</text>
          );
        })}

        {/* center labels with numeric scores */}
        {points.map((p,i) => {
          const lx = p.x;
          const ly = p.y - 8;
          return (<text key={'s'+i} x={lx} y={ly} fontSize="11" textAnchor="middle" fill="#065f46">{p.score}</text>);
        })}
      </svg>

      {/* Interpretation box */}
      <div className="mt-3 p-3 bg-white rounded shadow-sm">
        <div className="text-sm text-gray-700 mb-2"><strong>Interpretação rápida:</strong></div>
        <div className="text-sm text-gray-800 mb-2">{interpretation.text}</div>
        <div className="text-sm text-gray-700"><strong>Sugestões de áreas:</strong></div>
        <ul className="list-disc list-inside text-sm text-gray-800">
          {interpretation.suggestions.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
    </div>
  );
}
