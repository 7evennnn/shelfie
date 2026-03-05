import { useState, useEffect, useRef } from "react";
import AuthorMap from './AuthorMap'

const HARDCODED_PERCENTILES = [
  { books: 1, percentile: 33 },
  { books: 5, percentile: 55 },
  { books: 10, percentile: 72 },
  { books: 20, percentile: 85 },
  { books: 30, percentile: 91 },
  { books: 50, percentile: 96 },
  { books: 100, percentile: 99 },
];

const GENRE_COLORS = {
  Fiction: "#E8A87C",
  "Science Fiction": "#7EB8F7",
  Fantasy: "#B39DDB",
  Mystery: "#546E7A",
  Thriller: "#EF5350",
  Romance: "#F48FB1",
  Biography: "#81C784",
  History: "#A1887F",
  "Self-Help": "#FFD54F",
  Horror: "#78909C",
  Poetry: "#CE93D8",
  Nonfiction: "#80CBC4",
  Other: "#90A4AE",
};

const SPINE_COLORS = [
  "#C84B31","#2E4057","#F7A278","#A8DADC","#457B9D",
  "#E9C46A","#264653","#E76F51","#2A9D8F","#F4A261",
  "#6D6875","#B5838D","#355070","#FFBA08","#3A86FF",
];

function getPercentile(bookCount) {
  if (bookCount === 0) return 0;
  for (let i = HARDCODED_PERCENTILES.length - 1; i >= 0; i--) {
    if (bookCount >= HARDCODED_PERCENTILES[i].books) {
      return HARDCODED_PERCENTILES[i].percentile;
    }
  }
  return 15;
}

function estimateReadingHours(pages) {
  return Math.round((pages * 275) / (250 * 60));
}

function estimateWords(pages) {
  return pages * 275;
}

