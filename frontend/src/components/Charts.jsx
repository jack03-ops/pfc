import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import TimeframeSelector from './TimeframeSelector';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Preset datasets for each timeframe option
const GROWTH_DATASETS = {
  '1D': {
    labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    values: [2, 5, 8, 4, 12, 6]
  },
  '1W': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [8, 14, 19, 12, 22, 28, 16]
  },
  '1M': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [24, 38, 45, 52]
  },
  '3M': {
    labels: ['Jul', 'Aug', 'Sep'],
    values: [85, 110, 142]
  },
  '6M': {
    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    values: [42, 65, 80, 105, 128, 154]
  },
  '12M': {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    values: [30, 45, 50, 68, 75, 90, 110, 125, 140, 160, 185, 210]
  }
};

const REVENUE_DATASETS = {
  '1D': {
    labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    values: [2000, 5000, 3500, 7000, 12000, 4500]
  },
  '1W': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [5000, 7500, 10000, 6000, 12000, 15000, 9000]
  },
  '1M': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [22000, 31000, 28000, 45000]
  },
  '3M': {
    labels: ['Jul', 'Aug', 'Sep'],
    values: [75000, 98000, 124000]
  },
  '6M': {
    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    values: [45000, 58000, 64000, 82000, 105000, 132000]
  },
  '12M': {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    values: [35000, 42000, 55000, 68000, 74000, 89000, 95000, 112000, 130000, 148000, 165000, 190000]
  }
};

export function MembershipGrowthChart({ showHeader = true }) {
  const [timeframe, setTimeframe] = useState('1M'); // Default to 1 Month
  const currentData = GROWTH_DATASETS[timeframe] || GROWTH_DATASETS['1M'];

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        fill: true,
        label: 'New Registrations',
        data: currentData.values,
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.12)',
        tension: 0.4,
        pointBackgroundColor: '#dc2626',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#09090b',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#71717a', font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#71717a', font: { family: 'Inter', size: 11 } },
      },
    },
  };

  return (
    <div className="w-full space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Membership Registrations Growth</h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">Active registration momentum & curve trajectory</p>
          </div>
          <TimeframeSelector selectedId={timeframe} onChange={setTimeframe} />
        </div>
      )}
      <div className="h-64 w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export function RevenueChart({ showHeader = true }) {
  const [timeframe, setTimeframe] = useState('1M'); // Default to 1 Month
  const currentData = REVENUE_DATASETS[timeframe] || REVENUE_DATASETS['1M'];

  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: currentData.values,
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderRadius: 8,
        hoverBackgroundColor: '#ef4444',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#09090b',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `Revenue: ₹${context.raw.toLocaleString()}`
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#71717a', font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          color: '#71717a', 
          font: { family: 'Inter', size: 11 },
          callback: (value) => '₹' + value.toLocaleString()
        },
      },
    },
  };

  return (
    <div className="w-full space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Revenue Curves</h4>
            <p className="text-[10px] text-zinc-400 mt-0.5">Payments and fee collection records</p>
          </div>
          <TimeframeSelector selectedId={timeframe} onChange={setTimeframe} />
        </div>
      )}
      <div className="h-64 w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export function MemberDistributionChart({ activeCount, inactiveCount }) {
  const chartData = {
    labels: ['Active Members', 'Inactive Members'],
    datasets: [
      {
        data: [activeCount || 75, inactiveCount || 25],
        backgroundColor: ['#dc2626', '#27272a'],
        borderColor: '#09090b',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#a1a1aa',
          font: { family: 'Inter', size: 11 },
          padding: 20,
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
