"use client";

import { useState } from "react";
import type { MenuItemBase } from "@/lib/menu";

/** Fixed dimensions so every card matches (image + content same size). Image 6.75rem (4:3 for 9rem); content min 7.25rem. */
const IMAGE_HEIGHT = "6.75rem";
const CONTENT_MIN_HEIGHT = "7.25rem";

interface MenuItemCardProps {
  item: MenuItemBase;
  compact?: boolean;
}

export function MenuItemCard({ item, compact }: MenuItemCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = item.image && !imgError;

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-lg shadow-stone-200/50 backdrop-blur-xl transition hover:shadow-xl hover:border-white/60 ${
        compact
          ? "flex w-[9rem] shrink-0 gap-3 p-2"
          : "flex h-[14rem] w-full min-w-0 flex-col"
      }`}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-stone-100/80 ${
          compact ? "h-14 w-14 rounded-lg" : "w-full"
        }`}
        style={
          !compact
            ? { height: IMAGE_HEIGHT, minHeight: IMAGE_HEIGHT }
            : undefined
        }
      >
        {showImage ? (
          <img
            src={item.image}
            alt={item.name}
            className={`object-cover object-center ${compact ? "h-full w-full rounded-lg" : "h-full w-full"}`}
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
            : "flex min-h-0 flex-1 flex-col overflow-hidden p-3"
        }
        style={
          !compact
            ? { minHeight: CONTENT_MIN_HEIGHT }
            : undefined
        }
      >
        <h3 className="truncate font-semibold text-stone-800" title={item.name}>
          {item.name}
        </h3>
        <p className="mt-0.5 shrink-0 text-sm font-medium text-orange-600">
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
