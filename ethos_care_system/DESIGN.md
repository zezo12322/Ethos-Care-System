# Case Management Design System: High-End Editorial Guidelines

## 1. Overview & Creative North Star
**The Creative North Star: "The Compassionate Architect"**

This design system moves beyond the utility of a standard administrative tool to create a digital environment that feels both authoritative and deeply human. We reject the "spreadsheet-only" aesthetic in favor of a **High-End Editorial** approach. 

The system utilizes "Organic Professionalism"—a blend of rigid institutional reliability and soft, human-centric layouts. We break the traditional grid through intentional white space, layered depth, and a typography scale that prioritizes readability and emotional resonance. The interface shouldn't just display data; it should curate a story of human impact.

---

## 2. Colors: Tonal Depth & Soul
Our palette is rooted in the earth and growth (Teal/Green) with points of urgent warmth (Amber).

### The Palette
- **Primary Foundation:** `primary` (#005c55) and `primary_container` (#0F766E). Use these for high-level branding and primary navigation backgrounds.
- **The Human Element:** `tertiary` (#734700) and `tertiary_fixed_dim` (#ffb95f). These amber tones represent life and urgency; use them sparingly for status highlights and critical calls to action.
- **Neutrals:** A sophisticated range of `surface` (#f7faf8) to `surface_container_highest` (#e0e3e1).

### Design Rules
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Use background shifts (e.g., a `surface_container_low` card on a `surface` background) to define boundaries.
*   **The "Glass & Gradient" Rule:** For floating headers or sidebars (as seen in the reference images), use a backdrop-blur (12px-20px) combined with a semi-transparent `surface` color.
*   **Signature Textures:** Apply a subtle linear gradient from `primary` to `primary_container` on large interactive elements to provide a "silk" finish that flat colors cannot replicate.

---

## 3. Typography: Editorial Authority
We use a dual-font strategy to balance modernity with professional trust.
*   **Headlines (Manrope/IBM Plex Sans Arabic):** Used for `display` and `headline` tiers. These are bold and spacious, providing a clear "editorial" entry point to each page.
*   **Body (Plus Jakarta Sans/Cairo):** Optimized for the high-density data of case management. 

**Hierarchy Strategy:**
- **Display-LG (3.5rem):** Reserved for impact metrics (e.g., "Total Cases").
- **Title-MD (1.125rem):** The workhorse for card headers and section titles.
- **Label-SM (0.6875rem):** Used for metadata and status chips to ensure the UI remains clean even with complex data.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too "digital." We use **Physical Layering** to create hierarchy.

*   **The Layering Principle:** 
    *   Level 0: `surface` (The canvas).
    *   Level 1: `surface_container_low` (The main content areas).
    *   Level 2: `surface_container_lowest` (Individual cards—providing a "lift" through brightness).
*   **Ambient Shadows:** For "Floating" elements (Modals, Popovers), use:
    *   `Shadow: 0px 12px 32px -4px rgba(0, 40, 38, 0.06)`
    *   *Note: The shadow is tinted with the primary-dark hue to look natural, never pure grey.*
*   **The "Ghost Border" Fallback:** If a container needs more definition (e.g., a search input), use `outline_variant` at **15% opacity**.

---

## 5. Components: Refined Utility

### Buttons & Interaction
- **Primary Button:** Large radii (`rounded-md` 0.75rem), using the `primary` token with a subtle top-to-bottom gradient.
- **Tertiary/Ghost Buttons:** No background or border. Use `on_surface_variant` text. Focus states should use a soft `primary_container` glow.

### Data Management
- **Cards:** Forbid internal dividers. Use `spacing-6` (1.5rem) to separate the card title from the content.
- **Clean Tables:** Reference the "Life Makers" table style. Headers use `surface_container_high` with no vertical lines. Row hover states should utilize a subtle shift to `surface_container_low`.
- **Status Chips:** Use high-contrast pairings (e.g., `on_tertiary_container` text on `tertiary_container` background). Ensure a `rounded-full` pill shape for an approachable, human feel.

### Specialized Components
- **Case Timeline:** As seen in the reference, use a vertical line in `outline_variant` (20% opacity) with `primary` or `tertiary` nodes to indicate case progress.
- **Metric Tiles:** Use `display-md` for numbers to create a clear "at-a-glance" dashboard experience.

---

## 6. Do's and Don'ts

### Do:
- **Use "White Space as a Border":** Trust the `spacing` scale (specifically `8` and `12`) to separate content modules.
- **RTL-First Thinking:** Ensure all iconography is mirrored where appropriate (arrows, progress bars) and typography is right-aligned with proper optical kerning for Arabic scripts.
- **Layer for Importance:** Place the most critical case info on the "brightest" layer (`surface_container_lowest`).

### Don't:
- **Don't use 100% Black:** Never use #000000. Use `on_surface` (#181c1c) for text to maintain a premium, softened look.
- **Don't Overcrowd:** If a table has more than 8 columns, use a "View Details" pattern rather than shrinking text.
- **Don't use Sharp Corners:** Avoid `rounded-none`. Even for small elements, use at least `rounded-sm` (0.25rem) to maintain the "human" brand personality.