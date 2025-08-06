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
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopProduct {
  name: string;
  quantity: number;
}

interface ProductChartProps {
  data?: TopProduct[];
  monthlyData?: { [key: string]: TopProduct[] };
  isLoading?: boolean;
}

export const ProductChart: React.FC<ProductChartProps> = ({ 
  data = [], 
  monthlyData = {},
  isLoading = false 
}) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  
  // Get available months from monthlyData
  const availableMonths = Object.keys(monthlyData).sort();
  const currentMonthKey = availableMonths[currentMonthIndex];
  const currentMonthData = monthlyData[currentMonthKey] || data;

  // Format month for display
  const formatMonthDisplay = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // If no data or loading, show empty chart
  if (isLoading || (!currentMonthData || currentMonthData.length === 0)) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground text-sm">
            {isLoading ? 'Loading product data...' : 'No product data available'}
          </div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: currentMonthData.map(item => {
      // Truncate long product names for better display
      const name = item.name;
      return name.length > 20 ? name.substring(0, 20) + '...' : name;
    }),
    datasets: [
      {
        label: 'Units Sold',
        data: currentMonthData.map(item => item.quantity),
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
        padding: 12,
        callbacks: {
          title: function(context: any) {
            // Show full product name in tooltip
            const index = context[0].dataIndex;
            const fullName = currentMonthData[index]?.name || '';
            return fullName;
          },
          label: function(context: any) {
            const value = context.parsed.y;
            const formattedValue = new Intl.NumberFormat("en-US", {
              useGrouping: true,
            }).format(value);
            return `${formattedValue} units sold`;
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
          callback: function(value: any) {
            const formattedValue = new Intl.NumberFormat("en-US", {
              useGrouping: true,
            }).format(value);
            return formattedValue;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      {availableMonths.length > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonthIndex(Math.max(0, currentMonthIndex - 1))}
            disabled={currentMonthIndex === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium">
            {currentMonthKey ? formatMonthDisplay(currentMonthKey) : 'Current Month'}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonthIndex(Math.min(availableMonths.length - 1, currentMonthIndex + 1))}
            disabled={currentMonthIndex === availableMonths.length - 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Chart */}
      <div className="h-[250px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};