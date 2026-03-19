export type SourceChunk = {
  chunk_id: string;
  document_name: string;
  score: number;
  content: string;
};

export type ChatResponse = {
  answer: string;
  sources: SourceChunk[];
};

export type DocumentStatusValue = "queued" | "processing" | "completed" | "failed";

export type UploadResponse = {
  id: string;
  user_id: string;
  filename: string;
  status: DocumentStatusValue;
  chunk_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function uploadDocument(userId: string, file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: "Upload failed." }));
    throw new Error(body.detail ?? "Failed to upload document.");
  }

  return response.json() as Promise<UploadResponse>;
}

export async function getDocumentStatus(docId: string): Promise<UploadResponse> {
  const response = await fetch(`${API_BASE_URL}/documents/${docId}/status`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: "Status check failed." }));
    throw new Error(body.detail ?? "Failed to get document status.");
  }

  return response.json() as Promise<UploadResponse>;
}

export async function askQuestion(userId: string, question: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, question }),
  });

  if (!response.ok) {
    throw new Error("Failed to get answer from backend.");
  }

  return response.json() as Promise<ChatResponse>;
}
