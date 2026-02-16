import OpenAI from "openai";
import {
  ADDONS,
  getMenuItem,
  getStore,
  MENU_ITEMS,
  SAUCE_MAX_PER_ITEM,
  STORES,
  type StoreId,
} from "@/lib/menu";
import type {
  CartLineItem,
  OrderState,
} from "@/lib/order-state";

const GROK_MODEL = "grok-2-1212";

function buildSystemPrompt(orderState: OrderState): string {
  const storeList = STORES.map(
    (s) => `${s.name} (id: ${s.id}) — ${s.distance}, open until ${s.openUntil}, pickup ETA ${s.pickupEta}`
  ).join("\n");
  const menuList = MENU_ITEMS.map(
    (m) => `${m.name} (id: ${m.id}) — $${m.price.toFixed(2)} — ${m.description}`
  ).join("\n");
  const addonList = ADDONS.map(
    (a) => `${a.name} (id: ${a.id}) — +$${a.price.toFixed(2)} [${a.category}]`
  ).join("\n");

  const cartSummary =
    orderState.cart.length === 0
      ? "Cart is empty."
      : orderState.cart
          .map(
            (line, i) =>
              `${i + 1}. ${line.quantity}x ${line.name} @ $${line.unitPrice.toFixed(2)} each` +
              (line.addOns.length ? ` + ${line.addOns.map((a) => `${a.name} (+$${a.price.toFixed(2)})`).join(", ")}` : "") +
              (line.customization?.cookingPreference ? ` — ${line.customization.cookingPreference}` : "") +
              (line.customization?.noTomato ? " — no tomato" : "") +
              (line.lineLabel ? ` [${line.lineLabel}]` : "")
          )
          .join("\n");

  return `You are the friendly ordering assistant for "Flame & Crumb", a restaurant. You help the user order food for pickup or delivery.

Current order state (use the tools to update it; do not invent state):
- Store chosen: ${orderState.storeId ?? "not set (user can say no to location, then ask ZIP or city/state)"}
- Mode (pickup/delivery): ${orderState.mode ?? "not set"}
- Ready ETA: ${orderState.readyEta ?? "—"}
- Order number (after payment): ${orderState.orderNumber ?? "—"}
- Cart:
${cartSummary}

Stores (use set_store with store id):
${storeList}

Menu items (use add_item with menu_item_id):
${menuList}

Add-ons (use add_item or update_line with addon ids; sauces max ${SAUCE_MAX_PER_ITEM} per entree):
${addonList}

Cooking preferences for burgers: rare, medium-rare, medium, medium-well, well-done.

Flow to follow:
1. Greet and offer pickup or delivery. If user says they want to order, ask for location (use location to find closest stores) or ZIP/city if they decline.
2. Show nearby stores (list them), ask which location.
3. After store is chosen, ask pickup or delivery, then "What would you like to order?"
4. When they name an item (e.g. Classic Flame Burger), add it with add_item, then offer customizations: add-ons (list categories and prices), then cooking preference. Confirm each change (e.g. "Done—adding bacon (+$1.50) and extra cheese (+$1.00). How would you like it cooked?").
5. If they change quantity ("make it two burgers"), use update_quantity. If they specify per-item ("one of them no tomato", "second burger well done"), use update_line_customization.
6. Offer "Want any sides or drinks?" — add sides/drinks with add_item.
7. When they seem done, show the cart with show_cart and ask "Everything look right?" / "Anything else before we proceed to payment?"
8. When they confirm, say "Great. Place order?" then after "Yes" open checkout: "Perfect—opening secure checkout now. You'll confirm payment details and final total securely." Tell them to reply "Checkout complete." when done.
9. When they say "Checkout complete.", call place_order with a fake order number (e.g. FNC-510284) and confirm: "Payment confirmed—your order is placed!" and give order number, pickup location, ETA, and item summary.

Always confirm actions in a short, friendly way. Use the tools whenever you add/change the order so the cart stays in sync.`;
}

