from typing import Literal, Optional

from pydantic import BaseModel


DocumentStatusEnum = Literal["queued", "processing", "completed", "failed"]


class DocumentStatus(BaseModel):
    """Response model for upload and status endpoints."""

    id: str
    user_id: str
    filename: str
    status: DocumentStatusEnum
    chunk_count: int = 0
    error_message: Optional[str] = None
    created_at: str
    updated_at: str


class ChunkRecord(BaseModel):
    """Representation of a single text chunk stored in the DB."""

    id: str
    document_id: str
    user_id: str
    content: str
    chunk_index: int
    char_start: int
    char_end: int
    created_at: str
