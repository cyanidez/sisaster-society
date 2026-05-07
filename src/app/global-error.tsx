"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body style={{ fontFamily: "sans-serif", padding: "2rem", background: "#0a0a0a", color: "#fff" }}>
        <h1 style={{ color: "#f43f5e" }}>เกิดข้อผิดพลาด</h1>
        <pre style={{
          background: "#1a1a1a", padding: "1rem", borderRadius: "8px",
          fontSize: "12px", overflowX: "auto", color: "#fca5a5"
        }}>
          {error?.message}
          {"\n"}
          {error?.digest && `Digest: ${error.digest}`}
          {"\n"}
          {error?.stack}
        </pre>
        <button
          onClick={reset}
          style={{
            marginTop: "1rem", padding: "0.5rem 1.5rem",
            background: "#f43f5e", color: "#fff", border: "none",
            borderRadius: "8px", cursor: "pointer"
          }}
        >
          ลองใหม่
        </button>
      </body>
    </html>
  );
}