function getOpenAIClient(): OpenAI {
  const key =
    process.env.XAI_API_KEY ??
    process.env.xai_api_key;
  if (!key) throw new Error("XAI_API_KEY is not configured");
  return new OpenAI({ apiKey: key, baseURL: "https://api.x.ai/v1" });
}

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "set_store",
      description: "Set the chosen store (e.g. after user says River North or gives ZIP and you resolve to a store).",
      parameters: {
        type: "object",
        properties: {
          store_id: { type: "string", enum: ["river-north", "streeterville", "west-loop"] },
        },
        required: ["store_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_mode",
      description: "Set pickup or delivery.",
      parameters: {
        type: "object",
        properties: {
          mode: { type: "string", enum: ["pickup", "delivery"] },
        },
        required: ["mode"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_item",
      description:
        "Add a menu item to the cart. For burgers, can include addon_ids (from add-ons list), cooking_preference, and no_tomato. For sides/drinks only menu_item_id and quantity.",
      parameters: {
        type: "object",
        properties: {
          menu_item_id: { type: "string", description: "e.g. classic-flame-burger, fries, coke" },
          quantity: { type: "number", default: 1 },
          addon_ids: { type: "array", items: { type: "string" }, description: "Add-on ids" },
          cooking_preference: { type: "string", enum: ["rare", "medium-rare", "medium", "medium-well", "well-done"] },
          no_tomato: { type: "boolean" },
        },
        required: ["menu_item_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_quantity",
      description: "Change quantity of a cart line. line_index is 0-based from the cart list.",
      parameters: {
        type: "object",
        properties: {
          line_index: { type: "number" },
          quantity: { type: "number" },
        },
        required: ["line_index", "quantity"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_line_customization",
      description:
        "Update one line's customization: e.g. 'Burger #2 well done' or 'Burger #1 no tomato'. line_index is 0-based.",
      parameters: {
        type: "object",
        properties: {
          line_index: { type: "number" },
          cooking_preference: { type: "string", enum: ["rare", "medium-rare", "medium", "medium-well", "well-done"] },
          no_tomato: { type: "boolean" },
          no_lettuce: { type: "boolean" },
        },
        required: ["line_index"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_cart",
      description: "Call when you are about to show the user their cart / order summary. No parameters.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "place_order",
      description: "Call when user has completed checkout. Sets order number and marks order placed.",
      parameters: {
        type: "object",
        properties: {
          order_number: { type: "string", description: "e.g. FNC-510284" },
        },
        required: ["order_number"],
      },
    },
  },
];

function applyToolCall(
  name: string,
  args: Record<string, unknown>,
  state: OrderState
): OrderState {
  const next = { ...state, cart: [...state.cart] };

  if (name === "set_store") {
    const storeId = args.store_id as StoreId;
    const store = getStore(storeId);
    if (store) {
      next.storeId = storeId;
      next.readyEta = store.pickupEta;
    }
    return next;
  }

  if (name === "set_mode") {
    next.mode = args.mode as "pickup" | "delivery";
    return next;
  }

  if (name === "add_item") {
    const menuItemId = args.menu_item_id as string;
    const item = getMenuItem(menuItemId);
    if (!item) return next;
    const quantity = (args.quantity as number) ?? 1;
    const addonIds = (args.addon_ids as string[]) ?? [];
    const addOns = addonIds
      .map((id) => ADDONS.find((a) => a.id === id))
      .filter(Boolean)
      .map((a) => ({ name: a!.name, price: a!.price }));
    const line: CartLineItem = {
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity,
      addOns,
      customization:
        item.category === "entree"
          ? {
              addOnIds: addonIds,
              cookingPreference: args.cooking_preference as string | undefined,
              noTomato: args.no_tomato as boolean | undefined,
            }
          : undefined,
    };
    next.cart.push(line);
    return next;
  }

  if (name === "update_quantity") {
    const idx = args.line_index as number;
    const q = args.quantity as number;
    if (idx >= 0 && idx < next.cart.length && q >= 1) {
      next.cart[idx] = { ...next.cart[idx], quantity: q };
    }
    return next;
  }

  if (name === "update_line_customization") {
    const idx = args.line_index as number;
    if (idx < 0 || idx >= next.cart.length) return next;
    const line = next.cart[idx];
    const cust = line.customization ? { ...line.customization } : { addOnIds: [] };
    if (args.cooking_preference != null) cust.cookingPreference = args.cooking_preference as string;
    if (args.no_tomato != null) cust.noTomato = args.no_tomato as boolean;
    if (args.no_lettuce != null) cust.noLettuce = args.no_lettuce as boolean;
    next.cart[idx] = { ...line, customization: cust };
    return next;
  }

  if (name === "show_cart") {
    return next;
  }

  if (name === "place_order") {
    next.orderNumber = args.order_number as string;
    return next;
  }

  return next;
}

export interface ChatRequestBody {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  orderState: OrderState;
}

export async function POST(req: Request) {
  const key =
    process.env.XAI_API_KEY ??
    process.env.xai_api_key;
  if (!key) {
    return Response.json(
      {
        error:
          "XAI_API_KEY is not set. In Vercel: Project Settings → Environment Variables → add XAI_API_KEY for Production, then redeploy.",
      },
      { status: 500 }
    );
  }
  const openai = getOpenAIClient();

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, orderState: initialOrderState } = body;
  const systemPrompt = buildSystemPrompt(initialOrderState);

  const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  let orderState = initialOrderState;
  let lastContent = "";

  try {
    let response = await openai.chat.completions.create({
      model: GROK_MODEL,
      messages: apiMessages,
      tools,
      tool_choice: "auto",
    });

    const choice = response.choices?.[0];
    if (!choice?.message) {
      return Response.json(
        { error: "No message in response", orderState },
        { status: 502 }
      );
    }

    const msg = choice.message;
    lastContent = (msg.content as string) ?? "";

    // Handle tool calls (one round)
    if (msg.tool_calls?.length) {
      const toolResults: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "assistant", content: msg.content || null, tool_calls: msg.tool_calls },
      ];
      for (const tc of msg.tool_calls) {
        const name = tc.function?.name ?? "";
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.function?.arguments ?? "{}") as Record<string, unknown>;
        } catch {}
        orderState = applyToolCall(name, args, orderState);
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id!,
          content: JSON.stringify({ success: true, updated: true }),
        });
      }
      // Get final text reply after tool use
      const followUp = await openai.chat.completions.create({
        model: GROK_MODEL,
        messages: [
          ...apiMessages,
          ...toolResults,
        ],
        tools,
        tool_choice: "none",
      });
      const followMsg = followUp.choices?.[0]?.message;
      lastContent = (followMsg?.content as string) ?? lastContent;
    }

    return Response.json({
      message: lastContent,
      orderState,
    });
  } catch (err) {
    console.error("Grok API error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Chat request failed", orderState: initialOrderState },
      { status: 502 }
    );
  }
}
