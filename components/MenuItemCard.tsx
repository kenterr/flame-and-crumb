"use client";

import { useState } from "react";
import type { MenuItemBase } from "@/lib/menu";

interface MenuItemCardProps {
  item: MenuItemBase;
  compact?: boolean;
}

export function MenuItemCard({ item, compact }: MenuItemCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = item.image && !imgError;

  return (
    <article
      className={`overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md ${
        compact
          ? "flex w-[9rem] shrink-0 gap-3 p-2"
          : "flex h-[14rem] w-[9rem] shrink-0 flex-col"
      }`}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center bg-stone-100 ${compact ? "h-14 w-14 shrink-0 rounded-lg" : "aspect-[4/3] w-full"}`}
        style={!compact ? { aspectRatio: "4/3" } : undefined}
      >
        {showImage ? (
          <img
            src={item.image}
            alt={item.name}
            className={`object-cover ${compact ? "h-full w-full rounded-lg" : "h-full w-full"}`}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-stone-400" aria-hidden>
            {compact ? "—" : "📷"}
          </span>
        )}
      </div>
      <div
        className={
          compact
            ? "min-w-0 flex-1 py-1 pr-2"
            : "flex min-h-0 flex-1 flex-col p-3"
        }
      >
        <h3 className="truncate font-semibold text-stone-800" title={item.name}>
          {item.name}
        </h3>
        <p className="mt-0.5 shrink-0 text-sm font-medium text-orange-600">
          ${item.price.toFixed(2)}
        </p>
        {!compact && (
          <p className="mt-1 line-clamp-2 min-h-0 flex-1 text-xs text-stone-500">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}
