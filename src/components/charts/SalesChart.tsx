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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatTrendDate } from '@/utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesData {
  date: string;
  sales: number;
  count: number;
}

interface SalesChartProps {
  data?: SalesData[];
  period?: 'monthly' | 'weekly' | 'daily';
  isLoading?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({ 
  data = [], 
  period = 'monthly',
  isLoading = false 
}) => {
  // If no data or loading, show empty chart
  if (isLoading || !data || data.length === 0) {
    const emptyData = {
      labels: ['No Data'],
      datasets: [
        {
          label: 'Sales (OMR)',
          data: [0],
          borderColor: 'hsl(213, 100%, 55%)',
          backgroundColor: 'hsla(213, 100%, 55%, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'hsl(213, 100%, 55%)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };

    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground text-sm">
            {isLoading ? 'Loading sales data...' : 'No sales data available'}
          </div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => formatTrendDate(item.date, period)),
    datasets: [
      {
        label: 'Sales (OMR)',
        data: data.map(item => item.sales),
        borderColor: 'hsl(213, 100%, 55%)',
        backgroundColor: 'hsla(213, 100%, 55%, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'hsl(213, 100%, 55%)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
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
            const value = context.parsed.y;
            const formattedValue = new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
              useGrouping: true, // This ensures commas are added
            }).format(value);
            return `${formattedValue} OMR`;
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
            size: 12,
          },
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
          callback: function(value: any) {
            const formattedValue = new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
              useGrouping: true, // This ensures commas are added
            }).format(value);
            return `${formattedValue} OMR`;
          },
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: 'hsl(213, 100%, 55%)',
      },
    },
  };

  return (
    <div className="h-[300px] w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};