---
name: Bacheca eventi BuonaCaccia
description: A troop-hall noticeboard of AGESCI events, with the registration-opening date as each flyer's headline.
colors:
  cork: "#74502f"
  cork-dot-a: "#664527"
  cork-dot-b: "#82593a"
  cork-deep: "#5e3f24"
  on-cork: "#fffdf8"
  on-cork-soft: "#f1e4d3"
  note-paper: "#fffdf8"
  note-paper-hover: "#f1e9de"
  ground: "#ecebe7"
  paper: "#ffffff"
  paper-edge: "#ddd6cb"
  ink: "#2a211a"
  ink-soft: "#5e5044"
  track: "#ece5d9"
  focus: "#1f5fa8"
  pin-fc: "#1f5fa8"
  pin-lc: "#f2b705"
  pin-eg: "#2e7d32"
  pin-rs: "#c62828"
  pin-aa: "#6d6a66"
  stamp-soon: "#4338a8"
  stamp-open: "#2e6b2f"
  stamp-full: "#b3261e"
typography:
  display:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "1.85rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  body-small:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 600
    lineHeight: 1.1
  stamp:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 700
    letterSpacing: "0.09em"
  group-label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  note: "2px"
  sm: "4px"
  search: "6px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "16px"
  xl: "24px"
components:
  button-paper:
    backgroundColor: "{colors.note-paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
    height: "42px"
  button-paper-hover:
    backgroundColor: "{colors.note-paper-hover}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
    height: "42px"
  button-ink-hover:
    backgroundColor: "{colors.ink-soft}"
  button-ghost:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
    height: "42px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 13px"
    height: "38px"
  chip-hover:
    backgroundColor: "{colors.track}"
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  note:
    backgroundColor: "{colors.note-paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.note}"
    padding: "9px 13px 8px"
    height: "40px"
  note-add:
    textColor: "{colors.on-cork}"
    typography: "{typography.label}"
    rounded: "{rounded.note}"
    padding: "9px 13px 8px"
    height: "40px"
  search:
    backgroundColor: "{colors.note-paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.search}"
    padding: "0 12px"
    height: "46px"
  field:
    backgroundColor: "{colors.note-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 34px 8px 10px"
    height: "42px"
  flyer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "14px 16px 12px"
  stamp-soon:
    textColor: "{colors.stamp-soon}"
    typography: "{typography.stamp}"
    rounded: "{rounded.note}"
    padding: "1px 8px"
  stamp-open:
    textColor: "{colors.stamp-open}"
    typography: "{typography.stamp}"
    rounded: "{rounded.note}"
    padding: "1px 8px"
  stamp-full:
    textColor: "{colors.stamp-full}"
    typography: "{typography.stamp}"
    rounded: "{rounded.note}"
    padding: "1px 8px"
---

# Design System: Bacheca eventi BuonaCaccia

## Overview

**Creative North Star: "La bacheca di sede"**

The page is the cork noticeboard in a scout troop hall. A dark, finely speckled cork shell holds everything a leader handles (the board name, their pinned favourite searches, the search field, the filter panel); white paper flyers hang below it, one per event, each held by a coloured pushpin that says which branch it belongs to. The registration-opening date is the flyer's headline, set big in a condensed face, and the registration state is a rubber stamp with a word on it.

Density is phone-first and practical: one column of flyers at 390px, a sticky cork filter column plus a two-column flyer grid from 960px. The physical metaphor is carried by a small set of real devices (cork texture, pins, slight hand-hung tilt, stamps, soft paper shadows), never by illustration or skeuomorphic chrome. Everything else is plain, legible Barlow on paper.

The dark theme is the same board at night: burnt cork and warm grey paper, with the cream notes and fields on the cork kept cream so they still read as paper pinned to it.

**Key Characteristics:**
- Two materials: cork for controls, paper for content.
- Pin colour is the branch legend, shared by flyer pins, chip dots and favourite notes.
- State shown as a tilted stamp with a word, never by colour alone.
- Condensed display type reserved for dates, the board name and stamps.
- Small, deliberate tilts that straighten on interaction.
- Flat paper with soft, low shadows; no heavy elevation.

## Colors

A warm, brown-black palette of cork, cream and white paper, with five saturated pin colours and three stamp inks as the only chroma.

### Primary
- **Speckled Cork** (`cork`, with `cork-dot-a` and `cork-dot-b` speckles): the shell behind the header, favourites and search, the mobile filter panel and the desktop filter column. Always rendered with its two-layer dot texture (1px dots on 7px and 11px grids, offset 3px 5px). `cork-deep` is the darker step reserved for depth on cork.
- **Cream on Cork** (`on-cork`, `on-cork-soft`): text and outlines placed directly on cork; the soft variant for timestamps, group labels, counts and the dashed outline of the "Appunta" note.

