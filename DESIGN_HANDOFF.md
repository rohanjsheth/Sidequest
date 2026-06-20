# Sidequest — Design Handoff

> **TL;DR for the designer:** Design a calm, premium, **black-&-white minimalist** mobile app
> for spontaneous plans with friends, with **monospace type as the signature**. Think
> **HeyTea's clean, spacious restraint** crossed with editorial/design-forward mono. You own
> the visual design. The data each screen shows is real (it comes from a working API), so keep
> designs implementable in React Native (Expo).

---

## 1. The product in one breath

A host spins up a spur-of-the-moment plan ("rooftop in 2 hours"), it broadcasts to their
friends, and friends RSVP. Partiful's playful energy, but for the spontaneous — not formal
parties. Phone number is the account (no email/passwords).

## 2. The design concept

No skeuomorphic metaphor — the opposite. **Get out of the content's way: calm, confident
minimalism.** Lots of whitespace, strict black on white, and a **monospace typeface used
expressively** (big titles, tiny labels, times, numbers) to give the app a quiet, modern,
design-led personality. The tension to play with: **HeyTea-soft** (rounded, spacious, premium,
friendly) × **monospace-technical** (precise, editorial). Spontaneity should feel *effortless
and fast* — never busy.

## 3. Brand (the constraints already set)

- **Color: black & white only.** White canvas, black ink, a ladder of grays for hierarchy
  (e.g. `#000`/`#111` text, `#666` secondary, `#999` tertiary, `#E5E5E5` hairlines, `#F5F5F5`
  surfaces, `#FFF` background). Invert for emphasis — black cards / black buttons with white
  text. No brand hue in MVP (one can come later if ever needed).
- **Type: monospace is the signature.** Use a *readable humanist* mono (real options: Commit
  Mono, Berkeley Mono, MD IO, JetBrains Mono, IBM Plex Mono) across titles, labels, times, and
  numbers. Long body copy can stay in the same mono at a comfortable size, or use a quiet
  neutral sans companion if mono tires the eye — your call, but lean mono-forward.
- **Feel:** HeyTea minimal — premium, spacious, restrained, a little playful. Soft rounded
  containers, generous padding, thin hairlines over heavy borders. Let the type do the work.
