import { FormEvent, useState } from "react";

import { askQuestion, ChatResponse, uploadDocument } from "./lib/api";

const defaultUser = import.meta.env.VITE_DEFAULT_USER_ID || "demo-user";

function App() {
  const [userId, setUserId] = useState(defaultUser);
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<ChatResponse | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAsk, setLoadingAsk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }

    setError(null);
    setLoadingUpload(true);
    try {
      await uploadDocument(userId, file);
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
        <h1>Personal Knowledge AI</h1>
        <p>Upload documents, ask questions, and get grounded answers.</p>
      </section>

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
            <label htmlFor="document">Upload Document</label>
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
      </section>

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

      {error ? <section className="panel meta">Error: {error}</section> : null}

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
