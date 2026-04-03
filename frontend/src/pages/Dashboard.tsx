import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  askQuestion,
  ChatResponse,
  DocumentStatusValue,
  getDocumentStatus,
  uploadDocument,
  UploadResponse,
} from "../api";
import { NexusBrand, NexusIcon } from "../components/NexusBrand";

const defaultUser = import.meta.env.VITE_DEFAULT_USER_ID || "demo-user";

export function Dashboard() {
  const [userId] = useState(defaultUser);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<ChatResponse | null>(null);
  
  // Actually, we use a ref for the file input to trigger it from the custom button
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAsk, setLoadingAsk] = useState(false);

  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!uploadResult || uploadResult.status === "completed" || uploadResult.status === "failed") {
      stopPolling();
      return;
    }
    stopPolling();
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadResult(null);
    setLoadingUpload(true);
    try {
      const result = await uploadDocument(userId, file);
      setUploadResult(result);
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setLoadingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function onAsk(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoadingAsk(true);
    try {
      const response = await askQuestion(userId, question);
      setAnswer(response);
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setLoadingAsk(false);
    }
  }

  return (
    <div className="d-flex vh-100 overflow-hidden nexus-main">
      
      {/* LEFT SIDEBAR */}
      <aside className="nexus-sidebar d-flex flex-column py-4 px-3" style={{ gap: "2rem" }}>
        
        {/* Brand */}
        <div className="px-2">
          <NexusBrand />
        </div>

        {/* Management Nav */}
        <div>
          <div className="nexus-section-label px-2 mb-2">Document Management</div>
          <div className="d-flex flex-column gap-1">
            <a href="#" className="nav-link px-2">
              <i className="bi bi-stack me-2"></i> 
              <span className="flex-grow-1">My Knowledge Base</span>
            </a>
            <a href="#" className="nav-link px-2">
              <i className="bi bi-file-earmark-text me-2"></i> 
              <span className="flex-grow-1">All Documents</span>
              <span className="text-muted small">1,428 files</span>
            </a>
            <a href="#" className="nav-link px-2">
              <i className="bi bi-clock-history me-2"></i> 
              <span className="flex-grow-1">Recent Uploads</span>
              <span className="text-muted small">292 files</span>
            </a>
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
            disabled={loadingUpload}
          >
            {loadingUpload ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-plus-lg"></i>
            )}
            {loadingUpload ? "Uploading..." : "Upload Documents"}
          </button>
          
          {/* Temporary injection status alert just for utility */}
          {uploadResult && uploadResult.status !== "completed" && (
             <div className="mt-2 small text-muted text-center px-2">
               Processing {uploadResult.filename}: {uploadResult.status}...
             </div>
          )}
        </div>

        {/* Files Section */}
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          <div className="nexus-section-label px-2 mb-2">Files</div>
          <div className="flex-grow-1 overflow-auto d-flex flex-column gap-2 mb-3 pe-1">
            <a href="#" className="nav-link px-2"><i className="bi bi-filetype-pdf me-2"></i> Project_A_Proposal.pdf</a>
            <a href="#" className="nav-link px-2"><i className="bi bi-filetype-pdf me-2"></i> Project_A_Proposal.pdf</a>
            <a href="#" className="nav-link px-2 text-primary opacity-100"><i className="bi bi-filetype-docx me-2"></i> Nexus_Q2_Report.docx</a>
            <a href="#" className="nav-link px-2"><i className="bi bi-filetype-pdf me-2"></i> competitor_analysis.pdf</a>
            <a href="#" className="nav-link px-2"><i className="bi bi-file-earmark-text me-2"></i> documents</a>
            <a href="#" className="nav-link px-2"><i className="bi bi-file-earmark-text me-2"></i> etc.</a>
          </div>
          
          {/* Search Bar at bottom of sidebar */}
          <div className="position-relative mt-auto">
            <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
            <input 
              type="text" 
              className="form-control nexus-input-area ps-5" 
              placeholder="Search documents..." 
            />
          </div>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="d-flex flex-column flex-grow-1">
        
        {/* Top bar */}
        <div className="d-flex justify-content-end align-items-center p-3 gap-3">
          <button className="nexus-icon-btn position-relative">
            <i className="bi bi-bell"></i>
            <span className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle" style={{ top: "10px", right: "2px" }}></span>
          </button>
          <div className="avatar">EM</div>
        </div>

        {/* Header Content */}
        <div className="px-5 pt-3 pb-3 nexus-header-line mx-3">
          <h2 className="mb-1 fw-bold">Nexus AI | Enterprise Knowledge Base</h2>
          <div className="text-muted">Conversing with global enterprise data</div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow-1 overflow-auto px-5 py-4 d-flex flex-column" style={{ gap: "2.5rem" }}>
          
          {/* Mock User Message */}
          <div className="d-flex gap-3 px-3">
             <div className="avatar mt-1">EM</div>
             <div>
               <div className="fw-bold mb-1">Elizabeth M.</div>
               <p className="mb-0" style={{ fontSize: "1.05rem" }}>
                 Analyze the performance trends of competitor products based on the uploaded Q2 filings.
               </p>
             </div>
          </div>

          {/* AI Response (Either Mock or Real) */}
          <div className="d-flex gap-3 px-3">
             <div className="avatar-ai mt-1">
               <NexusIcon />
             </div>
             <div>
               <div className="fw-bold mb-1">AI</div>
               
               {answer ? (
                 <div className="mb-0" style={{ fontSize: "1.05rem", whiteSpace: "pre-wrap" }}>
                   {answer.answer}
                   {answer.sources && answer.sources.length > 0 && (
                     <div className="mt-4 pt-3 border-top border-secondary">
                        <small className="text-muted text-uppercase fw-bold">Sources</small>
                        <ul className="mt-2 list-unstyled d-flex flex-column gap-2 text-muted" style={{ fontSize: "0.9rem" }}>
                          {answer.sources.map((src, i) => (
                            <li key={i}>· {src.document_name} ({src.score.toFixed(2)})</li>
                          ))}
                        </ul>
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="mb-0" style={{ fontSize: "1.05rem" }}>
                   <p className="mb-3">Analyzing trends...</p>
                   <p className="mb-3">Based on documents (Q2_Competitor_Filings.pdf, etc.):</p>
                   <div className="mb-3">
                     <div className="mb-1">· Competitor A showed 15% revenue growth in EMEA.</div>
                     <div>· Competitor B reduced R&D spending by 8%.</div>
                   </div>
                   <p className="mb-0">Key differentiation areas include...</p>
                 </div>
               )}

             </div>
          </div>
          
        </div>

        {/* Input Area */}
        <div className="p-4 mx-3 mb-2">
          <form onSubmit={onAsk} className="d-flex align-items-center nexus-input-area position-relative ps-3 pe-2 py-2">
            <input 
              type="text" 
              className="form-control py-2" 
              placeholder="Ask Nexus AI (use @ for context)..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="d-flex align-items-center gap-2">
              <button type="button" className="nexus-icon-btn"><i className="bi bi-mic"></i></button>
              <button type="button" className="nexus-icon-btn"><i className="bi bi-paperclip"></i></button>
              <button 
                type="submit" 
                className="btn btn-primary rounded-3 px-3 py-1"
                disabled={loadingAsk || !question.trim()}
              >
                {loadingAsk ? "..." : "Send"}
              </button>
            </div>
          </form>
        </div>

      </main>

    </div>
  );
}
