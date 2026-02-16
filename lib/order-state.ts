import type { StoreId } from "./menu";

export type OrderMode = "pickup" | "delivery";

export interface LineItemCustomization {
  addOnIds: string[];
  cookingPreference?: string;
  noTomato?: boolean;
  noLettuce?: boolean;
  notes?: string;
}

export interface CartLineItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  addOns: { name: string; price: number }[];
  customization?: LineItemCustomization;
  /** For display: "Burger #1", "Burger #2" when multiple of same entree with different prep */
  lineLabel?: string;
}

export interface OrderState {
  /** undefined = not set; null = user declined; StoreId = chosen */
  storeId: StoreId | null | undefined;
  mode: OrderMode | null;
  cart: CartLineItem[];
  /** ETA string for chosen store, e.g. "20-25 min" */
  readyEta?: string;
  /** Order number after placement, e.g. "FNC-510284" */
  orderNumber?: string;
}

export function subtotal(state: OrderState): number {
  return state.cart.reduce((sum, line) => {
    const lineTotal =
      (line.unitPrice + line.addOns.reduce((a, b) => a + b.price, 0)) * line.quantity;
    return sum + lineTotal;
  }, 0);
}

export function formatMoney(dollars: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(dollars);
}
