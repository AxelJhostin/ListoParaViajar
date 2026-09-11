---
name: Canada Explorer Heritage
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#5c403f'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#906f6e'
  outline-variant: '#e5bdbb'
  surface-tint: '#bf0229'
  primary: '#9e001f'
  on-primary: '#ffffff'
  primary-container: '#c8102e'
  on-primary-container: '#ffdad8'
  inverse-primary: '#ffb3b1'
  secondary: '#3f6653'
  on-secondary: '#ffffff'
  secondary-container: '#beead1'
  on-secondary-container: '#436b58'
  tertiary: '#3e4c6e'
  on-tertiary: '#ffffff'
  tertiary-container: '#566487'
  on-tertiary-container: '#d9e2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#c1ecd4'
  secondary-fixed-dim: '#a5d0b9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#274e3d'
  tertiary-fixed: '#d9e2ff'
  tertiary-fixed-dim: '#b7c6ee'
  on-tertiary-fixed: '#0a1a3a'
  on-tertiary-fixed-variant: '#384668'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system crafts an emotionally grounded, reassuring, and exhilarating travel companion for an Ecuadorian family embarking on their maiden international journey to Toronto, Canada. The personality balances the warmth and closeness of Latin American family life with the structured clarity, crispness, and legendary hospitality of Canadian transit and national park wayfinding.

The design movement merges **Modern Tactile Road-Trip Wayfinding** with **Warm Editorial Minimalism**:
- **Reassurance First:** First-time international flyers encounter unfamiliar logistics (customs, bilingual signage, currency exchange, public transit like TTC and UP Express). The visual language feels dependable, sturdy, and calm, eliminating anxiety through clear signposting and deliberate state indicators.
- **Adventurous & Invigorating:** Maple-leaf vibrant reds alongside deep pine greens evoke scenic discovery, pristine lakes, and the bustling multicultural vibrancy of Toronto.
- **Warm Domesticity:** Rather than sterile tech minimalism, creamy paper backgrounds evoke passport notebooks, travel guides, and scrapbook memories in the making.
- **Accessible Touch Ergonomics:** Designed specifically for mobile PWA execution with generous one-handed thumb navigation, prominent touch targets, and high legibility under varying light (bright outdoor snow reflections, dim airplane cabins).

## Colors

The palette draws inspiration from Canadian iconography, northern pine canopies, and warm tactile stationery:

- **Maple Red (Primary - `#C8102E`):** Used for focal action points, critical CTAs, badges of active travel steps, and signature icons. A darker shade (`#8B1E1E`) serves as the hover/active state and high-contrast structural anchor to ensure WCAG AAA accessibility for text labels.
- **Pine Forest Green (Secondary - `#1B4332`):** Delivers positive reinforcement for completed checklists, confirmed flight legs, and validated entry documents (e.g., eTA/visas). Paired with soft mint tint (`#E8F5E9`) for container fills.
- **Deep Maritime Navy (Tertiary - `#1B2A4A`):** The steadfast backbone for all primary headings, bottom navigation bars, and top app headers, instilling institutional trust and high contrast.
- **Warm Cream Canvas (Neutral Surface - `#FDFBF7`):** Replaces harsh cool whites with a warm, welcoming surface tone that reduces eye strain during long flights and night-time planning. Secondary containers use `#F4EFE6`.
- **Amber Warning (`#D97706` / `#FEF3C7`):** Reserved for contextual heads-up notices, upcoming boarding gates, pending packing tasks, and timezone shift alerts.
- **Neutral Stone Dividers (`#E2E8F0` / `#CBD5E1`):** Precise, subtle outlines preventing visual clutter while structuring itinerary timelines.

## Typography

The design system standardizes on **Plus Jakarta Sans** across all text tiers. Its friendly rounded geometry, open counters, and sturdy x-height maintain extreme legibility on mobile screens under motion (walking through airports or riding the subway).

- **Headings:** Bold and confident, echoing modern Canadian municipal signage with a warm humanistic spirit. Tight negative tracking on display sizes enhances structural punch.
- **Body:** Open line heights ensure effortless reading for multi-generational family members, including parents and older relatives adjusting to dual-language content (Spanish UI with English place names).
- **Labels & Badges:** Microcopy uses uppercase or semi-bold variants with positive letter-spacing (`0.02em` - `0.04em`) to make operational travel signals ("TERMINAL 1", "LISTO", "EN CURSO") instantly scannable at arm's length.

## Layout & Spacing

Designed fundamentally around a **mobile-first PWA paradigm**:
- **Mobile Containerization:** Standard viewport padding locks to `1rem` (16px) margin, maximizing screen real estate while protecting touch zones from screen bevels and system gestures.
- **Adaptive Breakpoints:**
  - `compact` (Mobile portrait: 320px - 599px): Single-column stack with dynamic bottom navigation bar and sticky action footer.
  - `medium` (Tablet / Foldable: 600px - 1023px): Two-column asymmetric split (left: trip timeline/map, right: day checklist & documents).
  - `expanded` (Desktop PWA: 1024px+): Three-column command view with a centered phone preview guide.
