import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/ui/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatOMRCurrency, formatDate } from '@/utils/formatters';
import { getInvoiceReportByDateRange, getProductSalesReportByDateRange } from '@/services/reports.js';
import { exportToExcel } from '@/utils/exportToExcel';
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip } from 'recharts';

type ApiInvoice = {
  invoice_id: number;
  invoice_date: string;
  invoice_number: string;
  total_invoice_amount: string; // may include commas
  quotation_number: string;
  refund_amount: string;
  refund_reasons: string;
  total_quotation_amount: string; // used as grand total without delivery
  net_total_quotation_amount_with_delivery: string; // sometimes matches grand + delivery
  customer_name: string;
  contact_number: string;
  quatation_type: string; // Note: API typo maintained
  delivery_charges: string;
  discount_price: string;
  quotation_vat: string;
  resived_invoicedetails: string;
  pending_amount: string;
  payment_details: Array<{
    id: number;
    invoice_number: string;
    invoice_id: string;
    payment_date: string;
    payment_method: string;
    reference: string;
    comment: string;
    paid_amount: string;
    balance_amount: string;
    created_at: string;
    last_edit_user_id: string;
    last_edit_user_name: string;
    user_name: string;
    user_id: string;
    payment_invoice_number: string;
  }>;
  user_details: string; // created user name
};

type ApiUserSummary = {
  user_id: number;
  user_name: string;
  user_total_amount: string;
  pending_amount: string;
};

type ProductSalesItem = {
  productId: string;
  productName: string;
  productBrand: string;
  unitPrice: string;
  stock: string;
  received: number;
  quantitySold: number;
  totalSales: number | string;
  grn_numbers: Array<{ id: number; quantity: string; date: string }>;
  invoice_numbers: Array<{ id: number; quantity: string; date: string }>;
};

