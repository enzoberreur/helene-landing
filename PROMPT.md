# Helene Landing Page — Claude Code Prompt

Build a responsive React landing page for **Helene**, a (peri)menopause companion app for women. The project should be deployable on Vercel.

## Setup
- Use **Vite + React** (TypeScript)
- Use **Tailwind CSS v4** for styling
- Font: **Outfit** from Google Fonts
- Brand color: `#E83E73` (pink)
- Deploy target: **Vercel** (include `vercel.json` if needed)

## Assets
All assets are in this folder:
- `helene-landing-page.png` — **reference design to match as closely as possible**
- `app-dashboard.png` — app screenshot (dashboard/check-in screen)
- `app-chat.png` — app screenshot (AI chat screen)
- `app-community.png` — app screenshot (community feed)
- `logo.svg` — Helene logo (pink flower/circles pattern)

Copy these images into `public/images/` in the project.

## Sections (top to bottom)

### 1. Navbar
- Left: Logo + "HELENE" text
- Right: nav links (Features, Community, About) + "Join Waitlist" pink CTA button (`#E83E73`, white text, rounded pill)
- Sticky on scroll with white background + subtle shadow

### 2. Hero Section
- **Left side:**
  - Pink badge: "Now in early access"
  - Headline: `Navigate (peri)menopause with confidence` — "(peri)menopause" in pink (`#E83E73`)
  - Description: "Track your symptoms, get personalized insights, and connect with a community that understands. Helene is your daily companion through every stage."
  - Email input + "Join Waitlist" pink button (pill shape, side by side)
  - Social proof: avatar stack (4 circles) + "2,400+ women already on the waitlist"
- **Right side:**
  - Two phone mockups using `app-dashboard.png` (behind, rotated -4deg) and `app-chat.png` (front, rotated +3deg)
  - Rounded corners (border-radius ~28px), subtle drop shadows
- White background with very subtle pink radial gradient blobs

### 3. Features Section
- Background: `#FAFAFA`
- Pink label: "WHY HELENE"
- Title: "Built for your body, your way"
- Subtitle: "Every woman's experience is different. Helene adapts to yours with smart tracking and compassionate AI support."
- 3 cards in a grid:
  1. **Symptom Tracking** (pink icon bg) — "Log sleep, energy, mood, hot flashes, and more. See patterns and understand your body better over time."
  2. **AI Companion** (green icon bg `#E8F5EE`) — "Chat with Helene anytime. Get personalized insights, gentle check-ins, and evidence-based guidance."
  3. **Community** (purple icon bg `#F0EEFF`) — "Connect with women who get it. Share experiences, find support, and feel less alone in your journey."
- Cards: white background, rounded corners (20px), subtle shadow

### 4. Community Showcase
- **Left:** phone mockup with `app-community.png` (rounded corners, shadow)
- **Right:**
  - Pink label: "YOU'RE NOT ALONE"
  - Title: "A community that understands"
  - Description: "Share your story, ask questions, and discover that what you're going through is more common than you think."
  - 3 feature rows with pink icon boxes:
    1. **Real conversations** — "Honest posts about sleep, brain fog, anxiety, and everything in between."
    2. **Tips that work** — "Discover what's helping other women manage symptoms day to day."
    3. **Safe space** — "A moderated, supportive environment where every experience is valid."

### 5. CTA Block
- Dark rounded card (`#1A1A1A` to `#2A2A2A` gradient, border-radius 24px)
- Centered layout with subtle pink radial gradient blobs in background
- Title: "Join the waitlist today" (white)
- Subtitle: "Be among the first to experience Helene. Early access is opening soon." (white, 60% opacity)
- Email input + "Join Waitlist" button (same style as hero but dark theme)
- Card has horizontal margin (not full width)

### 6. Footer
- Left: Logo + "HELENE"
- Right: "© 2026 Helene. All rights reserved."
- Top border: 1px solid `#F0F0F0`

## Responsive Behavior
- Desktop-first, but mobile-friendly
- Hero: stack vertically on mobile (text above phones)
- Features grid: single column on mobile
- Community showcase: stack vertically on mobile
- Nav: collapse to hamburger on mobile

## Project Structure
```
helene-landing/
├── public/
│   └── images/
│       ├── app-dashboard.png
│       ├── app-chat.png
│       ├── app-community.png
│       └── logo.svg
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Community.tsx
│   │   ├── CTA.tsx
│   │   └── Footer.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── vercel.json
```

## Deployment
- Configure for Vercel deployment (framework preset: Vite)
- Add `vercel.json` with rewrites for SPA routing
- Make sure `npm run build` produces a working `dist/` folder
