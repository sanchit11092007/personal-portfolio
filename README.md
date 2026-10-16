# Sanchit Goyal — Portfolio

A responsive portfolio for Sanchit Goyal, an aspiring Data Scientist and Machine Learning enthusiast. It is built with semantic HTML, CSS, and vanilla JavaScript—there is no React or Tailwind build step.

## Highlights

- Accessible, responsive portfolio with projects, skills, certifications, developer activity, and social profiles.
- Search-ready metadata, canonical URL, JSON-LD `Person` profile, `robots.txt`, and sitemap.
- MIKASA AI: a Gemini-powered, streaming portfolio assistant with conversation controls and protected server-side credentials.
- Performance-aware interactions: lazy project imagery, bounded canvas effects, paused background work, passive event listeners, and reduced-motion support.

## Run locally

Open `index.html` with a local static server. The visual portfolio will work without configuration. The MIKASA endpoint requires a serverless host because browser-only static hosting cannot protect an API key.

## Deploy MIKASA securely

The repository includes a Vercel serverless function at `api/chat.js`.

1. Import this GitHub repository into Vercel.
2. In Vercel Project Settings → Environment Variables, add `GEMINI_API_KEY` using the private key from Google AI Studio. Do not put it in JavaScript, HTML, or a committed `.env` file.
3. Deploy. Vercel serves the portfolio and `/api/chat` from the same domain, so the assistant works with no client-side key setup.
4. In GitHub Pages settings, set the Vercel URL as the website URL if the assistant must be live there; GitHub Pages alone cannot run the `/api/chat` server function.

Use `.env.example` only as a variable-name reference. If a key was ever committed or pasted into a public file, rotate it immediately in Google AI Studio.

## Quality checks

```bash
npm run check
```

## Search visibility

The site already includes a sitemap, crawl rules, canonical metadata, structured profile data, and links to professional profiles. Search ranking and indexing are controlled by search engines and cannot be guaranteed by code alone. Submit the deployed canonical URL in Google Search Console and keep the profile, GitHub, and LinkedIn names and links consistent.

### Tech Stack

- **Frontend**: Semantic HTML5, Modern Vanilla CSS, Vanilla JavaScript (ES6+)
- **AI Assistant**: Google Gemini API via Vercel Edge Serverless Function
- **Typography**: Outfit & Inter (Google Fonts)
- **Icons**: Font Awesome 6 & Custom SVG Sprites

### Features Overview

- **Learning Focus Map**: Visual dials showing current learning velocity and focus areas
- **Technical Skills Matrix**: Completion percentage indicators for core data science competencies
- **Interactive AI Assistant (MIKASA)**: Conversational assistant answering portfolio questions

### Performance & Accessibility

- Meets WCAG AA contrast standards
- Respects `prefers-reduced-motion` user preferences
- Keyboard navigable with focus rings and Escape key dialog dismissals
