# Shelfie

Shelfie turns your reading history into a living identity card and beautiful monthly or annual reports. It is accountless by design: books are stored in the browser on the device where they were added.

## Why it exists

Reading apps are good at maintaining lists. Shelfie is for the moment after the list: seeing the shape of your taste and making something beautiful enough to keep or share.

## What it does

- Builds a timeless reading identity card from your whole library
- Generates scrolling monthly and annual reading editions
- Searches Google Books or accepts manual book entry
- Imports Goodreads exports and simple CSV reading histories
- Saves the library to local browser storage automatically
- Exports share-ready PNG images with a small Shelfie signature
- Works without an account or paid hosting

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local address printed by Vite. The app runs without integrations, but Google Books search needs its API key.

## Configuration

Copy `.env.example` to `.env` when you need optional integrations:

- `VITE_GOOGLE_BOOKS_API_KEY`: required for Google Books search. Restrict the browser key to the Books API and the origins that should use it.
- `VITE_IMAGE_PROXY_URL`: optional Cloudflare Worker URL used to proxy Google Books covers during image export.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`: optional public browser configuration for aggregate counters.

All variables prefixed with `VITE_` are bundled into public browser code. They are configuration—not secret storage. Restrict the Google key by API and site origin, and protect Supabase data with Row Level Security.

The previously committed Google Books credential should be revoked or rotated in Google Cloud, even after it is removed from the current source tree.

## CSV import

Goodreads CSV exports are recognised automatically. A simple custom CSV needs `title` and `author` columns. Optional columns are `pages`, `genre`, `finished date`, `author country`, and `cover URL`.

Finish dates determine which books appear in monthly and annual editions. The timeless identity card always uses the complete library.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

Run all three automated gates together with `npm run release:check`. A successful build only proves that the production bundle was created; complete release QA also requires running that bundle and exercising the interaction checklist in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

Pull requests run the same checks in GitHub Actions.

## Free deployment

Shelfie is a static Vite site and can be deployed on Cloudflare Pages, GitHub Pages, Netlify, or Vercel's free tier. Configure any optional `VITE_` values in the host's build settings.

For a demo, add three or more books with different genres and finish dates, then capture:

1. The desktop identity card
2. The mobile identity card
3. A populated annual report
4. The library import and local-save state

## Privacy and storage

The library is stored in `localStorage`. This keeps the app simple and accountless, but data is specific to that browser and can be removed when browser storage is cleared. CSV import also doubles as a convenient way to rebuild a library.

## License

Shelfie is licensed under the GNU Affero General Public License v3.0. See [LICENSE](LICENSE).
