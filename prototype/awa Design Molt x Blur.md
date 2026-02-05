# Web3 Dashboard Design System
## Inspired by: moltecosystem.xyz + blur.io

---

## Design Philosophy

A fusion of **data-dense trading interfaces** (Blur) with **card-based ecosystem explorers** (Molt). The result: a dark-mode, high-contrast design system optimized for crypto/Web3 applications that need to display both quantitative data AND qualitative project information.

---

## Color System

### Base Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#000000` | Main background |
| `--bg-secondary` | `#0D0D0D` | Card backgrounds |
| `--bg-tertiary` | `#1A1A1A` | Elevated surfaces |
| `--bg-hover` | `#252525` | Hover states |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-primary` | `#FF6B00` | Primary CTA, Blur orange |
| `--accent-secondary` | `#00FF88` | Success states, positive % |
| `--accent-warning` | `#FFD93D` | Warnings, medium priority |
| `--accent-danger` | `#FF4757` | Errors, negative % |
| `--accent-info` | `#7C3AED` | Info badges, purple highlight |

### Status Colors (from Molt)
| Status | Color | Badge Style |
|--------|-------|-------------|
| Live | `#00FF88` | Solid pill, dark text |
| In Development | `#FFD93D` | Solid pill, dark text |
| High Priority | `#FF4757` | Outlined pill |
| Medium | `#FF6B00` | Outlined pill |
| Low | `#6B7280` | Outlined pill |
| Emerging | `#7C3AED` | Outlined pill |

### Text Hierarchy
| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#FFFFFF` | Headlines, primary content |
| `--text-secondary` | `#A0A0A0` | Descriptions, metadata |
| `--text-muted` | `#6B7280` | Timestamps, tertiary info |
| `--text-accent` | `#FF6B00` | Links, interactive text |

---

## Typography

### Font Stack
```css
font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace; /* Data/numbers */
font-family: 'Inter', 'SF Pro', system-ui, sans-serif; /* UI text */
```

### Type Scale
| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display | 32px | 700 | 1.1 | Page titles |
| H1 | 24px | 600 | 1.2 | Section headers |
| H2 | 18px | 600 | 1.3 | Card titles |
| H3 | 14px | 500 | 1.4 | Subsections |
| Body | 14px | 400 | 1.5 | Descriptions |
| Caption | 12px | 400 | 1.4 | Metadata, labels |
| Data | 14px | 500 | 1.0 | Numbers, prices |

### Special Typography Treatments
- **Positive percentages**: `#00FF88` with optional up-arrow icon
- **Negative percentages**: `#FF4757` with optional down-arrow icon
- **Crypto values**: Monospace, right-aligned, with ETH/SOL icon suffix
- **Project names**: Truncate with ellipsis at 18 characters on mobile

---

## Layout System

### Grid Structure

#### Desktop (1440px+)
```
Sidebar (240px) | Main Content (flex)
                |
[Navigation]    | [Header Bar]
[Filters]       | [Content Grid / Table]
[Footer]        |
```

#### Tablet (768px - 1439px)
```
[Collapsed Sidebar / Hamburger]
[Header Bar]
[Tabs for navigation]
[Content Grid 2-col / Table scroll]
```

#### Mobile (< 768px)
```
[Bottom Tab Navigation]
[Header]
[Content Stack / Horizontal scroll table]
```

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Inline elements |
| `--space-2` | 8px | Tight grouping |
| `--space-3` | 12px | Card padding (mobile) |
| `--space-4` | 16px | Standard spacing |
| `--space-5` | 24px | Card padding (desktop) |
| `--space-6` | 32px | Section gaps |
| `--space-8` | 48px | Major sections |

---

## Component Library

### 1. Navigation Bar (Blur-style)
```
[Logo] [Search Bar (expandable)] [Connect Wallet Button]
```
- Fixed position, 64px height
- Glassmorphism effect: `backdrop-filter: blur(12px)`
- Border bottom: `1px solid rgba(255,255,255,0.1)`
- Search input: Monospace placeholder, icon left-aligned

### 2. Sidebar Navigation (Molt-style)
```
[Logo Block]
  - Logo icon
  - Brand name

[Nav Items]
  - Icon + Label
  - Active state: orange accent bar left

[Social Links]
  - Twitter handle
  - Copyright
```
- Width: 240px desktop, collapsible on tablet
- Background: `--bg-secondary`
- Nav items: 48px height, icon 20px

### 3. Filter Pills / Category Tags
```css
/* Inactive */
background: transparent;
border: 1px solid rgba(255,255,255,0.2);
color: var(--text-secondary);

/* Active */
background: var(--accent-primary);
border: none;
color: #000;
```
- Pill shape: `border-radius: 9999px`
- Emoji prefix for category identification
- Count suffix in parentheses: `(21)`

### 4. Project Cards (Molt-style)
```
+----------------------------------+
| [Icon/Avatar]        [Star btn]  |
| Project Name                     |
| [Category Badge]                 |
|                                  |
| Description text here that      |
| spans multiple lines...          |
|                                  |
| [Status] [Priority] [Features]   |
|----------------------------------|
| [Website] [GitHub]    [OS Badge] |
+----------------------------------+
```
- Border: `1px solid rgba(255,255,255,0.1)`
- Border-radius: `12px`
- Hover: Lift effect + border glow
- Transition: `all 0.2s ease`

