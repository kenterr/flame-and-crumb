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

export type DisplayCategory = "Hamburgers" | "Wings" | "Sides" | "Drinks" | "Combos";

export interface MenuItemBase {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "entree" | "side" | "drink";
  /** Section title when showing menu: Hamburgers, Wings, Sides, Drinks, Combos */
  displayCategory: DisplayCategory;
  image?: string;
  /** e.g. ["spicy"], ["combo"] for recommendations */
  tags?: string[];
}

/** Order to show menu sections when displaying cards */
export const DISPLAY_CATEGORY_ORDER: DisplayCategory[] = [
  "Hamburgers",
  "Wings",
  "Sides",
  "Drinks",
  "Combos",
];

export const MENU_ITEMS: MenuItemBase[] = [
  // —— Hamburgers ——
  {
    id: "classic-flame-burger",
    name: "Classic Flame Burger",
    price: 12.99,
    description: "Flame-grilled Angus beef, aged cheddar, lettuce, tomato, special sauce, brioche bun",
    category: "entree",
    displayCategory: "Hamburgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    id: "spicy-flame-burger",
    name: "Spicy Flame Burger",
    price: 9.49,
    description: "Flame-grilled beef, pepper jack, jalapeños, chipotle mayo, brioche bun",
    category: "entree",
    displayCategory: "Hamburgers",
    tags: ["spicy"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    id: "hot-wings",
    name: "Hot Wings (6 pc)",
    price: 6.99,
    description: "Crispy wings tossed in buffalo sauce with ranch",
    category: "entree",
    displayCategory: "Wings",
    tags: ["spicy"],
    image: "https://images.unsplash.com/photo-1767065703660-7f14b6e29210?w=400&q=80",
  },
  {
    id: "chicken-sandwich",
    name: "Crispy Chicken Sandwich",
    price: 10.99,
    description: "Crispy chicken, pickles, mayo, brioche bun",
    category: "entree",
    displayCategory: "Hamburgers",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80",
  },
  {
    id: "veggie-burger",
    name: "Veggie Burger",
    price: 11.99,
    description: "House-made black bean patty, avocado, lettuce, tomato, chipotle aioli",
    category: "entree",
    displayCategory: "Hamburgers",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80",
  },
  // —— Sides ——
  {
    id: "fries",
    name: "Fries",
    price: 3.99,
    description: "Crispy seasoned fries",
    category: "side",
    displayCategory: "Sides",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
  },
  {
    id: "loaded-fries",
    name: "Loaded Fries",
    price: 5.99,
    description: "Fries topped with cheese sauce and bacon",
    category: "side",
    displayCategory: "Sides",
    tags: ["slang"],
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
  },
  {
    id: "onion-rings",
    name: "Onion Rings",
    price: 4.49,
    description: "Beer-battered onion rings with ranch",
    category: "side",
    displayCategory: "Sides",
    image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80",
  },
  {
    id: "coleslaw",
    name: "Coleslaw",
    price: 2.99,
    description: "Creamy classic coleslaw",
    category: "side",
    displayCategory: "Sides",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
  },
  {
    id: "side-salad",
    name: "Side Salad",
    price: 3.49,
    description: "Mixed greens, tomato, cucumber, vinaigrette",
    category: "side",
    displayCategory: "Sides",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
  },
  // —— Drinks ——
  {
    id: "coke",
    name: "Coke",
    price: 2.79,
    description: "Coca-Cola",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80",
  },
  {
    id: "diet-coke",
    name: "Diet Coke",
    price: 2.79,
    description: "Diet Coca-Cola",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80",
  },
  {
    id: "sprite",
    name: "Sprite",
    price: 2.79,
    description: "Sprite lemon-lime soda",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80",
  },
  {
    id: "dr-pepper",
    name: "Dr Pepper",
    price: 2.79,
    description: "Dr Pepper",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80",
  },
  {
    id: "root-beer",
    name: "Root Beer",
    price: 2.79,
    description: "Root beer",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80",
  },
  {
    id: "fanta-orange",
    name: "Fanta Orange",
    price: 2.79,
    description: "Fanta Orange",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80",
  },
  {
    id: "mountain-dew",
    name: "Mountain Dew",
    price: 2.79,
    description: "Mountain Dew",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80",
  },
  {
    id: "ginger-ale",
    name: "Ginger Ale",
    price: 2.79,
    description: "Ginger ale",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80",
  },
  {
    id: "lemonade",
    name: "Lemonade",
    price: 3.29,
    description: "Fresh-squeezed lemonade",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80",
  },
  {
    id: "iced-tea",
    name: "Iced Tea",
    price: 2.99,
    description: "House brewed iced tea",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
  },
  {
    id: "water",
    name: "Water",
    price: 0,
    description: "Still water",
    category: "drink",
    displayCategory: "Drinks",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
  },
  // —— Combos ——
  {
    id: "spicy-combo",
    name: "Spicy Combo",
    price: 9.99,
    description: "Spicy Flame Burger + Fries. Best value under $10.",
    category: "entree",
    displayCategory: "Combos",
    tags: ["spicy", "combo"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    id: "classic-combo",
    name: "Classic Combo",
    price: 14.99,
    description: "Classic Flame Burger + Fries + Drink (Coke, Diet Coke, Sprite, Lemonade, or Iced Tea)",
    category: "entree",
    displayCategory: "Combos",
    tags: ["combo"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    id: "chicken-combo",
    name: "Chicken Combo",
    price: 12.99,
    description: "Crispy Chicken Sandwich + Fries + Drink",
    category: "entree",
    displayCategory: "Combos",
    tags: ["combo"],
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80",
  },
  {
    id: "veggie-combo",
    name: "Veggie Combo",
    price: 13.99,
    description: "Veggie Burger + Side Salad + Drink",
    category: "entree",
    displayCategory: "Combos",
    tags: ["combo"],
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80",
  },
  {
    id: "wings-combo",
    name: "Wings Combo",
    price: 10.99,
    description: "Hot Wings (6 pc) + Fries + Drink",
    category: "entree",
    displayCategory: "Combos",
    tags: ["spicy", "combo"],
    image: "https://images.unsplash.com/photo-1767065703660-7f14b6e29210?w=400&q=80",
  },
  {
    id: "double-burger-combo",
    name: "Double Burger Combo",
    price: 16.99,
    description: "Classic Flame Burger with extra patty + Fries + Drink",
    category: "entree",
    displayCategory: "Combos",
    tags: ["combo"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    id: "family-combo",
    name: "Family Combo",
    price: 24.99,
    description: "2 Classic Flame Burgers + 2 Spicy Combos + Large Fries + 4 Drinks",
    category: "entree",
    displayCategory: "Combos",
    tags: ["combo"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    id: "loaded-combo",
    name: "Loaded Combo",
    price: 11.99,
    description: "Spicy Flame Burger + Loaded Fries + Drink",
    category: "entree",
    displayCategory: "Combos",
    tags: ["spicy", "combo"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
];

export function getMenuItem(id: string): MenuItemBase | undefined {
  return MENU_ITEMS.find((i) => i.id === id);
}

/** Group menu items by displayCategory for sectioned display. Order follows DISPLAY_CATEGORY_ORDER. */
export function groupItemsByCategory(itemIds: string[]): Map<DisplayCategory, MenuItemBase[]> {
  const map = new Map<DisplayCategory, MenuItemBase[]>();
  for (const cat of DISPLAY_CATEGORY_ORDER) {
    map.set(cat, []);
  }
  for (const id of itemIds) {
    const item = getMenuItem(id);
    if (item && map.has(item.displayCategory)) {
      map.get(item.displayCategory)!.push(item);
    }
  }
  return map;
}

export function getStore(id: StoreId): Store | undefined {
  return STORES.find((s) => s.id === id);
}
