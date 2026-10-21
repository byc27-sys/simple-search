# Simple Search

A small Korean-language search website. Express serves the page and proxies queries to Brave Search API.

## Run locally

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env`.
3. Put your Brave Search API key in `.env`.
4. Run `npm install`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Deploy on Render

1. Create a GitHub repository and upload these files. Do not upload `.env`.
2. In Render, create a **Web Service** and connect the repository.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add an environment variable named `BRAVE_API_KEY` with your API key in Render's Environment settings.
6. Deploy and open the `onrender.com` URL shown by Render.

## Notes

- Keep the API key secret. Never put it in `public/index.html` or commit `.env`.
- Check the search API provider's current pricing, rate limits, and terms.
- The included in-memory rate limit is only a lightweight prototype safeguard; it resets when the process restarts and is not shared across multiple instances.
- This app displays search-result links. It is not a general-purpose proxy for opening arbitrary websites.
