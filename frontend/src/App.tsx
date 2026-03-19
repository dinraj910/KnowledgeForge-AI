import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import {
  askQuestion,
  ChatResponse,
  DocumentStatusValue,
  getDocumentStatus,
  uploadDocument,
  UploadResponse,
} from "./api";

const defaultUser = import.meta.env.VITE_DEFAULT_USER_ID || "demo-user";

const STATUS_COLORS: Record<DocumentStatusValue, string> = {
  queued: "#f59e0b",
  processing: "#3b82f6",
  completed: "#22c55e",
  failed: "#ef4444",
};

function StatusBadge({ status }: { status: DocumentStatusValue }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        background: STATUS_COLORS[status],
        color: "#fff",
        fontSize: "0.78rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {status}
    </span>
  );
}

function App() {
  const [userId, setUserId] = useState(defaultUser);
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<ChatResponse | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAsk, setLoadingAsk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ingestion tracking
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Poll ingestion status every 2 s until terminal state
  useEffect(() => {
    if (!uploadResult || uploadResult.status === "completed" || uploadResult.status === "failed") {
      stopPolling();
      return;
    }

    stopPolling(); // clear any previous interval
    pollRef.current = setInterval(async () => {
      try {
        const fresh = await getDocumentStatus(uploadResult.id);
        setUploadResult(fresh);
        if (fresh.status === "completed" || fresh.status === "failed") {
          stopPolling();
        }
      } catch {
        stopPolling();
      }
    }, 2000);

    return stopPolling;
  }, [uploadResult, stopPolling]);

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }

    setError(null);
    setUploadResult(null);
    setLoadingUpload(true);
    try {
      const result = await uploadDocument(userId, file);
      setUploadResult(result);
      setFile(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingUpload(false);
    }
  }

  async function onAsk(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setError(null);
    setLoadingAsk(true);
    try {
      const response = await askQuestion(userId, question);
      setAnswer(response);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingAsk(false);
    }
  }

  return (
    <main className="container">
      <section className="panel">
        <h1>KnowledgeForge AI</h1>
        <p>Upload documents, ask questions, and get grounded answers.</p>
      </section>

      {/* ---- Upload Section ---- */}
      <section className="panel">
        <form onSubmit={onUpload} className="row">
          <div>
            <label htmlFor="user-id">User ID</label>
            <input
              id="user-id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="demo-user"
            />
          </div>

          <div>
            <label htmlFor="document">Upload Document (.pdf, .txt, .docx — max 20 MB)</label>
            <input
              id="document"
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <button type="submit" disabled={loadingUpload}>
            {loadingUpload ? "Uploading..." : "Upload and Index"}
          </button>
        </form>

        {/* Ingestion status card */}
        {uploadResult && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              background: "var(--surface, #1e293b)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              fontSize: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <strong>{uploadResult.filename}</strong>
              <StatusBadge status={uploadResult.status} />
            </div>
            <div style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "0.78rem" }}>
              doc_id: {uploadResult.id}
            </div>
            {uploadResult.status === "completed" && (
              <div style={{ color: "#22c55e" }}>
                ✓ {uploadResult.chunk_count} chunk{uploadResult.chunk_count !== 1 ? "s" : ""} indexed
              </div>
            )}
            {uploadResult.status === "failed" && (
              <div style={{ color: "#ef4444" }}>✗ {uploadResult.error_message}</div>
            )}
            {(uploadResult.status === "queued" || uploadResult.status === "processing") && (
              <div style={{ color: "#94a3b8" }}>⏳ Ingestion in progress…</div>
            )}
          </div>
        )}
      </section>

      {/* ---- Chat Section ---- */}
      <section className="panel">
        <form onSubmit={onAsk}>
          <label htmlFor="question">Ask a Question</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What are the key points from my uploaded documents?"
          />
          <button type="submit" disabled={loadingAsk}>
            {loadingAsk ? "Thinking..." : "Ask"}
          </button>
        </form>
      </section>

      {error ? <section className="panel meta">⚠ {error}</section> : null}

      {answer ? (
        <section className="panel">
          <h2>Answer</h2>
          <p className="answer">{answer.answer}</p>

          <h3>Sources</h3>
          {answer.sources.map((source) => (
            <article className="source" key={source.chunk_id}>
              <div className="meta">
                {source.document_name} | score: {source.score.toFixed(2)}
              </div>
              <p>{source.content}</p>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}

export default App;