### 5. Data Table (Blur-style)
```
| Collection | Floor | Bid | 1D% | 7D% | Volume | Owners |
|------------|-------|-----|-----|-----|--------|--------|
| [img] Name | 4.34  | 4.26| +7% | -7% | 245.93 | 5128   |
```
- Sticky header with sort indicators
- Row hover: `background: var(--bg-hover)`
- Alternating row colors optional
- Percentage coloring: green/red based on +/-
- Right-align numerical columns
- Collection column: Avatar (40px) + Name + Verified badge

### 6. Status Badges
```css
/* Live Badge */
.badge-live {
  background: #00FF88;
  color: #000;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

/* In Development */
.badge-dev {
  background: #FFD93D;
  color: #000;
}

/* Priority Badges - Outlined */
.badge-priority {
  background: transparent;
  border: 1px solid currentColor;
  padding: 4px 8px;
}
```

### 7. Connect Wallet Button
```css
.connect-btn {
  background: linear-gradient(135deg, #FF6B00, #FF8533);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.connect-btn:hover {
  box-shadow: 0 0 20px rgba(255, 107, 0, 0.4);
  transform: translateY(-1px);
}
```

### 8. Search Input
```css
.search-input {
  background: var(--bg-secondary);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 12px 16px 12px 44px;
  color: var(--text-primary);
  font-family: monospace;
  width: 100%;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--accent-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
}
```

### 9. Bottom Tab Bar (Mobile)
```
+-------+-------+-------+-------+
|  [O]  |  [^]  |  [*]  |  [+]  |
| Coll. | Trend | Favs  | Points|
+-------+-------+-------+-------+
```
- Height: 64px + safe area
- Active tab: Orange icon + label
- Inactive: Gray icon, no label on very small screens

---

## Iconography

### Icon Style
- **Style**: Outlined, 1.5px stroke
- **Size**: 20px standard, 24px for nav
- **Color**: Inherits from parent text color

### Common Icons
| Icon | Usage |
|------|-------|
| Search (magnifier) | Search inputs |
| Filter (sliders) | Filter toggles |
| Star (outline/filled) | Favorites |
| External link (arrow) | Website links |
| GitHub logo | Repository links |
| Wallet | Connect wallet |
| Chart up/down | Price changes |
| Grid | Card view |
| List | Table view |

---

## Motion & Animation

### Transition Defaults
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease-out;
```

### Hover Effects
```css
/* Card Lift */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.4);
  border-color: rgba(255, 107, 0, 0.3);
}

/* Button Glow */
.btn-primary:hover {
  box-shadow: 0 0 20px rgba(255, 107, 0, 0.4);
}

/* Table Row */
.table-row:hover {
  background: var(--bg-hover);
}
```

### Loading States
- Skeleton screens with shimmer animation
- Pulse effect on loading badges
- Spin animation on refresh icons

---

## Data Visualization

### Percentage Display
```jsx
<span className={change >= 0 ? 'text-green' : 'text-red'}>
  {change >= 0 ? '+' : ''}{change.toFixed(2)}%
</span>
```

### Mini Sparklines (optional)
- 7-day trend visualization
- Height: 24px
- Width: 60px
- Stroke: 1.5px, color matches % direction

### Progress Bars
- Owner percentage: Filled bar relative to supply
- Border-radius: 4px
- Height: 4px
- Background: `var(--bg-tertiary)`
- Fill: `var(--accent-primary)`

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Component Adaptations
| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Sidebar | Hidden (bottom tabs) | Collapsed | Expanded |
| Cards | 1 column | 2 columns | 3-4 columns |
| Table | Horizontal scroll | Truncated cols | Full width |
| Search | Icon only | Expandable | Always visible |

---

## Accessibility Considerations

- Minimum contrast ratio: 4.5:1 for text
- Focus states: Visible outlines (orange glow)
- Touch targets: Minimum 44x44px
- Reduced motion: Respect `prefers-reduced-motion`
- Screen reader: Proper ARIA labels on interactive elements

---

## Implementation Notes

### Tech Stack Recommendations
- **Framework**: Next.js / Nuxt.js
- **Styling**: Tailwind CSS with custom config
- **Components**: Radix UI primitives
- **Animation**: Framer Motion
- **Charts**: Recharts / Visx
- **Table**: TanStack Table

### CSS Custom Properties Example
```css
:root {
  --bg-primary: #000000;
  --bg-secondary: #0D0D0D;
  --bg-tertiary: #1A1A1A;
  --accent-primary: #FF6B00;
  --accent-success: #00FF88;
  --accent-danger: #FF4757;
  --text-primary: #FFFFFF;
  --text-secondary: #A0A0A0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

---

## Reference URLs
- **Molt Ecosystem**: https://www.moltecosystem.xyz/
- **Blur NFT Marketplace**: https://blur.io/collections

---

*Design system documented: February 2026*