- **Rhythm & Safe Areas:** Strict 4px/8px rhythm. Bottom sheets, toolbars, and floating buttons automatically apply safe-area-inset padding for iOS and Android web shells.

## Elevation & Depth

This system achieves hierarchy through **Tonal Layering combined with Warm Ambient Vignette Shadows**:

- **Ground Plane (0dp):** The foundation is warm cream canvas (`#FDFBF7`).
- **Surface Cards (1dp):** Pure crisp white (`#FFFFFF`) or pale sand (`#F8F6F0`) resting on the background with a soft, natural drop shadow: `0 2px 8px rgba(27, 42, 74, 0.05)`, edged with a `1px` subtle border in `#E2E8F0`.
- **Interactive Elevated Items (2dp - Active itinerary cards, flight boarding passes):** `0 8px 20px rgba(27, 42, 74, 0.08)`, offering clear visual separation for the immediate next travel task.
- **Overlays, Bottom Sheets & Modals (3dp):** `0 16px 36px rgba(27, 42, 74, 0.16)`, backed by a frosted backdrop blur (`backdrop-filter: blur(8px); background-color: rgba(27, 42, 74, 0.4)`).
- **Physical Feedback:** Active button states eliminate elevation and apply a tactile 1px depression (`transform: translateY(1px)`) simulating physical hardware buttons.

## Shapes

The design system establishes a **Category 2 (Rounded)** curvature rhythm. Rounded profiles project safety, friendliness, and modern pocket-app aesthetics:

- **Cards & Primary Modules:** Employ `rounded-2xl` (1.25rem - 1.5rem / 20px - 24px) for a soft, friendly look reminiscent of rounded luggage tags, passport stamps, and transit cards.
- **Buttons, Inputs & Interactive Anchors:** Feature `rounded-xl` (0.75rem / 12px) to communicate easy fingertip engagement.
- **Badges, Tags & Status Pills:** Feature full pill shapes (`rounded-full` / 9999px) for quick eye recognition as discrete operational metadata.

## Components

### 1. Buttons
- **Primary Action (Maple Red):** Solid `#C8102E`, white typography, minimum height of `48px` (exceeding standard 44px for gloved or on-the-go tapping), `rounded-xl`, bold font. Hover/pressed state shifts to `#8B1E1E`.
- **Secondary Action (Deep Navy Outline or Pine Fill):** `#1B2A4A` outline with 1.5px border or solid `#1B4332` for itinerary confirmations.
- **Ghost/Tertiary:** No background, `#1B2A4A` text with an explicit left or right navigation icon (e.g., arrow, chevron).

### 2. Status Badges & Pills
- Built with a full pill radius, compact internal padding (`space-xs` vertically, `space-sm` horizontally), with an icon and uppercase microcopy:
  - **Listo / Completado:** Forest Green background tint (`#E8F5E9`), dark green text (`#1B4332`), checkmark icon.
  - **Pendiente / Por Completar:** Soft amber background (`#FEF3C7`), deep amber text (`#92400E`), clock/alert icon.
  - **Sin Conexión (Offline Ready):** Slate grey tint (`#F1F5F9`), charcoal text (`#475569`), cloud-slash icon (essential for roaming in Canada).
  - **En Ruta / En Vivo:** Red arce tint (`#FEE2E2`), red text (`#C8102E`), pulsing dot indicator.

### 3. Cards & Itinerary Modules
- Structured container with `rounded-2xl`, white background, `1px solid #E2E8F0`, and ambient shadow.
- **Day Card Header:** Displays clear dates, weather forecast in Toronto (Celsius with Fahrenheit toggle), and dual currency rates (CAD to USD/Ecuadorian economy context).
- **Activity Item:** Clean left-aligned timeline node, departure/arrival timestamps in bold navy, and direct tap targets for Google Maps / Apple Maps deep linking.

### 4. Inputs & Forms
- Input fields designed with generous `52px` height, soft sand fills (`#F8F6F0`), high-contrast borders that focus to `#C8102E` with a 2px offset ring. Clear floating labels to aid entry of passport numbers and ticket booking codes.

### 5. Specialized Travel Components
- **Currency & Tip Converter Card:** Interactive quick-calculator accounting for Ontario HST (13%) and Canadian tipping culture (15%-20%), giving first-time travelers immediate peace of mind.
- **Emergency / Embassy Quick Bar:** Fixed accessible component giving one-touch access to the Ecuadorian Consulate in Toronto, 911 emergency services, and travel insurance policy numbers.