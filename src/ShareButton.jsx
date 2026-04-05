// ShareButton.jsx
// Drop this in your src/ folder
// Run: npm install html2canvas

import { useState } from "react";
import html2canvas from "html2canvas";

export default function ShareButton({ targetId, filename = "my-shelfie" }) {
  const [loading, setLoading] = useState(false);

  async function capture() {
    const element = document.getElementById(targetId);
    if (!element) return null;

    const WORKER_URL = "https://shelfieimagesproxy.adicutti21.workers.dev";
    const images = element.querySelectorAll("img");
    await Promise.all(Array.from(images).map((img) => {
      if (img.src && img.src.includes("books.google")) {
        return new Promise((resolve) => {
          img.src = `${WORKER_URL}?url=${encodeURIComponent(img.src)}`;
          img.onload = resolve;
          img.onerror = resolve;
        });
      }
      return Promise.resolve();
    }));

    const canvas = await html2canvas(element, {
      backgroundColor: "#0d0d0d",
      scale: 2, // retina quality
      useCORS: true, // needed for book cover images
      allowTaint: true,
    });

    return canvas;
  }

  async function handleShare() {
    setLoading(true);
    try {
      const canvas = await capture();
      if (!canvas) return;

      // Try native share sheet first (works on mobile)
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], `${filename}.png`, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "My Shelfie 📚",
            });
          } else {
            // canShare returned false, fall back to download
            downloadCanvas(canvas);
          }
        });
      } else {
        // Desktop fallback — download
        downloadCanvas(canvas);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        // User didn't cancel, something actually went wrong — just download
        const canvas = await capture();
        if (canvas) downloadCanvas(canvas);
      }
    }
    setLoading(false);
  }

  function downloadCanvas(canvas) {
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "1px solid rgba(240,234,214,0.3)",
        color: "#f0ead6",
        padding: "10px 20px",
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.08em",
        cursor: loading ? "wait" : "pointer",
        transition: "all 0.2s",
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#f0ead6";
        e.currentTarget.style.background = "rgba(240,234,214,0.05)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(240,234,214,0.3)";
        e.currentTarget.style.background = "none";
      }}
    >
      {loading ? "CAPTURING..." : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          SHARE / SAVE
        </>
      )}
    </button>
  );
}
