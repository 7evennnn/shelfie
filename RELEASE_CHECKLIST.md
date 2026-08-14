# Shelfie release checklist

Compilation and interaction QA are separate gates. Record both before calling a release production-ready.

## 1. Automated gate

Run:

```powershell
npm run release:check
```

This must pass lint, the Node test suite and the standard Vite production build. If the standard build fails only because the Windows sandbox cannot load the Vite config, record that separately and retry `npx vite build --configLoader runner`; the workaround does not turn a genuine source or bundle error into a pass.

## 2. Run the production bundle

Run:

```powershell
npm run preview -- --host 127.0.0.1 --port 4173
```

Use the printed local URL. Do not use the development server for release interaction QA.

## 3. Desktop interaction QA

At a desktop viewport, verify:

- Card, Books and Recaps tabs work from the header; Books and Recaps also work from the footer.
- Privacy & terms opens from the footer, its external policy links are reachable, and Back to Shelfie returns to the card.
- The card name updates, a first book can be added, and all three card exports complete: current `shelfie_alltime.png`, Story/TikTok `shelfie_alltime_story.png` at 1080x1920, and Instagram post `shelfie_alltime_post.png` at 1080x1350.
- Book search covers a successful result, no-match result and failed/unconfigured request. Add one search result when the API is configured.
- Manual entry opens and closes, required-title validation works, a valid book is added, editing can be cancelled and saved, and removal works.
- CSV import can be cancelled, rejects an invalid file, accepts a valid file and does not duplicate an existing title-and-author pair. A Goodreads export imports only its `read` shelf, preserves slash-formatted calendar dates, and never labels reading statuses as genres.
- The library survives a reload in the same browser.
- Recaps switch between Month and Year, year/month selectors update the report, the empty state returns to Books, and populated recaps download the exact expected name: `shelfie_wrapped_[year].png` or `shelfie_wrapped_[mon]_[yy].png`.
- Download/share failure is reported in the interface. If native file sharing is available, exercise success and cancellation; otherwise verify the PNG download fallback.
- There are no unexpected console errors or failed same-origin production assets.

## 4. Mobile interaction QA

Repeat the relevant paths at 390 CSS pixels wide. Also verify:

- Nothing causes horizontal page overflow.
- Navigation, forms, modals, list actions, report controls and share/download controls remain visible and usable.
- Native sharing and its cancellation path are tested when the browser and operating system expose them; otherwise record that the download fallback was the only available path.

## 5. Release record

Record the commit, browser, desktop viewport, 390-pixel mobile viewport, automated-gate result, interaction result, any configuration used and every limitation. A build pass must never be reported as a complete production-readiness pass.
