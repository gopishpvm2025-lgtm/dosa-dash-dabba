import idleyImg from "@/assets/idley.jpg";
import dosaImg from "@/assets/dosa.jpg";
import pongalImg from "@/assets/pongal.jpg";
import biryaniImg from "@/assets/biryani.jpg";
import vadaImg from "@/assets/vada.jpg";
import puriImg from "@/assets/puri.jpg";
import omeletteImg from "@/assets/omelette.jpg";
import parottaImg from "@/assets/parotta.jpg";
import kothuParottaImg from "@/assets/kothu-parotta.jpg";
import tomatoRiceImg from "@/assets/tomato-rice.jpg";
import curdRiceImg from "@/assets/curd-rice.jpg";
import roastImg from "@/assets/roast.jpg";
import plainDosaImg from "@/assets/plain-dosa.jpg";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
}

const DEFAULT_MENU: MenuItem[] = [
  { id: "1", name: "Idley", price: 30, image: idleyImg, category: "Breakfast" },
  { id: "2", name: "Dosa", price: 50, image: dosaImg, category: "Breakfast" },
  { id: "3", name: "Pongal", price: 40, image: pongalImg, category: "Breakfast" },
  { id: "4", name: "Biryani", price: 120, image: biryaniImg, category: "Rice" },
  { id: "5", name: "Vada", price: 20, image: vadaImg, category: "Breakfast" },
  { id: "6", name: "Puri", price: 40, image: puriImg, category: "Breakfast" },
  { id: "7", name: "Omelette", price: 30, image: omeletteImg, category: "Egg" },
  { id: "8", name: "Parotta", price: 35, image: parottaImg, category: "Bread" },
  { id: "9", name: "Kothu Parotta", price: 60, image: kothuParottaImg, category: "Bread" },
  { id: "10", name: "Tomato Rice", price: 50, image: tomatoRiceImg, category: "Rice" },
  { id: "11", name: "Curd Rice", price: 40, image: curdRiceImg, category: "Rice" },
  { id: "12", name: "Roast", price: 60, image: roastImg, category: "Breakfast" },
  { id: "13", name: "Plain Dosa", price: 40, image: plainDosaImg, category: "Breakfast" },
];

export function getMenu(): MenuItem[] {
  const stored = localStorage.getItem("restaurant_menu");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("restaurant_menu", JSON.stringify(DEFAULT_MENU));
  return DEFAULT_MENU;
}

export function saveMenu(menu: MenuItem[]) {
  localStorage.setItem("restaurant_menu", JSON.stringify(menu));
}

export function getOrders(): Order[] {
  const stored = localStorage.getItem("restaurant_orders");
  return stored ? JSON.parse(stored) : [];
}

export function saveOrder(order: Order) {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem("restaurant_orders", JSON.stringify(orders));
}
