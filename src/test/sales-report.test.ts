import { describe, expect, it } from "vitest";
import type { Order } from "@/lib/store";
import { createPrintableReportHtml, getMonthlySalesSummary } from "@/lib/sales-report";

const sampleOrders: Order[] = [
  {
    id: "jan-1",
    date: "2026-01-02T12:00:00.000Z",
    total: 150,
    items: [{ id: "idli", name: "Idley", price: 30, image: "", category: "Breakfast", quantity: 5 }],
  },
  {
    id: "jan-2",
    date: "2026-01-02T14:00:00.000Z",
    total: 50,
    items: [{ id: "dosa", name: "Dosa", price: 50, image: "", category: "Breakfast", quantity: 1 }],
  },
  {
    id: "dec-1",
    date: "2025-12-31T12:00:00.000Z",
    total: 120,
    items: [{ id: "rice", name: "Tomato Rice", price: 120, image: "", category: "Rice", quantity: 1 }],
  },
];

describe("monthly sales report", () => {
  it("totals only the selected month and aggregates daily and menu revenue", () => {
    const summary = getMonthlySalesSummary(sampleOrders, "2026-01", new Date("2026-01-15T12:00:00.000Z"));

    expect(summary.totalRevenue).toBe(200);
    expect(summary.totalOrders).toBe(2);
    expect(summary.dailyData[1]).toEqual({ date: "02", revenue: 200 });
    expect(summary.items.map(({ name, quantity, revenue }) => ({ name, quantity, revenue }))).toEqual([
      { name: "Idley", quantity: 5, revenue: 150 },
      { name: "Dosa", quantity: 1, revenue: 50 },
    ]);
  });

  it("puts selected-month totals and the daily graph into the printable report", () => {
    const summary = getMonthlySalesSummary(sampleOrders, "2026-01", new Date("2026-01-15T12:00:00.000Z"));
    const html = createPrintableReportHtml(summary);

    expect(html).toContain("₹200");
    expect(html).toContain("Completed bills");
    expect(html).toContain('aria-label="Daily revenue chart for January 2026"');
    expect(html).toContain("Day 02: ₹200");
    expect(html).toContain("Idley");
  });
});