const cleanNum = (val: string | number | null | undefined): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).replace(/,/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

export const Reports = () => {
  const { toast } = useToast();

  // Default date range: 2024-05-30 to today
  const defaultStart = '2024-05-30';
  const todayStr = new Date().toISOString().split('T')[0];

  const [fromDate, setFromDate] = React.useState<string>(defaultStart);
  const [toDate, setToDate] = React.useState<string>(todayStr);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [invoices, setInvoices] = React.useState<ApiInvoice[]>([]);
  const [userDetails, setUserDetails] = React.useState<ApiUserSummary[]>([]);
  const [productSales, setProductSales] = React.useState<ProductSalesItem[]>([]);
  const [productSummary, setProductSummary] = React.useState({
    productsCount: 0,
    unitsSold: 0,
    totalSales: 0,
    totalReceivedUnits: 0,
  });
  const [summary, setSummary] = React.useState({
    subTotal: 0,
    vatTotal: 0,
    grandTotal: 0,
    paidTotal: 0,
    outstandingTotal: 0,
    refundTotal: 0,
    deliveryTotal: 0,
    discountTotal: 0,
    grandWithDelivery: 0,
  });

  // Custom multiline tick for long product names
  const ProductTick = (props: any) => {
    const { x, y, payload } = props;
    const text: string = String(payload?.value ?? "");
    const maxCharsPerLine = 18;
    const maxLines = 3;
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (testLine.length > maxCharsPerLine) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    const shown = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      shown[maxLines - 1] = `${shown[maxLines - 1]}…`;
    }
    return (
      <g transform={`translate(${x},${y})`}>
        <text textAnchor="middle" fill="hsl(215.4, 16.3%, 46.9%)" fontSize={11}>
          {shown.map((ln, idx) => (
            <tspan key={idx} x={0} dy={idx === 0 ? 12 : 12}>
              {ln}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getInvoiceReportByDateRange(fromDate, toDate);
      const apiData = res?.data || {};
      const list: ApiInvoice[] = Array.isArray(apiData.invoices) ? apiData.invoices : [];
      const users: ApiUserSummary[] = Array.isArray(apiData.user_details) ? apiData.user_details : [];

      setInvoices(list);
      setUserDetails(users);

      // Compute totals based on requirements
      let subTotal = 0;
      let vatTotal = 0;
      let grandTotal = 0;
      let paidTotal = 0;
      let outstandingTotal = 0;
      let refundTotal = 0;
      let deliveryTotal = 0;
      let discountTotal = 0;

      list.forEach((inv) => {
        const totalInvoice = cleanNum(inv.total_invoice_amount);
        const vat = cleanNum(inv.quotation_vat);
        const delivery = cleanNum(inv.delivery_charges);
        const discount = cleanNum(inv.discount_price);
        const refund = cleanNum(inv.refund_amount);

        subTotal += Math.max(totalInvoice - vat, 0);
        vatTotal += vat;
        grandTotal += totalInvoice;
        deliveryTotal += delivery;
        discountTotal += discount;
        refundTotal += refund;

        // Payments aggregate from payment_details
        const paid = (inv.payment_details || []).reduce((sum, p) => sum + cleanNum(p.paid_amount), 0);
        paidTotal += paid;
        // Due/Outstanding should use top-level pending_amount when aggregating per API instruction
        outstandingTotal += cleanNum(inv.pending_amount);
      });

      // Override aggregates with API-provided totals where requested
      const apiDeliveryTotal = cleanNum(apiData.all_delivery_amount);
      const apiOutstandingTotal = cleanNum(apiData.all_invoice_pending_amount);
      const apiPaidTotal = cleanNum(apiData.all_invoice_received_amount);
      const apiRefundTotal = cleanNum(apiData.all_invoice_refund_amount);
      const apiGrandWithDelivery = cleanNum(apiData.all_invoice_total);

      // Use API totals if present; otherwise fall back to computed
      const finalDeliveryTotal = isNaN(apiDeliveryTotal) ? deliveryTotal : apiDeliveryTotal;
      const finalOutstandingTotal = isNaN(apiOutstandingTotal) ? outstandingTotal : apiOutstandingTotal;
      const finalPaidTotal = isNaN(apiPaidTotal) ? paidTotal : apiPaidTotal;
      const finalRefundTotal = isNaN(apiRefundTotal) ? refundTotal : apiRefundTotal;
      const finalGrandWithDelivery = isNaN(apiGrandWithDelivery)
        ? grandTotal + deliveryTotal
        : apiGrandWithDelivery;

      setSummary({
        subTotal,
        vatTotal,
        grandTotal,
        paidTotal: finalPaidTotal,
        outstandingTotal: finalOutstandingTotal,
        refundTotal: finalRefundTotal,
        deliveryTotal: finalDeliveryTotal,
        discountTotal,
        grandWithDelivery: finalGrandWithDelivery,
      });

      // Fetch product sales report using same date range
      try {
        const psRes = await getProductSalesReportByDateRange(fromDate, toDate);
        const psList: ProductSalesItem[] = Array.isArray(psRes?.data) ? psRes.data : [];
        setProductSales(psList);

        // Compute product summary
        let unitsSold = 0;
        let totalSalesAmt = 0;
        let totalReceivedUnits = 0;
        psList.forEach((p) => {
          unitsSold += Number(p.quantitySold || 0);
          totalSalesAmt += cleanNum(p.totalSales as any);
          totalReceivedUnits += Number(p.received || 0);
        });
        setProductSummary({
          productsCount: psList.length,
          unitsSold,
          totalSales: totalSalesAmt,
          totalReceivedUnits,
        });
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to load product sales', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to load report', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async () => {
    try {
      const exportRows = invoices.map((inv) => {
        const vat = cleanNum(inv.quotation_vat);
        const invTotal = cleanNum(inv.total_invoice_amount);
        const sub = Math.max(invTotal - vat, 0);
        const paid = (inv.payment_details || []).reduce((sum, p) => sum + cleanNum(p.paid_amount), 0);
        const pending = cleanNum(inv.pending_amount);

        return {
          'Invoice Date': inv.invoice_date,
          'Quotation Type': inv.quatation_type,
          'Quotation User': inv.user_details || 'N/A',
          'Quotation No': inv.quotation_number,
          'Invoice No': inv.invoice_number,
          'Customer Name': inv.customer_name,
          'Customer Phone': inv.contact_number,
          'Sub Total (OMR)': sub.toFixed(3),
          'VAT (OMR)': vat.toFixed(3),
          'Total (OMR)': invTotal.toFixed(3),
          'Received (OMR)': paid.toFixed(3),
          'Pending (OMR)': pending.toFixed(3),
          'Delivery (OMR)': cleanNum(inv.delivery_charges).toFixed(3),
          'Discount (OMR)': cleanNum(inv.discount_price).toFixed(3),
          'Refund (OMR)': cleanNum(inv.refund_amount).toFixed(3),
        };
      });
      await exportToExcel(exportRows, null, 'Invoice Reports');
      toast({ title: 'Success', description: 'Report exported to Excel', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to export', variant: 'destructive' });
    }
  };

  type Row = ApiInvoice;
  const columns: Column<Row>[] = [
    { key: 'invoice_date', header: 'Invoice Date', render: (r) => formatDate(r.invoice_date) },
    { key: 'quatation_type', header: 'Quotation Type' },
    { key: 'user_details', header: 'Quotation User' },
    { key: 'quotation_number', header: 'Quotation No' },
    { key: 'invoice_number', header: 'Invoice No' },
    { key: 'customer_name', header: 'Customer Name' },
    { key: 'contact_number', header: 'Customer Phone' },
    {
      key: 'subtotal',
      header: 'Sub Total',
      render: (r) => {
        const sub = Math.max(cleanNum(r.total_invoice_amount) - cleanNum(r.quotation_vat), 0);
        return formatOMRCurrency(sub);
      },
    },
    { key: 'vat', header: 'VAT', render: (r) => formatOMRCurrency(cleanNum(r.quotation_vat)) },
    { key: 'total', header: 'Total', render: (r) => formatOMRCurrency(cleanNum(r.total_invoice_amount)) },
    {
      key: 'received',
      header: 'Received',
      render: (r) => formatOMRCurrency((r.payment_details || []).reduce((s, p) => s + cleanNum(p.paid_amount), 0)),
    },
    {
      key: 'pending',
      header: 'Pending',
      render: (r) => formatOMRCurrency(cleanNum(r.pending_amount)),
    },
    { key: 'delivery', header: 'Delivery', render: (r) => formatOMRCurrency(cleanNum(r.delivery_charges)) },
    { key: 'discount', header: 'Discount', render: (r) => formatOMRCurrency(cleanNum(r.discount_price)) },
    { key: 'refund', header: 'Refund', render: (r) => formatOMRCurrency(cleanNum(r.refund_amount)) },
  ];

  const summaryCards = [
    { title: 'Sub Total', value: formatOMRCurrency(summary.subTotal) },
    { title: 'VAT Amount', value: formatOMRCurrency(summary.vatTotal) },
    { title: 'Grand Total', value: formatOMRCurrency(summary.grandTotal) },
    { title: 'Paid Amount', value: formatOMRCurrency(summary.paidTotal) },
    { title: 'Outstanding Amount', value: formatOMRCurrency(summary.outstandingTotal) },
    { title: 'Refund Amount', value: formatOMRCurrency(summary.refundTotal) },
    { title: 'Delivery Charges', value: formatOMRCurrency(summary.deliveryTotal) },
    { title: 'Discount Amount', value: formatOMRCurrency(summary.discountTotal) },
    { title: 'Invoice Amount + Delivery', value: formatOMRCurrency(summary.grandWithDelivery) },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Business analytics and insights</p>
      </motion.div>
      
      {/* Filters */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Invoice Reports
          </CardTitle>
          <CardDescription>Filter by date range and export your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">From date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">To date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="date" value={toDate} max={todayStr} onChange={(e) => setToDate(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadData} disabled={loading}>Apply</Button>
              <Button onClick={handleExport} className="flex items-center gap-2" disabled={loading || invoices.length === 0}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="border-0 bg-gradient-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Data Table */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="mb-2">Invoice Details</CardTitle>
              <CardDescription>{invoices.length} invoices</CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport} className="flex items-center gap-2" disabled={loading || invoices.length === 0}>
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={invoices}
            columns={columns}
            searchKey="invoice_number"
            searchPlaceholder="Search by invoice or customer..."
            loading={loading}
            idKey="invoice_id"
            defaultPageSize={10}
            pageSizeOptions={[10, 20, 50, 100]}
            emptyMessage="No invoices in this date range."
          />
        </CardContent>
      </Card>

      {/* User-wise Sales */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle>User-wise Sales</CardTitle>
          <CardDescription>Totals by user for the selected date range</CardDescription>
        </CardHeader>
        <CardContent>
          {userDetails.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-base">User</TableHead>
                    <TableHead className="font-semibold text-base">Total Invoice Amount</TableHead>
                    <TableHead className="font-semibold text-base">Outstanding Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userDetails.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell>{u.user_name}</TableCell>
                      <TableCell>{formatOMRCurrency(cleanNum(u.user_total_amount))}</TableCell>
                      <TableCell>{formatOMRCurrency(cleanNum(u.pending_amount))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-6">No user summary data.</div>
          )}
        </CardContent>
      </Card>

      {/* Product Sales Summary */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle>Product Sales Overview</CardTitle>
          <CardDescription>Sales performance by product (invoice sub total) for the selected date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[{
              title: 'Products Count',
              value: productSummary.productsCount.toLocaleString(),
            }, {
              title: 'Units Sold',
              value: productSummary.unitsSold.toLocaleString(),
            }, {
              title: 'Total Sales (Invoice Sub Total)',
              value: formatOMRCurrency(productSummary.totalSales),
            }, {
              title: 'Units Received',
              value: productSummary.totalReceivedUnits.toLocaleString(),
            }].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="border-0 bg-gradient-card hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products by Units Sold (Bar) */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle>Top Products by Units Sold</CardTitle>
          <CardDescription>Highest selling products in the selected range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            {productSales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">No product sales data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={[...productSales].sort((a,b) => b.quantitySold - a.quantitySold).slice(0,10).map(p => ({
                  fullName: p.productName,
                  brand: p.productBrand,
                  units: Number(p.quantitySold || 0),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3, 31.8%, 91.4%)" />
                  <XAxis dataKey="fullName" interval={0} height={66} tick={<ProductTick />} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'hsl(215.4, 16.3%, 46.9%)' }} />
                  <ReTooltip formatter={(v: any, n: any, p: any) => [`${v} units`, p?.payload?.fullName || ""]} />
                  <Bar dataKey="units" fill="hsl(213, 100%, 55%)" radius={[6,6,0,0]} />
                </ReBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Products by Sales Amount (Bar) */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle>Top Products by Sales (OMR)</CardTitle>
          <CardDescription>Highest revenue products (invoice sub total) in the selected range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            {productSales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">No product sales data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={[...productSales].sort((a,b) => cleanNum(b.totalSales as any) - cleanNum(a.totalSales as any)).slice(0,10).map(p => ({
                  fullName: p.productName,
                  brand: p.productBrand,
                  sales: cleanNum(p.totalSales as any),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3, 31.8%, 91.4%)" />
                  <XAxis dataKey="fullName" interval={0} height={66} tick={<ProductTick />} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'hsl(215.4, 16.3%, 46.9%)' }} />
                  <ReTooltip formatter={(v: any, n: any, p: any) => [`Sub Total: ${formatOMRCurrency(v)}`, p?.payload?.fullName || ""]} />
                  <Bar dataKey="sales" fill="hsl(142, 71%, 45%)" radius={[6,6,0,0]} />
                </ReBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      
    </div>
  );
};