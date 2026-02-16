"use client";

import { getStore } from "@/lib/menu";
import type { OrderState } from "@/lib/order-state";
import { formatMoney, subtotal } from "@/lib/order-state";

interface OrderSummaryProps {
  orderState: OrderState;
}

export function OrderSummary({ orderState }: OrderSummaryProps) {
  if (orderState.cart.length === 0 && !orderState.orderNumber) return null;

  const store = orderState.storeId ? getStore(orderState.storeId) : null;
  const sub = subtotal(orderState);
  const tax = sub * 0.1;
  const pickupFee = 0;
  const total = sub + tax + pickupFee;

  if (orderState.orderNumber) {
    return (
      <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-stone-800">Order placed</h3>
        <p className="mt-1 text-sm text-stone-600">Order #{orderState.orderNumber}</p>
        {store && (
          <p className="mt-1 text-sm text-stone-600">
            Pickup: {store.name} — ETA {orderState.readyEta ?? store.pickupEta}
          </p>
        )}
        <ul className="mt-2 list-inside list-disc text-sm text-stone-600">
          {orderState.cart.map((line, i) => (
            <li key={i}>
              {line.quantity}x {line.name}
              {line.addOns.length ? ` (${line.addOns.map((a) => a.name).join(", ")})` : ""}
              {line.customization?.cookingPreference && ` — ${line.customization.cookingPreference}`}
              {line.customization?.noTomato && " — no tomato"}
              {line.lineLabel ? ` [${line.lineLabel}]` : ""}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-stone-800">Your order</h3>
      <ul className="mt-2 space-y-1 text-sm text-stone-700">
        {orderState.cart.map((line, i) => (
          <li key={i}>
            {line.quantity}x {line.name} — {formatMoney(line.unitPrice)} each
            {line.addOns.length
              ? ` + ${line.addOns.map((a) => `${a.name} (${formatMoney(a.price)})`).join(", ")}`
              : ""}
            {line.customization?.cookingPreference && ` — ${line.customization.cookingPreference}`}
            {line.customization?.noTomato && " — no tomato"}
            {line.lineLabel && ` [${line.lineLabel}]`}
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-stone-200 pt-2 text-sm">
        <p>Subtotal: {formatMoney(sub)}</p>
        <p>Est. tax: {formatMoney(tax)}</p>
        <p>Pickup fee: {formatMoney(pickupFee)}</p>
        <p className="font-medium">Est. total: {formatMoney(total)}</p>
      </div>
      {store && (
        <p className="mt-2 text-xs text-stone-500">
          Pickup: {store.name} — Ready in {orderState.readyEta ?? store.pickupEta}
        </p>
      )}
    </section>
  );
}
