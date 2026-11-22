# Project memory

## Product intent & audience

- TarımFinans (tarimfinans.com): Turkish agricultural finance & commodity terminal under the Kladogram Teknoloji ve Danışmanlık ecosystem.
- Audience: Turkish farmers, agri-business operators, commodity analysts tracking input costs, subsidies (ÇKS), and market prices.
- Core features: input cost & timing simulator, ÇKS subsidy credit engine, cash-flow/working-capital tools, live TZOB/commodity tickers, Foodecon news & analysis, multi-platform access (web, desktop via Tauri, mobile).
- Landing page (`/`) serves as marketing + portal hub; actual terminal app remains at `/dashboard`.

## Brand personality & voice

- Turkish-language UI throughout.
- Professional, data-dense financial-terminal tone with agricultural context.
- High-contrast presentation of financial numbers and market data.
- Copyright: "tarimfinans.com - © 2026 Kladogram Teknoloji ve Danışmanlık".

## Visual design & UX direction

- Dark financial-terminal aesthetic with agricultural tones.
- Palette: slate-900 background, emerald highlights `#10b981`, warm amber/gold accents `#f59e0b`, deep forest greens.
- Clean sans-serif typography; high contrast for numeric/data cards.
- Responsive single-page landing with hover effects and production polish.
- Layout sections: sticky navbar (logo left, center nav, emerald-glow CTA right), hero (headline + 3 feature cards left, terminal dashboard mockup right), scrolling commodity ticker bar, Foodecon news cards (3), platform access cards (web/desktop/mobile) with download CTA, footer with quick links + social icons.
- Lucide icons used for logo and section iconography.

## Decisions, constraints & rationale

- Landing page and terminal are separate routes: `/` for marketing, `/dashboard` for the existing app — preserves terminal functionality.
- Component-based build: shared content data and common components created first, then section components assembled into the page.
- Type-check and production build validated successfully; visual QA on mobile widths and animations left to user.
- Placeholder links (`#`) used for download buttons and social icons pending real URLs.
- Ticker values and dashboard mockup numbers are sample/mock data — not wired to live data sources.
- News article titles are placeholder sample headlines pending real Foodecon content.

## Open questions & assumptions

- Real download URLs for desktop (Tauri Windows/Mac) and mobile apps not yet provided.
- Social media account links not yet provided.
- Live data integration for TZOB commodity prices and mazot averages is out of scope for landing page; assumed static/mock for now.
- Real Foodecon article content and URLs needed to replace placeholders.
- Assumption: dashboard at `/dashboard` is pre-existing and untouched by landing work.