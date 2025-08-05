import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ProductChart = () => {
  const data = {
    labels: ['Steel Rods', 'Cement Bags', 'Concrete Blocks', 'Wire Products'],
    datasets: [
      {
        label: 'Sales Volume',
        data: [250, 180, 120, 95],
        backgroundColor: [
          'hsla(213, 100%, 55%, 0.8)',
          'hsla(180, 84%, 62%, 0.8)',
          'hsla(142, 71%, 45%, 0.8)',
          'hsla(45, 93%, 58%, 0.8)',
        ],
        borderColor: [
          'hsl(213, 100%, 55%)',
          'hsl(180, 84%, 62%)',
          'hsl(142, 71%, 45%)',
          'hsl(45, 93%, 58%)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(222, 15%, 8%)',
        titleColor: 'hsl(210, 40%, 98%)',
        bodyColor: 'hsl(210, 40%, 98%)',
        borderColor: 'hsl(213, 100%, 55%)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} units sold`;
          },
        },
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(215.4, 16.3%, 46.9%)',
          font: {
            size: 11,
          },
          maxRotation: 45,
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          color: 'hsl(214.3, 31.8%, 91.4%)',
          lineWidth: 1,
        },
        ticks: {
          color: 'hsl(215.4, 16.3%, 46.9%)',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="h-[300px] w-full">
      <Bar data={data} options={options} />
    </div>
  );
};