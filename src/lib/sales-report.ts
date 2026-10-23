import type { Order } from "@/lib/store";

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface ItemSales {
  name: string;
  quantity: number;
  revenue: number;
}

export interface MonthlySalesSummary {
  month: string;
  totalRevenue: number;
  totalOrders: number;
  dailyData: DailyRevenue[];
  items: ItemSales[];
}

export function getMonthlySalesSummary(
  orders: Order[],
  selectedMonth: string,
  now = new Date(),
): MonthlySalesSummary {
  const filtered = orders.filter((order) => order.date.startsWith(selectedMonth));
  const dailyTotals = new Map<string, number>();
  const itemTotals = new Map<string, ItemSales>();

  for (const order of filtered) {
    const day = order.date.split("T")[0];
    dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + order.total);

    for (const item of order.items) {
      const current = itemTotals.get(item.name) ?? { name: item.name, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.price * item.quantity;
      itemTotals.set(item.name, current);
    }
  }

  const [year, month] = selectedMonth.split("-").map(Number);
  const monthLength = new Date(year, month, 0).getDate();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const daysToShow = selectedMonth === currentMonth ? now.getDate() : monthLength;
  const dailyData = Array.from({ length: daysToShow }, (_, index) => {
    const date = `${selectedMonth}-${String(index + 1).padStart(2, "0")}`;
    return { date: date.slice(-2), revenue: dailyTotals.get(date) ?? 0 };
  });

  return {
    month: selectedMonth,
    totalRevenue: filtered.reduce((total, order) => total + order.total, 0),
    totalOrders: filtered.length,
    dailyData,
    items: Array.from(itemTotals.values()).sort((a, b) => b.revenue - a.revenue),
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

export function createPrintableReportHtml(summary: MonthlySalesSummary, primaryColor = "15 70% 45%") {
  const [year, month] = summary.month.split("-").map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const maxRevenue = Math.max(1, ...summary.dailyData.map((day) => day.revenue));
  const chartWidth = 960;
  const chartHeight = 280;
  const chartTop = 16;
  const chartBottom = 224;
  const left = 48;
  const usableWidth = chartWidth - left - 12;
  const slotWidth = usableWidth / Math.max(1, summary.dailyData.length);
  const barWidth = Math.max(3, Math.min(18, slotWidth * 0.62));
  const bars = summary.dailyData.map((day, index) => {
    const barHeight = (day.revenue / maxRevenue) * (chartBottom - chartTop);
    const x = left + index * slotWidth + (slotWidth - barWidth) / 2;
    const y = chartBottom - barHeight;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="2" fill="hsl(${primaryColor})"><title>Day ${escapeHtml(day.date)}: ₹${day.revenue}</title></rect>`;
  }).join("");
  const labels = summary.dailyData.map((day, index) => {
    if (summary.dailyData.length > 12 && index % 5 !== 0 && index !== summary.dailyData.length - 1) return "";
    const x = left + index * slotWidth + slotWidth / 2;
    return `<text x="${x.toFixed(1)}" y="246" text-anchor="middle">${escapeHtml(day.date)}</text>`;
  }).join("");
  const topItems = summary.items.slice(0, 8).map((item) =>
    `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td><td>₹${item.revenue.toLocaleString("en-IN")}</td></tr>`,
  ).join("");
  const primary = `hsl(${primaryColor})`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>South Spice · ${escapeHtml(monthName)} Sales</title><style>
    :root{color-scheme:light}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#28231f;margin:0;padding:32px;background:#fff}main{max-width:1040px;margin:0 auto}header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid ${primary};padding-bottom:18px;margin-bottom:24px}h1{font-size:28px;margin:0 0 6px}p{margin:0;color:#716961}.brand{color:${primary};font-weight:700;letter-spacing:1px;text-transform:uppercase;font-size:12px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:20px 0 28px}.stat{border:1px solid #ded8d0;border-radius:8px;padding:18px}.stat strong{display:block;font-size:25px;margin-bottom:6px}.stat span{font-size:13px;color:#716961}.section-title{font-size:17px;margin:26px 0 12px}.chart{width:100%;height:auto}.chart text{font:11px Arial,sans-serif;fill:#716961}.chart line{stroke:#ded8d0;stroke-width:1}table{width:100%;border-collapse:collapse;margin:12px 0 24px}th,td{text-align:left;padding:10px 8px;border-bottom:1px solid #e8e3dd;font-size:13px}th{color:#716961;font-weight:600}td:nth-child(2),td:nth-child(3),th:nth-child(2),th:nth-child(3){text-align:right}footer{margin-top:32px;padding-top:12px;border-top:1px solid #ded8d0;color:#716961;font-size:11px}@media print{body{padding:12mm}.stat,.chart,table{break-inside:avoid}header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body><main><header><div><div class="brand">South Spice</div><h1>Monthly sales report</h1><p>${escapeHtml(monthName)}</p></div><p>Prepared ${escapeHtml(new Date().toLocaleDateString("en-IN"))}</p></header><section class="stats"><div class="stat"><strong>₹${summary.totalRevenue.toLocaleString("en-IN")}</strong><span>Total revenue</span></div><div class="stat"><strong>${summary.totalOrders.toLocaleString("en-IN")}</strong><span>Completed bills</span></div><div class="stat"><strong>₹${(summary.totalOrders ? summary.totalRevenue / summary.totalOrders : 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong><span>Average bill</span></div></section><h2 class="section-title">Daily revenue</h2><svg class="chart" role="img" aria-label="Daily revenue chart for ${escapeHtml(monthName)}" viewBox="0 0 ${chartWidth} ${chartHeight}" xmlns="http://www.w3.org/2000/svg"><line x1="${left}" y1="${chartBottom}" x2="${chartWidth - 12}" y2="${chartBottom}"/><line x1="${left}" y1="${chartTop}" x2="${left}" y2="${chartBottom}"/>${bars}${labels}<text x="${left}" y="12">Revenue (₹)</text><text x="${chartWidth / 2}" y="274" text-anchor="middle">Day of month</text></svg><h2 class="section-title">Top-selling menu items</h2>${topItems ? `<table><thead><tr><th>Item</th><th>Qty sold</th><th>Revenue</th></tr></thead><tbody>${topItems}</tbody></table>` : `<p>No item sales were recorded in this month.</p>`}<footer>South Spice · Sales summary from recorded bills</footer></main><script>window.addEventListener('load',()=>window.print())</script></body></html>`;
}