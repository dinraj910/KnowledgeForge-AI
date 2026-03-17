from fastapi import APIRouter, File, Form, UploadFile

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    user_id: str = Form(...),
    file: UploadFile = File(...),
) -> dict[str, str]:
    # Placeholder upload endpoint. Hook this to object storage + ingestion queue.
    return {
        "message": "Document received and queued for ingestion.",
        "filename": file.filename,
        "user_id": user_id,
        "status": "queued",
    }
