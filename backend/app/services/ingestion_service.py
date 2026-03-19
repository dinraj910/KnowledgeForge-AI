"""Ingestion orchestrator – runs as a FastAPI BackgroundTask."""

import logging
from datetime import datetime, timezone

import aiosqlite

from app.db.database import DB_PATH
from app.models.document import ChunkRecord
from app.services.chunker_service import chunk_text
from app.services.extractor_service import extract_text

logger = logging.getLogger(__name__)


async def run_ingestion(doc_id: str, file_path: str, user_id: str) -> None:
    """
    Full ingestion pipeline:
      1. Mark document as *processing*.
      2. Extract text from the saved file.
      3. Chunk the text.
      4. Persist all chunks to the DB.
      5. Mark document as *completed* (or *failed* on error).
    """
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row

        try:
            # --- 1. Mark processing ---
            await _update_status(conn, doc_id, "processing")

            # --- 2. Extract ---
            text = extract_text(file_path)
            if not text:
                raise ValueError("No text could be extracted from the document.")

            # --- 3. Chunk ---
            chunks: list[ChunkRecord] = chunk_text(text, doc_id, user_id)

            # --- 4. Persist chunks ---
            now = datetime.now(timezone.utc).isoformat()
            await conn.executemany(
                """
                INSERT INTO chunks
                    (id, document_id, user_id, content, chunk_index, char_start, char_end, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        c.id,
                        c.document_id,
                        c.user_id,
                        c.content,
                        c.chunk_index,
                        c.char_start,
                        c.char_end,
                        c.created_at,
                    )
                    for c in chunks
                ],
            )

            # --- 5. Mark completed ---
            await conn.execute(
                """
                UPDATE documents
                SET status = 'completed', chunk_count = ?, updated_at = ?
                WHERE id = ?
                """,
                (len(chunks), now, doc_id),
            )
            await conn.commit()
            logger.info("Ingestion completed for doc %s — %d chunks", doc_id, len(chunks))

        except Exception as exc:
            logger.exception("Ingestion failed for doc %s: %s", doc_id, exc)
            try:
                await _update_status(conn, doc_id, "failed", error_message=str(exc))
                await conn.commit()
            except Exception:
                pass  # Swallow secondary errors


async def _update_status(
    conn: aiosqlite.Connection,
    doc_id: str,
    status: str,
    error_message: str | None = None,
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    await conn.execute(
        """
        UPDATE documents
        SET status = ?, error_message = ?, updated_at = ?
        WHERE id = ?
        """,
        (status, error_message, now, doc_id),
    )
    await conn.commit()
