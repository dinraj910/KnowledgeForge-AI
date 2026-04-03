import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  askQuestion,
  ChatMessage,
  DocumentRecord,
  DocumentStatusValue,
  getDocumentStatus,
  listDocuments,
  uploadDocument,
} from "../api";
import { NexusBrand, NexusIcon } from "../components/NexusBrand";

const defaultUser = import.meta.env.VITE_DEFAULT_USER_ID || "demo-user";

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<DocumentStatusValue, string> = {
  queued: "#f59e0b",
  processing: "#3b82f6",
  completed: "#22c55e",
  failed:  "#ef4444",
};

function StatusDot({ status }: { status: DocumentStatusValue }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: STATUS_COLOR[status],
        marginLeft: 6,
        flexShrink: 0,
      }}
      title={status}
    />
  );
}

// ─── File icon helper ──────────────────────────────────────────────────────────
function fileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf")  return "bi-filetype-pdf";
  if (ext === "docx") return "bi-filetype-docx";
  return "bi-file-earmark-text";
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="d-flex gap-3 px-3">
        <div className="avatar mt-1" style={{ background: "#4b5563" }}>U</div>
        <div>
          <div className="fw-bold mb-1" style={{ color: "var(--nexus-text-primary)" }}>You</div>
          <p className="mb-0" style={{ fontSize: "1rem", color: "var(--nexus-text-primary)" }}>
            {msg.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex gap-3 px-3">
      <div className="avatar-ai mt-1"><NexusIcon /></div>
      <div style={{ flex: 1 }}>
        <div className="fw-bold mb-1" style={{ color: "var(--nexus-text-primary)" }}>KnowledgeForge AI</div>
        <div style={{ fontSize: "1rem", color: "var(--nexus-text-primary)", whiteSpace: "pre-wrap" }}>
          {msg.content}
        </div>
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--nexus-border)" }}>
            <div className="nexus-section-label mb-2">Sources</div>
            {msg.sources.map((src) => (
              <div
                key={src.chunk_id}
                className="mb-2 p-2 rounded-2"
                style={{ background: "var(--nexus-input-bg)", border: "1px solid var(--nexus-border)" }}
              >
                <div className="d-flex justify-content-between mb-1">
                  <small className="fw-medium" style={{ color: "var(--nexus-text-primary)" }}>
                    <i className={`bi ${fileIcon(src.document_name)} me-1`} />
                    {src.document_name}
                  </small>
                  <small style={{ color: "var(--nexus-text-muted)" }}>score: {src.score.toFixed(2)}</small>
                </div>
                <small style={{ color: "var(--nexus-text-muted)" }}>&ldquo;{src.content}&rdquo;</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function Dashboard() {
  const [userId] = useState(defaultUser);

  // Documents list
  const [documents, setDocuments]     = useState<DocumentRecord[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [searchTerm, setSearchTerm]   = useState("");

  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]         = useState(false);
  const [activeUpload, setActiveUpload]   = useState<DocumentRecord | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Chat
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [question, setQuestion]   = useState("");
  const [asking, setAsking]       = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Load document list ────────────────────────────────────────────────────
  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await listDocuments(userId);
      setDocuments(docs);
    } catch {
      /* silently fail – docs section will stay empty */
    } finally {
      setDocsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  // ── Poll active upload until terminal ─────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => {
    if (!activeUpload || activeUpload.status === "completed" || activeUpload.status === "failed") {
      stopPolling();
      if (activeUpload?.status === "completed") refreshDocuments();
      return;
    }

    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const fresh = await getDocumentStatus(activeUpload.id);
        setActiveUpload(fresh);
        // Also update it in place inside the documents list
        setDocuments(prev => prev.map(d => d.id === fresh.id ? fresh : d));
        if (fresh.status === "completed" || fresh.status === "failed") {
          stopPolling();
          if (fresh.status === "completed") refreshDocuments();
        }
      } catch {
        stopPolling();
      }
    }, 2000);

    return stopPolling;
  }, [activeUpload, stopPolling, refreshDocuments]);

  // Scroll chat to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Upload handler ─────────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    setUploading(true);
    setActiveUpload(null);
    try {
      const result = await uploadDocument(userId, file);
      setActiveUpload(result);
      // Optimistically add to list
      setDocuments(prev => [result, ...prev]);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  // ── Ask handler ────────────────────────────────────────────────────────────
  async function onAsk(e: FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || asking) return;

    const userMsg: ChatMessage = { role: "user", content: q, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await askQuestion(userId, q);
      const aiMsg: ChatMessage = {
        role: "ai",
        content: res.answer,
        sources: res.sources,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: ChatMessage = {
        role: "ai",
        content: `⚠ Error: ${(err as Error).message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setAsking(false);
    }
  }

  // ── Filtered doc list ──────────────────────────────────────────────────────
  const filteredDocs = documents.filter(d =>
    d.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const completedCount = documents.filter(d => d.status === "completed").length;

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="d-flex vh-100 overflow-hidden nexus-main">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="nexus-sidebar d-flex flex-column py-4 px-3" style={{ gap: "1.5rem" }}>

        {/* Brand */}
        <div className="px-2">
          <NexusBrand />
        </div>

        {/* Document Management */}
        <div>
          <div className="nexus-section-label px-2 mb-2">Document Management</div>
          <div className="d-flex flex-column gap-1">
            <div className="nav-link px-2" style={{ cursor: "default" }}>
              <i className="bi bi-stack me-2" />
              <span className="flex-grow-1">My Knowledge Base</span>
            </div>
            <div className="nav-link px-2" style={{ cursor: "default" }}>
              <i className="bi bi-file-earmark-text me-2" />
              <span className="flex-grow-1">All Documents</span>
              <span className="small" style={{ color: "var(--nexus-text-muted)" }}>
                {docsLoading ? "…" : `${documents.length} file${documents.length !== 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="nav-link px-2" style={{ cursor: "default" }}>
              <i className="bi bi-check2-circle me-2" />
              <span className="flex-grow-1">Indexed</span>
              <span className="small" style={{ color: "var(--nexus-text-muted)" }}>
                {docsLoading ? "…" : `${completedCount} file${completedCount !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
          />
          <button
            className="btn btn-primary w-100 rounded-3 py-2 fw-medium d-flex align-items-center justify-content-center gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading
              ? <span className="spinner-border spinner-border-sm" role="status" />
              : <i className="bi bi-plus-lg" />}
            {uploading ? "Uploading…" : "Upload Documents"}
          </button>

          {/* Active upload status */}
          {activeUpload && (
            <div
              className="mt-2 p-2 rounded-2"
              style={{ background: "var(--nexus-input-bg)", border: "1px solid var(--nexus-border)" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <small
                  className="text-truncate me-2"
                  style={{ maxWidth: 160, color: "var(--nexus-text-primary)", fontWeight: 500 }}
                  title={activeUpload.filename}
                >
                  {activeUpload.filename}
                </small>
                <StatusDot status={activeUpload.status} />
              </div>
              <small style={{ color: "var(--nexus-text-muted)" }}>
                {activeUpload.status === "completed"
                  ? `✓ ${activeUpload.chunk_count} chunks indexed`
                  : activeUpload.status === "failed"
                    ? `✗ ${activeUpload.error_message ?? "Failed"}`
                    : `${activeUpload.status}…`}
              </small>
            </div>
          )}
        </div>

        {/* Files List */}
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <div className="nexus-section-label px-2 mb-2">Files</div>

          <div className="flex-grow-1 overflow-auto d-flex flex-column gap-1 mb-3 pe-1">
            {docsLoading && (
              <div className="text-center py-3">
                <span className="spinner-border spinner-border-sm" style={{ color: "var(--nexus-text-muted)" }} />
              </div>
            )}

            {!docsLoading && filteredDocs.length === 0 && (
              <div className="px-2 py-3 text-center" style={{ color: "var(--nexus-text-muted)", fontSize: "0.875rem" }}>
                {searchTerm ? "No files match your search." : "No documents yet. Upload one to get started."}
              </div>
            )}

            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="nav-link px-2 d-flex align-items-center"
                style={{ cursor: "default" }}
                title={`${doc.filename} — ${doc.status} — ${doc.chunk_count} chunks`}
              >
                <i className={`bi ${fileIcon(doc.filename)} me-2`} style={{ flexShrink: 0 }} />
                <span className="flex-grow-1 text-truncate" style={{ fontSize: "0.875rem" }}>
                  {doc.filename}
                </span>
                <StatusDot status={doc.status} />
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="position-relative mt-auto">
            <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3" style={{ color: "var(--nexus-text-muted)" }} />
            <input
              type="text"
              className="form-control nexus-input-area ps-5"
              style={{ background: "var(--nexus-input-bg)", border: "1px solid var(--nexus-border)", color: "var(--nexus-text-primary)" }}
              placeholder="Search documents…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </aside>

      {/* ── MAIN CANVAS ── */}
      <main className="d-flex flex-column flex-grow-1">

        {/* Top Bar */}
        <div className="d-flex justify-content-end align-items-center p-3 gap-3" style={{ borderBottom: "1px solid var(--nexus-border)" }}>
          <div className="small" style={{ color: "var(--nexus-text-muted)" }}>
            Workspace: <strong style={{ color: "var(--nexus-text-primary)" }}>{userId}</strong>
          </div>
          <div className="avatar">U</div>
          <Link to="/" style={{ color: "var(--nexus-text-muted)", fontSize: "0.85rem" }}>
            ← Home
          </Link>
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid var(--nexus-border)" }}>
          <h2 className="mb-1 fw-bold">KnowledgeForge AI</h2>
          <div style={{ color: "var(--nexus-text-muted)", fontSize: "0.9rem" }}>
            {documents.length === 0
              ? "Upload documents from the sidebar to start querying your knowledge base."
              : `${completedCount} of ${documents.length} document${documents.length !== 1 ? "s" : ""} indexed and ready to query.`}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow-1 overflow-auto px-4 py-4 d-flex flex-column" style={{ gap: "2rem" }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="m-auto text-center" style={{ maxWidth: 480, color: "var(--nexus-text-muted)" }}>
              <NexusIcon />
              <h4 className="mt-3 mb-2" style={{ color: "var(--nexus-text-primary)" }}>
                Ask anything about your documents
              </h4>
              <p style={{ fontSize: "0.9rem" }}>
                Upload PDFs, TXTs, or DOCX files using the sidebar, then ask questions in natural language. KnowledgeForge AI retrieves the most relevant passages and provides grounded answers with source citations.
              </p>
              {completedCount === 0 && (
                <div
                  className="mt-3 px-3 py-2 rounded-2 d-inline-block"
                  style={{ background: "var(--nexus-input-bg)", border: "1px solid var(--nexus-border)", fontSize: "0.85rem" }}
                >
                  <i className="bi bi-arrow-left me-1" /> Upload a document from the sidebar to begin
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}

          {/* Typing indicator */}
          {asking && (
            <div className="d-flex gap-3 px-3">
              <div className="avatar-ai mt-1"><NexusIcon /></div>
              <div className="d-flex align-items-center gap-1" style={{ height: 32 }}>
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    style={{
                      display: "inline-block",
                      width: 7, height: 7,
                      borderRadius: "50%",
                      background: "var(--nexus-text-muted)",
                      animation: "pulse 1.2s infinite",
                      animationDelay: `${delay}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4" style={{ borderTop: "1px solid var(--nexus-border)" }}>
          <form
            onSubmit={onAsk}
            className="d-flex align-items-center nexus-input-area ps-3 pe-2 py-2 mx-auto"
            style={{ maxWidth: 900 }}
          >
            <input
              type="text"
              className="form-control py-2"
              placeholder={
                completedCount > 0
                  ? "Ask anything about your documents…"
                  : "Upload documents first to start querying…"
              }
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAsk(e); }
              }}
              disabled={asking}
            />
            <div className="d-flex align-items-center gap-2">
              <button type="button" className="nexus-icon-btn"><i className="bi bi-paperclip" /></button>
              <button
                type="submit"
                className="btn btn-primary rounded-3 px-3 py-1"
                disabled={asking || !question.trim()}
              >
                {asking ? <span className="spinner-border spinner-border-sm" /> : "Send"}
              </button>
            </div>
          </form>
          <div className="text-center mt-2" style={{ fontSize: "0.75rem", color: "var(--nexus-text-muted)" }}>
            KnowledgeForge AI answers are grounded in your uploaded documents. Verify important details.
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