### Secondary (Branch pins)
- **Formazione Capi Blue** (`pin-fc`), **L/C Yellow** (`pin-lc`), **E/G Green** (`pin-eg`), **R/S Red** (`pin-rs`), **Speciale Grey** (`pin-aa`): the pushpin on each flyer, the dot inside each branch chip, and the pin atop each favourite note. They mean branch and nothing else. Pins keep the same values in both themes.

### Tertiary (Stamp inks)
- **Indigo Stamp** (`stamp-soon`): DA APRIRE.
- **Green Stamp** (`stamp-open`): APERTE.
- **Red Stamp** (`stamp-full`): PIENO.
In dark mode the stamp inks lift to pale tints (#aab0ff, #8fd18f, #ff8f85) so they hold contrast on dark paper.

### Neutral
- **Hall Floor** (`ground`): page background behind the flyers.
- **Flyer Paper** (`paper`) with **Paper Edge** (`paper-edge`): flyer, chip and empty-state surface and its 1px border.
- **Note Paper** (`note-paper`) and **Note Paper Hover** (`note-paper-hover`): the cream of favourite notes, search field, fields and paper buttons sitting on cork. Constant across themes.
- **Brown-Black Ink** (`ink`): text, active chip fill, duration bar fill, ink button.
- **Faded Ink** (`ink-soft`): secondary text (place, countdown, duration label, footer).
- **Track** (`track`): empty duration bar, chip hover, skeleton shimmer.
- **Focus Blue** (`focus`): the 2px focus outline (pale #9ec3ff in dark).

Dark theme mapping (prefers-color-scheme): cork #3a281a, ground #171411, paper #24201c, paper-edge and track #3a332c, ink #f1ebe3, ink-soft #c2b5a6.

### Named Rules
**The Two Materials Rule.** Cork carries controls; paper carries events. Content never sits on cork, and filters never sit on white paper.

**The Pin Is the Legend Rule.** A pin colour is used only to identify a branch, and only as a pin or dot next to the branch name or on a flyer that names its branch. Never use pin colours for buttons, links, highlights or decoration.

**The Stamp Speaks Rule.** Registration state is always a word in a stamp; colour reinforces it, shape distinguishes it (PIENO has a double border).

## Typography

**Display Font:** Barlow Condensed 600/700 (with Barlow, system-ui)
**Body Font:** Barlow 400/500/600 (with system-ui, sans-serif)

**Character:** A workmanlike grotesque with a condensed sibling that reads like dates hand-lettered on a poster. Both self-hosted (SIL OFL), tabular numerals throughout so counts and dates align.

### Hierarchy
- **Display** (700, 1.6rem, 2rem from 960px, 1.1): the board name in the cork header only.
- **Headline** (700, 1.85rem, 1): the flyer's date line ("Apre gio 29 ott", "Chiude ven 6 nov"). The largest thing on every flyer. Barlow Condensed at 1.5rem also heads the empty state.
- **Title** (600, 1.1rem, 1.25, balanced wrap): event name, linked to BuonaCaccia with the outbound icon.
- **Body** (400, 1rem, 1.45): base text. Body-small (0.9rem) for place/date lines and the results meta; 0.78 to 0.85rem for countdown, duration label and footer, footer capped at 70ch.
- **Label** (600, 0.875 to 0.95rem): chips, notes, buttons.
- **Stamp** (Barlow Condensed 700, 0.9rem, 0.09em, uppercase words): DA APRIRE, APERTE, PIENO.
- **Group label** (600, 0.8rem, 0.06em, uppercase, cream-soft on cork): fieldset legends in the filter panel (REGIONE, TIPOLOGIA).

### Named Rules
**The Condensed Is for Dates Rule.** Barlow Condensed is reserved for the board name, flyer dates, stamps and the empty-state heading. Never for body copy, buttons or labels.

**The Free Seats Are Bold Rule.** In the facts row, only the number (free seats, or registrations when full) is bold at 1.05rem; the words around it stay regular.

## Layout

Mobile (below 960px): full-bleed cork header (14px 16px 16px padding) with title and "Aggiornata …" on one baseline, a horizontally scrolling row of favourite notes with hidden scrollbar, and the search field. Below it a horizontally scrolling chip row (sort select, region, type, branch chips) at 16px side padding; region and type chips open the cork filter panel inline. Then the results meta line and a single column of flyers with 14px gaps.

Desktop (960px and up): content capped at 1240px (header rows 1192px). A two-column grid, 300px sticky cork filter column on the left (sticky at 16px, scrolls internally), 28px gap, 24px padding; the panel is always open, chips wrap, region list becomes a single column. Flyers form an auto-fill grid of min 330px columns with 22px row and 20px column gaps, aligned to start.

Spacing is a loose 4px-based rhythm: 4 and 8 inside components, 14 between flyers and header rows, 16 for gutters and panel padding, 24 for desktop gutters. Touch targets stay at 36 to 46px.

## Elevation & Depth

Depth is paper on a surface: two-layer soft shadows, no lifted cards, no hard offsets.

### Shadow Vocabulary
- **Paper** (`0 1px 2px rgb(42 33 26 / .12), 0 3px 10px rgb(42 33 26 / .07)`; darker in dark mode): flyers, cork panels.
- **Note** (`0 2px 3px rgb(0 0 0 / .25)`, hover `0 4px 8px rgb(0 0 0 / .28)`): favourite notes and the inline note editor on cork.
- **Pin** (`0 1.5px 1.5px rgb(0 0 0 / .35)`): the pushpin head; flyer pins add an inset bottom-right shade.
- **Inset field** (`inset 0 1px 2px rgb(0 0 0 / .12)`): the search field pressed into the cork.

### Named Rules
**The Hung by Hand Rule.** Flyers tilt alternately at most ±0.35deg; notes on cork tilt between ±1 and ±2deg. Anything hovered, pressed or active straightens to 0deg. Never exceed ±2deg.

## Shapes

Paper is nearly square: 2px for notes and stamps, 4px for flyers, buttons, fields and panels, 6px for the search field. Chips are full pills (999px), the one rounded silhouette, so filter controls read as distinct from paper. Pins are circles (11px on notes, 14px on flyers) protruding 6 to 7px above the top edge. Borders are thin: 1px paper edge on flyers, 1.5px ink on chips and ghost buttons, 1.5px dashed for "add" and empty states, 2px solid or 3px double for stamps. Icons are inline SVG strokes (2px, round caps) at 1.15em.

## Components

### Buttons
Solid and quiet.
- **Shape:** 4px corners, 42px minimum height, 8px 14px padding, 1.5px transparent border.
- **Paper:** note-paper fill, ink text; used on cork (pin form submit).
- **Ink:** ink fill, paper text; primary action on paper. Inside the cork panel it flips to note-paper fill and ink text.
- **Ghost:** transparent with currentColor border; cream on cork, ink on paper.
- **Hover / Focus:** colour shift over 0.15s; global 2px focus-blue outline offset 2px. Disabled at 45% opacity.

### Chips
- **Style:** pill, white paper fill, 1.5px ink border, 600 label, 38px tall. On the desktop cork column the border turns note-paper.
- **Branch chips:** carry a 10px pin-colour dot ringed by 1.5px paper.
- **State:** pressed or expanded fills ink with paper text; a set-but-closed region/type chip takes the track fill. The sort chip wraps a native select with a CSS chevron.

### Favourite Notes (signature)
Cream paper slips pinned in the cork header, each tilted and topped with the pin colour of its first branch (red if none). Active note straightens and gains an inset 2.5px ink outline. Applying one plays a 0.38s push: the pin squashes and the note settles, then the board reorders through a 0.18s view transition. The "Appunta" note is a transparent, dashed cream outline with a plus icon and no pin. Edit mode swaps notes for a note-paper box with input and a delete icon button.

### Flyers (signature)
White paper, 1px paper-edge border, 4px corners, paper shadow, 14px 16px 12px padding, pin at top-left (20px in). Order inside: condensed date headline with countdown right-aligned; stamp (rotated -2deg) with an optional small note; linked title; place, dates and fee joined by middots; facts row with a 6px duration bar (length = days, ink fill on track) and free seats right-aligned. Full flyers tint the paper 12% toward the ground. Loading shows shimmer skeleton flyers.

### Stamps
Inline block, currentColor 2px border, 2px corners, condensed uppercase word, -2deg rotation from the left edge. PIENO uses a 3px double border.

### Inputs / Fields
- **Search:** note-paper bar on cork, 6px corners, inset shadow, search icon, 46px; focus outlines the whole bar in cream.
- **Select field:** note-paper, 4px corners, SVG chevron, 42px.
- **Checks and switches:** native inputs with cream accent colour, 36px rows, counts right-aligned in cream-soft.

### Filter Panel
Cork-textured block with paper shadow and 4px corners; mobile drops in (0.22s, -6px) under the chip row, desktop is permanent in the sticky left column. Groups are spaced 18px with uppercase group labels.

## Do's and Don'ts

### Do:
- **Do** put every control (favourites, search, filters) on speckled cork and every event on white paper.
- **Do** lead each flyer with the opening or closing date in Barlow Condensed 700 at 1.85rem.
- **Do** pair every pin colour with its branch name somewhere visible (chip label, flyer text).
- **Do** show state as a stamp word; use the double border for PIENO.
- **Do** keep notes, fields and paper buttons on cork in note-paper cream in both themes.
- **Do** use the shared ease `cubic-bezier(.16, 1, .3, 1)` for motion, and drop all animation under reduced motion.
- **Do** use inline stroke SVG icons from the page sprite.

### Don't:
- **Don't** use pin colours for anything except branch identity.
- **Don't** tilt anything beyond ±2deg, or tilt flyers beyond ±0.35deg.
- **Don't** convey state, branch or selection by colour alone.
- **Don't** use hard offset shadows or deep elevation; paper sits on the board.
- **Don't** set body copy, labels or buttons in Barlow Condensed.
- **Don't** use AGESCI or BuonaCaccia logos or branding; the board is an unofficial tool and always credits BuonaCaccia as the source.
