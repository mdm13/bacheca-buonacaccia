# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/vanilla JS with no build step, in `site/`. Data comes from `site/eventi.json`, produced by the
Python scraper (`uv run buonacaccia --json site/eventi.json`). Hosted on GitHub Pages; a scheduled GitHub
Actions workflow regenerates the JSON and deploys daily.

## Users

AGESCI leaders (capi) from anywhere in Italy looking for a training or branch event to sign up for, or to
send their kids/youth to. Often on a phone, often checking repeatedly for when registrations open.

## Product Purpose

A faster, friendlier view of the public BuonaCaccia events list: one search page where a leader filters by
region (all regions plus Nazionale), category and event type, sorts by registration opening date, and hides
events that are already full. Success: a leader finds "the next CFM L/C in Veneto that still has seats and
when it opens" in a few seconds, and can return to that same search with one tap.

## Positioning

BuonaCaccia shows events but not the registration opening date in its list, and has no saved searches.
This page puts the opening date first, computes free seats, and remembers each leader's favourite filters.

## Operating Context

- Source: public pages at https://buonacaccia.agesci.it/Events.aspx ("iscrizioni aperte o da aprire")
  and each event's detail page. The actual sign-up always happens on BuonaCaccia; this page links there.
- Data refreshes once a day; the page must say when it was last updated.
- Vocabulary is AGESCI's: CFT, CFM L/C / E/G / R/S, CFA, CCG, MF (moduli formativi), ROSS, EPPPI,
  Piccole Orme, branche L/C, E/G, R/S, Formazione Capi.

## Capabilities and Constraints

- Filters: region (multi), category (Formazione Capi, L/C, E/G, R/S, Speciale), event type, text search;
  sort by registration opening (default) or event start; full events hidden by default with a toggle.
- Saved favourite filters in the browser (localStorage); current filters also in the URL for sharing.
- Some events publish no seat count ("(*)" on the source): seats unknown, never treated as full.
- "Full" means registrations ≥ seats; many such events still accept a waiting list on BuonaCaccia.
- No accounts, no backend, no tracking.

## Brand Commitments

Unofficial tool: must not impersonate AGESCI or BuonaCaccia (no AGESCI logo or branding), and must state that
data comes from BuonaCaccia and sign-up happens there. Interface language: Italian.

## Evidence on Hand

Real event data from the daily scrape (`site/eventi.json`, ~160 events). No testimonials, usage numbers or
endorsements exist; none may be invented.

## Product Principles

1. The opening date and free seats are the headline facts of every event.
2. One tap back to "my search": favourites beat re-filtering.
3. Honest data: show unknowns as unknown, show when data was refreshed, always link to the source.
4. Phone first; works on a slow connection with a single small JSON.

## Accessibility & Inclusion

Usable on small phones and by keyboard; sufficient contrast in light and dark; state never conveyed by
colour alone.
