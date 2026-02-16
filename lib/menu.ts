export type StoreId = "river-north" | "streeterville" | "west-loop";

export interface Store {
  id: StoreId;
  name: string;
  distance: string;
  openUntil: string;
  pickupEta: string;
}

export const STORES: Store[] = [
  {
    id: "river-north",
    name: "Flame & Crumb — River North",
    distance: "0.9 mi",
    openUntil: "12:00 AM",
    pickupEta: "15-25 min",
  },
  {
    id: "streeterville",
    name: "Flame & Crumb — Streeterville",
    distance: "1.4 mi",
    openUntil: "11:00 PM",
    pickupEta: "20-30 min",
  },
  {
    id: "west-loop",
    name: "Flame & Crumb — West Loop",
    distance: "2.6 mi",
    openUntil: "11:00 PM",
    pickupEta: "25-40 min",
  },
];

export interface AddOn {
  id: string;
  name: string;
  category: "cheese" | "protein" | "vegetable" | "sauce";
  price: number;
  maxPerItem?: number; // e.g. sauces choose up to 2
}

export const ADDONS: AddOn[] = [
  { id: "extra-cheese", name: "Extra Cheese", category: "cheese", price: 1.0 },
  { id: "vegan-cheese", name: "Vegan Cheese", category: "cheese", price: 1.5 },
  { id: "bacon", name: "Bacon", category: "protein", price: 1.5 },
  { id: "extra-patty", name: "Extra Patty", category: "protein", price: 3.0 },
  { id: "salmon", name: "Salmon", category: "protein", price: 4.0 },
  { id: "grilled-mushrooms", name: "Grilled Mushrooms", category: "protein", price: 0 },
  { id: "lettuce", name: "Lettuce", category: "vegetable", price: 0 },
  { id: "tomato", name: "Tomato", category: "vegetable", price: 0 },
  { id: "onions", name: "Onions", category: "vegetable", price: 0 },
  { id: "avocado", name: "Avocado", category: "vegetable", price: 1.5 },
  { id: "ketchup", name: "Ketchup", category: "sauce", price: 0 },
  { id: "mayo", name: "Mayo", category: "sauce", price: 0 },
  { id: "mustard", name: "Mustard", category: "sauce", price: 0 },
  { id: "special-sauce", name: "Special Sauce", category: "sauce", price: 0.5 },
  { id: "almond-butter", name: "Almond Butter Drizzle", category: "sauce", price: 0.75 },
];

export const SAUCE_MAX_PER_ITEM = 2;

export type CookingPreference = "rare" | "medium-rare" | "medium" | "medium-well" | "well-done";

export interface MenuItemBase {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "entree" | "side" | "drink";
  image?: string;
}

export const MENU_ITEMS: MenuItemBase[] = [
  {
    id: "classic-flame-burger",
    name: "Classic Flame Burger",
    price: 12.99,
    description: "Flame-grilled Angus beef, aged cheddar, lettuce, tomato, special sauce, brioche bun",
    category: "entree",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    id: "fries",
    name: "Fries",
    price: 3.99,
    description: "Crispy seasoned fries",
    category: "side",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
  },
  {
    id: "coke",
    name: "Coke",
    price: 2.79,
    description: "Coca-Cola",
    category: "drink",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80",
  },
];

export function getMenuItem(id: string): MenuItemBase | undefined {
  return MENU_ITEMS.find((i) => i.id === id);
}

export function getStore(id: StoreId): Store | undefined {
  return STORES.find((s) => s.id === id);
}
