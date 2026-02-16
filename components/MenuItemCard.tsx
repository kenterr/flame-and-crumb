"use client";

import type { MenuItemBase } from "@/lib/menu";

interface MenuItemCardProps {
  item: MenuItemBase;
  compact?: boolean;
}

export function MenuItemCard({ item, compact }: MenuItemCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md ${
        compact ? "flex gap-3 p-2" : "flex flex-col"
      }`}
    >
      {item.image && (
        <div
          className={`relative bg-stone-100 ${compact ? "h-14 w-14 shrink-0 rounded-lg" : "aspect-[4/3] w-full"}`}
        >
          <img
            src={item.image}
            alt={item.name}
            className={`object-cover ${compact ? "h-full w-full rounded-lg" : "h-full w-full"}`}
            loading="lazy"
          />
        </div>
      )}
      <div className={compact ? "min-w-0 flex-1 py-1 pr-2" : "p-3"}>
        <h3 className="font-semibold text-stone-800">{item.name}</h3>
        <p className="mt-0.5 text-sm font-medium text-orange-600">
          ${item.price.toFixed(2)}
        </p>
        {!compact && (
          <p className="mt-1 line-clamp-2 text-xs text-stone-500">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}
