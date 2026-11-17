# CSVS — Chattada Sri Vaishnava Sangham

Production Next.js 15 (App Router) website for the Chattada Sri Vaishnava Sangham community.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| Fonts | Google Fonts via `next/font/google` (Poppins + Lora) |
| Language | TypeScript (strict) |
| Images | `next/image` with Unsplash remote patterns |

## Getting Started

```bash
cd csvs-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
csvs-app/
├── app/
│   ├── globals.css          # Tailwind directives + global styles
│   ├── layout.tsx           # Root layout with SEO metadata, fonts, Header/Footer
│   ├── page.tsx             # Home page (/) — composes all sections
│   ├── events/
│   │   └── page.tsx         # Events page (/events) — filterable grid of community events
│   ├── members/
│   │   └── page.tsx         # Members directory (/members) — stats, search, member directory
│   ├── matrimony/
│   │   └── page.tsx         # Matrimony portal (/matrimony) — quick search, verified profiles, steps
│   ├── gallery/
│   │   └── page.tsx         # Gallery (/gallery) — masonry photo wall with zoom overlay
│   └── articles/
│       └── page.tsx         # Articles (/articles) — featured story, article feed & sidebar
├── components/
│   ├── Header.tsx           # Sticky nav with route detection & mobile menu (client)
│   ├── Footer.tsx           # 4-column footer with live links & social icons
│   ├── HeroSection.tsx      # Full-bleed hero with gradient overlay
│   ├── ArticlesEvents.tsx   # Side-by-side cards for articles and events
│   ├── GallerySection.tsx   # Masonry-style gallery teaser
│   ├── GalleryFilter.tsx    # Category filter pills for gallery (client)
│   ├── MatrimonySection.tsx # Matrimony promo with floating badge
│   ├── MatrimonySearch.tsx  # Quick profile search widget (client)
│   ├── MembersSection.tsx   # Tabbed community members filter (client)
│   ├── MembersSearch.tsx    # Search input and district/gender dropdowns (client)
│   └── EventsFilter.tsx     # Category filter buttons for events (client)
├── public/
│   └── favicon.svg          # Lotus SVG favicon (crimson + gold)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## SEO

- Full `<title>` template via `metadata.title.template`
- `<meta name="description">` and `keywords`
- Open Graph (`og:title`, `og:description`, `og:type`, `og:locale`, `og:site_name`)
- Twitter Card (`summary_large_image`)
- SVG favicon (lotus icon, served from `/public/favicon.svg`)

## Deployment

```bash
npm run build
npm run start
```

Or deploy to [Vercel](https://vercel.com) — zero-config with Next.js.
