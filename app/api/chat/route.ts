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

const GROK_MODEL = "grok-4-1-fast-reasoning";

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

Critical: Your reply must contain ONLY your own message. Never write "Human:", "User:", or any line that looks like the user's reply (e.g. "Human: River North"). Do not predict or simulate the user's next message. After you list locations, stop and wait for them to type which location they want.

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

Critical: Ask only one question per response. Do not ask multiple questions in the same message (e.g. do not ask "How would you like it cooked?" and "Want any sides or drinks?" together). Ask one thing, wait for the user's reply, then ask the next (e.g. after adding an item, ask about cooking first; after they answer, then ask about sides/drinks).

Flow to follow:
1. Greet and offer pickup or delivery. If user says they want to order, ask for location (use location to find closest stores) or ZIP/city if they decline.
2. When the user says "pickup" or "delivery": (a) call set_mode with that value, (b) call show_store_locations (the app will show the map). (c) In your reply text you must write: a short acknowledgment ("Got it, delivery!" or "Got it, pickup!"), then the full list of locations in text form, e.g. "Here are our locations: • River North — 0.9 mi, open until 12:00 AM, pickup ETA 15-25 min • Streeterville — 1.4 mi, open until 11:00 PM, pickup ETA 20-30 min • West Loop — 2.6 mi, open until 11:00 PM, pickup ETA 25-40 min. Which location would you like, or share your ZIP?" Then stop. Never write "Human:", "User:", or a store name as if the user already replied—the user has only said pickup or delivery; they will choose a location in their next message.
3. After store is chosen (user says e.g. "River North"), call set_store, then ask what they'd like to order. In that first ask, include a short line that they can tell you what they're into (e.g. loves meat, chicken, spicy, plain) or any dietary needs (gluten-free, no dairy, vegan, vegetarian, no red meat) and you'll suggest options that fit. Do not say you will "build" or "put together" or "create" a meal for them—just that you can suggest options. Keep it warm and concise; don't list every option.
4. When they name an item (e.g. Classic Flame Burger), add it with add_item, then in this message ask only one thing: either offer customizations (add-ons) OR ask cooking preference, not both. In the next turn ask the other (e.g. first "How would you like it cooked?" then next message "Want any add-ons like bacon, extra cheese, or sauces? Or sides and drinks?"). Confirm each change in a short reply with a single question.
5. If they change quantity ("make it two burgers"), use update_quantity. If they specify per-item ("one of them no tomato", "second burger well done"), use update_line_customization.
6. Offer "Want any sides or drinks?" — add sides/drinks with add_item.
7. When the user asks to see the menu or what's available, call show_menu so the UI displays menu cards grouped by category (Hamburgers, Wings, Chicken, Pizza, Sides, Drinks, Desserts, Combos). When they ask about a specific item, call show_menu_item with that item's id so the UI shows that product card.
8. Recommendations: When the user asks for suggestions or shares preferences/dietary, recommend matching items and call show_menu_item so their product cards appear. In your reply, always state what you're recommending and why (e.g. "For a spicy vegetarian, our Veggie Burger is perfect—chipotle aioli gives it a nice kick. Want to add it?"). If you just called show_menu_item for one or more items, your very next message must briefly explain why each option fits their request (e.g. "spicy and no dairy" → name each item and say how it fits: spicy, dairy-free, or "ask for no cheese"). Never reply with only a generic "Got it, what would you like?" or "Here are some options—take a look" without that explanation. Spicy under $10: spicy-flame-burger ($9.49), spicy-combo ($9.99), hot-wings ($6.99). Combos and sodas as listed in the menu.
9. When they seem done, show the cart with show_cart and ask "Everything look right?" / "Anything else before we proceed to payment?"
10. When they confirm, say "Great. Place order?" then after "Yes" open checkout: "Perfect—opening secure checkout now. You'll confirm payment details and final total securely." Tell them to reply "Checkout complete." when done.
11. When they say "Checkout complete.", call place_order with a fake order number (e.g. FNC-510284) and confirm: "Payment confirmed—your order is placed!" and give order number, pickup location, ETA, and item summary.

