# DemiCommerce

Modular e-commerce platform built on **Payload CMS 3** + **Next.js 15** + **PostgreSQL**.

Pick only the modules you need and compose them into a fully functional store. One platform — many shops.

## Architecture

```
demicommerce/
├── apps/
│   ├── _template/          Bare-bones starter for new shops (scaffold via scripts/scaffold-shop.sh)
│   ├── decor-shop/         Production instance: seasonal decor for UK market
│   └── yarn-origami/       Production instance: handmade yarn art (PL market)
├── packages/
│   ├── core/               Module system, assembler (assembleShop), multi-tenant primitives
│   ├── types/              Shared TypeScript interfaces
│   ├── ui/                 Design system components
│   ├── search/             Cross-collection search helpers
│   ├── seo/                JSON-LD, sitemap, robots, Open Graph helpers
│   └── config/             ESLint, TypeScript, Tailwind base configs
└── modules/
    ├── media/              File uploads & image processing
    ├── users/              Auth & configurable roles
    ├── products/           Products & categories (Omnibus, dimensions, price history)
    ├── orders/             Orders with decomposed event hooks
    ├── cart/               Client-side cart (localStorage, useCart hook)
    ├── checkout/           Checkout flow orchestration
    ├── payments/           Provider abstraction (Stripe, PayPal, HotPay)
    ├── shop-settings/      Store configuration global
    ├── cms/                Static pages with SEO + contact submissions
    ├── analytics/          Revenue dashboard widgets
    ├── blog/               Posts, categories, tags, authors
    ├── faq/                FAQ categories & items
    ├── chat/               Live chat with admin panel
    ├── seasons/            Seasonal product collections (date-bound)
    ├── themes/             CSS-vars themes + decorative effects
    ├── wishlist/           Wishlist (localStorage, useWishlist hook)
    ├── reviews/            Product reviews & ratings (moderation, verified purchase)
    ├── loyalty/            Points & tier program (earn on purchase, redeem helpers)
    ├── subscriptions/      Recurring billing (plans + subscriptions, Stripe-synced via webhooks)
    ├── b2b/                Customer groups, price tiers, VAT/VIES validation, tax exempts
    ├── receipts/           Auto-generated receipt/invoice PDFs (paragony, faktury)
    └── portfolio/          Portfolio works & categories
```

### Module composition

Modules are composed via `assembleShop({ modules: [...] })` in each app's `src/payload.config.ts`. The assembler resolves declared dependencies, merges collection/global field extensions, and produces a single Payload plugin.

Each module is self-contained with its own collections, globals, hooks, and types. Modules can extend collections/globals registered by their dependencies (e.g. `seasonsModule` adds a `seasons` relationship array to `products`).

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10
- **PostgreSQL** running locally or remotely

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/CyberDemigods/DemiCommerce.git
cd DemiCommerce
pnpm install
```

### 2. Scaffold a new shop

```bash
bash scripts/scaffold-shop.sh acme-store "Acme Store" 3011
```

Arguments: `<slug>` (kebab-case), `"<Display Name>"`, `[port]` (default 3010). The script copies `apps/_template`, replaces placeholders, and prints next steps.

### 3. Configure environment

```bash
cp apps/acme-store/.env.example apps/acme-store/.env
```

Edit `apps/acme-store/.env`:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Yes | Random string for Payload session encryption |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of the application |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | If using Stripe | Stripe API + webhook signing |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_ENV` | If using PayPal | PayPal Orders API |
| `HOTPAY_SECRET` / `HOTPAY_NOTIFICATION_PASSWORD` | If using HotPay (PL) | HotPay legacy provider |

Generate a secure `PAYLOAD_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Create the database

```bash
createdb acme-store
```

Payload auto-migrates and creates tables on first startup.

### 5. Start development

```bash
pnpm --filter @acme-store/web dev
```

Open [http://localhost:3011/admin](http://localhost:3011/admin) to create the first admin user.

## Module composition example

```typescript
import { buildConfig } from 'payload'
import { assembleShop } from '@demicommerce/core'

