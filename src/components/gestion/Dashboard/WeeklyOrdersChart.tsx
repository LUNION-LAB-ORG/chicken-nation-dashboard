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
import Image from 'next/image'

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
        min: 0,
        max: 100,
        // Ajoute le tick 50 pour la grille mais pas pour les labels
        afterBuildTicks: (axis) => {
          const tickValues = axis.ticks.map(t => t.value);
          if (!tickValues.includes(50)) {
            // Ajoute 50 entre 40 et 60
            const idx = tickValues.findIndex(v => v > 50);
            axis.ticks.splice(idx === -1 ? axis.ticks.length : idx, 0, { value: 50, major: true });
          }
        },
        grid: {
          color: (context: any) => {
            const value = context.tick?.value;
            if (value === 50) {
              return '#FDE9DA'; 
            }
            if ([0, 100].includes(value)) {
              return 'rgba(241, 121, 34, 0.1)';  
            }
            return 'transparent'; 
          },
          drawTicks: false,
          lineWidth: 2, 
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#9796A1',
          font: {
            size: 12,
          },
          padding: 10,
          stepSize: 20,
          callback: function(value: number) {
            // Affiche TOUS les labels principaux
            if ([0, 20, 40, 60, 80, 100].includes(Number(value))) {
              return value;
            }
            return '';
          },
        },
      },
    },
  }

  return (
    <div className="weekly-orders-chart">
      <div className="weekly-orders-header">
        <div className="weekly-orders-title">
        <Image className='mt-1' src="/icons/chicken.png" alt="circle" width={14} height={14} />
          <h3 className="text-[#F17922] font-bold text-[15px] ml-2">Commandes évaluées cette semaine</h3>
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

      <div style={{ width: '100%', height: 200 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

export default WeeklyOrdersChart
