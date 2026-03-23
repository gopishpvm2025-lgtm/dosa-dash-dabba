import { CartItem } from "@/lib/store";
import { forwardRef } from "react";

interface BillPrintProps {
  cart: CartItem[];
  billNo: string;
}

const BillPrint = forwardRef<HTMLDivElement, BillPrintProps>(({ cart, billNo }, ref) => {
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const now = new Date();

  return (
    <div ref={ref} className="p-6 max-w-[300px] mx-auto font-mono text-xs" style={{ fontFamily: "monospace" }}>
      <div className="text-center mb-4">
        <h1 className="text-base font-bold">🍛 South Spice</h1>
        <p>Restaurant & Cafe</p>
        <p>----------------------------</p>
        <p>Bill No: {billNo}</p>
        <p>{now.toLocaleDateString()} {now.toLocaleTimeString()}</p>
        <p>----------------------------</p>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Item</th>
            <th className="text-center">Qty</th>
            <th className="text-right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id}>
              <td className="text-left">{item.name}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">₹{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2">----------------------------</p>
      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL</span>
        <span>₹{total}</span>
      </div>
      <p>----------------------------</p>
      <p className="text-center mt-4">Thank you! Visit again 🙏</p>
    </div>
  );
});

BillPrint.displayName = "BillPrint";
export default BillPrint;