function BookRow({ book, onRemove, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: book.title,
    author: book.author,
    pages: book.pages,
    genre: book.genre,
    authorCountry: book.authorCountry || "",
  });

  function save() {
    onUpdate({ ...draft, pages: parseInt(draft.pages) || book.pages });
    setEditing(false);
  }

  if (editing) {
    return (
      <div style={{
        padding: "12px 14px",
        background: "rgba(240,234,214,0.06)",
        border: "1px solid rgba(240,234,214,0.2)",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} placeholder="Title" style={{ padding: "6px 10px", fontSize: 12 }} />
          <input value={draft.author} onChange={e => setDraft(p => ({ ...p, author: e.target.value }))} placeholder="Author" style={{ padding: "6px 10px", fontSize: 12 }} />
          <input value={draft.pages} onChange={e => setDraft(p => ({ ...p, pages: e.target.value }))} placeholder="Pages" type="number" style={{ padding: "6px 10px", fontSize: 12 }} />
          <select value={draft.genre} onChange={e => setDraft(p => ({ ...p, genre: e.target.value }))} style={{ padding: "6px 10px", fontSize: 12 }}>
            {Object.keys(GENRE_COLORS).map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <input value={draft.authorCountry} onChange={e => setDraft(p => ({ ...p, authorCountry: e.target.value }))} placeholder="Author's country (optional)" style={{ padding: "6px 10px", fontSize: 12 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" onClick={save} style={{ flex: 1, padding: "8px", fontSize: 11 }}>SAVE</button>
          <button className="btn-ghost" onClick={() => setEditing(false)} style={{ padding: "8px 16px", fontSize: 11 }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px",
      background: "rgba(240,234,214,0.04)",
      border: "1px solid rgba(240,234,214,0.08)",
    }}>
      <div style={{ width: 3, height: 36, background: book.spineColor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {book.title}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(240,234,214,0.4)", marginTop: 2 }}>
          {book.author} · {book.pages}p · {book.genre}
          {book.authorCountry ? ` · ${book.authorCountry}` : ""}
        </div>
      </div>
      <button
        onClick={() => setEditing(true)}
        style={{
          background: "none", border: "1px solid rgba(240,234,214,0.15)",
          color: "rgba(240,234,214,0.5)", cursor: "pointer",
          fontSize: 11, padding: "4px 10px",
          fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,234,214,0.5)"; e.currentTarget.style.color = "#f0ead6"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(240,234,214,0.15)"; e.currentTarget.style.color = "rgba(240,234,214,0.5)"; }}
      >
        edit
      </button>
      <button onClick={onRemove} style={{ background: "none", border: "none", color: "rgba(240,234,214,0.3)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}>
        ×
      </button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("entry");
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualBook, setManualBook] = useState({ title: "", author: "", pages: "", genre: "Fiction", authorCountry: "" });

  const totalPages = books.reduce((s, b) => s + (b.pages || 250), 0);
  const totalWords = estimateWords(totalPages);
  const totalHours = estimateReadingHours(totalPages);
  const percentile = getPercentile(books.length);
  const longestBook = books.reduce((a, b) => (b.pages > (a?.pages || 0) ? b : a), null);

  const genreCount = books.reduce((acc, b) => {
    const g = b.genre || "Other";
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=6`);
      const data = await res.json();
      setSearchResults(data.items || []);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }

  function addFromResult(item) {
    const info = item.volumeInfo;
    const book = {
      id: Date.now() + Math.random(),
      title: info.title || "Unknown",
      author: info.authors ? info.authors[0] : "Unknown Author",
      pages: info.pageCount || 250,
      genre: info.categories ? info.categories[0].split("/")[0].trim() : "Fiction",
      cover: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
      authorCountry: "",
      spineColor: SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)],
    };
    setBooks(prev => [...prev, book]);
    setSearchResults([]);
    setSearchQuery("");
  }

  function addManualBook() {
    if (!manualBook.title) return;
    const book = {
      id: Date.now() + Math.random(),
      title: manualBook.title,
      author: manualBook.author || "Unknown Author",
      pages: parseInt(manualBook.pages) || 250,
      genre: manualBook.genre || "Other",
      cover: null,
      authorCountry: manualBook.authorCountry || "",
      spineColor: SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)],
    };
    setBooks(prev => [...prev, book]);
    setManualBook({ title: "", author: "", pages: "", genre: "Fiction", authorCountry: "" });
    setManualMode(false);
  }

  function removeBook(id) {
    setBooks(prev => prev.filter(b => b.id !== id));
  }

  const navCards = [
    { id: "grid", label: "Library" },
    { id: "genre", label: "Genres" },
    { id: "badge", label: "Trophy" },
    { id: "map", label: "Origins" },
    { id: "stats", label: "Stats" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", fontFamily: "'Georgia', serif", color: "#f0ead6", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 2px; }
        .book-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .book-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.5); }
        .btn-primary {
          background: #f0ead6; color: #0d0d0d;
          border: none; padding: 12px 28px;
          font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500;
          cursor: pointer; letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }
        .btn-primary:hover { background: #e8dfc4; transform: translateY(-1px); }
        .btn-ghost {
          background: transparent; color: #f0ead6;
          border: 1px solid rgba(240,234,214,0.3); padding: 10px 22px;
          font-family: 'DM Mono', monospace; font-size: 12px;
          cursor: pointer; letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }
        .btn-ghost:hover { border-color: #f0ead6; background: rgba(240,234,214,0.05); }
        input, select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(240,234,214,0.2);
          color: #f0ead6; padding: 10px 14px;
          font-family: 'DM Mono', monospace; font-size: 13px;
          outline: none; width: 100%;
          transition: border-color 0.2s;
        }
        input:focus, select:focus { border-color: rgba(240,234,214,0.6); }
        input::placeholder { color: rgba(240,234,214,0.3); }
        select option { background: #1a1a1a; }
        .search-result {
          padding: 10px 14px; cursor: pointer;
          border-bottom: 1px solid rgba(240,234,214,0.08);
          display: flex; gap: 10px; align-items: center;
          transition: background 0.15s;
        }
        .search-result:hover { background: rgba(240,234,214,0.07); }
        .nav-tab {
          padding: 8px 16px; cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 0.08em; text-transform: uppercase;
          border-bottom: 2px solid transparent;
          transition: all 0.2s; color: rgba(240,234,214,0.5);
          white-space: nowrap;
        }
        .nav-tab.active { color: #f0ead6; border-bottom-color: #f0ead6; }
        .nav-tab:hover { color: rgba(240,234,214,0.8); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .donut-segment { transition: transform 0.2s ease; transform-origin: center; }
        .donut-segment:hover { transform: scale(1.05); }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(240,234,214,0.1)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, letterSpacing: "0.02em" }}>shelfie</h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(240,234,214,0.4)", letterSpacing: "0.1em", marginTop: 2 }}>YOUR READING, VISUALISED</p>
        </div>
        {screen !== "entry" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(240,234,214,0.5)" }}>{books.length} book{books.length !== 1 ? "s" : ""}</span>
            <button className="btn-ghost" onClick={() => setScreen("entry")} style={{ padding: "8px 16px", fontSize: 11 }}>+ Add Books</button>
          </div>
        )}
      </div>

      {/* ENTRY SCREEN */}
      {screen === "entry" && (
        <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 }}>
              What have you<br /><em>been reading?</em>
            </h2>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "rgba(240,234,214,0.5)", lineHeight: 1.7 }}>
              Add the books you've read and we'll turn them into something worth sharing.
            </p>
          </div>

          {/* Search */}
          {!manualMode && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <input
                  placeholder="Search for a book..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={handleSearch} style={{ whiteSpace: "nowrap", padding: "10px 20px" }}>
                  {searching ? "..." : "Search"}
                </button>
              </div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(240,234,214,0.35)", textAlign: "right" }}>
                Can't find it?{" "}
                <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setManualMode(true)}>Add manually</span>
              </p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{ border: "1px solid rgba(240,234,214,0.15)", marginBottom: 16, maxHeight: 280, overflowY: "auto" }}>
              {searchResults.map(item => (
                <div className="search-result" key={item.id} onClick={() => addFromResult(item)}>
                  {item.volumeInfo.imageLinks?.smallThumbnail && (
                    <img src={item.volumeInfo.imageLinks.smallThumbnail.replace("http://", "https://")} alt="" style={{ width: 32, height: 46, objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.volumeInfo.title}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(240,234,214,0.5)", marginTop: 2 }}>
                      {item.volumeInfo.authors?.[0]} · {item.volumeInfo.pageCount || "?"} pages
                    </div>
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(240,234,214,0.3)", flexShrink: 0 }}>+ add</span>
                </div>
              ))}
            </div>
          )}

          {/* Manual Mode */}
          {manualMode && (
            <div style={{ border: "1px solid rgba(240,234,214,0.15)", padding: 20, marginBottom: 16 }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(240,234,214,0.5)", marginBottom: 14, letterSpacing: "0.08em" }}>MANUAL ENTRY</p>
              <div style={{ display: "grid", gap: 10 }}>
                <input placeholder="Book title *" value={manualBook.title} onChange={e => setManualBook(p => ({ ...p, title: e.target.value }))} />
                <input placeholder="Author name" value={manualBook.author} onChange={e => setManualBook(p => ({ ...p, author: e.target.value }))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input placeholder="Pages (e.g. 320)" type="number" value={manualBook.pages} onChange={e => setManualBook(p => ({ ...p, pages: e.target.value }))} />
                  <select value={manualBook.genre} onChange={e => setManualBook(p => ({ ...p, genre: e.target.value }))}>
                    {Object.keys(GENRE_COLORS).map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <input placeholder="Author's country (optional)" value={manualBook.authorCountry} onChange={e => setManualBook(p => ({ ...p, authorCountry: e.target.value }))} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" onClick={addManualBook} style={{ flex: 1 }}>Add Book</button>
                  <button className="btn-ghost" onClick={() => setManualMode(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Books Added */}
          {books.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(240,234,214,0.4)", letterSpacing: "0.08em", marginBottom: 12 }}>
                {books.length} BOOK{books.length !== 1 ? "S" : ""} ADDED
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 340, overflowY: "auto", marginBottom: 24 }}>
                {books.map(book => (
                  <BookRow
                    key={book.id}
                    book={book}
                    onRemove={() => removeBook(book.id)}
                    onUpdate={updated => setBooks(prev => prev.map(b => b.id === book.id ? { ...b, ...updated } : b))}
                  />
                ))}
              </div>
              <button className="btn-primary" onClick={() => setScreen("grid")} style={{ width: "100%", padding: "14px", fontSize: 13, letterSpacing: "0.08em" }}>
                GENERATE MY SHELFIE →
              </button>
            </div>
          )}

          {/* Empty state */}
          {books.length === 0 && (
            <div style={{ marginTop: 40, textAlign: "center", padding: 32, border: "1px dashed rgba(240,234,214,0.1)" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontStyle: "italic", color: "rgba(240,234,214,0.3)" }}>
                Your shelf is empty.<br />Start by searching for a book above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* RESULTS SCREENS */}
      {screen !== "entry" && (
        <div>
          {/* Tab Nav */}
          <div style={{ borderBottom: "1px solid rgba(240,234,214,0.1)", padding: "0 24px", display: "flex", gap: 0, overflowX: "auto" }}>
            {navCards.map(tab => (
              <div key={tab.id} className={`nav-tab ${screen === tab.id ? "active" : ""}`} onClick={() => setScreen(tab.id)}>
                {tab.label}
              </div>
            ))}
          </div>

          <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

            {/* LIBRARY GRID */}
            {screen === "grid" && (
              <div>
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Your Library</h2>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "rgba(240,234,214,0.4)" }}>
                    {books.length} books · {totalPages.toLocaleString()} pages · ~{totalHours}h reading time
                  </p>
                </div>
                {books.length === 0 ? (
                  <p style={{ fontFamily: "'DM Mono', monospace", color: "rgba(240,234,214,0.3)", fontSize: 13 }}>No books added yet.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 16 }}>
                    {books.map(book => (
                      <div key={book.id} className="book-card" style={{ cursor: "default" }}>
                        {book.cover ? (
                          <img src={book.cover} alt={book.title} style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }} />
                        ) : (
                          <div style={{ width: "100%", aspectRatio: "2/3", background: book.spineColor, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 10, textAlign: "center", color: "rgba(0,0,0,0.7)", lineHeight: 1.3 }}>{book.title}</p>
                          </div>
                        )}
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "rgba(240,234,214,0.5)", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {book.title}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 40, padding: 24, background: "rgba(240,234,214,0.03)", border: "1px solid rgba(240,234,214,0.08)", textAlign: "center" }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: "italic", color: "rgba(240,234,214,0.6)" }}>
                    {books.length === 0 ? "Add books to see your library" :
                     books.length < 3 ? "Every great library starts with a single book." :
                     books.length < 10 ? "A reader in the making." :
                     books.length < 20 ? "A dedicated reader." :
                     "A serious bibliophile."}
                  </p>
                </div>
              </div>
            )}

            {/* GENRE BREAKDOWN */}
            {screen === "genre" && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Genre Breakdown</h2>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "rgba(240,234,214,0.4)", marginBottom: 40 }}>What kind of reader are you?</p>
                {Object.keys(genreCount).length === 0 ? (
                  <p style={{ fontFamily: "'DM Mono', monospace", color: "rgba(240,234,214,0.3)", fontSize: 13 }}>Add books to see genres.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                      <svg viewBox="0 0 200 200" style={{ width: "100%", maxWidth: 240, display: "block", margin: "0 auto" }}>
                        {(() => {
                          const total = Object.values(genreCount).reduce((a, b) => a + b, 0);
                          let cumulative = 0;
                          return Object.entries(genreCount).map(([genre, count], i) => {
                            const ratio = count / total;
                            const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
                            const endAngle = (cumulative + ratio) * 2 * Math.PI - Math.PI / 2;
                            cumulative += ratio;
                            const r = 80, cx = 100, cy = 100, ri = 50;
                            const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
                            const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
                            const xi1 = cx + ri * Math.cos(startAngle), yi1 = cy + ri * Math.sin(startAngle);
                            const xi2 = cx + ri * Math.cos(endAngle), yi2 = cy + ri * Math.sin(endAngle);
                            const largeArc = ratio > 0.5 ? 1 : 0;
                            const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ri} ${ri} 0 ${largeArc} 0 ${xi1} ${yi1} Z`;
                            return <path key={i} d={d} fill={GENRE_COLORS[genre] || "#90A4AE"} stroke="#0d0d0d" strokeWidth="2" className="donut-segment" />;
                          });
                        })()}
                        <text x="100" y="95" textAnchor="middle" style={{ fill: "#f0ead6", fontSize: 22, fontFamily: "Georgia" }} fontWeight="700">{Object.keys(genreCount).length}</text>
                        <text x="100" y="112" textAnchor="middle" style={{ fill: "rgba(240,234,214,0.5)", fontSize: 9, fontFamily: "monospace" }}>GENRES</text>
                      </svg>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {Object.entries(genreCount).sort((a, b) => b[1] - a[1]).map(([genre, count]) => (
                        <div key={genre} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 10, height: 10, background: GENRE_COLORS[genre] || "#90A4AE", flexShrink: 0 }} />
                          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, flex: 1 }}>{genre}</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(240,234,214,0.5)" }}>{count} book{count !== 1 ? "s" : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TROPHY */}
            {screen === "badge" && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Trophy Case</h2>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "rgba(240,234,214,0.4)", marginBottom: 40 }}>Your longest read deserves recognition.</p>
                {!longestBook ? (
                  <p style={{ fontFamily: "'DM Mono', monospace", color: "rgba(240,234,214,0.3)", fontSize: 13 }}>Add books to see your trophy.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
                    <div style={{
                      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                      border: "1px solid rgba(240,234,214,0.15)",
                      padding: "48px 40px", textAlign: "center", maxWidth: 420, width: "100%",
                      position: "relative", overflow: "hidden",
                    }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(240,234,214,0.4)", letterSpacing: "0.15em", marginBottom: 12 }}>LONGEST READ</p>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>{longestBook.title}</h3>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "rgba(240,234,214,0.5)", marginBottom: 24 }}>by {longestBook.author}</p>
                      <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
                        <div>
                          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>{longestBook.pages.toLocaleString()}</p>
                          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "rgba(240,234,214,0.4)", letterSpacing: "0.1em" }}>PAGES</p>
                        </div>
                        <div>
                          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>{estimateReadingHours(longestBook.pages)}h</p>
                          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "rgba(240,234,214,0.4)", letterSpacing: "0.1em" }}>EST. TIME</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ width: "100%", maxWidth: 420 }}>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(240,234,214,0.4)", letterSpacing: "0.1em", marginBottom: 14 }}>ALL BOOKS BY LENGTH</p>
                      {[...books].sort((a, b) => b.pages - a.pages).map((book, i) => {
                        const pct = (book.pages / longestBook.pages) * 100;
                        return (
                          <div key={book.id} style={{ marginBottom: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{book.title}</span>
                              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(240,234,214,0.4)", flexShrink: 0 }}>{book.pages}p</span>
                            </div>
                            <div style={{ height: 3, background: "rgba(240,234,214,0.1)", position: "relative" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: i === 0 ? "#FFD700" : book.spineColor, transition: "width 0.5s ease" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AUTHOR ORIGINS MAP */}
            {screen === "map" && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Author Origins</h2>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "rgba(240,234,214,0.4)", marginBottom: 24 }}>
                  Where in the world do your authors come from?
                </p>
                <AuthorMap
                  books={books}
                  onUpdateCountry={(id, country) =>
                    setBooks(prev => prev.map(b => b.id === id ? { ...b, authorCountry: country } : b))
                  }
                />
              </div>
            )}

            {/* STATS */}
            {screen === "stats" && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Your Stats</h2>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "rgba(240,234,214,0.4)", marginBottom: 40 }}>How do you stack up?</p>
                <div style={{ padding: "48px 32px", textAlign: "center", marginBottom: 32, background: "linear-gradient(135deg, rgba(240,234,214,0.03) 0%, rgba(240,234,214,0.07) 100%)", border: "1px solid rgba(240,234,214,0.1)" }}>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(240,234,214,0.4)", letterSpacing: "0.15em", marginBottom: 16 }}>YOU'RE IN THE TOP</p>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 80, fontWeight: 700, lineHeight: 1, color: "#f0ead6" }}>
                    {100 - percentile}<span style={{ fontSize: 40 }}>%</span>
                  </p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "rgba(240,234,214,0.5)", marginTop: 16 }}>
                    of readers worldwide — based on {books.length} book{books.length !== 1 ? "s" : ""} read
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                  {[
                    { label: "TOTAL PAGES", value: totalPages.toLocaleString(), sub: "pages turned" },
                    { label: "READING TIME", value: `${totalHours}h`, sub: "hours spent reading" },
                    { label: "WORDS READ", value: `${(totalWords / 1000).toFixed(0)}k`, sub: `≈ ${Math.round(totalWords / 77000)}× Harry Potter series` },
                    { label: "BOOKS READ", value: books.length, sub: `better than ${percentile}% of people` },
                  ].map(({ label, value, sub }) => (
                    <div key={label} style={{ padding: "24px 20px", border: "1px solid rgba(240,234,214,0.1)", background: "rgba(240,234,214,0.02)" }}>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "rgba(240,234,214,0.4)", letterSpacing: "0.12em", marginBottom: 10 }}>{label}</p>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700 }}>{value}</p>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(240,234,214,0.4)", marginTop: 6 }}>{sub}</p>
                    </div>
                  ))}
                </div>
                <div style={{ border: "1px solid rgba(240,234,214,0.1)", padding: 24 }}>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(240,234,214,0.4)", letterSpacing: "0.1em", marginBottom: 16 }}>READING LADDER</p>
                  {HARDCODED_PERCENTILES.map(({ books: b, percentile: p }) => (
                    <div key={b} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 48, fontFamily: "'DM Mono', monospace", fontSize: 11, color: books.length >= b ? "#f0ead6" : "rgba(240,234,214,0.25)" }}>
                        {b} bk{b !== 1 ? "s" : ""}
                      </div>
                      <div style={{ flex: 1, height: 4, background: "rgba(240,234,214,0.08)", position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${p}%`, background: books.length >= b ? "#f0ead6" : "rgba(240,234,214,0.15)", transition: "width 0.6s ease" }} />
                      </div>
                      <div style={{ width: 64, fontFamily: "'DM Mono', monospace", fontSize: 10, color: books.length >= b ? "rgba(240,234,214,0.8)" : "rgba(240,234,214,0.25)", textAlign: "right" }}>
                        top {100 - p}%
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(240,234,214,0.25)", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
                  Percentile estimates based on global reading surveys. Leaderboards coming soon.
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