import { mediaModule } from '@demicommerce/module-media'
import { usersModule } from '@demicommerce/module-users'
import { productsModule } from '@demicommerce/module-products'
import { shopSettingsModule } from '@demicommerce/module-shop-settings'
import { ordersModule } from '@demicommerce/module-orders'
import { cartModule } from '@demicommerce/module-cart'
import { checkoutModule } from '@demicommerce/module-checkout'
import { paymentsModule } from '@demicommerce/module-payments'
import { stripeProvider } from '@demicommerce/module-payments/stripe'
import { cmsModule } from '@demicommerce/module-cms'
import { blogModule } from '@demicommerce/module-blog'
import { themesModule } from '@demicommerce/module-themes'
import { seasonsModule } from '@demicommerce/module-seasons'
import { wishlistModule } from '@demicommerce/module-wishlist'

export default buildConfig({
  plugins: [
    assembleShop({
      modules: [
        // Core
        mediaModule(),
        usersModule(),
        productsModule({ enablePriceHistory: true }),
        shopSettingsModule({ defaultCurrency: 'GBP' }),

        // Commerce
        ordersModule(),
        cartModule(),
        checkoutModule(),
        paymentsModule({
          providers: [
            stripeProvider({
              secretKey: process.env.STRIPE_SECRET_KEY ?? '',
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
            }),
          ],
        }),

        // Content
        cmsModule(),
        blogModule(),

        // Personalization
        themesModule(),
        seasonsModule(),
        wishlistModule(),
      ],
    }),
  ],
  // ...rest of Payload config
})
```

### Module dependencies

Some modules require others (declared via `dependencies` in each module's `createModule({...})` call). Examples:

- `seasonsModule` requires `products` + `themes`
- `blogModule` requires `media`
- `wishlistModule` requires `products`
- `reviewsModule` requires `products` + `users` + `orders`
- `loyaltyModule` requires `users` + `orders`
- `subscriptionsModule` requires `users` (Stripe SDK is opt-in via dependency injection — module works without it for manual/admin-managed subscriptions)
- `b2bModule` requires `users` (extends Users with a Company tab + customerGroup; ships pure pricing helpers + VIES validator)
- `receiptsModule` requires `orders` + `media` (uploads generated PDFs to media collection; PDF rendering uses `pdfkit` + DejaVuSans for Polish diacritics)

### Subscriptions: wiring Stripe in your app

The `subscriptions` module ships pure data + sync helpers; the Stripe SDK
is intentionally **not** a runtime dependency. To enable Stripe-backed billing:

```ts
// app/api/webhooks/stripe-subscriptions/route.ts
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { syncFromStripeEvent } from '@demicommerce/module-subscriptions/stripe'
import { getPayloadClient } from '@/lib/payload'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const sig = (await headers()).get('stripe-signature')!
  const body = await req.text()
  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_SUBSCRIPTIONS_WEBHOOK_SECRET!,
  )
  const payload = await getPayloadClient()
  await syncFromStripeEvent(payload, event as never)
  return new Response(null, { status: 200 })
}
```

For checkout, inject the same `stripe` client into `createCheckoutSession`:

```ts
import { createCheckoutSession } from '@demicommerce/module-subscriptions/stripe'

const { url } = await createCheckoutSession(stripe, payload, {
  plan: 'pro-monthly',
  userId: session.user.id,
  userEmail: session.user.email,
  successUrl: `${origin}/account/subscriptions?success=1`,
  cancelUrl: `${origin}/pricing`,
})
return Response.redirect(url)
```

The assembler validates dependencies at boot.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm typecheck` | Run TypeScript type checking across the monorepo |
| `pnpm lint` | Run ESLint across the monorepo |
| `pnpm clean` | Remove all build artifacts and node_modules |
| `bash scripts/scaffold-shop.sh <slug> "<Name>" [port]` | Scaffold a new shop instance |

## Tech stack

- **Runtime**: Node.js 20+
- **Framework**: Next.js 15 (App Router)
- **CMS**: Payload CMS 3
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **Rich Text**: Lexical editor via `@payloadcms/richtext-lexical`
- **Styling**: Tailwind CSS 3.4
- **Monorepo**: pnpm workspaces + Turborepo
- **Language**: TypeScript 5.7+ (strict mode)

## License

Private
