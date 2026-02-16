"use client";

import { MENU_ITEMS } from "@/lib/menu";
import { MenuItemCard } from "./MenuItemCard";

export function MenuGrid() {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-stone-700">Menu</h3>
      <div className="space-y-2">
        {MENU_ITEMS.map((item) => (
          <MenuItemCard key={item.id} item={item} compact />
        ))}
      </div>
    </section>
  );
}
