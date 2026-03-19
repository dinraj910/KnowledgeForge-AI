"""Fixed-size overlapping text chunker with metadata."""

import uuid
from datetime import datetime, timezone
from typing import List

from app.models.document import ChunkRecord

CHUNK_SIZE = 800   # characters
CHUNK_OVERLAP = 100  # characters


def chunk_text(
    text: str,
    document_id: str,
    user_id: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> List[ChunkRecord]:
    """
    Split *text* into overlapping chunks.

    Each chunk records its character offsets so they can later be
    used for source highlighting when embedding is wired up.
    """
    if not text:
        return []

    chunks: List[ChunkRecord] = []
    start = 0
    index = 0
    now = datetime.now(timezone.utc).isoformat()

    while start < len(text):
        end = min(start + chunk_size, len(text))
        content = text[start:end].strip()

        if content:
            chunks.append(
                ChunkRecord(
                    id=str(uuid.uuid4()),
                    document_id=document_id,
                    user_id=user_id,
                    content=content,
                    chunk_index=index,
                    char_start=start,
                    char_end=end,
                    created_at=now,
                )
            )
            index += 1

        # Advance by (chunk_size - overlap) so consecutive chunks share context
        step = chunk_size - overlap
        start += step

    return chunks