- **Light mode first.** (It's basically monochrome already; true dark mode = invert, easy later.)

## 4. Platform

- **Native app: iOS first** (Android later), portrait, React Native / Expo. Design as a
  **token system** (color ladder, mono type scale, spacing, radii) + components.
- **Plus exactly one web surface:** the public **share page** (screen I) — opens from an SMS
  link in a mobile browser, no app and no login. Everything else is app-only.
- Navigation: bottom tab bar (Board / Friends / You) + stack pushes. Touch targets ≥ 44pt.

## 5. Screens to design (priority order)

> Field names in `code` are the literal data the API returns — design to them so it's buildable.

### ⭐ A. Feed — home
Scrolling list of upcoming plans from **you + your accepted friends**.
- Per item: `startsAt` (time/date, mono) · `title` · `location` + `host.name` · a small
  **status chip** only when relevant (Soon / Past / Cancelled) · `going` count · optional
  `imageUrl` thumb.
- Tap item → plan page; header action / FAB → create; pull-to-refresh.
- States: **empty** ("nothing happening — start something"), loading, **cancelled** item
  (muted/struck), **past** item (dimmed), mix.

### ⭐ B. Plan page (event detail)
- Shows: `imageUrl` (optional) · `title` · host (`host.name` + `host.avatarUrl`) · `location` ·
  `startsAt` (date + time, mono) · `going` count · `description` · status · attendee avatars ·
  `shareToken` (a small share code, if useful).
- **Primary action — RSVP:** Going / Maybe / Can't go (`going` / `maybe` / `declined`); show the
  user's current pick. A positive RSVP also auto-friends you with the host — worth a subtle
  "you're now friends with {host}" moment the first time.
- Secondary: **Share** (the link). **Host-only:** Edit, Cancel.
- Host sees **all attendees + every status**; a guest sees **only who's going**. Design both.
- States: RSVP'd vs not · **cancelled** (clear treatment) · **past** · no image.

### C. Create plan
- Fields: `title`, `location`, `startsAt` (date+time), `description` (optional), photo →
  `imageUrl` (optional), `notificationMessage` (broadcast text, prefilled
  `"<your name> wants to sidequest"`, editable).
- **MVP: every plan broadcasts to ALL your friends — no audience picker.**
- States: validation, submitting.

### D. Auth — phone sign-in (2 steps)
- Step 1: enter phone → send code. Step 2: enter **6-digit** code. Minimal.
- States: invalid number, wrong code, resend, loading.

### E. Onboarding — set your name
- After first verify the user has only a phone (`name` is null). Ask for `name` (+ optional
  avatar). One field, welcoming.

### F. Friends
The graph grows two ways:
1. **Explicit** — add a friend by typing a phone number **or picking them from your contacts**
   (native single-contact picker; just fills one number). This **sends a request** they accept,
   via an **incoming requests** inbox (accept/decline). Cold-adds are always request-based.
2. **Automatic** — **RSVPing to a plan auto-friends you with the host** (the one instant
   exception — you showed up, so no approval), so their future plans show up in your feed.
- Screen shows: your friends (`name` + `avatarUrl`), an add action (type number / pick contact),
  the requests inbox.
- States: empty, pending-request badge.

*(Friend lists are out of scope for MVP — see §9.)*

### G. You — profile
- Your `name`, `avatarUrl`, `phone`; edit; **sign out**.
- **Delete account** (destructive, needs a confirm step) — wipes your profile, friendships,
  RSVPs, and the plans you've hosted.

### ⭐ H. Public share page (the one WEB screen)
- The link target from an SMS — works in a mobile browser, **no app, no login**.
- Shows the plan preview (title, host, location, date/time, `going`, photo, description) from the
  public `GET /e/:shareToken`.
- CTA: **RSVP** (inline phone OTP) **or** "get the app."
- Make it a clean landing in the same black-&-white mono system.

## 6. Components / system to define

Plan card (feed item) · status chip (Soon / Past / Cancelled) · avatar + stacked "going" group ·
buttons (primary = black fill, secondary = outline, destructive) · text inputs · segmented
control (the RSVP picker) · bottom tab bar · headers · empty states · the share-page hero.
All on one **mono type scale + black/white/gray token ladder**.

## 7. Sample content (realistic plans)

- **Rooftop Sunset Hangs** · Cavalier Rooftop · Maya · in 45 min · *Soon* · 6 going
- **Pickup Basketball** · Mission Rec Center · Dev · in 5h · 9 going
- **Thai Night + Trivia** · Lers Ros · Priya · tomorrow · 4 going
- **Beach Bonfire** · Ocean Beach Pit #3 · Leo · in 2 days · 12 going
- **Kayak Dawn Patrol** · South Beach Harbor · Sam · *Cancelled*
- **Karaoke Night** · The Mint · Ana · yesterday · *Past* · 8 going

## 8. Deliverables

- A **token sheet**: the black/white/gray ladder, the mono type scale, spacing, radii (RN-friendly values).
- **Hi-fi mockups** of screens A–H (light mode), with key states (empty, cancelled, RSVP'd, host vs guest).
- The **component set** in §6.
- Specs as **values, not just images**, where possible (so they translate to RN StyleSheet).

## 9. Out of scope (don't design)

Backend internals, push notifications, SMS plumbing, **friend lists** (grouping friends into
named groups) and **list-based event targeting** (MVP broadcasts every plan to all friends).
App icon + splash can come later.

## 10. Vibe references

HeyTea (premium, spacious minimal) · monospace-led product design (Linear, Vercel, Teenage
Engineering OP-1 labels, Berkeley Graphics) · calm minimal apps (Things) for restraint.
