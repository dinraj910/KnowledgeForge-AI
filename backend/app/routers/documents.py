"""Documents router – real upload persistence, validation, and status tracking."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile

from app.core.config import get_settings
from app.db.database import get_db
from app.models.document import DocumentStatus
from app.services import ingestion_service, storage_service

router = APIRouter(prefix="/documents", tags=["documents"])

_settings = get_settings()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",  # Some clients send this for .docx
}


def _get_extension(filename: str) -> str:
    idx = filename.rfind(".")
    return filename[idx:].lower() if idx != -1 else ""


@router.post("/upload", response_model=DocumentStatus, status_code=202)
async def upload_document(
    background_tasks: BackgroundTasks,
    user_id: str = Form(...),
    file: UploadFile = File(...),
) -> DocumentStatus:
    """
    Accept a document upload, persist it to disk, and schedule async ingestion.

    Returns immediately with status='queued'.
    """
    # --- Validate file extension ---
    filename = file.filename or "unnamed"
    ext = _get_extension(filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # --- Read file bytes (enforce size limit) ---
    max_bytes = _settings.max_upload_size_mb * 1024 * 1024
    data = await file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {_settings.max_upload_size_mb} MB.",
        )
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # --- Persist to disk ---
    doc_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    file_path = await storage_service.save_upload(user_id, doc_id, filename, data)

    # --- Create DB record ---
    async with get_db() as conn:
        await conn.execute(
            """
            INSERT INTO documents (id, user_id, filename, file_path, status, chunk_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'queued', 0, ?, ?)
            """,
            (doc_id, user_id, filename, file_path, now, now),
        )
        await conn.commit()

    # --- Queue background ingestion ---
    background_tasks.add_task(ingestion_service.run_ingestion, doc_id, file_path, user_id)

    return DocumentStatus(
        id=doc_id,
        user_id=user_id,
        filename=filename,
        status="queued",
        chunk_count=0,
        error_message=None,
        created_at=now,
        updated_at=now,
    )


@router.get("/{doc_id}/status", response_model=DocumentStatus)
async def get_document_status(doc_id: str) -> DocumentStatus:
    """Return the current ingestion status of a document."""
    async with get_db() as conn:
        cursor = await conn.execute(
            "SELECT * FROM documents WHERE id = ?", (doc_id,)
        )
        row = await cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found.")

    return DocumentStatus(
        id=row["id"],
        user_id=row["user_id"],
        filename=row["filename"],
        status=row["status"],
        chunk_count=row["chunk_count"],
        error_message=row["error_message"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )
