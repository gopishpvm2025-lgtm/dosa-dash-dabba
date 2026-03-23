import { useState, useRef, useCallback } from "react";
import { MenuItem, CartItem, getMenu, saveOrder } from "@/lib/store";
import MenuGrid from "@/components/MenuGrid";
import CartPanel from "@/components/CartPanel";
import BillPrint from "@/components/BillPrint";
import MenuManager from "@/components/MenuManager";
import SalesReport from "@/components/SalesReport";
import { ShoppingCart, UtensilsCrossed, Settings, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type Tab = "order" | "manage" | "report";

const Index = () => {
  const [menu, setMenu] = useState<MenuItem[]>(getMenu);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tab, setTab] = useState<Tab>("order");
  const [showCart, setShowCart] = useState(false);
  const billRef = useRef<HTMLDivElement>(null);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added`);
  }, []);

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c));
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));
  const clearCart = () => setCart([]);

  const printBill = () => {
    const billNo = `B${Date.now().toString().slice(-6)}`;
    saveOrder({ id: billNo, items: [...cart], total: cart.reduce((s, i) => s + i.price * i.quantity, 0), date: new Date().toISOString() });

    const printWindow = window.open("", "_blank", "width=350,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Bill ${billNo}</title>
      <style>body{font-family:monospace;font-size:12px;margin:0;padding:20px}
      table{width:100%;border-collapse:collapse}th,td{padding:2px 0}
      th{text-align:left}td:nth-child(2){text-align:center}td:nth-child(3),th:nth-child(3){text-align:right}
      .center{text-align:center}.bold{font-weight:bold}.total{font-size:14px;display:flex;justify-content:space-between}
      </style></head><body>
      <div class="center"><h2>🍛 South Spice</h2><p>Restaurant & Cafe</p>
      <p>----------------------------</p><p>Bill No: ${billNo}</p>
      <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      <p>----------------------------</p></div>
      <table><tr><th>Item</th><th>Qty</th><th>Amt</th></tr>
      ${cart.map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price * i.quantity}</td></tr>`).join("")}
      </table><p>----------------------------</p>
      <div class="total bold"><span>TOTAL</span><span>₹${cart.reduce((s, i) => s + i.price * i.quantity, 0)}</span></div>
      <p>----------------------------</p><p class="center" style="margin-top:16px">Thank you! Visit again 🙏</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast.success("Bill printed & saved!");
    clearCart();
    setShowCart(false);
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "order", label: "Order", icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: "manage", label: "Menu", icon: <Settings className="w-5 h-5" /> },
    { id: "report", label: "Report", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">🍛 South Spice</h1>
        {tab === "order" && (
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative lg:hidden p-2 rounded-lg bg-primary text-primary-foreground"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        )}
      </header>

      {/* Tab nav */}
      <nav className="sticky top-[57px] z-20 bg-card border-b border-border flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setShowCart(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === t.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon} <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex">
        {/* Main content */}
        <main className={`flex-1 p-4 ${tab === "order" ? "lg:pr-[340px]" : ""}`}>
          {tab === "order" && <MenuGrid items={menu} onAddToCart={addToCart} />}
          {tab === "manage" && <MenuManager menu={menu} onMenuChange={setMenu} />}
          {tab === "report" && <SalesReport />}
        </main>

        {/* Desktop cart sidebar */}
        {tab === "order" && (
          <aside className="hidden lg:flex fixed top-[113px] right-0 w-[340px] h-[calc(100vh-113px)] border-l border-border bg-card flex-col">
            <CartPanel cart={cart} onUpdateQty={updateQty} onRemove={removeItem} onClear={clearCart} onPrint={printBill} />
          </aside>
        )}

        {/* Mobile cart overlay */}
        {tab === "order" && showCart && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-foreground/30" onClick={() => setShowCart(false)} />
            <div className="absolute right-0 top-0 h-full w-[320px] max-w-[85vw] bg-card shadow-xl flex flex-col">
              <CartPanel cart={cart} onUpdateQty={updateQty} onRemove={removeItem} onClear={clearCart} onPrint={printBill} />
            </div>
          </div>
        )}
      </div>

      {/* Hidden print template */}
      <div className="hidden">
        <BillPrint ref={billRef} cart={cart} billNo="" />
      </div>
    </div>
  );
};

export default Index;
