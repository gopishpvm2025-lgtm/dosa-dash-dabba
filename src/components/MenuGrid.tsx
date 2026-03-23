import { MenuItem } from "@/lib/store";
import { Plus } from "lucide-react";

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

const MenuGrid = ({ items, onAddToCart }: MenuGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onAddToCart(item)}
          className="group bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-left"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              width={512}
              height={512}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-2 sm:p-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm sm:text-base text-foreground">{item.name}</p>
              <p className="text-primary font-bold text-sm">₹{item.price}</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MenuGrid;
