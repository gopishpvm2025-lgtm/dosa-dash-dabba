import { useMemo, useState } from "react";
import { getOrders } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import SalesInsights from "@/components/SalesInsights";
import { createPrintableReportHtml, getMonthlySalesSummary } from "@/lib/sales-report";

const SalesReport = () => {
  const orders = getOrders();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const monthlyData = useMemo(() => {
    return getMonthlySalesSummary(orders, selectedMonth);
  }, [orders, selectedMonth]);

  const months = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      const d = new Date(o.date);
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    const now = new Date();
    set.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    return Array.from(set).sort().reverse();
  }, [orders]);

  const printReport = () => {
    const printWindow = window.open("", "_blank", "width=1100,height=850");
    if (!printWindow) return;
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "15 70% 45%";
    printWindow.document.open();
    printWindow.document.write(createPrintableReportHtml(monthlyData, primaryColor));
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-foreground">Sales Report</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Sales report month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            {months.map((m) => (
              <option key={m} value={m}>{new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={printReport}>
            <FileDown /> Print / save PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">₹{monthlyData.totalRevenue.toLocaleString("en-IN")}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{monthlyData.totalOrders}</p>
          <p className="text-sm text-muted-foreground">Total Orders</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Daily Revenue</h3>
          {monthlyData.totalOrders === 0 && (
            <p className="text-sm text-muted-foreground mb-3">No sales recorded for this month yet</p>
          )}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData.dailyData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={Math.max(0, Math.ceil(monthlyData.dailyData.length / 10) - 1)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v: number) => `₹${v}`} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      {monthlyData.topItems.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Top items</h3>
          <div className="space-y-2">
            {monthlyData.items.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground">{item.name}</span>
                <span className="text-muted-foreground">{item.quantity} sold · ₹{item.revenue.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <SalesInsights summary={monthlyData} />
    </div>
  );
};

export default SalesReport;
