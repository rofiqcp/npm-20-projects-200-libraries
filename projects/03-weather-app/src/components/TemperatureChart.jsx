import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function TemperatureChart({ forecast, unit }) {
  const tempUnit = unit === 'metric' ? '°C' : '°F'

  // Next 8 data points = 24 hours
  const points = forecast.list.slice(0, 8)
  const labels = points.map(p => {
    const date = new Date(p.dt_txt)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  })
  const temps = points.map(p => Math.round(p.main.temp))

  const data = {
    labels,
    datasets: [
      {
        label: `Temperature (${tempUnit})`,
        data: temps,
        borderColor: 'rgba(147, 197, 253, 1)',
        backgroundColor: 'rgba(147, 197, 253, 0.15)',
        pointBackgroundColor: 'rgba(255, 255, 255, 0.9)',
        pointBorderColor: 'rgba(147, 197, 253, 1)',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(219, 234, 254, 0.9)',
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: '24-Hour Temperature Trend',
        color: 'rgba(219, 234, 254, 0.9)',
        font: { size: 14, weight: 'bold' },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.parsed.y}${tempUnit}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(147, 197, 253, 0.8)', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: {
          color: 'rgba(147, 197, 253, 0.8)',
          font: { size: 11 },
          callback: val => `${val}${tempUnit}`,
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <Line data={data} options={options} />
    </div>
  )
}
