"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h2 style={{ color: "#f43f5e" }}>เกิดข้อผิดพลาด</h2>
      <pre style={{
        background: "#fef2f2", padding: "1rem", borderRadius: "8px",
        fontSize: "12px", overflowX: "auto", color: "#b91c1c",
        whiteSpace: "pre-wrap", wordBreak: "break-word"
      }}>
        {error?.message}
        {"\n"}
        {error?.digest && `Digest: ${error.digest}`}
      </pre>
      <button onClick={reset} style={{
        marginTop: "1rem", padding: "0.5rem 1.5rem",
        background: "#f43f5e", color: "#fff", border: "none",
        borderRadius: "8px", cursor: "pointer"
      }}>
        ลองใหม่
      </button>
    </div>
  );
}
