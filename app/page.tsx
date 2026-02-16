"use client";

import { useCallback, useRef, useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { MenuItemCard } from "@/components/MenuItemCard";
import { OrderSummary } from "@/components/OrderSummary";
import { getMenuItem } from "@/lib/menu";
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

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col bg-stone-100 p-4">
      <header className="mb-4 flex items-center gap-2 border-b border-stone-200 pb-3">
        <span className="text-xl font-semibold text-stone-800">Flame & Crumb</span>
        <span className="text-sm text-stone-500">Order for pickup or delivery</span>
      </header>

      <div
        className={`flex flex-1 gap-4 overflow-hidden ${orderState.cart.length > 0 || orderState.orderNumber ? "pr-[18rem]" : ""}`}
      >
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  <div className="flex flex-wrap gap-3 pl-1">
                    {msg.itemIds
                      .map((id) => getMenuItem(id))
                      .filter(Boolean)
                      .map((item) => (
                        <div key={item!.id} className="w-36 shrink-0">
                          <MenuItemCard item={item!} />
                        </div>
                      ))}
                  </div>
                )}
                {msg.role === "assistant" && msg.showStoreMap && (
                  <div className="pl-1">
                    <img
                      src="/locations-map.png"
                      alt="Flame & Crumb locations"
                      className="max-w-sm rounded-lg border border-stone-200 shadow-sm"
                    />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-stone-200 px-4 py-3 text-sm text-stone-500">
                  ...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-stone-200 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-xl bg-[#C45C26] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
        {(orderState.cart.length > 0 || orderState.orderNumber) && (
          <aside
            className="fixed right-4 top-20 z-10 w-72 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/95 shadow-lg backdrop-blur-sm"
            style={{ maxHeight: "calc(100vh - 6rem)" }}
          >
            <OrderSummary
              orderState={orderState}
              onCheckoutClick={() => {
                setInput("Place order");
                inputRef.current?.focus();
              }}
            />
          </aside>
        )}
      </div>
    </main>
  );
}
