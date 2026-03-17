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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function uploadDocument(userId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload document.");
  }
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
