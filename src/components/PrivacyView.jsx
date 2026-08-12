export default function PrivacyView({ onBack }) {
  return (
    <section className="page-section privacy-page" aria-labelledby="privacy-title">
      <header className="section-heading privacy-heading">
        <p className="eyebrow">Privacy &amp; terms</p>
        <h1 id="privacy-title">Plain and simple</h1>
        <p>Shelfie has no accounts, ads or reader database. Your library stays in this browser.</p>
      </header>

      <div className="policy-sheet">
        <section>
          <span>01</span>
          <div>
            <h2>Your books stay here</h2>
            <p>Your name and reading log are stored in your browser. CSV files are read on your device. Clearing Shelfie&apos;s site data removes the library from that browser.</p>
          </div>
        </section>
        <section>
          <span>02</span>
          <div>
            <h2>Searches and covers</h2>
            <p>Book searches go to Google Books. Covers load from Google Books, and cover URLs may pass through Shelfie&apos;s Cloudflare image proxy when you save a card or recap.</p>
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google&apos;s privacy policy</a>
          </div>
        </section>
        <section>
          <span>03</span>
          <div>
            <h2>Hosting</h2>
            <p>Cloudflare serves the site and may process ordinary request information for delivery and security. Shelfie does not add analytics, advertising trackers or tracking cookies.</p>
            <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare&apos;s privacy policy</a>
          </div>
        </section>
        <section>
          <span>04</span>
          <div>
            <h2>Terms</h2>
            <p>Shelfie is provided as-is. Book details and covers come from third parties and may be incomplete or inaccurate. You are responsible for what you add and share.</p>
          </div>
        </section>
      </div>

      <div className="policy-footer">
        <button type="button" className="button button--ink" onClick={onBack}>Back to Shelfie</button>
        <span>Updated 13 August 2026</span>
      </div>
    </section>
  )
}
