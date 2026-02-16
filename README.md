# Flame & Crumb — Conversational ordering

Conversational UI for ordering from Flame & Crumb (pickup or delivery), powered by **Grok AI** (xAI). Flow: greet → location/store → pickup or delivery → add items → customize (add-ons, cooking) → sides/drinks → cart summary → place order → checkout → confirmation.

## Stack

- **Next.js 14** (App Router)
- **Grok** via xAI API (OpenAI-compatible)
- **Tailwind CSS**

## Setup

1. **Install and run locally**

   ```bash
   npm install
   cp .env.example .env.local
   ```

2. **Set your xAI API key** in `.env.local`:

   ```bash
   XAI_API_KEY=your_key_here
   ```

   Get a key at [console.x.ai](https://console.x.ai). **Do not commit this key.**

3. **Run dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub (or connect your repo in Vercel).
2. In [Vercel](https://vercel.com): **New Project** → import this repo.
3. **Environment variables**: add `XAI_API_KEY` with your xAI key (same as above). Use **Production** (and optionally Preview if you want).
4. Deploy. Vercel will run `npm run build` and deploy the app.

No extra config is required; Next.js is detected automatically. When you're ready to log in to Vercel, you can do so and we can wire the project if needed.

## Flow (from your diagrams)

- User says they want to order → assistant offers pickup/delivery and location (or ZIP).
- Store selection → pickup/delivery → "What would you like?"
- Add items (e.g. Classic Flame Burger) → offer add-ons and cooking preference → confirm.
- Quantity changes ("make it two burgers") and per-item notes ("one no tomato", "second well done").
- "Want any sides or drinks?" → add fries, Coke, etc.
- Cart summary → "Everything look right?" → "Place order?" → open checkout (simulated); user says "Checkout complete" → confirm with order number and ETA.
