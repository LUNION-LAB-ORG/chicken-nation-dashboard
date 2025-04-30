"use client"

import React, { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { ChevronDown } from 'lucide-react'
import './WeeklyOrdersChart.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface WeeklyOrdersChartProps {
  data?: Array<{
    name: string
    value: number
  }>
}

const defaultData = [
  { name: 'Lun', value: 42 },
  { name: 'Mar', value: 23 },
  { name: 'Mer', value: 41 },
  { name: 'Jeu', value: 35 },
  { name: 'Ven', value: 42 },
  { name: 'Sam', value: 58 },
  { name: 'Dim', value: 0 },
]

const dateRanges = [
  'Du 12 fév-19 fév',
  'Du 5 fév-12 fév',
  'Du 29 jan-5 fév',
  'Du 22 jan-29 jan',
]

const WeeklyOrdersChart: React.FC<WeeklyOrdersChartProps> = ({ data = defaultData }) => {
  const [selectedDateRange, setSelectedDateRange] = useState(dateRanges[0])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Commandes',
        data: data.map(item => item.value),
        backgroundColor: '#F17922',
        borderRadius: 4,
        barThickness: 30,
        borderSkipped: false,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        bodyFont: {
          size: 14,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} commandes`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9796A1',
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#9796A1',
          stepSize: 20,
          padding: 10,
        },
        max: 100,
      },
    },
  }

  return (
    <div className="weekly-orders-chart">
      <div className="weekly-orders-header">
        <div className="weekly-orders-title">
          <span className="weekly-orders-star">★</span>
          <h3 className="text-base font-medium text-gray-800">Commandes évaluées cette semaine</h3>
        </div>

        <div className="date-selector">
          <button
            className="date-selector-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedDateRange}
            <ChevronDown size={16} className="ml-2" />
          </button>

          {isDropdownOpen && (
            <div className="date-selector-dropdown">
              {dateRanges.map((range, index) => (
                <div
                  key={index}
                  className="date-option"
                  onClick={() => {
                    setSelectedDateRange(range)
                    setIsDropdownOpen(false)
                  }}
                >
                  {range}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', height: 220 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

export default WeeklyOrdersChart
