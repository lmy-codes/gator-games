# Gator Games Website

Static Vercel-ready website concept for Gator Games in San Mateo.

## Local Preview

```bash
python3 -m http.server 3001
```

Open `http://localhost:3001`.

## Connect Google Calendar

The event calendar works from local weekly rules today. To show the admin's live
Google Calendar feed:

1. Open Google Calendar settings for the admin event calendar.
2. Make the calendar public or share it so visitors can view it.
3. Copy the iframe `src` from **Integrate calendar**.
4. Paste that URL into `GOOGLE_CALENDAR_EMBED_URL` in `calendar.js`.

The monthly calendar and upcoming list can stay as the styled fallback, or the
weekly rules in `calendar.js` can be edited to mirror the live calendar.

## Deploy to Vercel

```bash
vercel
vercel --prod
```

No build command is required. Vercel serves the static files directly.
