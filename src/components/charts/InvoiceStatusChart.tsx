import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusBreakdown {
  done: number;
  pending: number;
  partially: number;
  overdue: number;
}

interface InvoiceStatusChartProps {
  data?: StatusBreakdown;
  isLoading?: boolean;
}

export const InvoiceStatusChart: React.FC<InvoiceStatusChartProps> = ({ 
  data,
  isLoading = false 
}) => {
  // If no data or loading, show empty chart
  if (isLoading || !data) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground text-sm">
            {isLoading ? 'Loading status data...' : 'No status data available'}
          </div>
        </div>
      </div>
    );
  }

  // Filter out zero values and create chart data
  const chartData = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 2,
      cutout: '75%',
    }]
  };

  const colors = {
    done: 'hsl(142, 71%, 45%)',
    pending: 'hsl(45, 93%, 58%)',
    partially: 'hsl(25, 95%, 53%)',
    overdue: 'hsl(0, 84.2%, 60.2%)'
  };

  let totalInvoices = 0;

  Object.entries(data).forEach(([status, count]) => {
    if (count > 0) {
      chartData.labels.push(status.charAt(0).toUpperCase() + status.slice(1));
      chartData.datasets[0].data.push(count);
      chartData.datasets[0].backgroundColor.push(colors[status]);
      chartData.datasets[0].borderColor.push(colors[status]);
      totalInvoices += count;
    }
  });

  // If no data, show empty state
  if (totalInvoices === 0) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground text-sm">No invoices found</div>
        </div>
      </div>
    );
  }

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
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value} invoice${value !== 1 ? 's' : ''}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-[200px] w-full flex items-center justify-center">
      <div className="relative">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};