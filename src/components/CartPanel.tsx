import { CartItem } from "@/lib/store";
import { Minus, Plus, Trash2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartPanelProps {
  cart: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onPrint: () => void;
}

const CartPanel = ({ cart, onUpdateQty, onRemove, onClear, onPrint }: CartPanelProps) => {
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-display text-lg font-bold text-foreground">Cart</h2>
        {cart.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm">Tap items to add to cart</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex items-center gap-2 bg-muted rounded-md p-2">
              <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">₹{item.price} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onUpdateQty(item.id, -1)} className="w-6 h-6 rounded bg-card border border-border flex items-center justify-center">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} className="w-6 h-6 rounded bg-card border border-border flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </button>
                <button onClick={() => onRemove(item.id)} className="w-6 h-6 rounded flex items-center justify-center text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-foreground font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">₹{total}</span>
          </div>
          <Button onClick={onPrint} className="w-full" size="lg">
            <Printer className="w-4 h-4 mr-2" /> Print Bill
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
