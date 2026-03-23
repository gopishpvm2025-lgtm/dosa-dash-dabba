import { useState } from "react";
import { MenuItem, getMenu, saveMenu } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";

interface MenuManagerProps {
  menu: MenuItem[];
  onMenuChange: (menu: MenuItem[]) => void;
}

const MenuManager = ({ menu, onMenuChange }: MenuManagerProps) => {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: "", price: "", category: "", image: "" });

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", price: "", category: "Breakfast", image: "" });
    setOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({ name: item.name, price: String(item.price), category: item.category, image: item.image });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    let updated: MenuItem[];
    if (editItem) {
      updated = menu.map((m) => m.id === editItem.id ? { ...m, name: form.name, price: Number(form.price), category: form.category, image: form.image || m.image } : m);
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: form.name,
        price: Number(form.price),
        category: form.category,
        image: form.image || "/placeholder.svg",
      };
      updated = [...menu, newItem];
    }
    saveMenu(updated);
    onMenuChange(updated);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = menu.filter((m) => m.id !== id);
    saveMenu(updated);
    onMenuChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Manage Menu</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? "Edit Item" : "Add Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {menu.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
            <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{item.name}</p>
              <p className="text-sm text-muted-foreground">₹{item.price} · {item.category}</p>
            </div>
            <button onClick={() => openEdit(item)} className="p-2 rounded hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={() => handleDelete(item.id)} className="p-2 rounded hover:bg-muted"><Trash2 className="w-4 h-4 text-destructive" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuManager;
