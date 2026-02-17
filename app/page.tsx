"use client";

import { useCallback, useRef, useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { MenuItemCard } from "@/components/MenuItemCard";
import { OrderSummary } from "@/components/OrderSummary";
import { DISPLAY_CATEGORY_ORDER, groupItemsByCategory } from "@/lib/menu";
import type { OrderState } from "@/lib/order-state";

type Message = { role: "user" | "assistant"; content: string; itemIds?: string[]; showStoreMap?: boolean };

const initialOrderState: OrderState = {
  storeId: undefined,
  mode: null,
  cart: [],
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [orderState, setOrderState] = useState<OrderState>(initialOrderState);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const orderStateRef = useRef<OrderState>(initialOrderState);
  orderStateRef.current = orderState;
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    scrollToBottom();

    const currentOrderState = orderStateRef.current;
    try {
      const nextMessages: Message[] = [...messages, { role: "user", content: text }];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          orderState: currentOrderState,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Error: ${data.error ?? res.statusText}` },
        ]);
        return;
      }
      const nextOrderState = data.orderState ?? currentOrderState;
      orderStateRef.current = nextOrderState;
      setOrderState(nextOrderState);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.message || "",
          itemIds: data.displayItemIds,
          showStoreMap: data.showStoreMap,
        },
      ]);
      scrollToBottom();
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Something went wrong: ${e instanceof Error ? e.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, scrollToBottom]);

  const hasCart = orderState.cart.length > 0 || orderState.orderNumber;

  return (
    <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-3 pb-24 pt-4 md:px-4 md:pb-24 md:pt-4">
      {/* Mobile: floating checkout bar at top centered */}
      {hasCart && (
        <aside
          className="fixed left-0 right-0 top-0 z-20 flex justify-center p-3 md:left-auto md:right-4 md:top-20 md:block md:w-72 md:max-w-[18rem] md:p-0"
          style={{ maxHeight: "calc(100vh - 5rem)" }}
        >
          <div className="w-full max-w-sm overflow-y-auto md:max-w-none glass-panel md:max-h-[calc(100vh-6rem)]">
            <OrderSummary
              orderState={orderState}
              onCheckoutClick={() => {
                setInput("Place order");
                inputRef.current?.focus();
              }}
            />
          </div>
        </aside>
      )}

      {/* On mobile when cart is open, pad so content starts below the floating top bar */}
      <div className={hasCart ? "pt-52 md:pt-0" : ""}>
        <header className="mb-4 flex items-center gap-2 pb-3">
          <span className="text-xl font-semibold text-stone-800">Flame & Crumb</span>
          <span className="text-sm text-stone-500">Order for pickup or delivery</span>
        </header>

      <div
        className={`flex flex-1 flex-col overflow-hidden md:flex-row md:gap-4 ${hasCart ? "md:pr-[18rem]" : ""}`}
      >
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden glass-panel">
          <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-3 md:pb-24">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-stone-500">
                <p className="text-lg">Hey, can I order from Flame & Crumb?</p>
                <p className="mt-2 text-sm">Type a message below to start.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="space-y-2">
                <ChatMessage role={msg.role} content={msg.content} />
                {msg.role === "assistant" && msg.itemIds && msg.itemIds.length > 0 && (
                  <div className="space-y-4 pl-1">
                    {DISPLAY_CATEGORY_ORDER.map((category) => {
                      const items = groupItemsByCategory(msg.itemIds!).get(category) ?? [];
                      if (items.length === 0) return null;
                      return (
                        <div key={category}>
                          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
                            {category}
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {items.map((item) => (
                              <div key={item.id} className="w-32 shrink-0 md:w-36">
                                <MenuItemCard item={item} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {msg.role === "assistant" && msg.showStoreMap && (
                  <div className="pl-1">
                    <img
                      src="/locations-map.png"
                      alt="Flame & Crumb locations"
                      className="max-w-sm rounded-2xl border border-white/40 shadow-md"
                    />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="glass-panel-subtle px-4 py-3 text-sm text-stone-500">...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 flex justify-center p-3 pb-5 md:p-4 md:pb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="glass-panel flex w-full max-w-2xl gap-2 px-3 py-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border-0 bg-white/60 px-4 py-2.5 text-sm outline-none backdrop-blur-sm placeholder:text-stone-400 focus:ring-2 focus:ring-orange-400/60"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-[#C45C26] px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
