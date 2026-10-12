import { useMemo, useState } from "react";
import { getOrders } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SalesReport = () => {
  const orders = getOrders();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const monthlyData = useMemo(() => {
    const filtered = orders.filter((o) => o.date.startsWith(selectedMonth));
    const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
    const totalOrders = filtered.length;

    const dailyMap: Record<string, number> = {};
    filtered.forEach((o) => {
      const day = o.date.split("T")[0];
      dailyMap[day] = (dailyMap[day] || 0) + o.total;
    });

    const [year, month] = selectedMonth.split("-").map(Number);
    const monthLength = new Date(year, month, 0).getDate();
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const daysToShow = selectedMonth === currentMonth ? today.getDate() : monthLength;
    const dailyData = Array.from({ length: daysToShow }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return { date: day, revenue: dailyMap[`${selectedMonth}-${day}`] || 0 };
    });

    const itemMap: Record<string, { qty: number; revenue: number }> = {};
    filtered.forEach((o) =>
      o.items.forEach((i) => {
        if (!itemMap[i.name]) itemMap[i.name] = { qty: 0, revenue: 0 };
        itemMap[i.name].qty += i.quantity;
        itemMap[i.name].revenue += i.price * i.quantity;
      })
    );

    const topItems = Object.entries(itemMap)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5);

    return { totalRevenue, totalOrders, dailyData, topItems };
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-xl font-bold text-foreground">Sales Report</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          {months.map((m) => (
            <option key={m} value={m}>{new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">₹{monthlyData.totalRevenue}</p>
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
          <h3 className="text-sm font-semibold text-foreground mb-3">Top Items</h3>
          <div className="space-y-2">
            {monthlyData.topItems.map(([name, data]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{name}</span>
                <span className="text-muted-foreground">{data.qty} sold · ₹{data.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
