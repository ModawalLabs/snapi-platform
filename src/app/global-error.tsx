"use client";

/**
 * Last-resort boundary: catches failures in the root layout itself, where
 * `error.tsx` cannot help. It must render its own <html>/<body> because the
 * layout that normally provides them is what failed.
 *
 * Styles are inline — globals.css may not have loaded if the failure was early.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#0d0c0a",
          color: "#f7f5f1",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
            Snapi is temporarily unavailable
          </h1>
          <p style={{ marginTop: "0.75rem", opacity: 0.7, fontSize: "0.875rem", lineHeight: 1.6 }}>
            We hit an unrecoverable error. Reloading usually fixes it.
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: "1rem",
                opacity: 0.5,
                fontSize: "0.75rem",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              ref: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#e3b341",
              color: "#231b0c",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
