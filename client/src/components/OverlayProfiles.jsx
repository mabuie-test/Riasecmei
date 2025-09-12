// client/src/components/OverlayProfiles.jsx
import React from 'react'

const TYPES = [
  { key: 'R', label: 'R' },
  { key: 'I', label: 'I' },
  { key: 'A', label: 'A' },
  { key: 'S', label: 'S' },
  { key: 'E', label: 'E' },
  { key: 'C', label: 'C' }
];

function deg2rad(d){ return (d*Math.PI)/180; }

export default function OverlayProfiles({ datasets = [], colors = [], size = 420 }){
  const padding = 40;
  const cx = size/2, cy = size/2;
  const maxR = (size - padding*2)/2;
  const angles = [0,60,120,180,240,300];

  const basePoints = angles.map(a => ({ a, x: cx + maxR * Math.cos(deg2rad(a)), y: cy + maxR * Math.sin(deg2rad(a)) }));

  function scoresToPts(scores){
    return angles.map((a,i) => {
      const key = TYPES[i].key;
      const s = Math.max(0, Math.min(6, Number(scores[key] ?? 0)));
      const r = (s/6) * maxR;
      return { x: cx + r * Math.cos(deg2rad(a)), y: cy + r * Math.sin(deg2rad(a)), score: s };
    });
  }

  return (
    <div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="#e5e7eb" strokeWidth="1"/>
        <polygon points={basePoints.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#d1d5db" strokeWidth="1" strokeDasharray="6 4"/>
        {basePoints.map((p,i)=> <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#f3f4f6" strokeWidth="1"/> )}

        {datasets.map((d, idx) => {
          const pts = scoresToPts(d.scores);
          const points = pts.map(p => `${p.x},${p.y}`).join(' ');
          const color = colors[idx % colors.length] || '#000';
          return (
            <g key={d.userId}>
              <polygon points={points} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={2} />
              {pts.map((p,i)=> <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} stroke="#fff" strokeWidth="0.8"/>)}
            </g>
          )
        })}

        {/* labels */}
        {basePoints.map((p,i)=>{
          const lx = cx + (maxR + 18) * Math.cos(deg2rad(p.a));
          const ly = cy + (maxR + 18) * Math.sin(deg2rad(p.a));
          const anchor = Math.abs(Math.cos(deg2rad(p.a))) > 0.5 ? (Math.cos(deg2rad(p.a)) > 0 ? 'start' : 'end') : 'middle';
          return <text key={i} x={lx} y={ly} fontSize="12" textAnchor={anchor}>{TYPES[i].key}</text>
        })}
      </svg>
    </div>
  )
}
