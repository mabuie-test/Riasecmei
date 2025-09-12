import React from 'react'
import { Radar } from 'react-chartjs-2'
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function RadarChart({scores, labels, title}){
  const data = {
    labels,
    datasets: [{
      label: title || 'Perfil RIASEC',
      data: labels.map(l=> scores[l[0]] ?? 0),
      fill: true,
      tension: 0.1,
      backgroundColor: 'rgba(59,130,246,0.2)',
      borderColor: 'rgba(59,130,246,1)'
    }]
  }
  const options = {
    scales: { r: { min: 0, max: 6, ticks: { stepSize: 1 } } },
    plugins: { legend: { display: false } }
  }
  return <Radar data={data} options={options} />
}