When users share preferences (e.g. "I love spicy", "plain please", "something with chicken") or dietary needs (gluten-free, no dairy, vegan, vegetarian, no red meat): suggest matching items—e.g. vegan → veggie-burger; no red meat → chicken-sandwich or hot-wings; no dairy → items without cheese, offer vegan cheese add-on where it fits. Use show_menu_item for each suggestion. Critical: when you recommend item(s) in response to preferences or dietary, your reply must NOT be generic. Do not say only "Got it! What would you like to order?" or "Here are some options—take a look" without saying why. Your message must: (1) acknowledge their preferences warmly (e.g. "Spicy with no dairy—got it!"), (2) name what you're suggesting (e.g. "Our Spicy Flame Burger and Veggie Burger both fit"), (3) briefly explain why each fits (e.g. "Spicy Flame is our spicy pick—ask for no cheese to keep it dairy-free; Veggie Burger is dairy-free and the chipotle aioli adds a little kick"), (4) ask if they'd like to add one. The product card will appear below your message; your text must introduce and explain the recommendation so the user knows why those options were chosen.

Query handling (interpret charitably and use only the menu above):
- Misspellings: Treat as intended. "Peperoni" / "cheezcake" / "chick" → map to closest: we don't have pepperoni or cheesecake; suggest spicy-flame-burger or veggie-burger for "something with chicken" (chicken-sandwich). "Burger four vegetarians" → veggie-burger.
- Slang: "Za" / "pie" = pizza → we have cheese-pizza, pepperoni-pizza, margherita-pizza, bbq-chicken-pizza. "Wings" → hot-wings. "Loaded fries" → loaded-fries. "PB shake" / "shake" → we have vanilla-soft-serve and chocolate-soft-serve; also suggest lemonade or iced-tea. "Grub for the kiddos" / "kid-friendly" → suggest chicken-sandwich, chicken-fingers, fries, classic-flame-burger, cheese-pizza (simpler options).
- Unexpected combos / "weird but good": When the user asks for surprising combos (e.g. "what wouldn't you think goes together but is delicious", "fries in a shake"), suggest items that create that contrast and explain why—e.g. fries + vanilla-soft-serve or lemonade (salty + sweet/cold), pizza + root beer, chicken-fingers + honey mustard + lemonade, tater-tots + chocolate-soft-serve, loaded-fries (indulgent). We have desserts: brownie, chocolate-chip-cookie, vanilla-soft-serve, chocolate-soft-serve, apple-pie-slice, churros. In your reply you must explain the combo (e.g. "Fries with something sweet and cold is a classic—our fries with Vanilla Soft Serve or Lemonade give you that salty-sweet contrast."). Never just list item names without saying why they fit.
- Generic: "Something healthy" → veggie-burger, side-salad. "Lots of cheese" → classic-flame-burger with extra-cheese add-on, cheese-pizza, mac-and-cheese, loaded-fries. "Something for a group" → suggest combos, multiple items (spicy-combo, wings, fries, pizza-combo). "Breakfast" → we don't serve breakfast; we have lunch/dinner. "Date night" / "for a date" → suggest shareable (hot-wings, loaded-fries, pizza) or nicer items. "Warm and sweet" / "dessert" → we have brownie, chocolate-chip-cookie, vanilla-soft-serve, chocolate-soft-serve, apple-pie-slice, churros.
- Recommendations: Suggest items that match. "Without onions or mushroom" → suggest items and use no onions/mushroom in customization. "Burger for someone who hates spicy" → classic-flame-burger or veggie-burger. "Not chocolate" / "not spicy" → lemonade, side-salad, classic-flame-burger. "Filling dinner combo with fries" → spicy-combo or classic-flame-burger + fries. Use show_menu_item for each suggestion.
- Build-your-own / creative: Map to what we can build. "Spicy salmon burger" → classic-flame-burger with salmon and jalapeño-style heat (spicy-flame-burger) or add salmon add-on. "Kale salad with chicken" → side-salad plus chicken-sandwich or suggest both. "Vegetarian Greek-style" → veggie-burger. We have pizza (cheese, pepperoni, margherita, bbq-chicken), chicken fingers, and desserts (brownie, cookies, soft serve, apple pie, churros). We don't have custom smoothies or acai; suggest soft-serve, lemonade, or iced-tea.
- Not on menu: Tacos, lobster roll, sushi, acai bowl, pad thai, chicken tikka masala, etc. Reply warmly that we don't have that and suggest 2–3 real options from the menu (e.g. "We don't have tacos—how about our Spicy Flame Burger or Hot Wings?"). Do not add items we don't have.

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
      name: "show_store_locations",
      description: "Call whenever you are listing Flame & Crumb store locations (e.g. after user chooses pickup or delivery, or asks for locations). Displays the store map in the UI. No parameters.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "show_menu",
      description: "Call when the user asks to see the menu or what's available. Displays all menu item cards in the UI. No parameters.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "show_menu_item",
      description: "Call when the user asks about a specific menu item or when recommending items (e.g. for 'spicy combo under $10' call once per recommended item). Displays that item's product card.",
      parameters: {
        type: "object",
        properties: {
          menu_item_id: {
            type: "string",
            description: `Valid menu item id. One of: ${MENU_ITEMS.map((m) => m.id).join(", ")}`,
          },
        },
        required: ["menu_item_id"],
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

  if (name === "show_cart" || name === "show_menu" || name === "show_menu_item" || name === "show_store_locations") {
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

  const { messages, orderState: orderStateFromBody } = body;
  const initialOrderState: OrderState = {
    ...orderStateFromBody,
    cart: (orderStateFromBody.cart ?? []).map((line) => ({
      ...line,
      addOns: [...(line.addOns ?? [])],
      customization: line.customization ? { ...line.customization } : undefined,
    })),
  };
  const systemPrompt = buildSystemPrompt(initialOrderState);

  const apiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  let orderState: OrderState = initialOrderState;
  let lastContent = "";
  const displayItemIdSet = new Set<string>();
  let showStoreMap = false;

  try {
    let response = await openai.chat.completions.create({
      model: GROK_MODEL,
      messages: apiMessages,
      tools,
      tool_choice: "auto",
      max_tokens: 8192,
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
        if (name === "show_store_locations") {
          showStoreMap = true;
        } else if (name === "show_menu") {
          MENU_ITEMS.forEach((i) => displayItemIdSet.add(i.id));
        } else if (name === "show_menu_item" && typeof args.menu_item_id === "string") {
          if (getMenuItem(args.menu_item_id)) displayItemIdSet.add(args.menu_item_id);
        } else {
          orderState = applyToolCall(name, args, orderState);
        }
        const toolPayload =
          name === "show_menu_item"
            ? { success: true, updated: true, reminder: "Your next message must explain why you chose these items for the user's request (e.g. how each item fits what they asked for). Do not reply with only a list of names or a generic line—give a short, specific explanation." }
            : { success: true, updated: true };
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id!,
          content: JSON.stringify(toolPayload),
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
        max_tokens: 8192,
      });
      const followMsg = followUp.choices?.[0]?.message;
      lastContent = (followMsg?.content as string) ?? lastContent;
    }

    const displayItemIds = displayItemIdSet.size > 0 ? Array.from(displayItemIdSet) : undefined;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const lastUserText =
      lastUserMessage && typeof lastUserMessage.content === "string"
        ? String(lastUserMessage.content).slice(0, 80).trim()
        : "";
    const defaultLocationList =
      "Here are the Flame & Crumb locations closest to you:\n\n" +
      STORES.map(
        (s) => `• ${s.name} — ${s.distance}, open until ${s.openUntil}, pickup ETA ${s.pickupEta}`
      ).join("\n") +
      "\n\nWhich one would you like?";
    const message = (() => {
      if (showStoreMap) return defaultLocationList;
      let s = lastContent
        .split("\n")
        .filter((line) => !/^\s*(Human|User):/i.test(line.trim()))
        .join("\n")
        .trim();
      s = s.replace(/\s*(Human|User):\s*[^\n]*/gi, "").trim();
      // Strip Grok tool-result tags so the user never sees e.g. <grok:richcontent type="tool_result">...</grok:richcontent>
      s = s.replace(/<grok:[\w-]+(?:\s[^>]*)?>[\s\S]*?<\/grok:[\w-]+>/gi, "").trim();
      s = s.replace(/\n{2,}/g, "\n\n").trim();
      if (!s || /^\s*(Human|User):/i.test(s)) {
        if (displayItemIds?.length) {
          const names = displayItemIds
            .map((id) => getMenuItem(id)?.name)
            .filter(Boolean) as string[];
          const list = names.length ? names.join(", ") : "the options above";
          const intro = lastUserText
            ? `You asked about ${lastUserText}${lastUserText.length >= 80 ? "…" : ""}—here are options we picked: ${list}. `
            : `Here are some options that match what you asked for: ${list}. `;
          return `${intro}Take a look above and tell me what you'd like!`;
        }
        return "Got it! What would you like to order?";
      }
      return s;
    })();
    return Response.json({
      message,
      orderState,
      ...(displayItemIds ? { displayItemIds } : {}),
      ...(showStoreMap ? { showStoreMap: true } : {}),
    });
  } catch (err) {
    console.error("Grok API error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Chat request failed", orderState: initialOrderState },
      { status: 502 }
    );
  }
}
