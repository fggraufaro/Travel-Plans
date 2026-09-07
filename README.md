# Travel Plans — Family Visit Planner

A shared trip itinerary for organizing family visits: flights, trains, hotels, and cars, all in one place, viewable on any phone with no login or app install.

**Live app:** https://claude.ai/code/artifact/53652c04-d49c-4907-9425-9eff7c41b143

## How it works

- Open the link above and tap **+** to add a booking. Paste a confirmation email and tap **Parse with Claude** to auto-fill the flight/train/hotel/car details, or fill the fields in by hand.
- Everyone who opens the link sees the same itinerary, grouped by day, with a countdown to the trip and the confirmation codes ready to show.
- The page saves itself — no separate backend or database. It's a single self-contained HTML file that uses two Claude Artifact runtime capabilities:
  - `sample` — asks Claude to extract structured booking details (type, times, confirmation number, location) from pasted email text.
  - `artifact` — lets the page publish a new version of itself whenever a booking is added, so every viewer's copy stays in sync.
- Anyone without edit access (e.g. the people you're organizing the trip for) gets a read-only view automatically.

## Limitations

- There's no way to log into Airbnb/Booking.com/airline accounts and pull bookings automatically — no consumer API exists for that. Pasting the confirmation email is the closest thing to automatic that actually works.
- Gmail ingestion is possible in principle (via a connected Gmail account) but only while the page is open — it can't watch a folder and react in the background, since the page isn't a running server.

## Files

- `visit-planner.html` — the full app (this is what gets published to the Artifact link above). Contains example data only; the live version has real trip data, which isn't committed here.

## Repo layout

This started as a single Claude Artifact. If this grows into a full self-hosted app later, an alternative worth referencing is [my-trip-planner](https://github.com/davinoishi/my-trip-planner), which scans Gmail for confirmations and uses Claude for extraction — closest in spirit to this project. [Roamarr](https://github.com/visorcraft/Roamarr) and [TREK](https://github.com/mauriceboe/TREK) are heavier self-hosted options with true background email polling, which this artifact-based approach can't do.
